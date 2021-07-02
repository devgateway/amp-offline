FROM electronuserland/builder:wine
COPY id_rsa /root/.ssh/id_rsa
COPY package.json .
RUN npm install --production
