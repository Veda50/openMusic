function routes(handler) {
  return [
    {
      method: 'POST',
      path: '/export/playlists/{playlistId}',
      handler: (request, h) => handler.postExportsHandler(request, h),
      options: { auth: 'music_jwt' },
    },
  ];
}
module.exports = routes;
