import {
  blockquoteMarkdown,
  defineAgentMarkdownComponent,
  getMarkdownProp,
  registerAgentMarkdownComponents,
  registerAgentMarkdownSerializers,
  type AgentMarkdownSerializer,
} from "@lupinum/ginko-content/server";
import { getAgentChartDemo } from "../../app/config/agent-chart-demo";
import { siteConfig } from "../../app/site.config";
import { formatSiteAddress, getLocalizedSiteText } from "../../app/config/site.utils";
import { getServiceRegistry } from "../../app/config/service-registry";
import { defaultLocale } from "../../i18n/locales";

let registered = false;

function renderContact() {
  const lines = [
    `**${siteConfig.identity.legalName}**`,
    ...formatSiteAddress(siteConfig).map((line) => line),
    `Email: <${siteConfig.contact.email}>`,
    `Phone: ${siteConfig.contact.phone}`,
  ];

  return lines.join("\n");
}

function renderImprint(locale: string) {
  const identity = siteConfig.identity;
  const rows = [
    `Legal name: ${identity.legalName}`,
    `Brand: ${identity.brandName}`,
    `Type: ${identity.type}`,
    `Address: ${formatSiteAddress(siteConfig).join(", ")}`,
    `Email: <${siteConfig.contact.legalEmail}>`,
    `Phone: ${siteConfig.contact.phone}`,
    `Managing directors: ${identity.managingDirectors.join(", ")}`,
    identity.registry ? `Registry: ${identity.registry}` : "",
    identity.registryCourt ? `Registry court: ${identity.registryCourt}` : "",
    identity.vatId ? `VAT ID: ${identity.vatId}` : "",
    `Responsible for content: ${siteConfig.legal.responsibleForContent}`,
    `Jurisdiction: ${getLocalizedSiteText(siteConfig.legal.jurisdiction, locale)}`,
  ].filter(Boolean);

  return rows.map((row) => `- ${row}`).join("\n");
}

function renderPrivacyServices(locale: string) {
  const services = getServiceRegistry();

  if (!services.length) {
    return "No consent-relevant optional services are configured.";
  }

  return services
    .map((service) => {
      const consent = service.requiresConsent ? "requires consent" : "does not require consent";
      const consentMode = service.consentMode ? "; consent mode enabled" : "";

      return [
        `### ${getLocalizedSiteText(service.label, locale)}`,
        "",
        getLocalizedSiteText(service.description, locale),
        "",
        `- Provider: ${service.provider}`,
        `- Category: ${service.category}`,
        `- Status: ${service.status}`,
        `- Consent: ${consent}${consentMode}`,
      ].join("\n");
    })
    .join("\n\n");
}

const renderConsentEmbed: AgentMarkdownSerializer = (node, { renderChildren }) => {
  const category = getMarkdownProp(node, "category") || "embeds";
  const body = renderChildren(node);

  return blockquoteMarkdown(
    [`Consent-gated embed. Category: ${category}.`, body ? `\n${body}` : ""].join(""),
  );
};

const renderGallery: AgentMarkdownSerializer = (node, ctx) =>
  ctx.xmlComponent("gallery", ctx.cleanProps(node), ctx.renderChildren(node));

const renderChart = defineAgentMarkdownComponent({
  render: (_node, ctx) => ctx.xmlComponent("chart", {}, ctx.jsonFence(getAgentChartDemo())),
});

export function registerBusinessAgentMarkdownSerializers() {
  if (registered) return;
  registered = true;

  registerAgentMarkdownComponents({
    chart: renderChart,
    MdcChart: renderChart,
  });

  registerAgentMarkdownSerializers({
    gallery: renderGallery,
    MdcGallery: renderGallery,
    "consent-embed": renderConsentEmbed,
    BusinessConsentEmbed: renderConsentEmbed,
    "business-contact": () => renderContact(),
    MdcBusinessContact: () => renderContact(),
    "business-imprint": (_node, { locale }) => renderImprint(locale ?? defaultLocale),
    MdcBusinessImprint: (_node, { locale }) => renderImprint(locale ?? defaultLocale),
    "privacy-services": (_node, { locale }) => renderPrivacyServices(locale ?? defaultLocale),
    MdcPrivacyServices: (_node, { locale }) => renderPrivacyServices(locale ?? defaultLocale),
  });
}
