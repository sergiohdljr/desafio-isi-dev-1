import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => {
  const rawPort = process.env.PORT;
  const port = rawPort === undefined || rawPort === '' ? 3000 : Number(rawPort);

  return {
    port,
    environment: process.env.NODE_ENV ?? 'development',
    frontendOrigin: process.env.FRONTEND_ORIGIN,
  };
});
