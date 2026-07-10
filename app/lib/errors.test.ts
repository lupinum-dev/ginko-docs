import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { messageSource } from "../../i18n/messages/source";
import { createContentNotFoundError, normalizeAppError } from "./errors";

const appRoot = process.cwd();

function readAppFile(path: string) {
  return readFileSync(join(appRoot, path), "utf8");
}

describe("errors", () => {
  it("normalizes Nuxt statusCode and statusCode-era errors", () => {
    expect(
      normalizeAppError({
        message: "Page not found",
        statusCode: 404,
        statusMessage: "Page not found",
      }),
    ).toMatchObject({
      kind: "notFound",
      statusCode: 404,
      statusMessage: "Page not found",
    });
  });

  it("normalizes status and statusText-era errors", () => {
    expect(
      normalizeAppError({
        status: 403,
        statusText: "Forbidden",
      }),
    ).toMatchObject({
      kind: "accessDenied",
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  });

  it("maps server and unknown errors to server errors", () => {
    expect(normalizeAppError({ statusCode: 500 })).toMatchObject({
      kind: "server",
      statusCode: 500,
    });
    expect(normalizeAppError(new Error("boom"))).toMatchObject({
      kind: "server",
      statusCode: 500,
    });
  });

  it("creates one canonical content not found error", () => {
    expect(normalizeAppError(createContentNotFoundError())).toMatchObject({
      kind: "notFound",
      statusCode: 404,
      statusMessage: "Not Found",
    });
  });

  it("keeps localized error copy for the supported error kinds", () => {
    expect(messageSource.errors).toMatchObject({
      accessDenied: expect.objectContaining({
        title: expect.any(Object),
        description: expect.any(Object),
      }),
      actions: expect.objectContaining({
        contact: expect.any(Object),
        docs: expect.any(Object),
        home: expect.any(Object),
        retry: expect.any(Object),
      }),
      notFound: expect.objectContaining({
        title: expect.any(Object),
        description: expect.any(Object),
      }),
      server: expect.objectContaining({
        title: expect.any(Object),
        description: expect.any(Object),
      }),
      unavailable: expect.objectContaining({
        title: expect.any(Object),
        description: expect.any(Object),
      }),
    });
  });

  it("keeps the error page self-contained and status-specific", () => {
    const errorPage = readAppFile("app/error.vue");

    expect(errorPage).toContain("normalizeAppError");
    expect(errorPage).toContain("noindex, nofollow");
    expect(errorPage).toContain("messages[locale].errors.actions.home");
    expect(errorPage).not.toContain("SiteHeader");
    expect(errorPage).not.toContain("SiteFooter");
    expect(errorPage).not.toContain("useI18n");
    expect(errorPage).not.toContain("useLocalizedPath");
  });

  it("uses one canonical content not found helper for content detail pages", () => {
    for (const file of ["app/pages/[...slug].vue"]) {
      const source = readAppFile(file);
      expect(source).toContain("createContentNotFoundError");
      expect(source).toContain("throw createContentNotFoundError()");
      expect(source).not.toContain('statusMessage: "Page not found"');
    }

    for (const file of [
      "app/features/docs/components/DocsPageContent.vue",
      "app/pages/blog/[slug].vue",
    ]) {
      const source = readAppFile(file);
      expect(source).toContain("createContentNotFoundError");
      expect(source).toContain("notFound: createContentNotFoundError");
    }
  });
});
