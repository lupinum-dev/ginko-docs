<script setup lang="ts">
import { computed, ref } from "vue";
import { onClickOutside } from "@vueuse/core";
import type { DocsNavigationSection } from "#ginko-docs/features/docs/docs-navigation";

const defaultNavIcon = "lucide:building-2";

const props = defineProps<{
  sections: DocsNavigationSection[];
  activeId: string;
}>();

const emit = defineEmits<{
  "update:activeId": [id: string];
}>();

const dropdownOpen = ref(false);
const dropdownRoot = ref<HTMLElement | null>(null);

onClickOutside(dropdownRoot, () => {
  dropdownOpen.value = false;
});

const activeSection = computed(
  () => props.sections.find((section) => section.id === props.activeId) ?? props.sections[0]!,
);

function selectById(id: string) {
  emit("update:activeId", id);
  dropdownOpen.value = false;
}
</script>

<template>
  <div v-if="sections.length > 0" ref="dropdownRoot" class="relative">
    <button
      type="button"
      class="flex w-full items-center gap-2 rounded-lg border border-border bg-secondary/50 p-2 text-start text-secondary-foreground transition-colors hover:bg-accent data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
      :data-state="dropdownOpen ? 'open' : 'closed'"
      aria-haspopup="listbox"
      :aria-expanded="dropdownOpen"
      @click="dropdownOpen = !dropdownOpen"
    >
      <div class="size-9 shrink-0 empty:hidden md:size-5">
        <div
          class="size-full rounded-lg text-foreground max-md:border max-md:bg-muted/50 max-md:p-1.5 [&_svg]:size-full"
        >
          <Icon :name="activeSection.icon ?? defaultNavIcon" class="size-full" />
        </div>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium">{{ activeSection.title }}</p>
      </div>
      <Icon
        name="lucide:chevrons-up-down"
        class="ms-auto size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </button>

    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="translate-y-0.5 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <ul
        v-show="dropdownOpen"
        class="absolute start-0 top-full z-50 mt-1 w-full min-w-[12rem] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
        role="listbox"
      >
        <li
          v-for="section in sections"
          :key="section.id"
          role="option"
          :aria-selected="section.id === activeId"
        >
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
            :class="section.id === activeId ? 'bg-accent/60' : ''"
            @click="selectById(section.id)"
          >
            <Icon :name="section.icon ?? defaultNavIcon" class="size-4 shrink-0" />
            <span class="truncate">{{ section.title }}</span>
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>
