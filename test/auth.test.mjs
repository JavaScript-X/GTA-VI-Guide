import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, signJwt, verifyJwt, verifyPassword } from "../packages/service-kit/src/auth.mjs";

describe("auth helpers", () => {
  it("hashes and verifies passwords", () => {
    const hash = hashPassword("ChangeMe123!");

    assert.equal(verifyPassword("ChangeMe123!", hash), true);
    assert.equal(verifyPassword("wrong", hash), false);
  });

  it("signs and verifies JWT claims", () => {
    const token = signJwt(
      {
        sub: "user_1",
        roles: ["player", "moderator"]
      },
      {
        secret: "test-secret",
        expiresInSeconds: 60
      }
    );

    const claims = verifyJwt(token, { secret: "test-secret" });
    assert.equal(claims.sub, "user_1");
    assert.deepEqual(claims.roles, ["player", "moderator"]);
  });

  it("rejects tampered JWTs", () => {
    const token = signJwt({ sub: "user_1" }, { secret: "test-secret" });
    const tampered = `${token.slice(0, -1)}x`;

    assert.throws(() => verifyJwt(tampered, { secret: "test-secret" }), /Invalid token/);
  });
});
