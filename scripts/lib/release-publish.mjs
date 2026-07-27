const DOCS_RELEASE_LANES = ["i18n-dropdown", "i18n-list", "single-tabs"];

export function npmTagForVersion(version) {
  return version.includes("-") ? "next" : "latest";
}

export function assertDocsReleaseCertification(certification) {
  const lanes = Array.isArray(certification?.lanes) ? [...certification.lanes].sort() : [];
  if (
    lanes.length !== DOCS_RELEASE_LANES.length ||
    lanes.some((name, index) => name !== DOCS_RELEASE_LANES[index])
  ) {
    throw new Error("The release certification does not contain every required fixture lane.");
  }
}
