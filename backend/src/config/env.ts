import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 3000,
  SECRET_KEY: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  ALLOWED_ORIGINS: (process.env.CLIENT_URL || "*").split(','),
};