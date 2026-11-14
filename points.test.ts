import { StudySession } from '../../src/models/StudySession';
import { User } from '../../src/models/User';
import { DailyCapPointStrategy } from '../../src/points/DailyCapPointStrategy';
import { PointService } from '../../src/points/PointService';
import { StandardPointStrategy } from '../../src/points/StandardPointStrategy';
import { TierPolicy } from '../../src/points/TierPolicy';

const session = (minutes: number, extraSec = 0) =>
  new StudySession(1, 1, minutes * 60 + extraSec, new Date('2026-11-14'), 0);

describe('StandardPointStrategy (FR-8)', () => {
  const strategy = new StandardPointStrategy();

  test('30-minute session gives 150 points', () => {
    expect(strategy.calculatePoints(session(30), 0)).toBe(150);
  });

  test('14-minute session gives 0 points', () => {
    expect(strategy.calculatePoints(session(14), 0)).toBe(0);
  });

  test('14 min 59 s is rounded down and gives 0 points', () => {
    expect(strategy.calculatePoints(session(14, 59), 0)).toBe(0);
  });

  test('exactly 15 minutes gives 75 points', () => {
    expect(strategy.calculatePoints(session(15), 0)).toBe(75);
  });
});

describe('TierPolicy (FR-9)', () => {
  const policy = new TierPolicy();

  test.each([
    [0, 1], [150, 1], [199, 1], [200, 2], [999, 2], [1000, 3], [3000, 4], [10000, 4],
  ])('%i lifetime points -> Tier %i', (points, tier) => {
    expect(policy.getTier(points)).toBe(tier);
  });
});

describe('DailyCapPointStrategy (R4, optional)', () => {
  const capped = new DailyCapPointStrategy(new StandardPointStrategy(), 500);

  test('no change when under the cap', () => {
    expect(capped.calculatePoints(session(30), 0)).toBe(150);
  });

  test('cuts points above the daily cap', () => {
    expect(capped.calculatePoints(session(30), 400)).toBe(100);
  });

  test('gives 0 when the cap is already reached', () => {
    expect(capped.calculatePoints(session(30), 500)).toBe(0);
  });
});

describe('PointService (UC4 flow)', () => {
  test('example table: 30 min (with pause), 14 min, 15 min', () => {
    const user = new User(1);
    const service = new PointService();

    // Session 1: 35 min elapsed, 5 min paused -> 30 active minutes
    const s1 = session(30);
    const r1 = service.awardPoints(user, s1);
    expect(r1).toEqual({ earnedPoints: 150, newBalance: 150, newTier: 1, tierUnlocked: false });
    expect(s1.pointsEarned).toBe(150);

    // Session 2: 14 min -> 0 points, session still has a record
    const s2 = session(14);
    const r2 = service.awardPoints(user, s2);
    expect(r2).toEqual({ earnedPoints: 0, newBalance: 150, newTier: 1, tierUnlocked: false });
    expect(s2.pointsEarned).toBe(0);

    // Session 3: 15 min -> 75 points, lifetime 225 -> Tier 2 unlocked
    const r3 = service.awardPoints(user, session(15));
    expect(r3).toEqual({ earnedPoints: 75, newBalance: 225, newTier: 2, tierUnlocked: true });
  });

  test('buying (UC3) lowers points but never lowers the tier', () => {
    const user = new User(1);
    new PointService().awardPoints(user, session(60)); // 300 points
    user.deductPoints(250);
    expect(user.getPoints()).toBe(50);
    expect(user.getLifetimePoints()).toBe(300);
    expect(user.getTier()).toBe(2);
  });

  test('strategy can be swapped without changing PointService', () => {
    const user = new User(1);
    const service = new PointService();
    service.setStrategy(new DailyCapPointStrategy(new StandardPointStrategy(), 100));
    expect(service.awardPoints(user, session(30)).earnedPoints).toBe(100);
  });
});
