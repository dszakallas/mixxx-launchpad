# syntax=docker/dockerfile:1.4
ARG WORKDIR=/mixxx-launchpad
ARG UID=65532

FROM node:current-alpine AS deps
RUN apk add jq make bash
ARG WORKDIR
ARG UID
USER $UID
WORKDIR $WORKDIR
COPY <<-EOF $WORKDIR/.npmrc
  cache=$WORKDIR/.npm
EOF
COPY package.json package-lock.json .
RUN --mount=type=bind,target=/docker-context \
    cd /docker-context/; \
    find . -name "package.json" -mindepth 3 -maxdepth 3 -exec cp --parents "{}" $WORKDIR/ \;
RUN --mount=type=cache,target=$WORKDIR/.npm,uid=$UID npm ci

FROM deps as build
COPY Makefile babel.config.js tsconfig.json .
COPY scripts scripts
COPY packages packages
RUN --mount=type=cache,target=$WORKDIR/dist,uid=$UID make

FROM scratch as dist
ARG WORKDIR
ARG UID
USER $UID
COPY --from=build --chown=$UID $WORKDIR/dist .
