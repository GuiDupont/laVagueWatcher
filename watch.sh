docker build . -t watcher
docker volume create whastappAuth

# To Run:

docker run -d --restart unless-stopped --mount source=whastappAuth,destination=/watcher/.wwebjs_auth watcher