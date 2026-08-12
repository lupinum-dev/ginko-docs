# Security policy

## Supported versions

Lupinum OG provides security fixes for the latest published minor release.
Before version 1.0, a security fix can use a hard cut when compatibility would
keep unsafe behavior.

## Report a vulnerability

Use GitHub private vulnerability reporting. If that channel is not available,
email [info@lupinum.com](mailto:info@lupinum.com).

Do not put an exploit, private content, credential, or private deployment URL
in a public issue.

Include the affected version, Node and Nuxt versions, a minimal reproduction,
the expected impact, and a known mitigation. Lupinum OG will acknowledge a
complete report within five business days.

Treat these defects as security-sensitive:

- Unsafe content bypasses the component policy.
- Private or draft content enters public output.
- Server-only behavior enters the client bundle.
- One locale exposes content from another locale incorrectly.
- A release artifact differs from the approved artifact.

Publication uses npm trusted publishing and a protected GitHub environment. The
OIDC-capable job publishes only a previously certified tarball.
