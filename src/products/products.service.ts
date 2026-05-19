import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
	constructor(private prisma: PrismaService) {}

	async findAll(organizationId: string, page: number, limit: number) {
		const skip = (page - 1) * limit;
		const cappedLimit = Math.min(limit, 100);

		const [data, total] = await this.prisma.$transaction([
			this.prisma.product.findMany({
				where: { organizationId, deletedAt: null },
				skip,
				take: cappedLimit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.product.count({ where: { organizationId, deletedAt: null } }),
		]);

		return {
			data,
			total,
			page,
			limit: cappedLimit,
			totalPages: Math.ceil(total / cappedLimit),
		};
	}

	async findOne(id: string, organizationId: string) {
		const product = await this.prisma.product.findFirst({
			where: { id, organizationId, deletedAt: null },
		});
		if (!product) throw new NotFoundException("Product not found");
		return product;
	}

	async create(organizationId: string, userId: string, dto: CreateProductDto) {
		try {
			return await this.prisma.$transaction(async (tx) => {
				const product = await tx.product.create({
					data: {
						organizationId,
						name: dto.name,
						sku: dto.sku,
						description: dto.description,
						costPrice: dto.costPrice,
						sellingPrice: dto.sellingPrice,
						lowStockThreshold: dto.lowStockThreshold,
						quantityOnHand: dto.initialQuantity ?? 0,
					},
				});

				// seed the ledger so quantityOnHand is always derivable from StockMovements
				if (dto.initialQuantity && dto.initialQuantity > 0) {
					await tx.stockMovement.create({
						data: {
							organizationId,
							productId: product.id,
							createdById: userId,
							delta: dto.initialQuantity,
							note: "Initial stock",
						},
					});
				}

				return product;
			});
		} catch (e: any) {
			if (e?.code === "P2002") {
				throw new ConflictException(
					"A product with that SKU already exists in this organization",
				);
			}
			throw e;
		}
	}

	async update(id: string, organizationId: string, dto: UpdateProductDto) {
		// verify ownership
		await this.findOne(id, organizationId);

		try {
			return await this.prisma.product.update({
				where: { id },
				data: dto,
			});
		} catch (e: any) {
			if (e?.code === "P2002") {
				throw new ConflictException(
					"A product with that SKU already exists in this organization",
				);
			}
			throw e;
		}
	}

	async remove(id: string, organizationId: string) {
		await this.findOne(id, organizationId);
		await this.prisma.product.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
		return { success: true };
	}
}
