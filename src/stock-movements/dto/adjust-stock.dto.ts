import {
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	NotEquals,
} from "class-validator";

export class AdjustStockDto {
	@IsInt()
	@IsNotEmpty()
	@NotEquals(0, { message: "delta must be a non-zero integer" })
	delta: number;

	@IsString()
	@IsOptional()
	note?: string;

	@IsString()
	@IsNotEmpty()
	idempotencyKey: string;
}
