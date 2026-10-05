# Technical Assessment – ETL and Restaurant Queue System

A TypeScript implementation covering asynchronous API processing, incremental data loading, FIFO queue management, duplicate prevention, and scalable multi-employee queue handling.

## Overview

This repository contains solutions for two technical areas:

### Section A – Data Processing

* Fetch data from an external API three times with a one-second delay between requests.
* Filter records incrementally using the timestamp from the last successful pipeline run.

### Section B – Restaurant Queue System

* Implement a FIFO customer queue.
* Enforce a maximum queue size of 1,000 customers.
* Prevent a customer from registering more than once.
* Remove customers from the active queue when processed.
* Store processed customers separately.
* Support multiple employees with independent queues.
* Distribute new customers across queues.
* Allow the design to scale to additional employees and restaurant locations.

---

## Tech Stack

* Node.js 24
* TypeScript
* Vitest
* Fetch API
* ES Modules

---

## Project Structure

```text
.
├── src/
│   ├── section-a/
│   │   ├── fetch-three-times.ts
│   │   └── incremental-load.ts
│   │
│   ├── section-b/
│   │   ├── customer.ts
│   │   ├── queue.ts
│   │   ├── restaurant-queue.ts
│   │   └── restaurant-system.ts
│   │
│   └── index.ts
│
├── tests/
│   ├── incremental-load.test.ts
│   ├── queue.test.ts
│   └── restaurant-system.test.ts
│
├── package.json
├── package-lock.json
├── tsconfig.json
├── .gitignore
└── README.md
```

---

# Section A – Data Processing

## A1. Fetch API Three Times

### Requirement

Fetch data from:

```text
https://jsonplaceholder.typicode.com/posts
```

three times with a one-second delay between requests.

### Approach

The requests are executed sequentially:

```text
Request 1
   ↓
Wait 1 second
   ↓
Request 2
   ↓
Wait 1 second
   ↓
Request 3
```

The implementation:

1. Loops exactly three times.
2. Calls the API using `fetch()`.
3. Checks the HTTP response.
4. Parses the JSON response.
5. Waits one second before the next request.

### Implementation

The implementation is located at:

```text
src/section-a/fetch-three-times.ts
```

### Error Handling

The implementation checks `response.ok` because `fetch()` does not reject its promise for HTTP error status codes such as `404` or `500`.

```typescript
if (!response.ok) {
  throw new Error(
    `Request failed with status ${response.status}`
  );
}
```

### Complexity

For a fixed number of three requests:

* Time: `O(n)` where `n` is the response size.
* Space: `O(n)` for the response data.

---

# A2. Incremental Data Loading

## Requirement

Filter records that are newer than the timestamp from the last pipeline run.

### Approach

The last successful pipeline timestamp is treated as a **watermark**.

```text
Last Successful Pipeline Run
             ↓
        Read Records
             ↓
   timestamp > lastRun?
          ↙       ↘
        YES        NO
         ↓          ↓
      Process      Skip
```

For example, if:

```text
lastPipelineRun = 1500
```

and the incoming records contain:

```text
1000
2000
3000
```

the records selected for processing are:

```text
2000
3000
```

### Implementation

Located at:

```text
src/section-a/incremental-load.ts
```

The core operation is:

```typescript
return records.filter(
  (record) => record.timestamp > lastPipelineRun
);
```

### Why a Watermark?

A watermark allows the pipeline to process only new or updated records instead of processing the complete dataset during every run.

### Pipeline Reliability

The watermark should represent the **last successful pipeline run**, not simply the last attempted run.

```text
Start Pipeline
      ↓
Read Last Successful Watermark
      ↓
Get New Records
      ↓
Validate / Transform / Process
      ↓
Pipeline Successful?
      ↙              ↘
    YES              NO
     ↓                ↓
Update             Keep Previous
Watermark           Watermark
```

If processing fails, keeping the previous watermark allows the records to be retried during the next run.

### Timestamp Boundary

This implementation uses:

```text
record.timestamp > lastPipelineRun
```

This treats the watermark as an exclusive boundary.

For production systems where multiple records can have the exact same timestamp, a composite watermark such as:

```text
(updatedAt, recordId)
```

could be used to avoid missing records with identical timestamps.

### Complexity

For `n` records:

* Time: `O(n)`
* Space: `O(k)`, where `k` is the number of records returned after filtering.

