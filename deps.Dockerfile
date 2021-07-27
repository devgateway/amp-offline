FROM node:8-alpine
RUN apk add openssh-client git make g++ python3
COPY .ssh_known_hosts /etc/ssh/ssh_known_hosts
COPY id_rsa /root/.ssh/id_rsa
WORKDIR /project
COPY package*.json ./
RUN npm config set progress=false color=false \
  && npm install --ignore-scripts --production 2>&1
RUN npm install 2>&1
