const { processBid } = require('../lib/bidProcessor');

exports.placeBid = async (req, res) => {
  const roomId = req.params.roomId;
  const { participantId, amount, strategy, increment, maxBid } = req.body;

  const result = await processBid({
    roomId,
    participantId,
    amount,
    strategy,
    increment,
    maxBid,
  });

  if (!result.ok) {
    return res.status(result.status || 400).json({ error: result.error });
  }

  return res.json(result.room);
};