---

# Section B – Restaurant Queue System

## Requirements

The restaurant needs a customer waiting-list system where customers are processed in registration order.

The system must:

* Support up to 1,000 customers in a queue.
* Process customers using FIFO ordering.
* Remove processed customers from the active queue.
* Store processed customers separately.
* Prevent duplicate customer registration.
* Support multiple employees.
* Assign each employee an independent queue.
* Scale to additional employees and restaurants.

---

# B1. FIFO Queue

The core data structure is a queue.

```text
First In → First Out
```

For example:

```text
Customer A
Customer B
Customer C
```

Processing produces:

```text
Customer A
     ↓
Customer B
     ↓
Customer C
```

### Queue Operations

```text
enqueue() → add customer
dequeue() → remove first customer
```

The implementation is located at:

```text
src/section-b/queue.ts
```

A head pointer is used so that dequeue operations remain `O(1)` rather than repeatedly shifting the entire array.

### Complexity

```text
enqueue → O(1)
dequeue → O(1)
size    → O(1)
isEmpty → O(1)
```

---

# B2. Duplicate Customer Prevention

A customer cannot register in two queues.

A `Set<number>` stores the IDs of currently registered customers.

```text
Customer ID
     ↓
Already in Set?
   ↙       ↘
 YES       NO
  ↓         ↓
Reject     Add ID
             ↓
           Queue
```

Example:

```typescript
if (registeredCustomerIds.has(customer.id)) {
  throw new Error("Customer is already registered");
}
```

### Why Set?

A Set provides average `O(1)` lookup, making it appropriate for duplicate detection.

When a customer is processed, the customer ID is removed from the Set:

```typescript
registeredCustomerIds.delete(customer.id);
```

This means the customer is no longer considered active in the waiting list.

---

# B3. Processing Customers

When an employee is ready to serve the next customer:

```text
Active Queue
     ↓
  dequeue()
     ↓
Customer
     ↓
Processed Storage
```

The customer is:

1. Removed from the active queue.
2. Added to processed customers.
3. Removed from the active customer Set.

This keeps active and completed customers separate.

---

# B4. Multiple Employees

Initially:

```text
Lionel
   ↓
Queue 1
```

When a second employee joins:

```text
Lionel              Ronaldo
   ↓                   ↓
Queue 1              Queue 2
```

The implementation does not hard-code two queues.

Instead, it uses:

```typescript
Queue<Customer>[]
```

This allows the same design to support:

```text
1 employee  → 1 queue
2 employees → 2 queues
5 employees → 5 queues
N employees → N queues
```

The implementation is located at:

```text
src/section-b/restaurant-system.ts
```

---

# B5. Customer Assignment

When a customer registers, the system selects the shortest queue.

For example:

```text
Queue 1 → 5 customers
Queue 2 → 3 customers
Queue 3 → 7 customers
```

The new customer is assigned to:

```text
Queue 2
```

This provides a simple load-balancing strategy across employees.

### Assignment Flow

```text
New Customer
     ↓
Duplicate Check
     ↓
Find Shortest Queue
     ↓
Queue Available?
   ↙          ↘
 YES          NO
  ↓            ↓
Enqueue     Reject
  ↓
Add Customer ID to Set
```

---

# B6. Queue Capacity

The assessment specifies a maximum of 1,000 people.

The implementation checks the capacity before adding a customer:

```typescript
if (queue.size() >= MAX_QUEUE_SIZE) {
  throw new Error("Queue is full");
}
```

The maximum is represented as a constant:

```typescript
const MAX_QUEUE_SIZE = 1000;
```

This avoids scattering the business rule throughout the code.

---

# B7. Scalability

The queue system is designed around a collection of queues rather than a fixed number of employees.

```text
Restaurant System
       |
       +---- Queue 1 → Employee 1
       |
       +---- Queue 2 → Employee 2
       |
       +---- Queue 3 → Employee 3
       |
       +---- Queue N → Employee N
```

This means adding another employee does not require changing the queue algorithm.

### Multiple Restaurants

For a future multi-location system, each restaurant should have its own queue namespace.

Conceptually:

```text
Restaurant A
   ├── Queue 1
   ├── Queue 2
   └── Queue 3

Restaurant B
   ├── Queue 1
   ├── Queue 2
   └── Queue 3
```

A production data model would therefore associate queue/customer state with a `restaurantId`.

