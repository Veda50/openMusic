const UploadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: (server, {
    storageService, songsService, picturesService, validator,
  }) => {
    const handler = new UploadsHandler(storageService, songsService, picturesService, validator);
    server.route(routes(handler));
  },
};
