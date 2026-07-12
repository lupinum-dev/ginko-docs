<script setup lang="ts">
defineProps<{
  channel: string;
  available?: boolean;
}>();
</script>

<template>
  <aside class="not-prose my-6 rounded-xl border border-border bg-muted/35 px-5 py-4">
    <div class="flex items-center gap-3">
      <span
        class="size-2 rounded-full"
        :class="available ? 'bg-emerald-500' : 'bg-amber-500'"
        aria-hidden="true"
      />
      <div>
        <p class="text-sm font-semibold text-foreground">{{ channel }} release channel</p>
        <p class="mt-1 text-sm text-muted-foreground"><slot /></p>
      </div>
    </div>
  </aside>
</template>
