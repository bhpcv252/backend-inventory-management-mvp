import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.type';

@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post(':productId')
  adjust(
    @CurrentUser() user: JwtPayload,
    @Param('productId') productId: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.stockMovementsService.adjust(
      productId,
      user.organizationId,
      user.userId,
      dto,
    );
  }

  @Get(':productId')
  findAll(
    @CurrentUser() user: JwtPayload,
    @Param('productId') productId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.stockMovementsService.findAll(
      productId,
      user.organizationId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }
}
