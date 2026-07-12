---
title: Grundlagen
description: Eine funktionale Tour durch Rendering, Navigation, Lokalisierung, Discovery und Agent-Ausgaben.
---

Dieser Bereich ist das funktionale Schaufenster. Jede Seite ist echter Collection-Content und nutzt dieselben Routen, Navigation, Suche, Lokalisierung, SEO- und Agent-Ausgaben wie eine Consumer-App.

## Was geprüft werden sollte

Prüfe [Markdown-Syntax]($docs/essentials/markdown-syntax), den [Navigationsbaum]($docs/essentials/navigation) und die Beispiele zum [Content-Rendering]($docs/essentials/content-rendering).

## Praktische Reihenfolge

Die Gruppe [Plattform-Funktionen]($docs/essentials/platform-capabilities) zeigt übersetzte Slugs, kanonische Content-Links, Suche und Discovery, SEO-Ausgaben sowie maschinenlesbare Schnittstellen.

::card-group{cols=2}
::card{title="Lokalisierte Routen" description="Eine kanonische Dokumentidentität mit übersetzten öffentlichen Slugs." icon="lucide:languages" to="$docs/essentials/platform-capabilities/localization"}
::
::card{title="Content-Verlinkung" description="Dauerhafte Links, die übersetzten Routen automatisch folgen." icon="lucide:link" to="$docs/essentials/platform-capabilities/content-linking"}
::
::card{title="Suche & Discovery" description="Tree-, Page-, Neighbor-, Backlink-, Varianten- und Such-APIs im Zusammenspiel." icon="lucide:search" to="$docs/essentials/platform-capabilities/search-discovery"}
::
::card{title="Agent-Schnittstellen" description="Raw Markdown, llms.txt-Kataloge und MCP-Tools prüfen." icon="lucide:bot" to="$docs/essentials/platform-capabilities/agent-interfaces"}
::
::

::callout{title="Qualitätsgrenze" icon="lucide:scan-search"}
Die Docs gelten erst dann als migriert, wenn Sidebar, Inhaltsverzeichnis, Suche, Sitemap und generiertes HTML denselben Content-Routen folgen.
::
