const Joi = require('joi');

const UploadPayloadSchema = Joi.object({
  'content-type': Joi.string().valid('image/jpeg', 'image/png', 'image/gif', 'image/svg+xml').required(),
}).unknown();

module.exports = { UploadPayloadSchema };
