const express = require('express');
const registerController = require('../controllers/controllers.js');
const router = express.Router();

router.post('/', registerController.registerUser);

module.exports = router;