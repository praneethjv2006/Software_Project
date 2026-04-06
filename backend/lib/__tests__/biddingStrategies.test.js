const {
  getBiddingStrategy,
  ManualBidStrategy,
  AutoBidStrategy,
  IncrementalBidStrategy,
  ProxyBidStrategy,
  AIBidStrategy,
} = require('../biddingStrategies');

describe('biddingStrategies', () => {
  it('defaults to ManualBidStrategy', () => {
    // Tests fallback strategy selection.
    const strategy = getBiddingStrategy('unknown');
    expect(strategy).toBeInstanceOf(ManualBidStrategy);
  });

  it('manual strategy validates amount', () => {
    // Tests manual bid validation for positive numeric amount.
    const strategy = new ManualBidStrategy();
    expect(() => strategy.executeBid({ amount: 0 })).toThrow('Valid bid amount is required');
    expect(strategy.executeBid({ amount: 10 })).toBe(10);
  });

  it('auto strategy uses increment when amount is missing', () => {
    // Tests auto bid calculation based on current bid and increment.
    const strategy = new AutoBidStrategy();
    expect(strategy.executeBid({ currentBid: 5, increment: 2 })).toBe(7);
  });

  it('incremental strategy requires positive increment', () => {
    // Tests validation for incremental bid strategy.
    const strategy = new IncrementalBidStrategy();
    expect(() => strategy.executeBid({ currentBid: 5, increment: 0 })).toThrow('Valid increment is required');
  });

  it('proxy strategy caps at max bid', () => {
    // Tests proxy bid ceiling enforcement.
    const strategy = new ProxyBidStrategy();
    expect(strategy.executeBid({ currentBid: 9, maxBid: 10, increment: 3 })).toBe(10);
  });

  it('ai strategy respects computed cap', () => {
    // Tests AI bid cap with default max bid.
    const strategy = new AIBidStrategy();
    expect(strategy.executeBid({ currentBid: 10, increment: 2 })).toBe(12);
  });
});
