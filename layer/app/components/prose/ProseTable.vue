<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div :class="cn('content-table', props.class)">
    <div class="content-table-scroll">
      <table>
        <slot />
      </table>
    </div>
  </div>
</template>
