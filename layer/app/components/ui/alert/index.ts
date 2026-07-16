import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as Alert } from "./Alert.vue";
export { default as AlertDescription } from "./AlertDescription.vue";
export { default as AlertTitle } from "./AlertTitle.vue";

export const alertVariants = cva(
  [
    "group/alert relative grid w-full gap-y-0.5 rounded-lg border px-4 py-3 text-left text-sm items-start",
    "grid-cols-[0_1fr]",
    "has-[>[data-slot=alert-icon]]:grid-cols-[auto_1fr]",
    "has-[>[data-slot=alert-icon]]:gap-x-2.5",
    "[&>[data-slot=alert-icon]]:col-start-1",
    "[&>[data-slot=alert-icon]]:row-span-2",
    "[&>[data-slot=alert-icon]]:size-4",
    "[&>[data-slot=alert-icon]]:translate-y-0.5",
    "[&>[data-slot=alert-icon]]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>[data-slot=alert-icon]]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type AlertVariants = VariantProps<typeof alertVariants>;
