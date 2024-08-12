FROM itzg/minecraft-server:latest

RUN apt-get -y update && apt-get -y install tmux
COPY config_patches/ /config_patches
#COPY plugins/ /plugins
ENV EDITOR=nano
