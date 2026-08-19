# WaterMirror `image-size` patch

This directory vendors the self-contained CommonJS runtime from `image-size`
2.0.2 as version 2.0.3 until the upstream package publishes a release that
contains the fixes for the zero-length parser loops tracked by:

- GHSA-w3rx-r6r6-pgpr (ICNS)
- GHSA-5p2g-fcmc-qvqq (JXL and HEIF)

The runtime adds parser progress and length guards to the ICNS, HEIF, and JXL
container paths. It is consumed only through Metro's transitive dependency.
Replace this vendor package with the first upstream patched release once one is
available, then remove the `image-size` override from the root package.
