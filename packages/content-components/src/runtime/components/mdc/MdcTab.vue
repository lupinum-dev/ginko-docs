<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

defineProps<{
  icon?: string;
  label?: string;
  inGroup?: boolean;
}>();
</script>

<template>
  <div :label="label" :in-group="inGroup">
    <slot />
  </div>
</template>
