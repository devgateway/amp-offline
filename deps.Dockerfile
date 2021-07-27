FROM node:8-alpine
COPY .ssh_known_hosts /etc/ssh/ssh_known_hosts
COPY id_rsa /root/.ssh/id_rsa
WORKDIR /project
COPY package*.json ./
RUN apk add --no-cache --virtual .build openssh-client git make g++ python3 \
  && npm config set progress=false color=false \
  && npm install --ignore-scripts --production 2>&1 \
  && apk del .build \
  && npm cache clean --force
RUN npm install 2>&1 \
  && npm cache clean --force
