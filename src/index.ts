import { fetchThreeTimes } from './section-a/fetch-three-times.js';
import { getNewRecords, PipelineRecord } from './section-a/incremental-load.js';
import { RestaurantSystem } from './section-b/restaurant-system.js';

const main = async (): Promise<void> => {
  console.log('==== Section A: API ====');
  await fetchThreeTimes();
  console.log('\n ==== Section A: Incremental Load ====');
  const records: PipelineRecord[] = [
    {
      id: 1,
      name: 'Building A',
      timestamp: 10000,
    },
    {
      id: 2,
      name: 'Building B',
      timestamp: 2000,
    },
    {
      id: 3,
      name: 'Building C',
      timestamp: 30000,
    },
  ];
  const newRecords = getNewRecords(records, 1500);
  console.log('New records: ', newRecords);
  console.log('\n ==== Section B: Restaurant ==== ');
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
  restaurant.register({
    id: 4,
    name: 'Customer 4',
  });
  console.log('Queue Sizes: ', restaurant.getQueueSizes());
  console.log('Employee 1:', restaurant.processNextCustomer(0));
  console.log('Employee 2: ', restaurant.processNextCustomer(1));
  console.log('Processed: ', restaurant.getProcessedCustomers());
};

main().catch((error: unknown) => {
  console.error('Application failed: ', error);
});
