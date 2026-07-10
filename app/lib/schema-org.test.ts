import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { siteConfig } from "../site.config";
import {
  createArticleSchema,
  createBreadcrumbSchema,
  createBusinessIdentitySchema,
  createFaqSchema,
  createServiceSchema,
  createWebSiteSchema,
} from "./schema-org";

const appRoot = process.cwd();

function readAppFile(path: string) {
  return readFileSync(join(appRoot, path), "utf8");
}

describe("schema org", () => {
  it("derives business identity and website schema from business config", () => {
    expect(createBusinessIdentitySchema("de")).toMatchObject({
      "@type": siteConfig.schema.type,
      name: siteConfig.identity.brandName,
      legalName: siteConfig.identity.legalName,
      logo: `${siteConfig.site.url}${siteConfig.site.logo.light}`,
      email: siteConfig.contact.email,
      telephone: siteConfig.contact.phone,
      vatID: siteConfig.identity.vatId,
      areaServed: siteConfig.schema.areaServed,
      address: {
        streetAddress: siteConfig.contact.address.street,
        postalCode: siteConfig.contact.address.postalCode,
        addressLocality: siteConfig.contact.address.city,
        addressCountry: siteConfig.contact.address.countryCode,
      },
    });
    expect(createWebSiteSchema("en")).toMatchObject({
      name:
        typeof siteConfig.site.name === "string" ? siteConfig.site.name : siteConfig.site.name.en,
      url: siteConfig.site.url,
      inLanguage: "en",
    });
  });

  it("keeps direct JSON-LD registration wired without review schema", () => {
    const packageJson = readAppFile("package.json");
    const nuxtConfig = readAppFile("nuxt.config.ts");
    const app = readAppFile("app/app.vue");
    const schemaHelper = readAppFile("app/lib/schema-org.ts");
    const schemaComposable = readAppFile("app/composables/useSchemaJsonLd.ts");

    expect(packageJson).not.toContain('"nuxt-schema-org"');
    expect(nuxtConfig).not.toContain('"nuxt-schema-org"');
    expect(app).toContain("useSchemaJsonLd");
    expect(app).toContain("createBusinessIdentitySchema");
    expect(app).toContain("createWebSiteSchema");
    expect(schemaComposable).toContain("application/ld+json");
    expect(schemaComposable).toContain('"@graph"');
    expect(schemaHelper).toContain('"@type": "WebSite"');
    expect(schemaHelper).toContain('"@type": "BreadcrumbList"');
    expect(schemaHelper).not.toMatch(/defineReview|aggregateRating|review:/);
  });

  it("uses real light and dark SVG logo assets", () => {
    const lightLogoPath = join(appRoot, "public/lupinum_light.svg");
    const darkLogoPath = join(appRoot, "public/lupinum_dark.svg");
    const logoComponent = readAppFile("app/components/site/SiteLogoMark.vue");
    const header = readAppFile("app/components/site/SiteHeader.vue");
    const footer = readAppFile("app/components/site/SiteFooter.vue");

    expect(siteConfig.site.logo).toEqual({
      light: "/lupinum_light.svg",
      dark: "/lupinum_dark.svg",
    });
    expect(existsSync(lightLogoPath)).toBe(true);
    expect(existsSync(darkLogoPath)).toBe(true);
    expect(readFileSync(lightLogoPath, "utf8")).toContain("<svg");
    expect(readFileSync(darkLogoPath, "utf8")).toContain("<svg");
    expect(logoComponent).toContain("site.logo.light");
    expect(logoComponent).toContain("site.logo.dark");
    expect(logoComponent).toContain("dark:hidden");
    expect(logoComponent).toContain("dark:block");
    expect(header).toContain("<SiteLogoMark");
    expect(footer).toContain("<SiteLogoMark");
  });

  it("derives page-level schema from existing content data", () => {
    expect(
      createBreadcrumbSchema([
        { name: "Leistungen", path: "/leistungen" },
        { name: "Website Strategie", path: "/leistungen/website-strategie" },
      ]),
    ).toMatchObject({
      itemListElement: [
        { name: "Leistungen", position: 1 },
        { name: "Website Strategie", position: 2 },
      ],
    });
    expect(
      createServiceSchema(
        {
          title: "Website Strategie",
          description: "Klarer Plan fuer Website-Projekte.",
        },
        "https://example.at/leistungen/website-strategie",
      ),
    ).toMatchObject({
      name: "Website Strategie",
      serviceType: "Website Strategie",
      areaServed: siteConfig.schema.areaServed,
    });
    expect(
      createArticleSchema(
        {
          title: "Prerender, SEO und Suche",
          description: "Warum generierte Ausgabe geprueft werden muss.",
          date: "2026-06-04",
        },
        "https://example.at/blog/prerender-seo-suche",
        "Lena Bauer",
      ),
    ).toMatchObject({
      headline: "Prerender, SEO und Suche",
      author: { name: "Lena Bauer" },
      datePublished: "2026-06-04",
    });
    expect(
      createFaqSchema([{ question: "Was ist enthalten?", answer: "Content und i18n." }]),
    ).toMatchObject([
      {
        name: "Was ist enthalten?",
        acceptedAnswer: {
          text: "Content und i18n.",
        },
      },
    ]);
  });

  it("registers page-level schema only from pages that already own the source data", () => {
    expect(readAppFile("app/pages/services/[...slug].vue")).toContain("createServiceSchema");
    expect(readAppFile("app/pages/services/[...slug].vue")).toContain("createBreadcrumbSchema");
    expect(readAppFile("app/pages/blog/[slug].vue")).toContain("createArticleSchema");
    expect(readAppFile("app/pages/blog/[slug].vue")).toContain("createBreadcrumbSchema");
    expect(readAppFile("app/components/marketing/FaqSection.vue")).toContain("createFaqSchema");
  });
});
