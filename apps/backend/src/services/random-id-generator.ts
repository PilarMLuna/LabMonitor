import { randomUUID } from "node:crypto";

import type { IdGenerator } from "@lab-monitor/domain";

export class RandomIdGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
}
