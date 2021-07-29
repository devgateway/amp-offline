The new workflow uses Docker-based build, managed by a declarative pipeline in Jenkins. All images and volumes are unique per Git branch to avoid contamination. The declarative pipeline consists of four major _sequential_ phases:
1. Filter and preinstall dependencies into **Deps** image.
2. Build the **Builder** image.
3. Run the application build and QA.
4. Package the application for each platform.

### Dependencies

Process `packages.json` with `jq` to extract and presort only the crucial package information and dependencies, when building the Deps image. This allows skipping rebuilds completely, even if other members in `package.json` change. Also, it ensures the image layers are as small as possible to increase container launch speed. This phase uses old Node 8 for compatibility.

### Build the Builder

Use Node 8 to build the DLL, then use Electron to prebuild the Main module.
Both builds depend on code that changes infrequently, allowing CI to cache and skip steps in future. Steps are ordered from least to most likely to change, in order to increase chance of cache hit. Output is produced outside of the `app` tree, in order to keep the latter unmodified for the upcoming phases.

### Build Renderer and Run QA

This phase entirely consists of stages running _in parallel_, using the Builder image:
* Run Mocha test
* Run ESLint
* Build the Renderer module; output directed outside the `app` tree, onto a Docker volume for upcoming phases

All stages use read-only bind mounts of source code and tests into their containers, in order to guarantee code staying unmodified, to avoid sending unnecessary data into Docker context (faster builds) during all earlier phases, and increase container launch speed in later phases.

### Package Per Platform and Save Artifacts

Launch containers per each platform _in parallel_ to package the Electron app. Stages matrix is defined by Carthesian product of package type (win, deb) by CPU arch (32, 64). The containers are completely independent, and each uses its own Docker volume to cache web downloads between builds, and its own output directory that is bind-mounted from the Jenkins workdir.

When packaging completes, Jenkins picks up the packaged artifacts and stores them for the last 5 successful builds of each branch. Finally, the CI cleans up the intermediate artifact directories and Docker volumes, and posts an update to Slack.
