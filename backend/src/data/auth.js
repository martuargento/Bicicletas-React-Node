const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'bicileal-node-secret-dev';

function generateTokens(user) {
  const payload = { id: user.id, username: user.username, email: user.email };

  return {
    refresh: jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' }),
    access: jwt.sign(payload, SECRET_KEY, { expiresIn: '60m' }),
  };
}

function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY);
}

module.exports = {
  SECRET_KEY,
  generateTokens,
  verifyToken,
};
