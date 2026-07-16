import { site } from "./site";
import { banner } from "./banner";
import { nav } from "./nav";
import { docs } from "./docs";
import { blog } from "./blog";
import { theme } from "./theme";
import { command } from "./command";
import { feedback } from "./feedback";
import { errors } from "./errors";

export const globalMessages = {
  site,
  banner,
  nav,
  docs,
  blog,
  theme,
  command,
  feedback,
  errors,
} as const;
