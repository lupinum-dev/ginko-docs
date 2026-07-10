<script setup lang="ts">
import { cva, type VariantProps } from "class-variance-authority";
import type { DialogContentEmits, DialogContentProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { DialogClose, DialogContent, useForwardPropsEmits } from "reka-ui";
import { cn } from "@/lib/utils";
import DialogOverlay from "./DialogOverlay.vue";
import DialogPortal from "./DialogPortal.vue";

const dialogContentVariants = cva(
  "fixed top-[50%] left-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  {
    variants: {
      size: {
        sm: "w-[min(calc(100vw-2rem),24rem)]",
        default: "w-[min(calc(100vw-2rem),32rem)]",
        lg: "w-[min(calc(100vw-2rem),48rem)]",
        xl: "w-[min(calc(100vw-2rem),64rem)]",
        full: "w-[calc(100vw-2rem)]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type DialogContentVariants = VariantProps<typeof dialogContentVariants>;

interface Props extends DialogContentProps {
  class?: HTMLAttributes["class"];
  showClose?: boolean;
  size?: DialogContentVariants["size"];
}

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
  showClose: true,
});
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = reactiveOmit(props, "class", "showClose", "size");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      data-slot="dialog-content"
      :class="cn(dialogContentVariants({ size: props.size }), props.class)"
      v-bind="{ ...$attrs, ...forwarded }"
    >
      <slot />

      <DialogClose
        v-if="showClose"
        class="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none"
      >
        <Icon name="lucide:x" class="size-4" aria-hidden="true" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
