module.exports = {
  apps: [
    {
      name: "proxy",
      script: "./dist/proxy.js",
      interpreter: "node",
      autorestart: true,
      max_memory_restart: "100M",
      env: {
        NODE_OPTIONS: "--no-warnings",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "main",
      script: "./dist/src/backend/main/server.js",
      interpreter: "node",
      autorestart: true,
      max_memory_restart: "350M",
      env: {
        NODE_OPTIONS: "--no-warnings",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "status",
      script: "./dist/src/backend/status/server.js",
      interpreter: "node",
      autorestart: true,
      max_memory_restart: "100M",
      env: {
        NODE_OPTIONS: "--no-warnings",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "api",
      script: "./dist/src/backend/api/server.js",
      interpreter: "node",
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_OPTIONS: "--no-warnings",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "cdn",
      script: "./dist/src/backend/cdn/server.js",
      interpreter: "node",
      autorestart: true,
      max_memory_restart: "150M",
      env: {
        NODE_OPTIONS: "--no-warnings",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "support",
      script: "./dist/src/backend/support/server.js",
      interpreter: "node",
      autorestart: true,
      max_memory_restart: "350M",
      env: {
        NODE_OPTIONS: "--no-warnings",
        FORCE_COLOR: "1"
      }
    },
    {
      name: "discord_client",
      script: "./dist/src/integrations/discord/client.js",
      interpreter: "node",
      autorestart: true,
      max_memory_restart: "150M",
      env: {
        NODE_OPTIONS: "--no-warnings",
        FORCE_COLOR: "1"
      }
    }
  ],
};