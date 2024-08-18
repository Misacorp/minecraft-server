#! /usr/bin/env -S deno run --allow-write

import TOML from "npm:smol-toml@1.2";

export { };

const
  // Fly supports haProxy style ip forwarding, but it needs a few config changes
  // to make work
  // Specifically, you need to make it so Paper, the minecraft server, is aware of
  // the proxy running, so it can remap connections.
  // This handles all that automatically
  enableProxy = false,
  // Enable BlueMap. This sets up a HTTPs port in your fly config, and loads bluemap
  enableBlueMap = false,
  // Configure your plugins here
  plugins = [
    "https://cdn.modrinth.com/data/P7dR8mSH/versions/bK6OgzFj/fabric-api-0.102.1%2B1.21.1.jar",
    "https://download.geysermc.org/v2/projects/geyser/versions/latest/builds/latest/downloads/fabric",
    "https://cdn.modrinth.com/data/bWrNNfkb/versions/iWEfqepR/Floodgate-Fabric-2.2.3-SNAPSHOT%2Bbuild.31.jar",
    "https://cdn.modrinth.com/data/rbJ7eS5V/versions/I3kp6jxL/dcintegration-fabric-3.0.7.2-1.21.jar",
    // "https://cdn.modrinth.com/data/MubyTbnA/versions/vbGiEu4k/FreedomChat-Paper-1.6.0.jar",
    // "https://cdn.modrinth.com/data/RPOSBQgq/versions/E7jCNr0p/itemswapperplugin-0.2.1-SNAPSHOT.jar",
    // "https://ci.enginehub.org/repository/download/bt6/24948:id/craftbook-3.10.12-SNAPSHOT-dist.jar?branch=master&guest=1",
    // "https://github.com/jmattingley23/AppleSkinSpigot/releases/download/latest/AppleSkinSpigot-1.2.0.jar",
    // "https://github.com/MiniPlaceholders/MiniPlaceholders/releases/download/2.2.4/MiniPlaceholders-Paper-2.2.4.jar",
    // "https://hangarcdn.papermc.io/plugins/EngineHub/CraftBook/versions/5.0.0-beta-03/PAPER/craftbook-bukkit-5.0.0-beta-03.jar",
    // "https://hangarcdn.papermc.io/plugins/LOOHP/ImageFrame/versions/1.7.9/PAPER/ImageFrame-1.7.9.0.jar",
    // "https://hangarcdn.papermc.io/plugins/Multiverse/Multiverse-Core/versions/4.3.12/PAPER/multiverse-core-4.3.12.jar",
    // "https://hangarcdn.papermc.io/plugins/Multiverse/Multiverse-Inventories/versions/4.2.6/PAPER/multiverse-inventories-4.2.6.jar",
    // "https://hangarcdn.papermc.io/plugins/Multiverse/Multiverse-NetherPortals/versions/4.2.3/PAPER/multiverse-netherportals-4.2.3.jar",
    // "https://hangarcdn.papermc.io/plugins/Multiverse/Multiverse-Portals/versions/4.2.3/PAPER/multiverse-portals-4.2.3.jar",
    // "https://hangarcdn.papermc.io/plugins/NanoFlux/Networks/versions/2.1.8/PAPER/Networks-2.1.8.jar",
    // "https://hangarcdn.papermc.io/plugins/Vicarious/Carbon/versions/3.0.0-beta.27/PAPER/carbonchat-paper-3.0.0-beta.27.jar",
  ],
  spigetPlugins = [
    // "https://www.spigotmc.org/resources/chestsort-api.59773/",
    // "https://www.spigotmc.org/resources/invunload.60095/",
    // "https://www.spigotmc.org/resources/luckperms.28140/",
    // "https://www.spigotmc.org/resources/placeholderapi.6245/",
    // "https://www.spigotmc.org/resources/slot-machine.22023/",
    // "https://www.spigotmc.org/resources/cmilib.87610/",
  ],
  bluemap = enableBlueMap ? ["https://hangarcdn.papermc.io/plugins/Blue/BlueMap/versions/5.2/PAPER/BlueMap-5.2-paper.jar", "https://github.com/Mark-225/BlueBridge/releases/download/2.1/BlueBridgeCore-2.1.jar"] : []



