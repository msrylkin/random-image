'use strict';

const axios = require('axios');
const retry = require('async-retry');
const config = require('config');
const giphyClient = require('../lib/giphy-client');
const { NotFoundError, ApiError, UniqueConstraintError } = require('../lib/errors');

const retryCount = config.get('retryCount');
const ImageModel = require('mongoose').model('Image');

/**
 * @swagger
 *
 * components:
 *      schemas:
 *          Image:
 *              properties:
 *                  id: 
 *                      type: string
 *                  url:
 *                      type: string
 *                  title:
 *                      type: string
 *                  image:
 *                      type: string
 */

/**
 * @swagger
 * 
 * /image/{id}:
 *   get:
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *               type: string
 *            required: true
 *      responses:
 *          '200':
 *              content:
 *                  image/gif:
 *                      schema:
 *                          type: string
 *                          format: binary
 * 
 */
async function getImageById(req, res, next) {
    const { id } = req.params;
    const imageDb = await ImageModel.findById(id);

    if (!imageDb) {
        throw new NotFoundError('Image', id);
    }

    const imageResponse = await axios.get(imageDb.image, { responseType: 'stream' });
    imageResponse.data.pipe(res);
}

/**
 * @swagger
 *
 * /image:
 *   post:
 *     responses:
 *       '200':
 *             content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Image'
 */
async function processRandomImage(req, res, next) {
    let failedIds = [];

    const saveResult = await retry(async (bail) => {
        try {
            const { data: { url, id, title, image_original_url: imageUrl } } = await giphyClient.getRandomImage();
            const imageDb = new ImageModel({ _id: id, url, title, image: imageUrl });
            return await imageDb.save();
        } catch (err) {
            if (err instanceof UniqueConstraintError) {
                failedIds.push(err.value);
                throw new ApiError(`Can't save random image, image exists. Failed ids: ${failedIds.join(', ')}`);
            }
            bail(err);
        }
    }, { minTimeout: 0, retries: retryCount });

    res.json({
        id: saveResult._id,
        url: saveResult.url,
        title: saveResult.title,
        image: saveResult.image,
    });
}

/**
 * @swagger
 *
 * /images:
 *   get:
 *     parameters:
 *          - in: query
 *            name: page
 *            type: integer
 *            minimum: 1
 *          - in: query
 *            name: limit
 *            type: integer
 *            minimum: 1
 *          - in: query
 *            name: sort
 *            type: string
 *            enum: [asc, desc]
 *          - in: query
 *            name: dateStart
 *            type: string
 *            format: date-time
 *          - in: query
 *            name: dateEnd
 *            type: string
 *            format: date-time
 *     responses:
 *       '200':
 *             content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              images:
 *                                  type: array
 *                                  items:
 *                                      $ref: '#/components/schemas/Image'
 */
async function getImageList(req, res, next) {
    const page = (req.query.page > 0 ? req.query.page : 1) - 1;
    const limit = Number(req.query.limit) || 15;
    const sort = req.query.sort || 'desc';
    const { dateStart, dateEnd } = req.query;

    const imagesDb = await ImageModel.list({ page, limit, sort, dateStart, dateEnd });

    res.json({
        images: imagesDb.map(({ _id, url, title, image }) => ({ id: _id, url, title, image })),
    });
}

module.exports = { getImageById, processRandomImage, getImageList };