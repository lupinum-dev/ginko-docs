export type GinkoDocsLocalizedText = { en: string; de?: string };

export interface GinkoDocsLink {
  label: GinkoDocsLocalizedText;
  to: GinkoDocsLocalizedText;
}

export interface GinkoDocsAppConfig {
  site: {
    name: GinkoDocsLocalizedText;
    description: GinkoDocsLocalizedText;
    url: string;
    logo: { light: string; dark: string };
    localeSwitcher: "dropdown" | "segmented";
  };
  social: {
    github?: string;
    linkedin?: string;
  };
  feedback: {
    enabled: boolean;
    endpoint?: string;
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
    features: Array<{
      title: GinkoDocsLocalizedText;
      description: GinkoDocsLocalizedText;
      icon?: string;
    }>;
  };
}
