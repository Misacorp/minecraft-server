FROM itzg/minecraft-server:latest

RUN apt-get -y update && apt-get -y install tmux
COPY config_patches/ /config_patches
COPY icon.png /data/icon.png
#COPY plugins/ /plugins
ENV EDITOR=nano
