const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addCollaboration(playlistId, userId) {
    const user = await this._pool.query({
      text: 'SELECT * FROM users WHERE id =$1',
      values: [userId],
    });

    if (!user.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    const id = `collab-${nanoid(16)}`;
    const result = await this._pool.query({
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    });
    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }
    await this._cacheService.delete(`playlist-${userId}`);
    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const result = await this._pool.query({
      text: 'DELETE FROM collaborations WHERE playlist_id =$1 AND user_id =$2 RETURNING id',
      values: [playlistId, userId],
    });

    if (result.rowCount === 0) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }
    await this._cacheService.delete(`playlist-${userId}`);
  }

  async verifyCollaborator(playlistId, userId) {
    const result = await this._pool.query({
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id =$2',
      values: [playlistId, userId],
    });

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }
}

module.exports = CollaborationsService;
