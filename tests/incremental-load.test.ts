import { describe, expect, it } from 'vitest';
import { getNewRecords, PipelineRecord } from '../src/section-a/incremental-load.js';

describe('getNewRecords', () => {
  const records: PipelineRecord[] = [
    {
      id: 1,
      name: 'Building A',
      timestamp: 1000,
    },
    {
      id: 2,
      name: 'Building B',
      timestamp: 2000,
    },
    {
      id: 3,
      name: 'Building C',
      timestamp: 3000,
    },
  ];
  it('returns records newer than the last pipeline run', () => {
    const result = getNewRecords(records, 1500);
    expect(result).toEqual([records[1], records[2]]);
  });
  it('returns an empty array when there are no records', () => {
    const result = getNewRecords(records, 3000);
    expect(result).toEqual([]);
  });
  it('does not include a record with the exact same timestamp', () => {
    const result = getNewRecords(records, 2000);
    expect(result).toEqual([records[2]]);
  });
});
