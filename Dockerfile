FROM zenika/alpine-chrome

USER root
RUN apk add --no-cache \
      nodejs  yarn


COPY . /watcher
WORKDIR /watcher
RUN ["yarn", "install"]
CMD ["yarn", "start"] 

