import "reflect-metadata";
import { join } from "path";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.use(
    helmet({
      // API-only backend, no HTML views — CSP has nothing to protect here
      // and would otherwise apply to the static /uploads image responses too.
      contentSecurityPolicy: false,
      // The web app runs on a different origin and loads listing/profile
      // photos directly from /uploads via <img>; helmet's default
      // same-origin policy would block that cross-origin image load.
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads" });

  const webBaseUrl = config.get<string>("WEB_BASE_URL") ?? "http://localhost:3000";
  const extraOrigins = (config.get<string>("CORS_ORIGINS") ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const allowedOrigins = [webBaseUrl, ...extraOrigins];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS ile izin verilmeyen origin: ${origin}`), false);
      }
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix("api");

  const port = config.get<number>("PORT") ?? 3001;
  await app.listen(port);
  console.log(`İmece Burada API http://localhost:${port}/api adresinde çalışıyor`);
}

bootstrap();
