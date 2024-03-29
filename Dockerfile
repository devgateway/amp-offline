FROM #jobName#-deps AS DEPS
COPY webpack.config.base.js webpack.config.dll.js .babelrc ./
# TODO: set args a late as possible
#ARG COMMIT_HASH
#ARG BRANCH_NAME
RUN npm run build-dll 2>&1

FROM electronuserland/builder:16-wine
WORKDIR /project
COPY app app
COPY resources resources
COPY --from=DEPS /project/node_modules node_modules/
COPY --from=DEPS /project/.babelrc /project/package*.json /project/webpack.config.base.js ./
COPY webpack.config.electron.js .env-cmdrc ./
RUN npm config set progress=false color=false 2>&1 \
  && mkdir repository database \
  && npm run build-main 2>&1
COPY --from=DEPS /project/dll dll/
