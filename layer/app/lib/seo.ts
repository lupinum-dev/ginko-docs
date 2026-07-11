export const defaultOgImage = "/og-image.svg";

export function resolveOgImage(image?: string | null) {
  return image || defaultOgImage;
}
