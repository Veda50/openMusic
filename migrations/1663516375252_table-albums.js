exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(25)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INT',
      notNull: true,
    },
    coverUrl: {
      type: 'VARCHAR(100)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('albums');
};
