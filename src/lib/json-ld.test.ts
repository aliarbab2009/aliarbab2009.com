import { describe, expect, it } from "vitest";

import {
  aboutPageJsonLd,
  contactPageJsonLd,
  personJsonLd,
  projectJsonLd,
  resumeJsonLd,
} from "./json-ld";

/**
 * The JSON-LD builders are part of the privacy-load-bearing surface:
 * a forbidden field slipping in (address, telephone, alumniOf,
 * birthDate, etc.) becomes a structured-data leak Google indexes.
 *
 * Tests assert both the SHAPE we emit (so consumers get the schema.org
 * fields they expect) AND the negative space (the forbidden fields
 * never appear).
 */

const FORBIDDEN_FIELDS = [
  "address",
  "telephone",
  "birthDate",
  "birthPlace",
  "nationality",
  "gender",
  "alumniOf",
  "worksFor",
];

function deepKeys(obj: unknown): Set<string> {
  const keys = new Set<string>();
  function walk(o: unknown) {
    if (o === null || typeof o !== "object") return;
    if (Array.isArray(o)) {
      for (const item of o) walk(item);
      return;
    }
    for (const [k, v] of Object.entries(o)) {
      keys.add(k);
      walk(v);
    }
  }
  walk(obj);
  return keys;
}

describe("personJsonLd", () => {
  const json = personJsonLd();

  it("has the schema.org @context + Person @type", () => {
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("Person");
  });

  it("name + url + image are present", () => {
    expect(json.name).toBe("Ali Arbab");
    expect(json.url).toMatch(/^https:\/\/aliarbab2009\.com$/);
    expect(json.image).toMatch(/^https:\/\/aliarbab2009\.com\/og\//);
  });

  it("contains NONE of the forbidden privacy fields anywhere", () => {
    const keys = deepKeys(json);
    for (const f of FORBIDDEN_FIELDS) {
      expect(keys.has(f)).toBe(false);
    }
  });

  it("email uses the alias, not a raw @gmail.com", () => {
    expect(typeof json.email).toBe("string");
    expect(json.email).toMatch(/^mailto:.+@aliarbab2009\.com$/);
    expect(json.email).not.toMatch(/@gmail\.com/);
  });

  it("sameAs only includes the GitHub profile (no LinkedIn / Twitter / etc.)", () => {
    expect(json.sameAs).toEqual(["https://github.com/Ali-Arbab"]);
  });
});

describe("aboutPageJsonLd", () => {
  const json = aboutPageJsonLd();

  it("@type is ProfilePage", () => {
    expect(json["@type"]).toBe("ProfilePage");
  });

  it("dateModified is an ISO date (YYYY-MM-DD)", () => {
    expect(json.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("contains NO forbidden privacy fields anywhere in the graph", () => {
    const keys = deepKeys(json);
    for (const f of FORBIDDEN_FIELDS) {
      expect(keys.has(f)).toBe(false);
    }
  });
});

describe("contactPageJsonLd", () => {
  const json = contactPageJsonLd();

  it("@type is ContactPage", () => {
    expect(json["@type"]).toBe("ContactPage");
  });

  it("contains no forbidden privacy fields", () => {
    const keys = deepKeys(json);
    for (const f of FORBIDDEN_FIELDS) {
      expect(keys.has(f)).toBe(false);
    }
  });
});

describe("resumeJsonLd", () => {
  const json = resumeJsonLd();

  it("emits an @graph with two nodes (ProfilePage + DigitalDocument)", () => {
    const graph = json["@graph"] as Array<{ "@type": string }>;
    expect(graph).toHaveLength(2);
    const types = graph.map((g) => g["@type"]).sort();
    expect(types).toEqual(["DigitalDocument", "ProfilePage"]);
  });

  it("contains no forbidden privacy fields anywhere", () => {
    const keys = deepKeys(json);
    for (const f of FORBIDDEN_FIELDS) {
      expect(keys.has(f)).toBe(false);
    }
  });
});

describe("projectJsonLd", () => {
  it("emits WebApplication for stocksaathi", () => {
    const j = projectJsonLd("stocksaathi");
    expect(j["@type"]).toBe("WebApplication");
    expect(j.applicationCategory).toBe("FinanceApplication");
  });

  it("emits WebApplication for bolhisaab with hi+en languages", () => {
    const j = projectJsonLd("bolhisaab");
    expect(j["@type"]).toBe("WebApplication");
    expect(j.inLanguage).toEqual(["hi", "en"]);
  });

  it("emits Product+CreativeWork @graph for maglock", () => {
    const j = projectJsonLd("maglock");
    const graph = j["@graph"] as Array<{ "@type": string }>;
    const types = graph.map((g) => g["@type"]).sort();
    expect(types).toEqual(["CreativeWork", "Product"]);
  });

  it("throws on unknown slug", () => {
    // @ts-expect-error — testing runtime guard for unknown slugs
    expect(() => projectJsonLd("nope")).toThrow(/Unknown project slug/);
  });
});
