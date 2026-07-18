export type GinkoDocsLocalizedText = { en: string; de?: string };

export interface GinkoDocsLink {
  label: GinkoDocsLocalizedText;
  to: GinkoDocsLocalizedText;
  /** Iconify icon shown where nav items render with icons (e.g. mobile menu). */
  icon?: string;
}

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
  site: {
    name: GinkoDocsLocalizedText;
    description: GinkoDocsLocalizedText;
    url: string;
    logo: { light: string; dark: string };
    localeSwitcher: "dropdown" | "segmented";
    docsSidebarSwitcher: "dropdown" | "list" | "tabs";
    lupinumAttribution: boolean;
  };
  nav: {
    /** "auto" derives Docs (+ Blog when blog routes exist); an array overrides entirely. */
    links: "auto" | GinkoDocsLink[];
  };
  banner: {
    /** "auto" shows the banner when blog routes exist (legacy behavior). */
    enabled: boolean | "auto";
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
  social: {
    github?: string;
    linkedin?: string;
  };
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
    eyebrow?: GinkoDocsLocalizedText;
    title: GinkoDocsLocalizedText;
    description: GinkoDocsLocalizedText;
    primary: GinkoDocsLink;
    secondary?: GinkoDocsLink;
    hero?: {
      media?: GinkoDocsHeroMedia;
    };
    features: Array<{
      title: GinkoDocsLocalizedText;
      description: GinkoDocsLocalizedText;
      icon?: string;
    }>;
  };
}
