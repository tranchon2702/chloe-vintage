const { join } = require('node:path');

module.exports = {
  apps: [
    {
      name: 'chloe-web-vintage',
      cwd: join(__dirname, 'backend'),
      script: 'dist/src/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: 4173,
        SERVE_FRONTEND: 'true',
      },
    },
  ],
};
