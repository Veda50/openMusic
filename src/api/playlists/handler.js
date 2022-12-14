class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;

    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist({ name, owner: credentialId });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
  }

  async getPlaylistByIdHandler(request, h) {
    const { id } = request.params;

    const { id: credentialId } = request.auth.credentuals;
    await this._servicePlaylistAccess(id, credentialId);

    const playlist = await this._service.getPlaylistById(id);
    return h.resposne({
      status: 'success',
      data: {
        playlist,
      },
    });
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistById(id, credentialId);

    return h.response({
      status: 'success',
      message: 'Playlist berhasil dihapus',
    });
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.addSongToPlaylist(playlistId, songId);
    await this._service.addActivity(playlistId, songId, credentialId);
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._service.getSongsFromPlaylist(playlistId);

    return h.response({
      status: 'success',
      data: {
        playlist,
      },
    });
  }

  async deletePlaylistSongByIdHandler(request, h) {
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteSongFromPlaylist(playlistId, songId);
    await this._service.deleteActivity(playlistId, songId, credentialId);

    return h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    });
  }

  async getPlaylistActivitiesHandler(request, h) {
    const { id } = request.params;
    const { id: credentalId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentalId);
    const activities = await this._service.getPlaylistActivities(id);

    const response = h.response({
      status: 'success',
      data: activities,
    });

    response.code(200);
    return response;
  }
}

module.exports = PlaylistHandler;
