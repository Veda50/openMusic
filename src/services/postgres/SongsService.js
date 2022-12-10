const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapSongModel } = require('../../utils/songs');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongServices {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({
    title, year, performer, genre, duration, albumId,
  }, user = 'Developer') {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES( $1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan lagu');
    }

    await this._cacheService.delete(`song:${user}`);
    return result.rows[0].id;
  }

  async getSongs(user = 'Developer') {
    try {
      const result = await this._cacheService.get(`song:${user}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT songs.id, songs.title, songs.performer,pictures.picture_url FROM songs LEFT JOIN pictures ON songs.picture_id = pictures.id',
      };

      const result = await this._pool.query(query);
      const mappedResult = result.rows.map(mapSongModel);
      await this._cacheService.set(`song:${user}`, JSON.stringify(mappedResult));
      return mappedResult;
    }
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id =$1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('lagu tidak ditemukan!');
    }
    return result.rows.map(mapSongModel)[0];
  }

  async editSongById(id, {
    title, year, performer, genre, duration,
  }, user = 'Developer') {
    const query = {
      text: 'UPDATE songs SET title =$1, year =$2, performer =$3, genre =$4, duration =$5 WHERE id =$6 RETURNING id',
      values: [title, year, performer, genre, duration, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak dapat ditemukan');
    }
    (await this.getAllPlaylistIdBySongId(id)).forEach(
      async (playlistId) => this._cacheService.delete(`playlistSong:${playlistId}`),
    );
    await this._cacheService.delete(`user:${user}`);
  }

  async deleteSongById(id, user = 'Developer') {
    const query = {
      text: 'DELETE FROM songs WHERE id =$1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    (await this.getAllPlaylistIdBySongId(id)).forEach(
      async (playlistId) => this._cacheService.delete(`playlistSong:${playlistId}`),
    );
    await this._cacheService.delete(`song:${user}`);
  }

  async updatePictureId(id, pictureId, user = 'Developer') {
    const query = {
      text: 'UPDATE songs SET picture_id = $1 WHERE id = $2 RETURNING id',
      values: [pictureId, id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Id Song Not Found!');
    }
    (await this.getAllPlaylistIdBySongId(id)).forEach(
      async (playlistId) => this._cacheService.delete(`playlistSong:${playlistId}`),
    );
    await this._cacheService.delete(`picture:${user}`);
  }

  async getAllPlaylistIdBySongId(songId) {
    const query = {
      text: 'SELECT playlist_id FROM playlist_songs WHERE song_id=$1',
      values: [songId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = SongServices;