const generalEnv = {
  MAX_MEMORY: "4G",
  TZ: "Europe/Helsinki",
  ENABLE_ROLLING_LOGS: "TRUE",
  CREATE_CONSOLE_IN_PIPE: "true",
  REPLACE_ENV_VARIABLE_PREFIX: "",
}

const minecraftEnv = {
  EULA: "TRUE",
  TYPE: "FABRIC",
  VERSION: "1.21.1",
  SERVER_NAME: "Kummituskoalition Kaivostaito",
  MOTD: "Kummituskoalition Kaivostaito",
  DIFFICULTY: "normal",
  ICON: "https://cdn.discordapp.com/icons/759362928276537410/800dea802edb6e99289f2bda1a9cdf71.png",
  OVERWRITE_ICON: "TRUE",
  ENFORCE_SECURE_PROFILE: "FALSE",
  FORCE_GAMEMODE: "FALSE",
  INITIAL_ENABLED_PACKS: "update_1_21,bundle",
  ALLOW_FLIGHT: "TRUE",
  ENABLE_COMMAND_BLOCK: "TRUE",
  SNOOPER_ENABLED: "FALSE",
  PATCH_DEFINITIONS: "/config_patches/",
  WHITELIST_FILE: "/players-config/whitelist.json",
  OPS_FILE: "/players-config/ops.json",
  ENABLE_WHITELIST: "TRUE",
  SEED: "89305139214612",
}

const autoStopEnv = {
  ENABLE_AUTOSTOP: "TRUE",
  AUTOSTOP_TIMEOUT_EST: "120",
  AUTOSTOP_TIMEOUT_INIT: "120",
  AUTOSTOP_PKILL_USE_SUDO: "TRUE",
  USES_PROXY_PROTOCOL: enableProxy ? "TRUE" : "FALSE",
}

const flyProxyConf = enableProxy ? {
  handlers: ["proxy_proto"],
  proxy_proto_options: { version: "v2" }
} : {};

const blueMapConfig = {
  internal_port: 8080,
  force_https: true,
  auto_stop_machines: false,
  auto_start_machines: false,
}

const config = {
  app: "gc-minecraft",
  primary_region: "arn", // Stockholm. See fly.io regions for more.
  build: { dockerfile: "Dockerfile" },
  mounts: {
    source: "gc_minecraft_data",
    destination: "/data",
    initial_size: "4", // Mount a 4 GB volume to store the game world and other files. Can be increased later.
  },
  // Virtual machine specs
  vm: [{ size: "shared-cpu-4x", memory: "4gb", cpus: 4 }],
  // Do not restart the server when it shuts down (e.g., after an error)
  restart: [{
    policy: "never",
  }],
  http_service: enableBlueMap ? blueMapConfig : null,
  services: [
    // Open the following port for Java connections
    {
      internal_port: 25565,
      protocol: "tcp",
      auto_stop_machines: false,
      auto_start_machines: false,
      ports: [
        {
          port: 25565,
          ...flyProxyConf,
        }
      ]
    },
    // Open the following port for Bedrock connections
    {
      internal_port: 19132,
      protocol: "udp",
      ports: [
        {
          port: 19132,
        }
      ]
    }
  ],
  env: {
    ...generalEnv,
    ...minecraftEnv,
    ...autoStopEnv,
    ...pluginEnvs(),

  }
}

function pluginEnvs() {
  const envs = {};

  const pluginSum = [
    ...plugins,
    ...bluemap,
  ]

  if (pluginSum.length > 0) {
    envs["PLUGINS"] = pluginSum.join(",");
  }

  if (spigetPlugins.length > 0) {
    envs["SPIGET_RESOURCES"] = spigetPlugins.map((x) => x.match(/.*?\.(\d+)\/$/)![1]!).join(",")
  }

  return envs;
}

const manual_comment = `
# THIS FILE IS AUTOMATICALLY GENERATED VIA THE fly.ts SCRIPT
# YOU SHOULD NOT EDIT IT BY HAND
`;

const outputs = [
  manual_comment,
  TOML.stringify(config),
].map((x) => x.trim()).join("\n");

await Deno.writeTextFile("fly.toml", outputs);

console.log("Generated new fly.toml file\n");
