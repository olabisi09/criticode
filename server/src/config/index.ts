import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/code-review',
    supabase: {
      url: process.env.SUPABASE_PROJECT_URL || '',
      anonKey: process.env.SUPABASE_API_KEY || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-for-development-only',
    expiresIn: '7d',
  },

  // AI Integration
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
  },
} as const;

export default config;
