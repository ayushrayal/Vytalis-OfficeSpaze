const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { loginRateLimiter, signupRateLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/signup', signupRateLimiter, authController.signup);
router.post('/login', loginRateLimiter, authController.login);
router.get('/me', authMiddleware, authController.me);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
