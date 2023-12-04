import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import {
  DocumentBuilder,
  SwaggerModule,
  SwaggerCustomOptions,
} from '@nestjs/swagger';

const customOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    withCredentials: true,
  },
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  const options = new DocumentBuilder()
    .setTitle('Test project for inDev')
    .setDescription('JWT auth server via cookies')
    .setVersion('1.0')
    .addCookieAuth('authCookie')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document, customOptions);

  await app.listen(3000);
}
bootstrap();
