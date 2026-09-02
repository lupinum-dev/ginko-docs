import { describe, expect, it } from "vite-plus/test";
import {
  bannerStorageKey,
  resolveBanner,
  resolveMainNav,
  resolveSocialLinks,
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
  defaultText: "Announcement",
  defaultLinkLabel: "Read more",
};

describe("resolveMainNav", () => {
  it("derives Docs and Blog automatically when blog routes exist", () => {
    expect(resolveMainNav("auto", navContext)).toEqual([
      { label: "Documentation", href: "/docs", icon: "lucide:book-open" },
      { label: "Blog", href: "/blog", icon: "lucide:file-text" },
    ]);
  });

  it("omits Blog when no blog routes exist", () => {
    expect(resolveMainNav("auto", { ...navContext, blogExists: false })).toEqual([
      { label: "Documentation", href: "/docs", icon: "lucide:book-open" },
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
      { label: "Anleitungen", href: "/de/dokumentation", external: false, icon: undefined },
      { label: "GitHub", href: "https://github.com/acme", external: true, icon: undefined },
    ]);
  });

  it("returns no items for an explicit empty list", () => {
    expect(resolveMainNav([], navContext)).toEqual([]);
  });
});

describe("resolveSocialLinks", () => {
  it("applies the platform label and icon to a bare URL", () => {
    expect(resolveSocialLinks({ github: "https://github.com/acme" })).toEqual([
      {
        label: "GitHub",
        href: "https://github.com/acme",
        external: true,
        icon: "lucide:github",
        platform: "github",
      },
    ]);
  });

  it("renders in configuration order rather than a fixed platform order", () => {
    const items = resolveSocialLinks({
      discord: "https://discord.gg/acme",
      github: "https://github.com/acme",
    });

    expect(items.map((item) => item.platform)).toEqual(["discord", "github"]);
  });

  it("uses the bundled Discord brand mark by default", () => {
    expect(resolveSocialLinks({ discord: "https://discord.gg/acme" })[0]?.icon).toBe(
      "logos:discord-icon",
    );
  });

  it("lets a site override the label and icon per entry", () => {
    expect(
      resolveSocialLinks({
        discord: { href: "https://discord.gg/acme", label: "Community", icon: "acme:discord" },
      }),
    ).toEqual([
      {
        label: "Community",
        href: "https://discord.gg/acme",
        external: true,
        icon: "acme:discord",
        platform: "discord",
      },
    ]);
  });

  it("skips entries without a destination", () => {
    expect(resolveSocialLinks({ github: "", linkedin: undefined })).toEqual([]);
  });

  it("returns no items when nothing is configured", () => {
    expect(resolveSocialLinks({})).toEqual([]);
  });
});

describe("resolveBanner", () => {
  const config = { enabled: false, id: "default", showOnLanding: true } as const;

  it("honors explicit enable and disable", () => {
    expect(resolveBanner({ ...config, enabled: true }, bannerContext).show).toBe(true);
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
    expect(fallback.linkHref).toBeUndefined();
  });

  it("omits the link when it is not configured", () => {
    const resolved = resolveBanner({ ...config, enabled: true }, bannerContext);
    expect(resolved.linkHref).toBeUndefined();
  });

  it("derives the dismissal storage key from the banner id", () => {
    expect(bannerStorageKey("default")).toBe("ginko-docs:banner:default");
    expect(resolveBanner({ ...config, id: "v2" }, bannerContext).storageKey).toBe(
      "ginko-docs:banner:v2",
    );
  });
});
