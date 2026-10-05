import { Queue, MAX_QUEUE_SIZE } from './queue.js';
import { Customer } from './customer.js';

export class RestaurantSystem {
  // One queue is created for each employee.
  // Using an array allows the system to scale beyond two employees.
  private readonly queues: Queue<Customer>[];
  // Shared across all employee queues to prevent a customer
  // from registering with more than one queue.
  private readonly registeredCustomerIds = new Set<number>();
  // Customers are moved here after they are processed.
  private readonly processedCustomers: Customer[] = [];

  constructor(employeeCount: number) {
    if (employeeCount <= 0) throw new Error('At least one employee is Required');
    this.queues = Array.from({ length: employeeCount }, () => new Queue<Customer>());
  }

  register(customer: Customer): void {
    // A customer can only belong to one active queue.
    if (this.registeredCustomerIds.has(customer.id)) throw new Error(`Customer ${customer.id} is already registered`);
    const queue = this.getShortestQueue();
    if (queue.size() >= MAX_QUEUE_SIZE) throw new Error('All queues are full');
    queue.enqueue(customer);
    this.registeredCustomerIds.add(customer.id);
  }

  processNextCustomer(employeeIndex: number): Customer | undefined {
    const queue = this.queues[employeeIndex];
    if (!queue) throw new Error('Invalid employee index');
    const customer = queue.dequeue();
    if (!customer) return undefined;
    this.processedCustomers.push(customer);
    this.registeredCustomerIds.delete(customer.id);
    return customer;
  }

  getQueueSizes(): number[] {
    return this.queues.map((queue) => queue.size());
  }

  getProcessedCustomers(): Customer[] {
    return [...this.processedCustomers];
  }

  private getShortestQueue(): Queue<Customer> {
    // Assign each new customer to the shortest employee queue
    // to distribute the workload more evenly.
    return this.queues.reduce((shortest, current) => (current.size() < shortest.size() ? current : shortest));
  }
}
