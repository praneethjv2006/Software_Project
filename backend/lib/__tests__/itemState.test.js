const { ItemStatuses, getItemState, InProgressState } = require('../itemState');

describe('itemState', () => {
  it('returns InProgressState for ongoing items', () => {
    // Tests that in-progress items use the correct state handler.
    const state = getItemState(ItemStatuses.IN_PROGRESS);
    expect(state).toBeInstanceOf(InProgressState);
  });

  it('updates bid in InProgressState', () => {
    // Tests bid update mutation fields.
    const state = getItemState(ItemStatuses.IN_PROGRESS);
    const update = state.updateBid({ amount: 50, participantId: 3 });
    expect(update).toEqual({ currentBid: 50, winnerId: 3 });
  });

  it('declares winner properly', () => {
    // Tests sold vs unsold status transitions.
    const state = getItemState(ItemStatuses.IN_PROGRESS);
    expect(state.declareWinner({ hasWinner: true })).toEqual({ status: ItemStatuses.SOLD });
    expect(state.declareWinner({ hasWinner: false })).toEqual({ status: ItemStatuses.UNSOLD });
  });
});
