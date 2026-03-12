const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const participantController = require('../controllers/participantController');
const itemController = require('../controllers/itemController');

router.get('/', roomController.getRooms);
router.post('/', roomController.createRoom);
router.get('/:roomId', roomController.getRoom);
router.post('/:roomId/participants', participantController.addParticipant);
router.post('/:roomId/items', itemController.addItem);

module.exports = router;
