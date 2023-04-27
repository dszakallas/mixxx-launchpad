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
COPY packages/mixxx/package.json packages/mixxx/package.json
COPY packages/app/package.json packages/app/package.json
COPY packages/mk1/package.json packages/mk1/package.json
COPY packages/mk2/package.json packages/mk2/package.json
COPY packages/mini-mk3/package.json packages/mini-mk3/package.json
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
