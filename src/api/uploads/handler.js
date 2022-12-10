class UploadsHandler {
  constructor(storageService, songsService, pictureService, validator) {
    this._storageService = storageService;
    this._songsService = songsService;
    this._pictureService = pictureService;
    this._validator = validator;
  }

  async postUploadPictureHandler(request, h) {
    const { data, songId } = request.payload;
    let credentialId = null;
    if (request.auth.credentials !== null) {
      credentialId = request.auth.credentials.id;
    }
    await this._validator.validateUploadPayload({
      'content-type': data.hapi.headers['content-type'],
    });
    const filename = await this._storageService.writeFile(data, data.hapi.filename);
    const pictureId = await this._pictureService.addPicture(`/upload/pictures/${filename}`, credentialId);

    if (songId) {
      await this.songsService.updatePictureId(songId, pictureId);
    }

    const response = h.response({
      status: 'success',
      message: 'Gambar berhasil diunggah',
      data: {
        pictureUrl: `${request.headers.host}/upload/pictures/${filename}`,
      },
    });
    response.code(201);
    return response;
  }
}
module.exports = UploadsHandler;
