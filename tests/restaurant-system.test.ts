import { describe, expect, it } from 'vitest';
import { RestaurantSystem } from '../src/section-b/restaurant-system.js';
describe('RestaurantSystem', () => {
  it('registers customers and distributes them across queues', () => {
    const restaurant = new RestaurantSystem(2);
    restaurant.register({
      id: 1,
      name: 'Customer 1',
    });
    restaurant.register({
      id: 2,
      name: 'Customer 2',
    });
    restaurant.register({
      id: 3,
      name: 'Customer 3',
    });
    expect(restaurant.getQueueSizes()).toEqual([2, 1]);
  });
  it('prevents the same customer from registration twice', () => {
    const restaurant = new RestaurantSystem(2);
    restaurant.register({
      id: 1,
      name: 'Customer 1',
    });
    expect(() =>
      restaurant.register({
        id: 1,
        name: 'Customer 1',
      }),
    ).toThrow('already registered');
  });
  it('processes customers in FIFO order', () => {
    const restaurant = new RestaurantSystem(1);

    restaurant.register({
      id: 1,
      name: 'Customer 1',
    });

    restaurant.register({
      id: 2,
      name: 'Customer 2',
    });

    expect(restaurant.processNextCustomer(0)).toEqual({
      id: 1,
      name: 'Customer 1',
    });

    expect(restaurant.processNextCustomer(0)).toEqual({
      id: 2,
      name: 'Customer 2',
    });
  });

  it('removes a processed customer from the registration set', () => {
    const restaurant = new RestaurantSystem(1);
    restaurant.register({
      id: 1,
      name: 'Customer 1',
    });
    restaurant.processNextCustomer(0);
    expect(() =>
      restaurant.register({
        id: 1,
        name: 'Customer 1',
      }),
    ).not.toThrow();
  });

  it('rejects an invalid employee index', () => {
    const restaurant = new RestaurantSystem(2);
    expect(() => restaurant.processNextCustomer(5)).toThrow('Invalid employee index');
  });
  it('does not allow more than 1000 customers in one queue', () => {
    const restaurant = new RestaurantSystem(1);
    for (let id = 1; id <= 1000; id++) {
      restaurant.register({
        id,
        name: `Customer ${id}`,
      });
    }
    expect(restaurant.getQueueSizes()).toEqual([1000]);
    // The 1,001st customer must be rejected by the capacity rule.
    expect(() =>
      restaurant.register({
        id: 1001,
        name: 'Customer 1001',
      }),
    ).toThrow('All queues are full');
  });
  it('supports multiple employees', () => {
    const restaurant = new RestaurantSystem(3);
    for (let id = 1; id <= 6; id++) {
      restaurant.register({
        id,
        name: `Customer ${id}`,
      });
    }
    expect(restaurant.getQueueSizes()).toEqual([2, 2, 2]);
  });
  it('prevents a customer from joining another queue', () => {
    const restaurant = new RestaurantSystem(2);
    restaurant.register({
      id: 101,
      name: 'Customer 101',
    });
    expect(() =>
      restaurant.register({
        id: 101,
        name: 'Customer 101',
      }),
    ).toThrow('already registered');
    expect(restaurant.getQueueSizes()).toEqual([1, 0]);
  });
});
