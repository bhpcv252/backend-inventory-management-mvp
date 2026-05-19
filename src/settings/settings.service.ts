import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SettingsService {
	constructor(private prisma: PrismaService) {}

	async getSettings(organizationId: string) {
		const org = await this.prisma.organization.findUniqueOrThrow({
			where: { id: organizationId },
			select: { defaultLowStockThreshold: true },
		});
		return { defaultLowStockThreshold: org.defaultLowStockThreshold };
	}

	async updateSettings(
		organizationId: string,
		defaultLowStockThreshold: number,
	) {
		const org = await this.prisma.organization.update({
			where: { id: organizationId },
			data: { defaultLowStockThreshold },
			select: { defaultLowStockThreshold: true },
		});
		return { defaultLowStockThreshold: org.defaultLowStockThreshold };
	}
}
