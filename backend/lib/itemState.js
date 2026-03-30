const ItemStatuses = {
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'ongoing',
  SOLD: 'sold',
  UNSOLD: 'unsold',
};

class ItemState {
  updateBid() {
    throw new Error('updateBid not allowed in this state');
  }

  declareWinner() {
    throw new Error('declareWinner not allowed in this state');
  }
}

class UnsoldState extends ItemState {}

class SoldState extends ItemState {}

class InProgressState extends ItemState {
  updateBid({ amount, participantId }) {
    return {
      currentBid: amount,
      winnerId: participantId,
    };
  }

  declareWinner({ hasWinner }) {
    return {
      status: hasWinner ? ItemStatuses.SOLD : ItemStatuses.UNSOLD,
    };
  }
}

function getItemState(status) {
  switch (status) {
    case ItemStatuses.IN_PROGRESS:
      return new InProgressState();
    case ItemStatuses.SOLD:
      return new SoldState();
    case ItemStatuses.UNSOLD:
    case ItemStatuses.UPCOMING:
    default:
      return new UnsoldState();
  }
}

module.exports = {
  ItemStatuses,
  getItemState,
  InProgressState,
  UnsoldState,
  SoldState,
};
