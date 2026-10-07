# Brief 06: handbooks and cleanup

Goal: the handbooks point to the released section mode and lib docs defaults, and this spec folder leaves the repository.

Depends on: 05d. Size: S. Two repositories plus ginko-docs.

## Changes

1. `lupinum-website` (the `lupinum-website` checkout next to this repository):
   - `standards/docs-section.md`: path (a) section mode is available; link the released ginko-docs version and the "Docs inside your website" page. Update the "Library status" note (W-02).
   - `changes-needed/ginko-docs-section-mode.md`: mark "Status: shipped in <version>" and move it where the handbook keeps shipped proposals (check the README; if there is no such place, keep it and change only the status line).
   - `fleet/sites.json`: rolfing's docs entry reflects section mode (follow the file's existing fields).
2. `lupinum-oss` handbook (find its checkout next to this repository; if it is missing, report and skip): the lib docs page lists the defaults (framed, standalone, `docs` component set) and the three settings a lib may change (`theme.preset`, `theme.surface`, `theme.shell`).
3. ginko-docs: delete `plans/one-shell/` (the spec is done; Git history keeps it). Keep any durable decisions in `ARCHITECTURE.md`: one paragraph on "one shell, two installs" and the token contract, linking the docs pages.

Each repository follows its own commit and verification rules. Do not publish or deploy anything.

## Done when

- Both handbooks link the released version.
- `plans/one-shell/` is gone from ginko-docs `main`; `ARCHITECTURE.md` has the paragraph.
