module.exports = {
  apps: [
    {
      name: "proxy",
      script: "./proxy.ts",
      interpreter: "node",
      node_args: "--import tsx",
      autorestart: true,
      max_memory_restart: "1G",
      watch: [
        "./app.config.ts",
        "./proxy.ts",
        "./src/backend/_common",
        "./src/_common"
      ],
      ignore_watch: [
        "**/*.tsx"
      ],
      env: {
        NODE_OPTIONS: "--no-warnings",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "main",
      script: "./src/backend/main/server.ts",
      interpreter: "node",
      node_args: "--import tsx",
      autorestart: true,
      max_memory_restart: "1G",
      watch: [
        "./app.config.ts",
        "./src/backend/main",
        "./src/backend/_common",
        "./src/_common"
      ],
      ignore_watch: [
        "**/*.tsx"
      ],
      env: {
        NODE_OPTIONS: "--no-warnings",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "status",
      script: "./src/backend/status/server.ts",
      interpreter: "node",
      node_args: "--import tsx",
      autorestart: true,
      max_memory_restart: "1G",
      watch: [
        "./app.config.ts",
        "./src/backend/status",
        "./src/backend/_common",
        "./src/_common"
      ],
      ignore_watch: [
        "**/*.tsx"
      ],
      env: {
        NODE_OPTIONS: "--no-warnings",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "api",
      script: "./src/backend/api/server.ts",
      interpreter: "node",
      node_args: "--import tsx",
      autorestart: true,
      max_memory_restart: "1G",
      watch: [
        "./app.config.ts",
        "./src/backend/api",
        "./src/backend/_common",
        "./src/_common"
      ],
      ignore_watch: [
        "**/*.tsx"
      ],
      env: {
        NODE_OPTIONS: "--no-warnings",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "cdn",
      script: "./src/backend/cdn/server.ts",
      interpreter: "node",
      node_args: "--import tsx",
      autorestart: true,
      max_memory_restart: "1G",
      watch: [
        "./app.config.ts",
        "./src/backend/cdn",
        "./src/backend/_common",
        "./src/_common"
      ],
      ignore_watch: [
        "**/*.tsx"
      ],
      env: {
        NODE_OPTIONS: "--no-warnings",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "support",
      script: "./src/backend/support/server.ts",
      interpreter: "node",
      node_args: "--import tsx",
      autorestart: true,
      max_memory_restart: "1G",
      watch: [
        "./app.config.ts",
        "./src/backend/support",
        "./src/backend/_common",
        "./src/_common"
      ],
      ignore_watch: [
        "**/*.tsx"
      ],
      env: {
        NODE_OPTIONS: "--no-warnings",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "discord_client",
      script: "./src/integrations/discord/client.ts",
      interpreter: "node",
      node_args: "--import tsx",
      autorestart: true,
      max_memory_restart: "1G",
      watch: [
        "./app.config.ts",
        "./src/integrations/discord",
        "./src/_common"
      ],
      ignore_watch: [
        "**/*.tsx"
      ],
      env: {
        NODE_OPTIONS: "--no-warnings",
        FORCE_COLOR: "1"
      }
    }
  ]
};