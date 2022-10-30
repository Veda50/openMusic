const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist VALUES( $1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username AS username FROM playlists LEFT JOIN collaborations ON collaborations.playlist_id = playlist.id LEFT JOIN users ON users.id = playlists.owner WHERE playlists.owner =$1 OR collaborations.user_id =$1 GROUP BY (playlists.id, user.username)',
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlayistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id =$1 RETURNING id',
      values: [id],
    };

    const deleteResult = await this._pool.query(query);
    if (!deleteResult.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id =$1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }
    if (result.rows[0] !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this._verifyPlayllistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const song = await this._pool.query({
      text: 'SELECT * FROM songs WHERE id =$1',
      values: [songId],
    });
    if (!song.rows.length) {
      throw new NotFoundError('Lagu gagal ditambahkan');
    }

    await this._pool.query({
      text: 'INSERT INTO playlist_songs VALUES( $1, $2)',
      values: [playlistId, songId],
    });
  }

  async getSongsFromPlaylist(playlistId) {
    const playlist = await this._pool.query({
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlist_songs INNER JOIN playlists on playlist_songs.playlist_id = playlists.id INNER JOIN users ON playlists.owner = users.id WHERE playlist_id = $1 LIMIT 1',
      values: [playlistId],
    });
    if (!playlist.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const song = await this._pool.query({
      text: 'SELECT songs.id, songs.title, songs.performer FROM playlist_songs INNER JOIN songs on playlist_songs.song_id = songs.id WHERE playlist_id = $1',
      values: [playlistId],
    });

    return {
      id: playlist.rows[0].id,
      name: playlist.rows[0].name,
      username: playlist.rows[0].username,
      songs: song.rows,
    };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const deleteResult = await this._pool.query({
      text: 'DELETE FROM playlist_songs WHERE playlist_id =$1 AND song_id =$2',
      values: [playlistId, songId],
    });

    if (deleteResult.rows.length === 0) {
      throw new InvariantError('Lagu gagal dihapus, id tidak ditemukan!');
    }
  }

  async addActivity(playlistId, songId, userId) {
    const songTitle = await this._pool.query({
      text: 'SELECT title FROM songs WHERE id =$1',
      values: [songId],
    });

    const username = await this._pool.query({
      text: 'SELECT username FROM users WHERE id =$1',
      values: [userId],
    });

    const activityId = `activity-${nanoid}`;
    const activityTime = new Date().toISOString();

    await this._pool.query({
      text: 'INSERT INTO playlist_activites VALUES($1, $2, $3, $4, $5, $6)',
      values: [activityId, playlistId, songTitle, username, 'add', activityTime],
    });
  }

  async deleteActivity(playlistId, songId, userId) {
    const songTitle = await this._pool.query({
      text: 'SELECT title FROM songs WHERE id =$1',
      values: [songId],
    });

    const username = await this._pool.query({
      text: 'SELECT username FROM users WHERE id =$1',
      values: [userId],
    });

    const activityId = `activity-${nanoid}`;
    const activityTime = new Date().toISOString();

    await this._pool.query({
      text: 'INSERT INTO playlist_activites VALUES($1, $2, $3, $4, $5, $6)',
      values: [activityId, playlistId, songTitle, username, 'delete', activityTime],
    });
  }

  async getPlaylistActivity(playlistId) {
    const activity = await this._pool.query({
      text: 'SELECT * FROM playlist_activities WHERE playlist_id = $1',
      values: [playlistId],
    });

    if (!activity.rows.length) {
      throw new NotFoundError('Tidak ada aktivitas');
    }

    const activityMap = activity.rows.map((row) => ({
      username: row.user_id,
      title: row.song_id,
      action: row.action,
      time: row.time,
    }));

    return {
      playlistId,
      activities: activityMap,
    };
  }
}

module.exports = PlaylistService;
