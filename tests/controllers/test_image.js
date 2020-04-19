'use strict';

process.env.NODE_ENV = 'test';

require('../../models');
const mongoose = require('mongoose');
const chai = require('chai');
const axios = require('axios');
const { Readable } = require('stream');
const chaiSubset = require('chai-subset');
const chaiHttp = require('chai-http');
const chaiBytes = require('chai-bytes');
const sinon = require('sinon');
const server = require('../../server');
const giphyClient = require('../../lib/giphy-client');
const testData = require('./data');

const sandbox = sinon.createSandbox();
const should = chai.should();
const ImageModel = mongoose.model('Image');

chai.use(chaiHttp);
chai.use(chaiSubset);
chai.use(chaiBytes);

describe('test image api', () => {
    beforeEach(async () => {
        sandbox.restore();
        await ImageModel.deleteMany({});
    });

    describe('POST /image', () => {
        beforeEach(() => {
            sandbox.stub(giphyClient, 'getRandomImage').resolves(testData.response_giphy_random_image);
        });

        it('should return created image', async () => {
            const res = await chai.request(server).post('/image').send({});

            res.should.have.status(200);
            res.body.should.have.property('id', 'fCUEe8jUGywBv3RFNy');
        });

        it('should throw error if all images exists', async () => {
            const createdImage = new ImageModel({ _id: 'fCUEe8jUGywBv3RFNy', url: 'test', image: 'test' });
            await createdImage.save();

            const res = await chai.request(server).post('/image').send({});

            res.should.have.status(500);
            res.body.should.have.property('message').and.satisfy(message => message.startsWith(
                'Can\'t save random image, image exists. Failed ids: fCUEe8jUGywBv3RFNy')
            );
        });
    });

    describe('GET /images', () => {
        beforeEach(async () => {
            await ImageModel.create([
                { _id: 'test1', url: 'test', image: 'test' },
                { _id: 'test2', url: 'test', image: 'test' },
                { _id: 'test3', url: 'test', image: 'test' },
                { _id: 'test4', url: 'test', image: 'test' }
            ]);
        });

        it('should return images from db', async () => {
            const res = await chai.request(server).get('/images');

            res.should.have.status(200);
            res.body.should
                .have.property('images')
                .and.to.be.a('array')
                .and.to.have.length(4)
                .and.to.containSubset([{id: 'test1'}, {id: 'test2'}, {id: 'test3'}]);
        });
    });

    describe('GET /image/:id', () => {
        const testData = Buffer.alloc(1000, 'x');

        beforeEach(async () => {
            await ImageModel.create([
                { _id: 'test1', url: 'test', image: 'test' },
            ]);
            const testStream = new Readable();
            const testBuffer = testData
            testStream.push(testBuffer);
            testStream.push(null);

            sandbox.stub(axios, 'get').resolves({ data: testStream });
        });

        it('should return image data', async () => {
            const res = await chai.request(server).get('/image/test1').buffer().parse((res, cb) => {
                res.setEncoding('binary');
                res.data = '';
                res.on('data', function (chunk) {
                    res.data += chunk;
                });
                res.on('end', function () {
                    cb(null, Buffer.from(res.data, 'binary'));
                });
            });

            res.body.should.to.equalBytes(testData);
        });

        it('should throw not found error if image not exist', async () => {
            const res = await chai.request(server).get('/image/noid');

            res.should.have.status(404);
            res.body.should.have.property('code', 'NotFoundError');
        });
    })
})
