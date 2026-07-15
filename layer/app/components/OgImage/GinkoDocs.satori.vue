<script setup lang="ts">
import { computed } from "vue";
import { useAppConfig } from "#imports";
import type { GinkoDocsAppConfig } from "../../../shared/types/app-config";
import { getLocalizedSiteText } from "../../config/site.utils";

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    siteName?: string;
    logo?: string;
    locale?: string;
    colorBg?: string;
    colorFg?: string;
    colorMuted?: string;
    colorAccent?: string;
  }>(),
  {
    title: "",
    description: "",
    siteName: undefined,
    logo: undefined,
    locale: "en",
    colorBg: "#ffffff",
    colorFg: "#0f172a",
    colorMuted: "#64748b",
    colorAccent: "#2563eb",
  },
);

const config = useAppConfig().ginkoDocs as GinkoDocsAppConfig;

const resolvedSiteName = computed(
  () => props.siteName ?? getLocalizedSiteText(config.site.name, props.locale),
);
const resolvedLogo = computed(() => props.logo ?? config.site.logo?.light);
const displayTitle = computed(() => (props.title || resolvedSiteName.value).slice(0, 120));
const displayDescription = computed(() => (props.description ?? "").slice(0, 180));
</script>

<template>
  <div
    :style="{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      backgroundColor: colorBg,
      fontFamily: 'Public Sans',
    }"
  >
    <div :style="{ display: 'flex', alignItems: 'center', gap: '20px' }">
      <img v-if="resolvedLogo" :src="resolvedLogo" :width="48" :height="48" alt="" />
      <div
        :style="{
          display: 'flex',
          fontSize: '30px',
          fontWeight: 700,
          color: colorFg,
        }"
      >
        {{ resolvedSiteName }}
      </div>
    </div>

    <div :style="{ display: 'flex', flexDirection: 'column', gap: '24px' }">
      <div
        :style="{
          display: 'flex',
          fontSize: displayTitle.length > 50 ? '56px' : '68px',
          fontWeight: 700,
          lineHeight: 1.15,
          color: colorFg,
          letterSpacing: '-0.02em',
        }"
      >
        {{ displayTitle }}
      </div>
      <div
        v-if="displayDescription"
        :style="{
          display: 'flex',
          fontSize: '30px',
          lineHeight: 1.4,
          color: colorMuted,
        }"
      >
        {{ displayDescription }}
      </div>
    </div>

    <div :style="{ display: 'flex', alignItems: 'center', gap: '16px' }">
      <div
        :style="{
          display: 'flex',
          width: '56px',
          height: '8px',
          borderRadius: '9999px',
          backgroundColor: colorAccent,
        }"
      />
      <div
        :style="{
          display: 'flex',
          width: '20px',
          height: '8px',
          borderRadius: '9999px',
          backgroundColor: colorMuted,
          opacity: 0.4,
        }"
      />
    </div>
  </div>
</template>
