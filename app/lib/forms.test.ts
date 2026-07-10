import { readdirSync, readFileSync, statSync } from "node:fs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { siteConfig } from "../site.config";
import type { SiteConfig } from "../config/site.schema";
import {
  contactFormToLeadPayload,
  createLeadFormBody,
  createLeadFormMetadata,
  leadMagnetFormToLeadPayload,
  resolveFormEndpoint,
  submitLeadForm,
  validateContactForm,
  validateLeadMagnetForm,
  type LeadFormPayload,
} from "./forms";

const appRoot = process.cwd();
const testEndpoint = "https://usebasin.com/f/lupinum-test";
const formTestConfig: SiteConfig = {
  ...siteConfig,
  forms: {
    ...siteConfig.forms,
    testEndpoint,
  },
};

function collectVueFiles(dir: string): string[] {
  const absolute = join(appRoot, dir);
  const output: string[] = [];

  for (const entry of readdirSync(absolute)) {
    const path = join(absolute, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) output.push(...collectVueFiles(path.replace(appRoot + "/", "")));
    else if (path.endsWith(".vue")) output.push(path);
  }

  return output;
}

describe("forms", () => {
  it("uses the Basin test endpoint outside production", () => {
    expect(() => resolveFormEndpoint("contact", { environment: "development" })).toThrow(
      "A Basin test endpoint is required",
    );
    expect(
      resolveFormEndpoint("contact", {
        config: formTestConfig,
        environment: "development",
      }),
    ).toMatchObject({
      formKey: "contact",
      provider: "basin",
      test: true,
      url: testEndpoint,
    });
    expect(
      resolveFormEndpoint("contact", { config: formTestConfig, environment: "test" }),
    ).toMatchObject({
      test: true,
      url: testEndpoint,
    });
  });

  it("configures the lead magnet form through the same endpoint resolver", () => {
    expect(
      resolveFormEndpoint("leadMagnet", {
        config: formTestConfig,
        environment: "development",
      }),
    ).toMatchObject({
      formKey: "leadMagnet",
      provider: "basin",
      test: true,
      url: testEndpoint,
    });
    expect(
      resolveFormEndpoint("leadMagnet", {
        config: {
          ...siteConfig,
          forms: {
            ...siteConfig.forms,
            endpoints: {
              leadMagnet: {
                provider: "basin",
                productionEndpoint: "https://usebasin.com/f/lead-magnet",
              },
            },
          },
        },
        environment: "production",
      }),
    ).toMatchObject({
      formKey: "leadMagnet",
      provider: "basin",
      test: false,
      url: "https://usebasin.com/f/lead-magnet",
    });
  });

  it("requires explicit production endpoints in production", () => {
    expect(() => resolveFormEndpoint("contact", { environment: "production" })).toThrow(
      "Production endpoint missing",
    );
    expect(
      resolveFormEndpoint("contact", {
        config: {
          ...siteConfig,
          forms: {
            ...siteConfig.forms,
            endpoints: {
              contact: {
                provider: "basin",
                productionEndpoint: "https://usebasin.com/f/contact",
              },
            },
          },
        },
        environment: "production",
      }),
    ).toMatchObject({
      test: false,
      url: "https://usebasin.com/f/contact",
    });

    expect(() =>
      resolveFormEndpoint("contact", {
        config: {
          ...siteConfig,
          forms: {
            ...siteConfig.forms,
            endpoints: {
              contact: {
                provider: "basin",
              },
            },
          },
        },
        environment: "production",
      }),
    ).toThrow("Production endpoint missing");
  });

  it("fails fast for unknown forms", () => {
    expect(() => resolveFormEndpoint("unknown", { environment: "test" })).toThrow(
      "Unknown form key",
    );
  });

  it("validates contact form inputs before submission", () => {
    expect(
      validateContactForm({
        company: "Muster GmbH",
        email: "kunde@example.at",
        message: "Bitte um einen Rueckruf zum Website-Projekt.",
        name: "Max Mustermann",
        privacyAccepted: true,
      }),
    ).toEqual({});

    expect(
      validateContactForm({
        company: "",
        email: "ungueltig",
        message: "kurz",
        name: "M",
        phone: "abc",
        privacyAccepted: false,
      }),
    ).toEqual({
      company: "company",
      email: "email",
      name: "name",
      phone: "phone",
      privacyAccepted: "privacyAccepted",
    });
  });

  it("maps contact form input to a Basin payload", () => {
    expect(
      contactFormToLeadPayload({
        company: " Muster GmbH ",
        email: " kunde@example.at ",
        message: " Bitte um Rueckruf. ",
        name: " Max Mustermann ",
        phone: " +43 1 234567 ",
        privacyAccepted: true,
        website: "",
      }),
    ).toEqual({
      company: "Muster GmbH",
      email: "kunde@example.at",
      message: "Bitte um Rueckruf.",
      name: "Max Mustermann",
      phone: "+43 1 234567",
      privacy_accepted: true,
      website: "",
    });
  });

  it("validates and maps lead magnet form input to a Basin payload", () => {
    expect(
      validateLeadMagnetForm({
        email: "kunde@example.at",
        privacyAccepted: true,
        resourceId: "seo-checklist",
      }),
    ).toEqual({});
    expect(
      validateLeadMagnetForm({
        email: "ungueltig",
        privacyAccepted: false,
        resourceId: "",
      }),
    ).toEqual({
      email: "email",
      privacyAccepted: "privacyAccepted",
      resourceId: "resourceId",
    });
    expect(
      leadMagnetFormToLeadPayload({
        company: " Muster GmbH ",
        email: " kunde@example.at ",
        name: " Max Mustermann ",
        privacyAccepted: true,
        resourceId: " seo-checklist ",
        website: "",
      }),
    ).toEqual({
      company: "Muster GmbH",
      email: "kunde@example.at",
      name: "Max Mustermann",
      privacy_accepted: true,
      resource_id: "seo-checklist",
      website: "",
    });
  });

  it("adds standard metadata to lead form submissions", () => {
    expect(
      createLeadFormMetadata(
        "contact",
        {
          consentVersion: "2026-06",
          locale: "de",
          siteUrl: "https://example.at",
          sourcePath: "/kontakt",
          submittedAt: "2026-06-04T08:00:00.000Z",
          utm: {
            campaign: "launch",
            medium: "cpc",
            source: "google",
          },
        },
        siteConfig,
      ),
    ).toEqual({
      _consent_version: "2026-06",
      _form_key: "contact",
      _locale: "de",
      _site_domain: "example.at",
      _source_path: "/kontakt",
      _submitted_at: "2026-06-04T08:00:00.000Z",
      _utm_campaign: "launch",
      _utm_content: undefined,
      _utm_medium: "cpc",
      _utm_source: "google",
      _utm_term: undefined,
    });
  });

  it("creates url-encoded Basin payloads", () => {
    const body = createLeadFormBody(
      "contact",
      {
        email: "kunde@example.at",
        message: "Bitte um Rueckruf",
        name: "Max Mustermann",
      },
      {
        locale: "de",
        sourcePath: "/kontakt",
        submittedAt: "2026-06-04T08:00:00.000Z",
      },
    );

    expect(body.get("email")).toBe("kunde@example.at");
    expect(body.get("message")).toBe("Bitte um Rueckruf");
    expect(body.get("_form_key")).toBe("contact");
    expect(body.get("_locale")).toBe("de");
    expect(body.get("_source_path")).toBe("/kontakt");
  });

  it("submits through the resolved endpoint and tracks only non-PII metadata", async () => {
    const calls: Array<{ init?: RequestInit; url: string }> = [];
    const events: Array<{ name: string; props: unknown }> = [];
    const payload: LeadFormPayload = {
      email: "kunde@example.at",
      message: "Bitte rufen Sie mich an.",
      name: "Max Mustermann",
      website: "",
    };

    const result = await submitLeadForm("contact", payload, {
      config: formTestConfig,
      environment: "test",
      fetchImpl: (async (url, init) => {
        const submittedUrl =
          typeof url === "string" ? url : url instanceof URL ? url.href : url.url;
        calls.push({ init, url: submittedUrl });
        return new Response(null, { status: 200 });
      }) as typeof globalThis.fetch,
      locale: "de",
      sourcePath: "/kontakt",
      submittedAt: "2026-06-04T08:00:00.000Z",
      track: (name, props) => events.push({ name, props }),
    });

    expect(result).toMatchObject({ ok: true, skipped: false, status: 200 });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(testEndpoint);
    expect(events).toEqual([
      {
        name: "form_submit_success",
        props: {
          form_key: "contact",
          success: true,
        },
      },
    ]);
  });

  it("skips likely bot submissions through the honeypot field", async () => {
    const result = await submitLeadForm(
      "contact",
      {
        email: "kunde@example.at",
        website: "https://spam.example",
      },
      {
        config: formTestConfig,
        environment: "test",
        fetchImpl: (async () => {
          throw new Error("fetch should not run");
        }) as typeof globalThis.fetch,
        locale: "de",
        sourcePath: "/kontakt",
      },
    );

    expect(result).toMatchObject({ ok: true, skipped: true, status: 204 });
  });

  it("keeps Basin endpoint URLs out of Vue components", () => {
    for (const file of collectVueFiles("app")) {
      expect(readFileSync(file, "utf8")).not.toContain("usebasin.com");
    }
  });

  it("wires the contact pages through localized route metadata and reusable form UI", () => {
    const routes = readFileSync(join(appRoot, "i18n/routes.ts"), "utf8");
    const localizedPath = readFileSync(
      join(appRoot, "app/composables/useLocalizedPath.ts"),
      "utf8",
    );
    const nuxtConfig = readFileSync(join(appRoot, "nuxt.config.ts"), "utf8");
    const form = readFileSync(
      join(appRoot, "app/features/contact/components/ContactForm.vue"),
      "utf8",
    );
    const contactPage = readFileSync(join(appRoot, "app/pages/contact.vue"), "utf8");

    expect(routes).toContain('contact: "/kontakt"');
    expect(routes).toContain('contact: "/contact"');
    expect(routes).toContain('"thank-you": "/danke"');
    expect(routes).toContain('"thank-you": "/thank-you"');
    expect(localizedPath).toContain('import type { LocalizedRouteKey } from "../../i18n/routes"');
    expect(contactPage).toContain("<ContactForm");
    expect(existsSync(join(appRoot, "app/components/forms/ContactForm.vue"))).toBe(false);
    expect(readFileSync(join(appRoot, "app/pages/thank-you.vue"), "utf8")).not.toContain(
      "ThankYouPage",
    );
    expect(form).toContain("@/components/ui/input");
    expect(form).toContain("@/components/ui/label");
    expect(form).toContain("@/components/ui/textarea");
    expect(form).toContain("<Input");
    expect(form).toContain("<Label");
    expect(form).toContain("<Textarea");
    expect(form).toContain('submitLeadForm("contact"');
    expect(form).toContain('trackForm("form_start", "contact")');
    expect(form).toContain("privacyAccepted");
    expect(form).toContain("aria-describedby");
    expect(form).not.toContain("min-h-11 w-full rounded-md border border-input");
    expect(form).not.toContain("min-h-36 w-full resize-y rounded-md border border-input");
    expect(form).not.toContain("usebasin.com");
    expect(nuxtConfig).toContain("sitemapExcludedRoutes = localeCodes.flatMap");
    expect(nuxtConfig).toContain('["thank-you", "websiteClarity"]');
    expect(nuxtConfig).toContain("exclude: sitemapExcludedRoutes");
  });

  it("wires the reusable lead magnet form through validation, Basin, and tracking", () => {
    const form = readFileSync(
      join(appRoot, "app/features/lead-magnet/components/LeadMagnetForm.vue"),
      "utf8",
    );
    const siteConfigSource = readFileSync(join(appRoot, "app/site.config.ts"), "utf8");

    expect(siteConfigSource).toContain("leadMagnet:");
    expect(existsSync(join(appRoot, "app/components/forms/LeadMagnetForm.vue"))).toBe(false);
    expect(form).toContain("validateLeadMagnetForm");
    expect(form).toContain("@/components/ui/input");
    expect(form).toContain("@/components/ui/label");
    expect(form).toContain("<Input");
    expect(form).toContain("<Label");
    expect(form).toContain("leadMagnetFormToLeadPayload");
    expect(form).toContain("submitLeadForm(props.formKey");
    expect(form).toContain('trackForm("form_start", props.formKey)');
    expect(form).toContain("trackDownload(props.resourceId");
    expect(form).toContain("privacyAccepted");
    expect(form).not.toContain("min-h-11 w-full rounded-md border border-input");
    expect(form).not.toContain("usebasin.com");
  });

  it("keeps newsletter forms out of the default preset", () => {
    expect(existsSync(join(appRoot, "app/components/forms/NewsletterForm.vue"))).toBe(false);
    expect(readFileSync(join(appRoot, "app/lib/forms.ts"), "utf8")).not.toContain("NewsletterForm");
    expect(readFileSync(join(appRoot, "app/site.config.ts"), "utf8")).toContain("leadMagnet:");
  });
});
