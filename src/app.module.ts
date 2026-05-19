import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ProductsModule } from "./products/products.module";
import { StockMovementsModule } from "./stock-movements/stock-movements.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { SettingsModule } from "./settings/settings.module";
import { IdempotencyModule } from "./idempotency/idempotency.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		AuthModule,
		ProductsModule,
		StockMovementsModule,
		DashboardModule,
		SettingsModule,
		IdempotencyModule,
	],
})
export class AppModule {}
