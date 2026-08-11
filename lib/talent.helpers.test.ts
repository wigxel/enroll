import { describe, expect, it } from "vitest";
import {
  countWords,
  formatSpecialties,
  normalizeEmail,
  normalizePhone,
  TALENT_LIMITS,
  TALENT_SPECIALTY_KEYS,
  validateTalentRequest,
  type TalentRequestInput,
} from "~/lib/talent.helpers";

const validInput = (
  overrides: Partial<TalentRequestInput> = {},
): TalentRequestInput => ({
  companyName: "The Lagos Grill House",
  companyEmail: "hiring@lagosgrill.com",
  contactPhone: "+234 803 123 4567",
  specialties: ["grilling"],
  description:
    "We need two experienced grill chefs for our new branch opening in Lekki next month.",
  ...overrides,
});

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Hiring@Company.COM ")).toBe("hiring@company.com");
  });
});

describe("normalizePhone", () => {
  it("strips display punctuation", () => {
    expect(normalizePhone("(0803) 123-4567")).toBe("08031234567");
  });

  it("keeps a leading plus for international numbers", () => {
    expect(normalizePhone("+234 803 123 4567")).toBe("+2348031234567");
  });

  it("collapses the two ways of writing the same number to distinct canonical forms", () => {
    // Not the same string — but each is stable, which is what search relies on.
    expect(normalizePhone("0803 123 4567")).toBe("08031234567");
    expect(normalizePhone("08031234567")).toBe("08031234567");
  });
});

describe("countWords", () => {
  it("ignores leading, trailing, and repeated whitespace", () => {
    expect(countWords("  two   words  ")).toBe(2);
  });

  it("counts an empty string as zero", () => {
    expect(countWords("   ")).toBe(0);
  });
});

describe("formatSpecialties", () => {
  it("renders known keys as labels", () => {
    expect(formatSpecialties(["pastry_baking", "barista"])).toBe(
      "Pastry & Baking, Barista & Coffee",
    );
  });

  it("passes through an unknown key rather than dropping it", () => {
    // A record written before a catalogue edit must still show its requirement.
    expect(formatSpecialties(["sommelier"])).toBe("sommelier");
  });
});

describe("validateTalentRequest", () => {
  it("accepts a well-formed request", () => {
    expect(validateTalentRequest(validInput())).toBeNull();
  });

  it("accepts every specialty in the catalogue", () => {
    const result = validateTalentRequest(
      validInput({ specialties: TALENT_SPECIALTY_KEYS.slice(0, 10) }),
    );
    expect(result).toBeNull();
  });

  describe("company name", () => {
    it("rejects a blank name", () => {
      expect(
        validateTalentRequest(validInput({ companyName: "   " }))?.field,
      ).toBe("companyName");
    });

    it("rejects a name over the limit", () => {
      const long = "a".repeat(TALENT_LIMITS.companyNameMax + 1);
      expect(
        validateTalentRequest(validInput({ companyName: long }))?.field,
      ).toBe("companyName");
    });
  });

  describe("email", () => {
    it.each([
      ["missing @", "notanemail.com"],
      ["missing domain dot", "someone@localhost"],
      ["trailing dot", "someone@company."],
      ["whitespace inside", "some one@company.com"],
      ["empty", "   "],
    ])("rejects %s", (_label, email) => {
      expect(
        validateTalentRequest(validInput({ companyEmail: email }))?.field,
      ).toBe("companyEmail");
    });

    it("accepts a subdomain address", () => {
      expect(
        validateTalentRequest(
          validInput({ companyEmail: "chef@kitchen.company.co.uk" }),
        ),
      ).toBeNull();
    });

    it("accepts an address that only differs by case", () => {
      expect(
        validateTalentRequest(validInput({ companyEmail: "HIRING@LAGOS.COM" })),
      ).toBeNull();
    });
  });

  describe("phone", () => {
    it("rejects letters", () => {
      expect(
        validateTalentRequest(validInput({ contactPhone: "call-me-maybe" }))
          ?.field,
      ).toBe("contactPhone");
    });

    it("rejects a number that is too short", () => {
      expect(
        validateTalentRequest(validInput({ contactPhone: "12345" }))?.field,
      ).toBe("contactPhone");
    });

    it("accepts common local and international formats", () => {
      for (const phone of [
        "08031234567",
        "+2348031234567",
        "(080) 312-34567",
        "080 3123 4567",
      ]) {
        expect(
          validateTalentRequest(validInput({ contactPhone: phone })),
        ).toBeNull();
      }
    });
  });

  describe("specialties", () => {
    it("requires at least one", () => {
      expect(
        validateTalentRequest(validInput({ specialties: [] }))?.field,
      ).toBe("specialties");
    });

    it("rejects a key outside the catalogue", () => {
      // The client sends plain strings, so this is the only thing standing
      // between a typo (or a crafted payload) and an unmatchable record.
      expect(
        validateTalentRequest(validInput({ specialties: ["astronaut"] }))
          ?.field,
      ).toBe("specialties");
    });

    it("rejects a mix of valid and invalid keys", () => {
      expect(
        validateTalentRequest(
          validInput({ specialties: ["grill_roast", "astronaut"] }),
        )?.field,
      ).toBe("specialties");
    });

    it("counts duplicates once, so a padded list is not falsely over the cap", () => {
      const padded = Array(TALENT_LIMITS.specialtiesMax + 5).fill(
        "grill_roast",
      );
      expect(
        validateTalentRequest(validInput({ specialties: padded })),
      ).toBeNull();
    });
  });

  describe("description", () => {
    it("rejects one that is too short", () => {
      expect(
        validateTalentRequest(validInput({ description: "chef" }))?.field,
      ).toBe("description");
    });

    it("rejects one over the word cap", () => {
      const words = Array(TALENT_LIMITS.descriptionMaxWords + 1)
        .fill("chef")
        .join(" ");
      expect(
        validateTalentRequest(validInput({ description: words }))?.field,
      ).toBe("description");
    });

    it("rejects a single enormous word that slips under the word cap", () => {
      // Word counting alone would let this through and bloat the document.
      const blob = "a".repeat(TALENT_LIMITS.descriptionMaxChars + 1);
      expect(
        validateTalentRequest(validInput({ description: blob }))?.field,
      ).toBe("description");
    });

    it("measures length after trimming", () => {
      const padded = `   ${"a".repeat(TALENT_LIMITS.descriptionMin)}   `;
      expect(
        validateTalentRequest(validInput({ description: padded })),
      ).toBeNull();
    });
  });

  it("reports the first problem in field order when several are wrong", () => {
    const result = validateTalentRequest({
      companyName: "",
      companyEmail: "bad",
      contactPhone: "x",
      specialties: [],
      description: "",
    });
    expect(result?.field).toBe("companyName");
  });
});
