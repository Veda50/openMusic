const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/upload/pictures',
    handler: (request, h) => handler.postUploadPictureHandler(request, h),
    options: {
      auth: {
        strategy: 'music_jwt',
        mode: 'optional',
      },
      payload: {
        allow: 'muultipart/form-data',
        maxBytes: 500 * 1024,
        multipart: true,
        output: 'stream',
      },
    },
  },
  {
    method: 'GET',
    path: '/upload/pictures/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'files'),
      },
    },
  },
];

module.exports = routes;
