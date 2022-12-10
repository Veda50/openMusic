const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PicturesService {
  constructor() {
    this._pool = new Pool();
  }

  async addPicture(pictureUrl, userId) {
    const id = `Picture-${nanoid(16)}`;
    const createdAt = new Date();

    const result = await this._pool.query({
      text: 'INSERT INTO pictures (id, picture_url, picture_created_user_id) VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, pictureUrl, createdAt, userId],
    });
    if (result.rowCount === 0) {
      throw new InvariantError('Gagal menambahkan gambar');
    }

    return result.rows[0].id;
  }
}

module.exports = PicturesService;
