FROM electronuserland/builder:wine
COPY .ssh_known_hosts /etc/ssh/ssh_known_hosts
COPY id_rsa /root/.ssh/id_rsa
COPY package.json .
RUN npm config set color false; \
  npm -v; \
  npm install --production
RUN npm install
RUN npm run build-dll
