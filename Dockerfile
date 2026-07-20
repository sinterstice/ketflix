# syntax=docker/dockerfile:1.4

# if you're doing anything beyond your local machine, please pin this to a specific version at https://hub.docker.com/_/node/
FROM node:26 AS development

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ARG SMPT_KEY
ARG QBITTORRENT_PASS
ARG IPTORRENTS_USER
ARG IPTORRENTS_PASS
ARG POSTGRES_PASSWORD

ENV SMTP_KEY $SMTP_KEY
ENV QBITTORRENT_PASS $QBITTORRENT_PASS
ENV IPTORRENTS_USER $IPTORRENTS_USER
ENV IPTORRENTS_PASS $IPTORRENTS_PASS
ENV POSTGRES_PASSWORD $POSTGRES_PASSWORD

EXPOSE 3000 9229 9230

# note that /build inside the container is unrelated to /build inside the project repo. The final entry file will be at /build/build/backend/index.js.
COPY /package.json package.json
COPY /package-lock.json package-lock.json
COPY /tsconfig.json tsconfig.json
COPY /backend/src backend/src
COPY /types types

RUN npm ci --include dev && npm cache clean --force

WORKDIR /frontend

COPY /frontend/package.json package.json
COPY /frontend/package-lock.json package-lock.json
COPY /frontend/tsconfig.json tsconfig.json
COPY /frontend/tsconfig.node.json tsconfig.node.json
COPY /frontend/vite.config.ts vite.config.ts
COPY /frontend/index.html index.html
COPY /frontend/postcss.config.cjs postcss.config.cjs
COPY /frontend/src src

RUN npm ci --include dev && npm cache clean --force

WORKDIR /

RUN npm run build

# TODO: health check
# check every 30s to ensure this service returns HTTP 200
#HEALTHCHECK --interval=30s \
#  CMD node healthcheck.js

# if you want to use npm start instead, then use `docker run --init in production`
# so that signals are passed properly. Note the code in index.js is needed to catch Docker signals
# using node here is still more graceful stopping then npm with --init afaik
# I still can't come up with a good production way to run with npm and graceful shutdown

WORKDIR /build

CMD [ "node", "backend/src/index.js" ]

#FROM development as dev-envs
#RUN <<EOF
#apt-get update
#apt-get install -y --no-install-recommends git
#EOF
#
#RUN <<EOF
#useradd -s /bin/bash -m vscode
#groupadd docker
#usermod -aG docker vscode
#EOF
## install Docker tools (cli, buildx, compose)
#COPY --from=gloursdocker/docker / /
