const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) throw new Error('No token provided');
    const [, token] = header.split(' ');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = protect;
