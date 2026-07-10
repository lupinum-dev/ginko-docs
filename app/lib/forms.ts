import { siteConfig } from "../site.config";
import type { SiteConfig } from "../config/site.schema";
import type { TrackingEventName, TrackingProps } from "./tracking/events";

export type FormEnvironment = "development" | "production" | "test";
export type FormValue = boolean | null | number | string | undefined;
export type LeadFormPayload = Record<string, FormValue>;

export interface ResolvedFormEndpoint {
  formKey: string;
  provider: SiteConfig["forms"]["provider"];
  test: boolean;
  url: string;
}

export interface LeadFormMetadataInput {
  consentVersion?: string;
  locale: string;
  siteUrl?: string;
  sourcePath: string;
  submittedAt?: string;
  utm?: Partial<Record<"campaign" | "content" | "medium" | "source" | "term", string>>;
}

export interface SubmitLeadFormOptions extends LeadFormMetadataInput {
  config?: SiteConfig;
  environment?: FormEnvironment;
  fetchImpl?: typeof globalThis.fetch;
  honeypotField?: string;
  track?: (name: TrackingEventName, props: TrackingProps) => void;
}

export interface SubmitLeadFormResult {
  endpoint: ResolvedFormEndpoint;
  ok: boolean;
  skipped: boolean;
  status: number;
}

export interface ContactFormInput {
  company: string;
  email: string;
  message?: string;
  name: string;
  phone?: string;
  privacyAccepted: boolean;
  website?: string;
}

export type ContactFormErrorKey = "company" | "email" | "name" | "phone" | "privacyAccepted";
export type ContactFormErrors = Partial<Record<ContactFormErrorKey, string>>;

export interface LeadMagnetFormInput {
  company?: string;
  email: string;
  name?: string;
  privacyAccepted: boolean;
  resourceId: string;
  website?: string;
}

export type LeadMagnetFormErrorKey = "email" | "privacyAccepted" | "resourceId";
export type LeadMagnetFormErrors = Partial<Record<LeadMagnetFormErrorKey, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(?:\+|00)?[\d\s()./-]{7,}$/;

function currentFormEnvironment(): FormEnvironment {
  if (process.env.NODE_ENV === "production") return "production";
  if (process.env.NODE_ENV === "test") return "test";
  return "development";
}

function siteDomain(siteUrl: string) {
  return new URL(siteUrl).hostname;
}

function appendFormValue(body: URLSearchParams, key: string, value: FormValue) {
  if (value === null || value === undefined) return;
  body.set(key, String(value));
}

function textLength(value?: string) {
  return value?.trim().length ?? 0;
}

export function validateContactForm(input: ContactFormInput): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (textLength(input.name) < 2) {
    errors.name = "name";
  }

  if (textLength(input.company) < 2) {
    errors.company = "company";
  }

  if (!emailPattern.test(input.email.trim())) {
    errors.email = "email";
  }

  if (input.phone && !phonePattern.test(input.phone.trim())) {
    errors.phone = "phone";
  }

  if (!input.privacyAccepted) {
    errors.privacyAccepted = "privacyAccepted";
  }

  return errors;
}

export function validateLeadMagnetForm(input: LeadMagnetFormInput): LeadMagnetFormErrors {
  const errors: LeadMagnetFormErrors = {};

  if (!emailPattern.test(input.email.trim())) {
    errors.email = "email";
  }

  if (!input.resourceId.trim()) {
    errors.resourceId = "resourceId";
  }

  if (!input.privacyAccepted) {
    errors.privacyAccepted = "privacyAccepted";
  }

  return errors;
}

export function contactFormToLeadPayload(input: ContactFormInput): LeadFormPayload {
  return {
    company: input.company.trim(),
    email: input.email.trim(),
    message: input.message?.trim(),
    name: input.name.trim(),
    phone: input.phone?.trim(),
    privacy_accepted: input.privacyAccepted,
    website: input.website?.trim() ?? "",
  };
}

export function leadMagnetFormToLeadPayload(input: LeadMagnetFormInput): LeadFormPayload {
  return {
    company: input.company?.trim(),
    email: input.email.trim(),
    name: input.name?.trim(),
    privacy_accepted: input.privacyAccepted,
    resource_id: input.resourceId.trim(),
    website: input.website?.trim() ?? "",
  };
}

export function resolveFormEndpoint(
  formKey: string,
  options: {
    config?: SiteConfig;
    environment?: FormEnvironment;
  } = {},
): ResolvedFormEndpoint {
  const config = options.config ?? siteConfig;
  const endpoint = config.forms.endpoints[formKey];

  if (!endpoint) {
    throw new Error(`Unknown form key: ${formKey}`);
  }

  const environment = options.environment ?? currentFormEnvironment();
  if (environment !== "production") {
    if (!config.forms.testEndpoint) {
      throw new Error("A Basin test endpoint is required outside production.");
    }

    return {
      formKey,
      provider: config.forms.provider,
      test: true,
      url: config.forms.testEndpoint,
    };
  }

  if (!endpoint.productionEndpoint) {
    throw new Error(`Production endpoint missing for form: ${formKey}`);
  }

  return {
    formKey,
    provider: endpoint.provider,
    test: false,
    url: endpoint.productionEndpoint,
  };
}

export function createLeadFormMetadata(
  formKey: string,
  input: LeadFormMetadataInput,
  config: SiteConfig = siteConfig,
) {
  return {
    _consent_version: input.consentVersion ?? "none",
    _form_key: formKey,
    _locale: input.locale,
    _site_domain: siteDomain(input.siteUrl ?? config.site.url),
    _source_path: input.sourcePath,
    _submitted_at: input.submittedAt ?? new Date().toISOString(),
    _utm_campaign: input.utm?.campaign,
    _utm_content: input.utm?.content,
    _utm_medium: input.utm?.medium,
    _utm_source: input.utm?.source,
    _utm_term: input.utm?.term,
  };
}

export function createLeadFormBody(
  formKey: string,
  payload: LeadFormPayload,
  input: LeadFormMetadataInput,
  config: SiteConfig = siteConfig,
) {
  const body = new URLSearchParams();

  for (const [key, value] of Object.entries(payload)) {
    appendFormValue(body, key, value);
  }

  const metadata = createLeadFormMetadata(formKey, input, config);
  for (const [key, value] of Object.entries(metadata)) {
    appendFormValue(body, key, value);
  }

  return body;
}

export async function submitLeadForm(
  formKey: string,
  payload: LeadFormPayload,
  options: SubmitLeadFormOptions,
): Promise<SubmitLeadFormResult> {
  const config = options.config ?? siteConfig;
  const endpoint = resolveFormEndpoint(formKey, {
    config,
    environment: options.environment,
  });
  const honeypotValue = payload[options.honeypotField ?? "website"];

  if (typeof honeypotValue === "string" && honeypotValue.trim()) {
    return {
      endpoint,
      ok: true,
      skipped: true,
      status: 204,
    };
  }

  const body = createLeadFormBody(formKey, payload, options, config);
  const response = await (options.fetchImpl ?? globalThis.fetch)(endpoint.url, {
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  const result = {
    endpoint,
    ok: response.ok,
    skipped: false,
    status: response.status,
  };

  options.track?.(result.ok ? "form_submit_success" : "form_submit_error", {
    form_key: formKey,
    success: result.ok,
  });

  return result;
}
