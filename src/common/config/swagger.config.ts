import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = {
  documentBuilder: new DocumentBuilder()
    .setTitle(process.env.API_SWAGGER_TITLE || 'API Documentation')
    .setDescription(
      process.env.API_SWAGGER_DESCRIPTION ||
        'API documentation for the application',
    )
    .setVersion(process.env.SWAGGER_VERSION || '1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // Optional, can be omitted
      },
      'apiKey', // name of the security scheme
    )
    .build(),
  path: process.env.API_SWAGGER_PATH || '/api/docs',
};
