import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
	constructor(private prisma: PrismaService) {}

	async getDashboard(organizationId: string) {
		const org = await this.prisma.organization.findUniqueOrThrow({
			where: { id: organizationId },
			select: { defaultLowStockThreshold: true },
		});

		const [totalProducts, totalQuantityAgg, products] = await Promise.all([
			this.prisma.product.count({
				where: { organizationId, deletedAt: null },
			}),
			this.prisma.product.aggregate({
				where: { organizationId, deletedAt: null },
				_sum: { quantityOnHand: true },
			}),
			this.prisma.product.findMany({
				where: { organizationId, deletedAt: null },
				select: {
					id: true,
					name: true,
					sku: true,
					quantityOnHand: true,
					lowStockThreshold: true,
				},
			}),
		]);

		const defaultThreshold = org.defaultLowStockThreshold;

		const lowStockItems = products
			.filter((p) => {
				const threshold = p.lowStockThreshold ?? defaultThreshold;
				return p.quantityOnHand <= threshold;
			})
			.map((p) => ({
				id: p.id,
				name: p.name,
				sku: p.sku,
				quantityOnHand: p.quantityOnHand,
				effectiveThreshold: p.lowStockThreshold ?? defaultThreshold,
			}));

		return {
			totalProducts,
			totalQuantity: totalQuantityAgg._sum.quantityOnHand ?? 0,
			lowStockItems,
		};
	}
}
