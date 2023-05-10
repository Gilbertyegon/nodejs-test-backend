const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/users', authController.createUser);
router.post('/login', authController.loginUser);

module.exports = router;
