import { siteConfig } from "../site.config";
import { assertLaunchReady, findLaunchReadinessIssues } from "./launch-readiness";

try {
  assertLaunchReady(siteConfig);
  console.log("Launch readiness passed.");
} catch (error) {
  const issues = findLaunchReadinessIssues(siteConfig);
  for (const issue of issues) {
    console.error(`${issue.path}: ${issue.value}`);
  }

  throw error;
}
