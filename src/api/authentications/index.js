const AuthenticationsHandler = require('./handler');
const routes = require('./routes');

module.export = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, {
    authentcationsSercice,
    usersService,
    tokenManager,
    validator,
  }) => {
    const authenticationsHandler = new AuthenticationsHandler(
      authentcationsSercice,
      usersService,
      tokenManager,
      validator,
    );
    server.route(routes(authenticationsHandler));
  },
};
