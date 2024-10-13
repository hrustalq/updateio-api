interface AppConfig {
  host: string;
  port: number;
  apiPrefix: string;
  cors: {
    origin: string | boolean;
    methods?: string;
    allowedHeaders?: string;
    credentials: boolean;
    preflightContinue: boolean;
    optionsSuccessStatus: number;
  };
}

export const allowedOrigins = process.env.CORS_ORIGIN.split(',');

export const appConfig: AppConfig = {
  host: process.env.API_HOST || 'localhost',
  port: process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 3001,
  apiPrefix: process.env.API_API_PREFIX || '/api',
  cors: {
    origin: true,
    credentials: true,
    preflightContinue: process.env.CORS_PREFLIGHT_CONTINUE
      ? process.env.CORS_PREFLIGHT_CONTINUE === 'true'
      : false,
    optionsSuccessStatus: process.env.CORS_OPTIONS_SUCCESS_STATUS
      ? parseInt(process.env.CORS_OPTIONS_SUCCESS_STATUS, 10)
      : 204,
  },
};
