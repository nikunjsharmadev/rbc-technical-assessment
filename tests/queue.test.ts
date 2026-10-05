import { describe, expect, it } from 'vitest';
import { Queue } from '../src/section-b/queue.js';

describe('Queue', () => {
  it('adds and removes items using FIFO order', () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
  });

  it('returns undefined when the queue is empty', () => {
    const queue = new Queue<number>();
    expect(queue.dequeue()).toBeUndefined();
  });

  it('returns the correct queue size', () => {
    const queue = new Queue<number>();
    expect(queue.size()).toBe(0);
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.size()).toBe(2);
    queue.dequeue();
    expect(queue.size()).toBe(1);
  });

  it('reports whether the queue is empty', () => {
    const queue = new Queue<number>();
    expect(queue.isEmpty()).toBe(true);
    queue.enqueue(1);
    expect(queue.isEmpty()).toBe(false);
    queue.dequeue();
    expect(queue.isEmpty()).toBe(true);
  });
});
