import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
  console.warn('\nWARNING: `.env` file is missing in the project root.\n' +
    'Some features may not work. Please create a `.env` file with the required variables.\n');
}

const REQUIRED_ENV_VARS = [
  'CLIENT_ID',
  'CLIENT_SECRET',
  'REDIRECT_URI',
  'FRONTEND_URI'
];

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}.\n` +
      `Please add it to your .env file in the project root.\n`);
  }
}

const requiredEnvVars = ["CLIENT_ID", "CLIENT_SECRET", "REDIRECT_URI", "FRONTEND_URI"];

export const ENV = {
  CLIENT_ID: process.env.CLIENT_ID || "",
  CLIENT_SECRET: process.env.CLIENT_SECRET || "",
  REDIRECT_URI: process.env.REDIRECT_URI || "http://127.0.0.1:3000/api/callback",
  FRONTEND_URI: process.env.FRONTEND_URI || "http://127.0.0.1:3000",
};

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  const warning = `Missing required env vars: ${missingVars.join(", ")}`;
  console.warn(warning);

  if (process.env.NODE_ENV !== "production") {
    console.log("Using fallback values where available.");
  }
}