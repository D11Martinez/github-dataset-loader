import Bottleneck from 'bottleneck';
import { maxConcurrentRequests, milisecondsBetweenRequests } from 'src/common';

export const bootleneckConfig: Bottleneck.ConstructorOptions = {
  maxConcurrent: maxConcurrentRequests,
  minTime: milisecondsBetweenRequests,
};
