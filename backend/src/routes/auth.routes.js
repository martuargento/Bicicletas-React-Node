const express = require('express');
const { register, login, profile } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/registro', register);
router.post('/login', login);
router.get('/perfil', authMiddleware, profile);

module.exports = router;
