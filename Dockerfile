FROM node:8-alpine AS NODE
RUN apk add openssh-client git make g++ python3
COPY .ssh_known_hosts /etc/ssh/ssh_known_hosts
COPY id_rsa /root/.ssh/id_rsa
WORKDIR /project
COPY package*.json ./
RUN npm config set progress=false color=false \
  && npm install --production 2>&1
RUN npm install 2>&1
COPY setup.js webpack.config.*.js .babelrc ./
# TODO: set args a late as possible
#ARG COMMIT_HASH
#ARG BRANCH_NAME
RUN npm run build-dll 2>&1

FROM electronuserland/builder:wine
WORKDIR /project
COPY webpack.config.electron.js .env-cmdrc ./
COPY --from=NODE /project ./
COPY app/utils app/utils/
COPY app/modules app/modules/
COPY app/main.development.js app/
RUN npm config set progress=false color=false 2>&1 \
  && npm run build-main 2>&1
COPY resources ./resources/
COPY app ./app/
RUN ls -a node_modules/.bin
RUN mkdir repository database \
  && npm run build-renderer 2>&1
