import {
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min,
} from "class-validator";

export class CreateProductDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	sku: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsInt()
	@Min(0)
	@IsOptional()
	initialQuantity?: number;

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
