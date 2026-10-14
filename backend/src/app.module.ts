import { BadRequestException, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { appConfig } from './config/app.config.js';
import { databaseConfig } from './config/database.config.js';
import { validateEnv } from './config/env.validation.js';
import { PlayersModule } from './players/players.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      validate: validateEnv,
    }),
    PrismaModule,
    PlayersModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
          enableImplicitConversion: false,
        },
        exceptionFactory: (errors: ValidationError[]) =>
          new BadRequestException(flattenValidationErrors(errors).join('; ')),
      }),
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}

function flattenValidationErrors(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const own = error.constraints ? Object.values(error.constraints) : [];
    const nested = error.children?.length
      ? flattenValidationErrors(error.children)
      : [];
    return [...own, ...nested];
  });
}
