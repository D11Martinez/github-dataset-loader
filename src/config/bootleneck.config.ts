import Bottleneck from 'bottleneck';
import { maxConcurrentRequests, milisecondsBetweenRequests } from '../common';

export const bootleneckConfig: Bottleneck.ConstructorOptions = {
  maxConcurrent: maxConcurrentRequests,
  minTime: milisecondsBetweenRequests,
};
