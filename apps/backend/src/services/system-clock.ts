import type { Clock } from "@lab-monitor/domain";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
