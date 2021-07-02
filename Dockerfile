FROM node:8-alpine AS NODE
RUN apk add openssh-client git make g++ python3
COPY .ssh_known_hosts /etc/ssh/ssh_known_hosts
COPY id_rsa /root/.ssh/id_rsa
COPY package.json .
RUN npm config set progress=false color=false \
  && echo "NPM version $(npm -v)" \
  && npm install --production 2>&1
RUN npm install 2>&1
COPY webpack.config.base.js webpack.config.dll.js .babelrc ./
ARG COMMIT_HASH
ARG BRANCH_NAME
RUN npm run build-dll 2>&1

FROM electronuserland/builder:wine
