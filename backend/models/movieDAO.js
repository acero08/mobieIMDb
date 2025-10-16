// models/movieDAO.js
const pool = require('../database');

class MovieDAO {
  async createUser(googleId, email, displayName) {
    
const query = `
  INSERT INTO users (google_id, email, display_name, created_at)
  VALUES ($1, $2, $3, NOW())
  ON CONFLICT (google_id) DO UPDATE
  SET email = EXCLUDED.email, display_name = EXCLUDED.display_name
  RETURNING id, google_id, email, display_name, created_at
`;
    const result = await pool.query(query, [googleId, email, displayName]);
    return result.rows[0];
  }

  async getUserByGoogleId(googleId) {
    const query = 'SELECT id, google_id, email, display_name, created_at FROM users WHERE google_id = $1';
    const result = await pool.query(query, [googleId]);
    return result.rows[0];
  }

  async getUserById(userId) {
    const query = 'SELECT id, google_id, email, display_name, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  async addFavorite(userId, movieId, title, posterPath, releaseDate) {
    const query = `
      INSERT INTO user_favorites (user_id, movie_id, title, poster_path, release_date, added_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (user_id, movie_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [userId, movieId, title, posterPath, releaseDate]);
    return result.rows[0];
  }

  async removeFavorite(userId, movieId) {
    const query = 'DELETE FROM user_favorites WHERE user_id = $1 AND movie_id = $2 RETURNING *';
    const result = await pool.query(query, [userId, movieId]);
    return result.rows[0];
  }

  async getFavorites(userId) {
    const query = `
      SELECT movie_id, title, poster_path, release_date, added_at
      FROM user_favorites
      WHERE user_id = $1
      ORDER BY added_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async isFavorite(userId, movieId) {
    const query = 'SELECT EXISTS(SELECT 1 FROM user_favorites WHERE user_id = $1 AND movie_id = $2)';
    const result = await pool.query(query, [userId, movieId]);
    return result.rows[0].exists;
  }

async getAllUsers() {
  const query = 'SELECT id, google_id, email, display_name, created_at FROM users ORDER BY created_at DESC';
  const result = await pool.query(query);
  return result.rows;
}

async deleteUser(userId) {
  const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [userId]);
  return result.rows[0];
}

async getUserFavoriteCount(userId) {
  const query = 'SELECT COUNT(*) as count FROM user_favorites WHERE user_id = $1';
  const result = await pool.query(query, [userId]);
  return parseInt(result.rows[0].count);
}

async searchFavorites(userId, searchTerm) {
  const query = `
    SELECT movie_id, title, poster_path, release_date, added_at
    FROM user_favorites
    WHERE user_id = $1 AND title ILIKE $2
    ORDER BY added_at DESC
  `;
  const result = await pool.query(query, [userId, `%${searchTerm}%`]);
  return result.rows;
}

async getMostRecentFavorites(userId, limit = 5) {
  const query = `
    SELECT movie_id, title, poster_path, release_date, added_at
    FROM user_favorites
    WHERE user_id = $1
    ORDER BY added_at DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [userId, limit]);
  return result.rows;
}

}

module.exports = new MovieDAO();