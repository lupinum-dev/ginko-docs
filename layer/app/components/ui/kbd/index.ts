import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as Kbd } from "./Kbd.vue";
export { default as KbdGroup } from "./KbdGroup.vue";

export const kbdVariants = cva(
  "bg-muted text-muted-foreground ring-1 ring-border pointer-events-none inline-flex w-fit items-center justify-center gap-1 rounded-sm font-sans font-medium select-none [&_svg:not([class*='size-'])]:size-3 [[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10",
  {
    variants: {
      size: {
        sm: "h-5 min-w-5 px-1 text-xs",
        md: "h-7 min-w-7 px-1.5 text-sm",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

export type KbdVariants = VariantProps<typeof kbdVariants>;
