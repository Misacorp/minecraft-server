FROM itzg/minecraft-server:latest

RUN apt-get -y update && apt-get -y install tmux
COPY config_patches /config_patches
# COPY plugins/ /plugins
ENV EDITOR=nano

# May be unnecessary, but won't remove for now…
EXPOSE 19132/udp
