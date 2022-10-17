FROM node:18-alpine3.15

COPY . /watcher
WORKDIR /watcher
RUN ["apk", "add", "chromium"]
RUN ["yarn", "install"]
CMD ["yarn", "start"] 