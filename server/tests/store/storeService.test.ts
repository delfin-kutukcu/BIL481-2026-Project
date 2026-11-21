import { ClothingItem } from '../../src/store/ClothingItem';
import { FurnitureItem } from '../../src/store/FurnitureItem';
import { StoreService } from '../../src/store/StoreService';
import { FakeStoreRepository } from './FakeStoreRepository';

// Unit tests of the purchase logic with an in-memory repository (seed items, ids 1 to 8).
// The same flows against a real PostgreSQL are in tests/db/storeRepository.db.test.ts.

const FLOOR_LAMP = 1;
const WOODEN_DESK = 3;
const SNEAKERS = 7;
const WINTER_COAT = 8;

const USER = 1;

function storeWith(points: number, lifetimePoints: number, owned: number[] = []) {
  const repository = new FakeStoreRepository().addUser(USER, points, lifetimePoints, owned);
  return { repository, service: new StoreService(repository) };
}

describe('StoreService.listItems (UC3, Factory Pattern)', () => {
  test('every items record becomes a FurnitureItem or a ClothingItem', async () => {
    const items = await storeWith(0, 0).service.listItems();

    expect(items).toHaveLength(8);
    expect(items.filter((item) => item instanceof FurnitureItem)).toHaveLength(5);
    expect(items.filter((item) => item instanceof ClothingItem)).toHaveLength(3);
    expect(items[2].getName()).toBe('Wooden desk');
    expect((items[2] as FurnitureItem).getGridSize()).toEqual([2, 1]);
    expect((items[7] as ClothingItem).getSlot()).toBe('outer');
  });
});

describe('StoreService.listInventory', () => {
  test('returns the items the user owns', async () => {
    const owned = await storeWith(0, 500, [FLOOR_LAMP, WOODEN_DESK]).service.listInventory(USER);

    expect(owned.map((item) => item.getName())).toEqual(['Floor lamp', 'Wooden desk']);
  });

  test('a user who owns nothing gets an empty list', async () => {
    expect(await storeWith(0, 0).service.listInventory(USER)).toEqual([]);
  });
});

describe('StoreService.buyItem (FR-10, Design Document 3.3)', () => {
  test('FR-10: with 500 points the 300-point Tier-2 desk is bought and 200 points are left', async () => {
    const { repository, service } = storeWith(500, 500);
    const result = await service.buyItem(USER, WOODEN_DESK);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newBalance).toBe(200);
      expect(result.inventory.map((item) => item.getName())).toEqual(['Wooden desk']);
    }
    expect(repository.stored(USER)).toEqual({ points: 200, lifetimePoints: 500, owned: [WOODEN_DESK] });
  });

  test('lifetime points do not change, so the tier does not drop after a purchase (FR-9)', async () => {
    const { repository, service } = storeWith(250, 250);
    await service.buyItem(USER, SNEAKERS);

    expect(repository.stored(USER)).toEqual({ points: 50, lifetimePoints: 250, owned: [SNEAKERS] });
  });

  test('a cost equal to the points is allowed and leaves 0 points', async () => {
    const { repository, service } = storeWith(200, 500);

    expect((await service.buyItem(USER, SNEAKERS)).success).toBe(true);
    expect(repository.stored(USER)?.points).toBe(0);
  });

  test('the returned inventory holds the old items and then the new one', async () => {
    const result = await storeWith(500, 500, [FLOOR_LAMP]).service.buyItem(USER, WOODEN_DESK);

    expect(result.success && result.inventory.map((item) => item.getName())).toEqual(['Floor lamp', 'Wooden desk']);
  });

  test('FR-10: with 100 points the same purchase is rejected and nothing changes', async () => {
    const { repository, service } = storeWith(100, 500);

    expect(await service.buyItem(USER, WOODEN_DESK)).toEqual({ success: false, reason: 'NOT_ENOUGH_POINTS' });
    expect(repository.stored(USER)).toEqual({ points: 100, lifetimePoints: 500, owned: [] });
  });

  test('FR-9: an item of a locked tier is rejected even with enough points', async () => {
    const { repository, service } = storeWith(950, 950);

    expect(await service.buyItem(USER, WINTER_COAT)).toEqual({ success: false, reason: 'TIER_LOCKED' });
    expect(repository.stored(USER)).toEqual({ points: 950, lifetimePoints: 950, owned: [] });
  });

  test('an owned item cannot be bought again', async () => {
    const { repository, service } = storeWith(500, 500, [WOODEN_DESK]);

    expect(await service.buyItem(USER, WOODEN_DESK)).toEqual({ success: false, reason: 'ALREADY_OWNED' });
    expect(repository.stored(USER)).toEqual({ points: 500, lifetimePoints: 500, owned: [WOODEN_DESK] });
  });

  test('an unknown item id is rejected', async () => {
    const { repository, service } = storeWith(500, 500);

    expect(await service.buyItem(USER, 999)).toEqual({ success: false, reason: 'ITEM_NOT_FOUND' });
    expect(repository.stored(USER)).toEqual({ points: 500, lifetimePoints: 500, owned: [] });
  });

  test('an item id that is not a positive whole number is rejected without opening a transaction', async () => {
    const { repository, service } = storeWith(500, 500);

    for (const itemId of [0, -3, 1.5, Number.NaN]) {
      expect(await service.buyItem(USER, itemId)).toEqual({ success: false, reason: 'ITEM_NOT_FOUND' });
    }
    expect(repository.transactionCount).toBe(0);
  });

  test('an unknown user is an error, and nothing is saved', async () => {
    const { service } = storeWith(500, 500);

    await expect(service.buyItem(42, WOODEN_DESK)).rejects.toThrow('User 42 not found');
  });

  test('if the item cannot be added, the point deduction is not saved either (one transaction)', async () => {
    const { repository, service } = storeWith(500, 500);
    repository.failNextInventoryWrite = true;

    await expect(service.buyItem(USER, WOODEN_DESK)).rejects.toThrow('insert into inventory failed');
    expect(repository.stored(USER)).toEqual({ points: 500, lifetimePoints: 500, owned: [] });
  });
});
