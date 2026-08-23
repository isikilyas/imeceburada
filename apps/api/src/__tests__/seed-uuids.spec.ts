import { readFileSync } from "fs";
import { join } from "path";

/**
 * Seed verisindeki UUID'ler daha önce yanlış grupta version/variant nibble'ı
 * taşıyordu (ör. "-4000-8000-" grup 2/3'teydi, olması gereken grup 3/4).
 * class-validator'ın @IsUUID() kontrolü bunu reddediyor ve "İlana Başvur"
 * akışını tüm seed ilanlar için kırıyordu. Bu test aynı regresyonu yakalar.
 */
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_LIKE_PATTERN = /"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"/gi;

describe("seed.ts UUIDs", () => {
  const seedSource = readFileSync(join(__dirname, "../../prisma/seed.ts"), "utf-8");
  const matches = [...seedSource.matchAll(UUID_LIKE_PATTERN)].map((m) => m[0].slice(1, -1));

  it("contains at least one hardcoded UUID to check", () => {
    expect(matches.length).toBeGreaterThan(0);
  });

  it("every hardcoded UUID is a valid v4 UUID (version/variant nibbles in the right group)", () => {
    const invalid = matches.filter((id) => !UUID_V4_PATTERN.test(id));
    expect(invalid).toEqual([]);
  });
});
