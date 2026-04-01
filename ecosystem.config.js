module.exports = {
    apps: [{
      name: "ligs_website",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,                  // Project root (where package.json, .next, node_modules are)
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log"
    }]
  };