import { normalizeForMatch, stringSimilarity } from "@imeceburada/shared";

describe("normalizeForMatch", () => {
  it("trims, collapses whitespace, and lowercases with Turkish locale rules", () => {
    expect(normalizeForMatch("  Çimento   Torbası  ")).toBe("çimento torbası");
    expect(normalizeForMatch("İNŞAAT")).toBe("inşaat");
  });
});

describe("stringSimilarity", () => {
  it("scores identical strings (post-normalization) as 1", () => {
    expect(stringSimilarity("Çimento", "  çimento ")).toBe(1);
  });

  it("scores an obvious typo well above the suggestion threshold", () => {
    expect(stringSimilarity("cimento", "Çimento")).toBeGreaterThan(0.3);
  });

  it("scores unrelated words well below the suggestion threshold", () => {
    expect(stringSimilarity("kalıpçı", "elektrikçi")).toBeLessThan(0.3);
  });

  it("returns 0 for completely disjoint short strings", () => {
    expect(stringSimilarity("ab", "xy")).toBe(0);
  });
});
