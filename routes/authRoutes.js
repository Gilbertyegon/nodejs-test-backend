const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.createUser);
router.post('/login', authController.loginUser);
router.post('/verify', authController.verifyOtp);
router.post('/resend', authController.resendOtp);

module.exports = router;
