import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateProductDto {
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	sku?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsNumber()
	@IsOptional()
	costPrice?: number;

	@IsNumber()
	@IsOptional()
	sellingPrice?: number;

	@IsInt()
	@Min(0)
	@IsOptional()
	lowStockThreshold?: number;
}
