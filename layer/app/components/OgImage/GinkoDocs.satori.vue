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
  },
);

const config = useAppConfig().ginkoDocs as GinkoDocsAppConfig;
const isNuxtPreset = computed(() => config.theme.preset === "nuxt");

const resolvedSiteName = computed(
  () => props.siteName ?? getLocalizedSiteText(config.site.name, props.locale),
);
const resolvedLogo = computed(() => props.logo ?? config.site.logo?.light);
const resolvedNuxtIcon = computed(() => props.logo ?? "/favicon-96x96.png");
const resolvedWordmark = computed(() =>
  isNuxtPreset.value ? config.site.logo?.dark : config.site.logo?.light,
);
const resolvedColorBg = computed(
  () => props.colorBg ?? (isNuxtPreset.value ? "#07111f" : "#ffffff"),
);
const resolvedColorFg = computed(
  () => props.colorFg ?? (isNuxtPreset.value ? "#ffffff" : "#0f172a"),
);
const resolvedColorMuted = computed(
  () => props.colorMuted ?? (isNuxtPreset.value ? "#aab8ca" : "#64748b"),
);
const resolvedColorAccent = computed(
  () => props.colorAccent ?? (isNuxtPreset.value ? "#00dc82" : "#2563eb"),
);
const displayTitle = computed(() => (props.title || resolvedSiteName.value).slice(0, 120));
const displayDescription = computed(() => (props.description ?? "").slice(0, 180));
</script>

<template>
  <div
    v-if="isNuxtPreset"
    :style="{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: resolvedColorBg,
      fontFamily: 'Public Sans',
      overflow: 'hidden',
      position: 'relative',
    }"
  >
    <div
      :style="{
        position: 'absolute',
        top: '-360px',
        right: '-80px',
        width: '800px',
        height: '800px',
        borderRadius: '9999px',
        backgroundImage:
          'radial-gradient(circle, rgba(0, 220, 130, 0.58) 0%, rgba(0, 220, 130, 0.08) 48%, rgba(0, 220, 130, 0) 72%)',
      }"
    />

    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        height: '72px',
        margin: '72px 96px 0',
      }"
    >
      <img :src="resolvedNuxtIcon" :width="72" :height="72" alt="" />
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          height: '72px',
          marginLeft: '20px',
          color: resolvedColorFg,
          fontSize: '30px',
          fontWeight: 700,
          letterSpacing: '-0.03em',
        }"
      >
        {{ resolvedSiteName }}
      </div>
    </div>

    <div
      :style="{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        flex: 1,
        margin: '32px 96px 0',
      }"
    >
      <div
        :style="{
          display: 'flex',
          maxWidth: '980px',
          marginBottom: displayDescription ? '22px' : 0,
          fontSize: displayTitle.length > 50 ? '54px' : '72px',
          fontWeight: 700,
          lineHeight: 1.02,
          color: resolvedColorFg,
          letterSpacing: '-0.05em',
        }"
      >
        {{ displayTitle }}
      </div>
      <div
        v-if="displayDescription"
        :style="{
          display: 'flex',
          maxWidth: '900px',
          fontSize: '27px',
          lineHeight: 1.4,
          color: resolvedColorMuted,
        }"
      >
        {{ displayDescription }}
      </div>
    </div>

    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        height: '74px',
        margin: '24px 96px 56px',
      }"
    >
      <img
        v-if="resolvedWordmark"
        :src="resolvedWordmark"
        :width="240"
        :height="52"
        alt=""
        :style="{ objectFit: 'contain', objectPosition: 'left center' }"
      />
    </div>
  </div>

  <div
    v-else
    :style="{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      backgroundColor: resolvedColorBg,
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
          color: resolvedColorFg,
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
          color: resolvedColorFg,
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
          color: resolvedColorMuted,
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
          backgroundColor: resolvedColorAccent,
        }"
      />
      <div
        :style="{
          display: 'flex',
          width: '20px',
          height: '8px',
          borderRadius: '9999px',
          backgroundColor: resolvedColorMuted,
          opacity: 0.4,
        }"
      />
    </div>
  </div>
</template>
