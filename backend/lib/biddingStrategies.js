class BiddingStrategy {
  executeBid() {
    throw new Error('executeBid must be implemented');
  }
}

class ManualBidStrategy extends BiddingStrategy {
  executeBid({ amount }) {
    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      throw new Error('Valid bid amount is required');
    }
    return parsed;
  }
}

class AutoBidStrategy extends BiddingStrategy {
  executeBid({ amount, currentBid, increment }) {
    if (amount != null && amount !== '') {
      const parsed = Number(amount);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    const step = Number.isNaN(Number(increment)) ? 1 : Number(increment);
    return (currentBid || 0) + Math.max(1, step);
  }
}

class IncrementalBidStrategy extends BiddingStrategy {
  executeBid({ currentBid, increment }) {
    const step = Number(increment);
    if (Number.isNaN(step) || step <= 0) {
      throw new Error('Valid increment is required');
    }
    return (currentBid || 0) + step;
  }
}

class ProxyBidStrategy extends BiddingStrategy {
  executeBid({ currentBid, maxBid, increment }) {
    const ceiling = Number(maxBid);
    if (Number.isNaN(ceiling) || ceiling <= 0) {
      throw new Error('Valid maxBid is required');
    }
    const step = Number.isNaN(Number(increment)) ? 1 : Number(increment);
    const next = (currentBid || 0) + Math.max(1, step);
    return Math.min(next, ceiling);
  }
}

class AIBidStrategy extends BiddingStrategy {
  executeBid({ currentBid, maxBid, increment }) {
    const step = Number.isNaN(Number(increment)) ? 1 : Number(increment);
    const cap = Number.isNaN(Number(maxBid)) ? (currentBid || 0) + step * 3 : Number(maxBid);
    const next = (currentBid || 0) + Math.max(1, step);
    return Math.min(next, cap);
  }
}

function getBiddingStrategy(name) {
  switch (String(name || '').toLowerCase()) {
    case 'auto':
      return new AutoBidStrategy();
    case 'incremental':
      return new IncrementalBidStrategy();
    case 'proxy':
      return new ProxyBidStrategy();
    case 'ai':
      return new AIBidStrategy();
    default:
      return new ManualBidStrategy();
  }
}

module.exports = {
  getBiddingStrategy,
  BiddingStrategy,
  ManualBidStrategy,
  AutoBidStrategy,
  IncrementalBidStrategy,
  ProxyBidStrategy,
  AIBidStrategy,
};
