// Business requirement: a queue can contain at most 1,000 customers.
export const MAX_QUEUE_SIZE = 1000;
export class Queue<T> {
  private readonly items: T[] = [];
  // Points to the next item that should be removed.
  // This avoids Array.shift() and keeps dequeue O(1).
  private head = 0;
  enqueue(item: T): void {
    this.items.push(item);
  }
  dequeue(): T | undefined {
    if (this.head >= this.items.length) return undefined;
    const item = this.items[this.head];
    this.head++;
    // Reset the internal storage when all items have been processed.
    // This prevents processed items from accumulating indefinitely.
    if (this.head === this.items.length) {
      this.items.length = 0;
      this.head = 0;
    }
    return item;
  }
  size(): number {
    return this.items.length - this.head;
  }
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
