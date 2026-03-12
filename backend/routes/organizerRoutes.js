const express = require('express');
const router = express.Router();
const organizerController = require('../controllers/organizerController');

router.get('/test', organizerController.getTest);
router.get('/', organizerController.getOrganizer);

module.exports = router;
