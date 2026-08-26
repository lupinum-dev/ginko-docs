<script setup lang="ts">
import { computed } from "vue";
import { useI18n, useSeoMeta } from "#imports";

const { locale } = useI18n();
const german = computed(() => String(locale.value) === "de");
const title = computed(() => (german.value ? "Über Ginko Docs" : "About Ginko Docs"));
const description = computed(() =>
  german.value
    ? "Lerne das Open-Source-Projekt Ginko Docs und das Lupinum-Team dahinter kennen."
    : "Learn about the Ginko Docs open-source project and the Lupinum team behind it.",
);

useSeoMeta({ title, description, ogTitle: title, ogDescription: description, ogType: "website" });
</script>

<template>
  <main class="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
    <p class="text-sm font-semibold tracking-wide text-primary uppercase">Lupinum Open Source</p>
    <h1 class="mt-4 text-4xl font-semibold tracking-[-0.035em] text-foreground sm:text-6xl">
      {{ title }}
    </h1>

    <div v-if="german" class="mt-10 space-y-6 text-lg leading-8 text-muted-foreground">
      <p>
        Ginko Docs ist ein Open-Source-Nuxt-Layer von Lupinum. Er verwandelt Markdown in eine
        vollständige Dokumentationsseite mit stabilen Routen, Suche, Lokalisierung, SEO und
        agentenlesbaren Ausgaben. Menschen, Suchmaschinen und Software-Agenten lesen dadurch
        dieselbe kanonische Quelle.
      </p>
      <p>
        Lupinum entwickelt Websites, Filme und Design für Organisationen, die Zukunft gestalten. Wir
        veröffentlichen Ginko Docs offen, damit kleine Teams eine solide Dokumentation nutzen
        können, ohne ein eigenes Dokumentationssystem betreiben zu müssen. Quellcode, Probleme und
        Beiträge bleiben im öffentlichen GitHub-Repository nachvollziehbar.
      </p>
    </div>
    <div v-else class="mt-10 space-y-6 text-lg leading-8 text-muted-foreground">
      <p>
        Ginko Docs is an open-source Nuxt layer maintained by Lupinum. It turns Markdown into a
        complete documentation site with stable routes, search, localization, SEO, and
        agent-readable output. People, search engines, and software agents therefore read the same
        canonical source.
      </p>
      <p>
        Lupinum creates websites, films, and design for organizations that help shape the future. We
        publish Ginko Docs openly so small teams can use a solid documentation foundation without
        operating a separate documentation system. Source code, issues, and contributions remain
        traceable in the public GitHub repository.
      </p>
    </div>

    <div class="mt-10 flex flex-wrap gap-3">
      <NuxtLink
        to="https://github.com/lupinum-dev/ginko-docs"
        class="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
      >
        GitHub
      </NuxtLink>
      <NuxtLink
        to="https://lupinum.com/kontakt"
        class="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-semibold text-foreground"
      >
        {{ german ? "Kontakt" : "Contact" }}
      </NuxtLink>
      <NuxtLink
        to="https://lupinum.com/datenschutz"
        class="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-semibold text-foreground"
      >
        {{ german ? "Datenschutz" : "Privacy" }}
      </NuxtLink>
    </div>
  </main>
</template>
