FROM electronuserland/builder:wine
COPY .ssh_known_hosts /etc/ssh/ssh_known_hosts
COPY id_rsa /root/.ssh/id_rsa
COPY package.json .
RUN npm config set progress=false color=false \
  && echo "NPM version $(npm -v)" \
  && npm install --production 2>&1
RUN npm install 2>&1
RUN npm run build-dll 2>&1
