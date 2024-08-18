FROM itzg/minecraft-server:latest

RUN apt-get -y update && apt-get -y install tmux

# Patches to Minecraft server config files
COPY config_patches /config_patches

# Ops and whitelist files
COPY players-config /players-config

# May be unnecessary, but won't remove for now…
EXPOSE 19132/udp

ENV EDITOR=nano