---

# Production Considerations

The current implementation intentionally uses in-memory data structures because the assessment focuses on algorithms and core system behaviour.

For a production environment with multiple application instances, I would move shared state to a durable/shared data store.

A possible architecture:

```text
                         Load Balancer
                              |
                +-------------+-------------+
                |             |             |
                ↓             ↓             ↓
            API Server 1  API Server 2  API Server 3
                |             |             |
                +-------------+-------------+
                              |
                       Shared Queue Store
                              |
                    +---------+---------+
                    |                   |
                    ↓                   ↓
                 Worker 1            Worker 2
                    |                   |
                    +---------+---------+
                              |
                       Processed Storage
```

Potential production improvements include:

* Redis or a database for shared queue state.
* Persistent customer records.
* Transactional registration.
* Distributed locking where required.
* Idempotent customer processing.
* Retry handling.
* Dead-letter/error handling.
* Audit logging.
* Monitoring and alerting.
* Authentication and authorization.
* Rate limiting.
* Horizontal scaling.
* Restaurant-level partitioning.

---

# Complexity Summary

| Operation                    |     Complexity |
| ---------------------------- | -------------: |
| Queue enqueue                |         `O(1)` |
| Queue dequeue                |         `O(1)` |
| Queue size                   |         `O(1)` |
| Queue empty check            |         `O(1)` |
| Customer duplicate check     | `O(1)` average |
| Add customer ID to Set       | `O(1)` average |
| Remove customer ID from Set  | `O(1)` average |
| Find shortest queue          |         `O(m)` |
| Incremental record filtering |         `O(n)` |

Where:

* `n` = number of records being evaluated.
* `m` = number of employee queues.

For the assessment's queue size and expected number of employees, the straightforward implementation is sufficient. For substantially larger employee counts, a min-heap could be considered for more efficient shortest-queue selection.

---

# Testing

The project includes unit tests using Vitest.

Tests cover:

### Incremental Loading

* Records newer than the watermark are returned.
* No new records returns an empty result.
* Records exactly equal to the watermark are excluded.

### Queue

* FIFO behaviour.
* Empty queue behaviour.
* Queue size tracking.
* Empty-state tracking.

### Restaurant System

* Customer registration.
* Duplicate customer prevention.
* FIFO customer processing.
* Processed customer storage.
* Re-registration after processing.
* Multiple employee queues.
* Queue capacity.
* Invalid employee handling.

Run all tests:

```bash
npm test
```

---

# Getting Started

## Prerequisites

* Node.js 24 or later
* npm

## Install Dependencies

```bash
npm install
```

## Type Check

```bash
npm run typecheck
```

## Run Tests

```bash
npm test
```

## Run Tests in Watch Mode

```bash
npm run test:watch
```

## Build

```bash
npm run build
```

## Run the Application

```bash
npm start
```

---

# Development Flow

The recommended local validation flow is:

```text
npm install
     ↓
npm run typecheck
     ↓
npm test
     ↓
npm run build
     ↓
npm start
```

All checks should pass before pushing changes to the repository.

---

# Design Principles

The implementation follows a few simple principles:

### Keep responsibilities separate

Customer data, queue behaviour, and restaurant coordination are separate concerns.

### Prefer simple data structures

The problem naturally maps to:

```text
FIFO requirement  → Queue
Duplicate check   → Set
Multiple employees → Array of Queues
Incremental load  → Filter + Watermark
```

### Make business rules explicit

Examples:

```text
Maximum queue size = 1,000
Duplicate customer = rejected
Processed customer = removed from active queue
```

### Design for extension

The system supports `N` employees instead of being limited to two employees.

---

# Key Takeaways

The main algorithmic patterns demonstrated in this assessment are:

```text
API processing
→ Async/Await + Sequential Execution

Incremental ETL
→ Watermark + Filtering

Restaurant waiting list
→ FIFO Queue

Duplicate prevention
→ HashSet / Set

Multiple employees
→ Multiple Queues

Load distribution
→ Shortest Queue

Scalability
→ Generic N-queue design + Shared Persistent State
```

---

# Notes

This repository focuses on the requested technical assessment requirements rather than implementing a complete production restaurant application.

The in-memory queue implementation is appropriate for demonstrating the core algorithm and data-structure requirements. A production deployment would require persistent shared state, concurrency control, observability, security, and fault-tolerance mechanisms.
