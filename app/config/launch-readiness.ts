import { siteConfig } from "../site.config";
import type { SiteConfig } from "./site.schema";

export const launchPlaceholderPatterns = [
  /REPLACE_WITH_/i,
  /example\.invalid/i,
  /example\.at/i,
  /Musterbetrieb/i,
  /Mustermann/i,
  /G-XXXXXXXXXX/i,
  /GTM-XXXXXXX/i,
  /usebasin\.com\/f\/example-test/i,
  /url:\s*"#"/i,
] as const;

function collectStrings(
  value: unknown,
  path = "siteConfig",
): Array<{ path: string; value: string }> {
  if (typeof value === "string") return [{ path, value }];
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => collectStrings(entry, `${path}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, entry]) => collectStrings(entry, `${path}.${key}`));
  }

  return [];
}

export function findLaunchReadinessIssues(config: SiteConfig = siteConfig) {
  return collectStrings(config)
    .filter(({ value }) => launchPlaceholderPatterns.some((pattern) => pattern.test(value)))
    .map(({ path, value }) => ({ path, value }));
}

export function assertLaunchReady(config: SiteConfig = siteConfig) {
  const issues = findLaunchReadinessIssues(config);
  if (issues.length) {
    const summary = issues.map((issue) => `${issue.path}: ${issue.value}`).join("\n");
    throw new Error(`Launch placeholders remain:\n${summary}`);
  }
}
