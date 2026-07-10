import { globalMessages } from "./global";
import { pageMessages } from "./pages";

export const messageSource = {
  ...globalMessages,
  pages: pageMessages,
} as const;
