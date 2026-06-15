module.exports = {
  apps: [
    {
      name: "hensy-website",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      env_file: ".env",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "300M",
    },
  ],
};
