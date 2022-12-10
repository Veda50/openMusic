class ExportsHandler {
  constructor(exportsService, playlistsService, validator) {
    this._exportsService = exportsService;
    this._playlistsService = playlistsService;
    this._validator = validator;
  }

  async postExportsHandler(request, h) {
    this._validator.validateExportNotesPayload(request.payload);

    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    const message = {
      userId,
      targetEmail: request.payload.targetEmail,
      playlistId,
    };

    await this._exportsService.sendMessage('export:playlist', JSON.stringify(message));
    const response = h.response({
      status: 'success',
      message: 'Permintaan dalam antrian',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
