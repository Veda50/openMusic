class CollaborationsHandler {
  constructor(collaborationsService, PlaylistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = PlaylistsService;
    this._validator = validator;
  }

  async postCollaborationHandler(request, h) {
    await this._validator.validateCollaborationPayload(request.payload);
    const credentialId = request.auth.credentials.id;

    const { playlistId, userId } = request.payload;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const id = await this._collaborationsService.addCollaboration(playlistId, userId);
    const response = h.response({
      status: 'success',
      message: 'Collaboration added',
      data: { collaborationId: id },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    await this._validator.validateCollaborationPayload(request.payload);
    const credentialId = request.auth.credentials.id;
    const { playlistId, userId } = request.payload;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    await this._collaborationsService.deleteCollaboration(playlistId, userId);
    return h.response({
      status: 'success',
      message: 'Collaboration deleted',
    });
  }
}

module.exports = CollaborationsHandler;
