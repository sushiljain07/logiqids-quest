import { describe, it, expect } from "vitest";
import { pickVoice } from "./speech.js";

describe("pickVoice", () => {
  it("prefers an English voice with a feminine/child-friendly name", () => {
    const voices = [
      { name: "Google US English", lang: "en-US" },
      { name: "Microsoft Zira", lang: "en-US" },
      { name: "Google Deutsch", lang: "de-DE" },
    ];
    expect(pickVoice(voices).name).toBe("Microsoft Zira");
  });

  it("falls back to any English voice when no preferred name matches", () => {
    const voices = [
      { name: "Google Deutsch", lang: "de-DE" },
      { name: "Google US English", lang: "en-US" },
    ];
    expect(pickVoice(voices).name).toBe("Google US English");
  });

  it("falls back to the first voice when nothing is English", () => {
    const voices = [{ name: "Google Deutsch", lang: "de-DE" }];
    expect(pickVoice(voices).name).toBe("Google Deutsch");
  });

  it("returns null for an empty voice list", () => {
    expect(pickVoice([])).toBe(null);
  });

  it("prefers an Indian-English (en-IN) voice over other English voices", () => {
    const voices = [
      { name: "Google US English", lang: "en-US" },
      { name: "Microsoft Zira", lang: "en-US" },
      { name: "Microsoft Ravi - English (India)", lang: "en-IN" },
    ];
    expect(pickVoice(voices).lang).toBe("en-IN");
  });

  it("among multiple en-IN voices, still prefers a feminine/child-friendly name", () => {
    const voices = [
      { name: "Microsoft Ravi", lang: "en-IN" },
      { name: "Microsoft Heera - Female", lang: "en-IN" },
    ];
    expect(pickVoice(voices).name).toBe("Microsoft Heera - Female");
  });

  it("matches the en-IN locale case-insensitively", () => {
    const voices = [
      { name: "Google US English", lang: "en-US" },
      { name: "Some Voice", lang: "EN-in" },
    ];
    expect(pickVoice(voices).lang).toBe("EN-in");
  });
});
