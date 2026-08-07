import { describe, expect, it } from "vitest";

import { User, type UserRole } from "./user.js";

describe("User", () => {
  it.each<UserRole>(["admin", "researcher", "technician", "viewer"])(
    "creates a user with the %s role",
    (role) => {
      const user = new User({
        id: "user-1",
        name: "Ada",
        role,
      });

      expect(user.role).toBe(role);
    },
  );
});
