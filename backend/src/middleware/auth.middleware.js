const { users } = require('../data/storage');
const { verifyToken } = require('../data/auth');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Token requerido.' });
  }

  try {
    const decoded = verifyToken(token);
    const user = users.find((item) => item.id === decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

module.exports = authMiddleware;
