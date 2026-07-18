import type { GinkoDocsAppConfig } from "../../shared/types/app-config";

type RepositoryConfig = NonNullable<GinkoDocsAppConfig["repository"]>;

const repoBase = (repository: RepositoryConfig) => repository.url.replace(/\/$/, "");

export function buildRepoIssueUrl(
  repository: RepositoryConfig,
  params: { title: string; body: string },
): string {
  const url = new URL(`${repoBase(repository)}/issues/new`);
  url.searchParams.set("title", params.title);
  url.searchParams.set("body", params.body);
  return url.toString();
}

export function buildRepoEditUrl(repository: RepositoryConfig, sourcePath: string): string {
  const branch = repository.branch || "main";
  return `${repoBase(repository)}/edit/${encodeURIComponent(branch)}/${sourcePath}`;
}
