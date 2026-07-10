import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export const cardVariants = cva("bg-card text-card-foreground border shadow-xs", {
  variants: {
    variant: {
      default: "flex flex-col gap-6 rounded-xl py-6",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type CardVariants = VariantProps<typeof cardVariants>;
