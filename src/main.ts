import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';

  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // DTO Config
  app.enableCors();
  dotenv.config();

  const port = process.env.PORT || 8080;
  await app.listen(port);
  Logger.log(
    `🚀 Task Manager Backend Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}
bootstrap();
