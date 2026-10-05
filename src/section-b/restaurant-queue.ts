import { Queue, MAX_QUEUE_SIZE } from './queue.js';
import { Customer } from './customer.js';
export class RestaurantQueue {
  private queue = new Queue<Customer>();
  // Keeps processed customers separate from the active waiting queue.
  private processedCustomer: Customer[] = [];
  // Tracks customers currently registered in the waiting system
  // so the same customer cannot register more than once.
  private registeredCustomerIds = new Set<number>();

  register(customer: Customer): void {
    if (this.queue.size() >= MAX_QUEUE_SIZE) throw new Error('Queue is Full');
    // A customer cannot be registered more than once.
    if (this.registeredCustomerIds.has(customer.id)) throw new Error('Customer is already registered');
    this.queue.enqueue(customer);
    this.registeredCustomerIds.add(customer.id);
  }

  processNextCustomer(): Customer | undefined {
    // FIFO behaviour is provided by dequeue().
    const customer = this.queue.dequeue();
    if (!customer) return undefined;
    // Move the customer from the active queue to processed storage.
    this.processedCustomer.push(customer);
    // The customer is no longer active in the waiting list.
    this.registeredCustomerIds.delete(customer.id);
    return customer;
  }

  getQueueSize(): number {
    return this.queue.size();
  }

  getProcessedCustomer(): Customer[] {
    // Return a copy so callers cannot directly modify internal state.
    return [...this.processedCustomer];
  }
}