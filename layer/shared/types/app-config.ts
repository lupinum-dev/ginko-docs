export type { GinkoDocsNeutralPalette, GinkoDocsPrimaryPalette } from "../theme-palettes";
import type { GinkoDocsNeutralPalette, GinkoDocsPrimaryPalette } from "../theme-palettes";

export type GinkoDocsLocalizedText = string | { en: string; de?: string };

export type GinkoDocsProseAppearance = "quiet" | "tint";
export type GinkoDocsProseFamily =
  | "callout"
  | "aside"
  | "excerpt"
  | "cards"
  | "readMore"
  | "accordion"
  | "tabs"
  | "code"
  | "files"
  | "api"
  | "figure"
  | "quiz"
  | "steps"
  | "timeline";

export interface GinkoDocsProseConfig {
  appearance: GinkoDocsProseAppearance;
  components?: Partial<Record<GinkoDocsProseFamily, GinkoDocsProseAppearance>>;
}

export interface GinkoDocsLink {
  label: GinkoDocsLocalizedText;
  to: GinkoDocsLocalizedText;
  /** Iconify icon shown where nav items render with icons (e.g. mobile menu). */
  icon?: string;
  /** One-line subtitle shown under the label in the mobile menu. */
  description?: GinkoDocsLocalizedText;
}

export type GinkoDocsSocialPlatform = "github" | "discord" | "linkedin";

/**
 * A URL uses the platform's built-in label and icon. Pass an object to override
 * either — `icon` accepts any Iconify name the consuming app has registered, so
 * sites that ship brand marks are not limited to the layer's bundled icons.
 */
export type GinkoDocsSocialEntry = string | { href: string; label?: string; icon?: string };

export interface GinkoDocsHeroCodeTab {
  label: GinkoDocsLocalizedText;
  /** Iconify icon shown in the tab. */
  icon?: string;
  filename?: string;
  /** Shiki language id; derived from the filename extension when unset. */
  language?: string;
  code: string;
}

export type GinkoDocsHeroMedia =
  | { type: "image"; src: string; alt: string }
  | { type: "code"; code: string; language?: string; filename?: string }
  | { type: "code-tabs"; tabs: GinkoDocsHeroCodeTab[] };

export type GinkoDocsPlausibleExtension =
  | "hash"
  | "outbound-links"
  | "file-downloads"
  | "tagged-events"
  | "revenue"
  | "pageview-props"
  | "compat"
  | "local"
  | "manual";

export interface GinkoDocsAppConfig {
  theme: {
    neutral: GinkoDocsNeutralPalette;
    primary: GinkoDocsPrimaryPalette;
  };
  prose: GinkoDocsProseConfig;
  site: {
    name: GinkoDocsLocalizedText;
    description: GinkoDocsLocalizedText;
    url: string;
    logo: { light: string; dark: string };
    docsSidebarSwitcher: "dropdown" | "list" | "tabs";
    lupinumAttribution: boolean;
  };
  nav: {
    /** "auto" derives Docs (+ Blog when blog routes exist); an array overrides entirely. */
    links: "auto" | GinkoDocsLink[];
    /** Render configured social links as icon buttons in the header instead of labelled rows. */
    socialIcons: boolean;
  };
  banner: {
    enabled: boolean;
    /** Dismissal storage key — change it to re-show the banner after an update. */
    id: string;
    text?: GinkoDocsLocalizedText;
    link?: { label?: GinkoDocsLocalizedText; to?: GinkoDocsLocalizedText };
    showOnLanding: boolean;
  };
  analytics?: {
    plausible?: {
      /** Leave unset to keep analytics fully disabled. */
      domain?: string;
      /** Self-hosted Plausible script URL override. */
      scriptSrc?: string;
      /** Plausible script extensions, e.g. ["outbound-links", "file-downloads"]. */
      extensions?: GinkoDocsPlausibleExtension[];
    };
  };
  social: Partial<Record<GinkoDocsSocialPlatform, GinkoDocsSocialEntry>>;
  feedback: {
    enabled: boolean;
  };
  ogImage: {
    enabled: boolean;
    /** OgImage template component name (file in app/components/OgImage/). */
    component: string;
  };
  markdownActions: {
    chatGpt: boolean;
    claude: boolean;
    mcp: boolean;
  };
  images: {
    /** Click-to-zoom lightbox for prose images. */
    zoom: boolean;
  };
  toc: {
    depth: 2 | 3 | 4;
  };
  repository?: {
    url: string;
    branch?: string;
    contentDirectory?: string;
  };
  landing: {
    title: GinkoDocsLocalizedText;
    description: GinkoDocsLocalizedText;
    primary: GinkoDocsLink;
    secondary?: GinkoDocsLink;
    hero?: {
      media?: GinkoDocsHeroMedia;
    };
    /** Copyable install command shown under the hero CTAs. */
    install?: { command: string };
    features: Array<{
      title: GinkoDocsLocalizedText;
      description: GinkoDocsLocalizedText;
      icon?: string;
    }>;
    /** Dark full-width band highlighting agent readiness. */
    agent?: {
      title: GinkoDocsLocalizedText;
      description: GinkoDocsLocalizedText;
      /** Terminal transcript; "$"-prefixed lines render as commands, "#" as comments. */
      code: string;
    };
    /** Closing call to action; primary falls back to landing.primary. */
    cta?: {
      title: GinkoDocsLocalizedText;
      primary?: GinkoDocsLink;
      secondary?: GinkoDocsLink;
    };
  };
}
