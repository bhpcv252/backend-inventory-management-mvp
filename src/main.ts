import { NestFactory, Reflector } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { RolesGuard } from "./auth/roles.guard";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix("api");

	const allowedOrigins = process.env.FRONTEND_URL?.split(",") || [];

	app.enableCors({
		origin: allowedOrigins,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // strip unknown properties
			forbidNonWhitelisted: true, // 400 if unknown properties are sent
			transform: true, // auto-cast query params, etc.
		}),
	);

	const reflector = app.get(Reflector);
	app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

	await app.listen(process.env.PORT ?? 3001);
	console.log(`StockFlow API running on port ${process.env.PORT ?? 3001}`);
}
bootstrap();
