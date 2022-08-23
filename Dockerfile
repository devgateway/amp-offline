FROM node:14-alpine AS build

RUN apk add openssh-client git make g++ python3

COPY .ssh_known_hosts /etc/ssh/ssh_known_hosts

WORKDIR /project

COPY . ./

RUN --mount=type=ssh  \
    --mount=type=cache,target=~/.npm \
    npm ci && \
    npm run build

FROM electronuserland/builder:wine

WORKDIR /project

COPY --from=build /project ./

RUN --mount=type=cache,target=~/.cache \
    npm run package-deb-64
