const InvariantError = require('../../exceptions/InvariantError');
const { UploadPayloadSchema } = require('./schema');

const UploadsValidator = {
  validateUploadPayload: (payload) => {
    const validationResult = UploadPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UploadsValidator;
