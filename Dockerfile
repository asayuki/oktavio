FROM node:8.14.0-alpine

WORKDIR /usr/app

COPY ./ .

RUN apk update && apk upgrade \
	&& apk add --no-cache git \
	&& apk --no-cache add --virtual builds-deps build-base python \
	&& npm install -g nodemon cross-env eslint npm-run-all node-gyp node-pre-gyp && npm install\
	&& npm rebuild bcrypt --build-from-source

RUN npm install --quiet