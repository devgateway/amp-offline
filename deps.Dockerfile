FROM node:16-alpine
RUN apk add --no-cache --virtual .build openssh-client git make g++ python3 \
  && npm config set progress=false color=false
COPY .ssh_known_hosts /etc/ssh/ssh_known_hosts
COPY id_rsa /root/.ssh/id_rsa
WORKDIR /project
COPY package-lock.json ./
COPY package.json package.json
RUN npm ci --legacy-peer-deps 2>&1 \
  && npm cache clean --force
