---
title: Essentials
description: A working tour of Ginko Content rendering, navigation, localization, discovery, and agent output.
---

This section is the functional showcase. Every page is real collection content and exercises the same routes, navigation, search index, localization, SEO, and agent output a consumer gets from the layer.

## What to inspect

Use [Markdown Syntax]($docs/essentials/markdown-syntax) to inspect prose, [Navigation Architecture]($docs/essentials/navigation) to inspect the tree, and [Content Rendering]($docs/essentials/content-rendering) for component-rich pages.

## Practical order

The [Platform Capabilities]($docs/essentials/platform-capabilities) group demonstrates translated slugs, canonical content links, search and discovery, SEO output, and machine-readable interfaces.

::card-group{cols=2}
::card{title="Localized routes" description="One canonical document identity, translated public slugs, and locale-aware links." icon="lucide:languages" to="$docs/essentials/platform-capabilities/localization"}
::
::card{title="Content linking" description="Author durable links that follow translated routes automatically." icon="lucide:link" to="$docs/essentials/platform-capabilities/content-linking"}
::
::card{title="Search & discovery" description="See tree, page, neighbors, backlinks, variants, and search APIs together." icon="lucide:search" to="$docs/essentials/platform-capabilities/search-discovery"}
::
::card{title="Agent interfaces" description="Inspect raw Markdown, llms.txt catalogs, and MCP tools." icon="lucide:bot" to="$docs/essentials/platform-capabilities/agent-interfaces"}
::
::

::callout{title="Quality bar" icon="lucide:scan-search"}
The docs are not considered migrated until the sidebar, TOC, search, sitemap, and generated HTML all agree on the same content routes.
::
