import assert from "node:assert/strict";
import { classifyRelease } from "./plan-release.mjs";

const base = {
  registryState: "verified-existing",
  channelVersion: "1.2.3",
  version: "1.2.3",
  tagState: "verified",
  releaseState: "present",
  assetState: "verified",
};

assert.equal(classifyRelease(base), "complete");
assert.equal(
  classifyRelease({
    ...base,
    registryState: "absent",
    channelVersion: null,
    tagState: "absent",
    releaseState: "absent",
    assetState: "absent",
  }),
  "publish",
);
assert.throws(
  () =>
    classifyRelease({
      ...base,
      registryState: "absent",
      channelVersion: null,
      tagState: "verified",
    }),
  /before the npm publication/u,
);
assert.equal(classifyRelease({ ...base, tagState: "absent", releaseState: "absent" }), "repair");
assert.equal(classifyRelease({ ...base, releaseState: "absent", assetState: "absent" }), "repair");
assert.equal(classifyRelease({ ...base, assetState: "conflict" }), "repair");
assert.throws(() => classifyRelease({ ...base, tagState: "conflict" }), /different commit/u);
assert.throws(
  () => classifyRelease({ ...base, tagState: "absent", releaseState: "present" }),
  /without its certified tag/u,
);
assert.throws(() => classifyRelease({ ...base, channelVersion: "1.2.2" }), /npm channel/u);

process.stdout.write("Release planning fixtures passed.\n");
