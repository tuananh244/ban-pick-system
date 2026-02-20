import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 3000,
  SECRET_KEY: process.env.JWT_SECRET || 'your_fallback_secret', // Nên có fallback để tránh crash
  NODE_ENV: process.env.NODE_ENV || 'development',
  ALLOWED_ORIGINS: (process.env.CLIENT_URL || "*").split(','),
  
  // Thêm dòng này để lấy link kết nối Redis
  REDIS_URL: process.env.REDIS_URL 
};