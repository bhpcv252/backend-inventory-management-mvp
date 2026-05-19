import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AdjustStockDto } from "./dto/adjust-stock.dto";

@Injectable()
export class StockMovementsService {
	constructor(private prisma: PrismaService) {}

	async adjust(
		productId: string,
		organizationId: string,
		userId: string,
		dto: AdjustStockDto,
	) {
		const product = await this.prisma.product.findFirst({
			where: { id: productId, organizationId, deletedAt: null },
		});
		if (!product) throw new NotFoundException("Product not found");

		try {
			const [movement, updated] = await this.prisma.$transaction(async (tx) => {
				const mv = await tx.stockMovement.create({
					data: {
						organizationId,
						productId,
						createdById: userId,
						delta: dto.delta,
						note: dto.note,
						idempotencyKey: dto.idempotencyKey,
					},
				});

				const prod = await tx.product.update({
					where: { id: productId },
					data: { quantityOnHand: { increment: dto.delta } },
				});

				return [mv, prod] as const;
			});

			return {
				movement: {
					id: movement.id,
					productId: movement.productId,
					delta: movement.delta,
					note: movement.note,
					createdById: movement.createdById,
					createdAt: movement.createdAt.toISOString(),
				},
				updatedQuantityOnHand: updated.quantityOnHand,
			};
		} catch (e: any) {
			// unique constraint violation -> duplicate idempotencyKey
			if (e?.code === "P2002") {
				throw new ConflictException("Duplicate idempotency key");
			}
			throw e;
		}
	}

	async findAll(
		productId: string,
		organizationId: string,
		page: number,
		limit: number,
	) {
		const product = await this.prisma.product.findFirst({
			where: { id: productId, organizationId, deletedAt: null },
		});
		if (!product) throw new NotFoundException("Product not found");

		const skip = (page - 1) * limit;
		const cappedLimit = Math.min(limit, 100);

		const [data, total] = await this.prisma.$transaction([
			this.prisma.stockMovement.findMany({
				where: { productId, organizationId },
				skip,
				take: cappedLimit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.stockMovement.count({ where: { productId, organizationId } }),
		]);

		return {
			data,
			total,
			page,
			limit: cappedLimit,
			totalPages: Math.ceil(total / cappedLimit),
		};
	}
}
