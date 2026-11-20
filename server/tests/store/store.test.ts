import { User } from '../../src/models/User';
import { ClothingItem } from '../../src/store/ClothingItem';
import { FurnitureItem } from '../../src/store/FurnitureItem';
import { Inventory } from '../../src/store/Inventory';
import { ItemFactory } from '../../src/store/ItemFactory';
import { StoreItem } from '../../src/store/StoreItem';
import { StoreService } from '../../src/store/StoreService';

const factory = new ItemFactory();
const service = new StoreService();

// Name, cost, tier, and size as in src/db/seed.sql (store wireframe).
const lamp = factory.createItem('furniture', { id: 1, name: 'Floor lamp', cost: 80, tier: 1, gridWidth: 1, gridHeight: 1 });
const desk = factory.createItem('furniture', { id: 3, name: 'Wooden desk', cost: 300, tier: 2, gridWidth: 2, gridHeight: 1 });
const piano = factory.createItem('furniture', { id: 5, name: 'Grand piano', cost: 3000, tier: 4, gridWidth: 2, gridHeight: 2 });
const hoodie = factory.createItem('clothing', { id: 6, name: 'Hoodie', cost: 60, tier: 1, slot: 'top' });

// Item X and Item Y of QA Plan TC-05.
const itemX = factory.createItem('furniture', { id: 101, name: 'Item X', cost: 100, tier: 1, gridWidth: 1, gridHeight: 1 });
const itemY = factory.createItem('furniture', { id: 102, name: 'Item Y', cost: 120, tier: 2, gridWidth: 1, gridHeight: 1 });

const user = (points: number, lifetimePoints: number, owned: StoreItem[] = []) =>
  new User(1, points, lifetimePoints, new Inventory(owned));

describe('ItemFactory (UC3, Factory Pattern)', () => {
  test('a furniture record becomes a FurnitureItem with its grid size', () => {
    expect(desk).toBeInstanceOf(FurnitureItem);
    expect(desk.getName()).toBe('Wooden desk');
    expect(desk.getCost()).toBe(300);
    expect(desk.getTier()).toBe(2);
    expect((desk as FurnitureItem).getGridSize()).toEqual([2, 1]);
  });

  test('a clothing record becomes a ClothingItem with its slot', () => {
    expect(hoodie).toBeInstanceOf(ClothingItem);
    expect((hoodie as ClothingItem).getSlot()).toBe('top');
  });

  test('accepts rows as they come from the database (unused columns are null)', () => {
    const coat = factory.createItem('clothing', {
      id: 8, name: 'Winter coat', cost: 900, tier: 3, gridWidth: null, gridHeight: null, slot: 'outer',
    });
    expect((coat as ClothingItem).getSlot()).toBe('outer');
  });

  test('an unknown item type is rejected', () => {
    expect(() => factory.createItem('wallpaper', { id: 9, name: 'Wallpaper', cost: 50, tier: 1 }))
      .toThrow('Unknown item type');
  });

  test('furniture without a grid size is rejected', () => {
    expect(() => factory.createItem('furniture', { id: 9, name: 'Table', cost: 50, tier: 1 }))
      .toThrow('grid size');
  });

  test('clothing with an unknown slot is rejected', () => {
    expect(() => factory.createItem('clothing', { id: 9, name: 'Hat', cost: 50, tier: 1, slot: 'head' }))
      .toThrow('slot');
  });
});

describe('Inventory (FR-10)', () => {
  test('an item is owned only after it is added', () => {
    const inventory = new Inventory();
    expect(inventory.owns(desk.getId())).toBe(false);
    inventory.add(desk);
    expect(inventory.owns(desk.getId())).toBe(true);
  });

  test('the same item cannot be added twice', () => {
    const inventory = new Inventory([lamp]);
    expect(() => inventory.add(lamp)).toThrow('already owned');
  });
});

describe('StoreService.canPurchase (FR-9, FR-10)', () => {
  test('FR-10: a user with 500 points can buy the 300-point Tier-2 desk', () => {
    expect(service.canPurchase(user(500, 500), desk)).toEqual({ allowed: true });
  });

  test('FR-10: with 100 points the same purchase is rejected', () => {
    expect(service.canPurchase(user(100, 500), desk)).toEqual({ allowed: false, reason: 'NOT_ENOUGH_POINTS' });
  });

  test('a cost equal to the points is allowed', () => {
    expect(service.canPurchase(user(300, 300), desk)).toEqual({ allowed: true });
  });

  test('QA TC-05: a Tier-1 user with 150 points cannot buy Item Y (Tier 2) but can buy Item X', () => {
    const tierOneUser = user(150, 150);
    expect(service.canPurchase(tierOneUser, itemY)).toEqual({ allowed: false, reason: 'TIER_LOCKED' });
    expect(service.canPurchase(tierOneUser, itemX)).toEqual({ allowed: true });
  });

  test('FR-9: after crossing 200 lifetime points, Tier-2 items can be bought', () => {
    expect(service.canPurchase(user(200, 200), itemY)).toEqual({ allowed: true });
  });

  test('an owned item cannot be bought again', () => {
    expect(service.canPurchase(user(500, 500, [lamp]), lamp)).toEqual({ allowed: false, reason: 'ALREADY_OWNED' });
  });

  test('the tier is checked before the points, as on the store wireframe ("Tier 4 required")', () => {
    expect(service.canPurchase(user(500, 500), piano)).toEqual({ allowed: false, reason: 'TIER_LOCKED' });
  });

  test('the check changes nothing', () => {
    const buyer = user(100, 500);
    service.canPurchase(buyer, desk);
    expect(buyer.getPoints()).toBe(100);
    expect(buyer.getInventory().owns(desk.getId())).toBe(false);
  });
});

describe('Purchase steps (Design Document 3.3)', () => {
  test('buying the desk with 500 points leaves 200 points; lifetime points and tier stay the same', () => {
    const buyer = user(500, 500);
    expect(service.canPurchase(buyer, desk)).toEqual({ allowed: true });

    buyer.deductPoints(desk.getCost());
    buyer.getInventory().add(desk);

    expect(buyer.getPoints()).toBe(200);
    expect(buyer.getLifetimePoints()).toBe(500);
    expect(buyer.getTier()).toBe(2);
    expect(service.canPurchase(buyer, desk)).toEqual({ allowed: false, reason: 'ALREADY_OWNED' });
  });
});
