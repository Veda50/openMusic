/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('pictures', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    picture_url: {
      type: 'VARCHAR(255)',
      notNull: true,
      unique: true,
    },
    created_at: {
      type: 'TIMESTAMP WITH TIME ZONE',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    picture_created_user_id: {
      type: 'VARCHAR(50)',
      notNull: false,
    },
  });

  pgm.addConstraint('pictures', 'pictures_picture_created_user_id_fkey', 'FOREIGN KEY (picture_created_user_id) REFERENCES users(id) ON DELETE SET NULL');

  pgm.addConstraint('songs', 'fk_songs.picture_id_pictures.id', 'FOREIGN KEY(picture_id) REFERENCES pictures(id) ON DELETE SET NULL');
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs.picture_id_pictures.id');
  pgm.dropTable('pictures');
};
