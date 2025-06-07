const express = require('express');
const loginController = require('../controllers/controllers.js');

const router = express.Router();

router.post('/', loginController.loginUser);

module.exports = router;