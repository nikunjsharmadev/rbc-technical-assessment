export type PipelineRecord = {
  id: number;
  name: string;
  timestamp: number;
};
export const getNewRecords = (records: PipelineRecord[], lastPipelineRun: number): PipelineRecord[] => {
  // The previous successful pipeline timestamp acts as a watermark.
  // Only records newer than the watermark should be processed.
  return records.filter((record) => record.timestamp > lastPipelineRun);
};