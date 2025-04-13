const dotenv = require('dotenv');

let ENV_FILE_NAME = '';
switch (process.env.NODE_ENV) {
  case 'production':
    ENV_FILE_NAME = '.env.production';
    break;
  case 'staging':
    ENV_FILE_NAME = '.env.staging';
    break;
  case 'test':
    ENV_FILE_NAME = '.env.test';
    break;
  case 'development':
  default:
    ENV_FILE_NAME = '.env';
    break;
}

try {
  dotenv.config({ path: process.cwd() + '/' + ENV_FILE_NAME });
} catch (e) {
  console.error(e);
}

// CORS configuration
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:7000";

module.exports = {
  projectConfig: {
    database_type: "postgres",
    database_url: process.env.DATABASE_URL,
    store_cors: STORE_CORS,
    admin_cors: ADMIN_CORS,
    redis_url: process.env.REDIS_URL
  },
  plugins: [
    // Add your plugins here
  ],
  modules: {
    // Add your modules here
  }
};
