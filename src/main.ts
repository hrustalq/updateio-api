import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { allowedOrigins, appConfig } from './common/config/app.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { swaggerConfig } from './common/config/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { UnauthorizedException, ValidationPipe } from '@nestjs/common';
import fs from 'fs';
import { NotFoundResponseDto, BadRequestResponseDto, ForbiddenResponseDto, InternalServerErrorResponseDto, UnauthorizedResponseDto, ConflicResponseDto } from './common/dto/error-response.dto';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  /* Security */
  app
    .use(helmet())
    .use(cookieParser())
    .enableCors({
      ...appConfig.cors,
      origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
          callback(null, true);
        } else {
          callback(new UnauthorizedException('Request is not allowed by CORS'));
        }
      },
    });

  app.setGlobalPrefix(appConfig.apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  /* Swagger */
  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig.documentBuilder,
    {
      extraModels: [
        NotFoundResponseDto, 
        BadRequestResponseDto, 
        ForbiddenResponseDto, 
        InternalServerErrorResponseDto, 
        UnauthorizedResponseDto,
        ConflicResponseDto
      ],
    }
  );
  fs.writeFileSync('./swagger.json', JSON.stringify(document));

  SwaggerModule.setup(swaggerConfig.path, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  /* Start server */
  await app.listen(appConfig.port, () => {
    console.log(`[App] Server is running on port ${appConfig.port}`);
  });
}

bootstrap();
