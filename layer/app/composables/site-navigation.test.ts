import { describe, expect, it } from "vite-plus/test";
import {
  bannerStorageKey,
  resolveBanner,
  resolveMainNav,
  type BannerContext,
  type MainNavContext,
} from "./site-navigation.utils";

const navContext: MainNavContext = {
  locale: "en",
  docsPath: "/docs",
  blogPath: "/blog",
  blogExists: true,
  docsLabel: "Documentation",
  blogLabel: "Blog",
};

const bannerContext: BannerContext = {
  locale: "en",
  blogPath: "/blog",
  blogExists: true,
  defaultText: "Announcement",
  defaultLinkLabel: "Read more",
};

describe("resolveMainNav", () => {
  it("derives Docs and Blog automatically when blog routes exist", () => {
    expect(resolveMainNav("auto", navContext)).toEqual([
      { label: "Documentation", href: "/docs" },
      { label: "Blog", href: "/blog" },
    ]);
  });

  it("omits Blog when no blog routes exist", () => {
    expect(resolveMainNav("auto", { ...navContext, blogExists: false })).toEqual([
      { label: "Documentation", href: "/docs" },
    ]);
  });

  it("uses explicit localized links verbatim and flags external targets", () => {
    const items = resolveMainNav(
      [
        {
          label: { en: "Guides", de: "Anleitungen" },
          to: { en: "/docs", de: "/de/dokumentation" },
        },
        { label: { en: "GitHub" }, to: { en: "https://github.com/acme" } },
      ],
      { ...navContext, locale: "de" },
    );

    expect(items).toEqual([
      { label: "Anleitungen", href: "/de/dokumentation", external: false },
      { label: "GitHub", href: "https://github.com/acme", external: true },
    ]);
  });

  it("returns no items for an explicit empty list", () => {
    expect(resolveMainNav([], navContext)).toEqual([]);
  });
});

describe("resolveBanner", () => {
  const config = { enabled: "auto", id: "default", showOnLanding: true } as const;

  it("keeps the legacy blog-gated behavior on auto", () => {
    expect(resolveBanner(config, bannerContext).show).toBe(true);
    expect(resolveBanner(config, { ...bannerContext, blogExists: false }).show).toBe(false);
  });

  it("honors explicit enable/disable regardless of blog presence", () => {
    expect(
      resolveBanner({ ...config, enabled: true }, { ...bannerContext, blogExists: false }).show,
    ).toBe(true);
    expect(resolveBanner({ ...config, enabled: false }, bannerContext).show).toBe(false);
  });

  it("resolves localized text and link overrides with i18n fallbacks", () => {
    const resolved = resolveBanner(
      {
        ...config,
        text: { en: "New release", de: "Neue Version" },
        link: { label: { en: "Changelog" }, to: { en: "/blog/release" } },
      },
      { ...bannerContext, locale: "de" },
    );

    expect(resolved.text).toBe("Neue Version");
    expect(resolved.linkLabel).toBe("Changelog");
    expect(resolved.linkHref).toBe("/blog/release");

    const fallback = resolveBanner(config, bannerContext);
    expect(fallback.text).toBe("Announcement");
    expect(fallback.linkLabel).toBe("Read more");
    expect(fallback.linkHref).toBe("/blog");
  });

  it("omits the link when nothing to announce links to", () => {
    const resolved = resolveBanner(
      { ...config, enabled: true },
      { ...bannerContext, blogExists: false },
    );
    expect(resolved.linkHref).toBeUndefined();
  });

  it("derives the dismissal storage key from the banner id", () => {
    expect(bannerStorageKey("default")).toBe("ginko-docs:banner:default");
    expect(resolveBanner({ ...config, id: "v2" }, bannerContext).storageKey).toBe(
      "ginko-docs:banner:v2",
    );
  });
});
