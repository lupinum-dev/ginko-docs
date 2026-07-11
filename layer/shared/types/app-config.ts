export type GinkoDocsLocalizedText = string | { en: string; de?: string };

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
    docsSidebarSwitcher: "dropdown" | "list" | "tabs";
  };
  social: {
    github?: string;
    linkedin?: string;
  };
  blog: boolean;
  feedback: {
    enabled: boolean;
    endpoint?: string;
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
