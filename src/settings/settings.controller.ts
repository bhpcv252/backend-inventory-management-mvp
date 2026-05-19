import { Body, Controller, Get, Patch } from '@nestjs/common';
import { IsInt, Min } from 'class-validator';
import { SettingsService } from './settings.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.type';

class UpdateSettingsDto {
  @IsInt()
  @Min(0)
  defaultLowStockThreshold: number;
}

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(@CurrentUser() user: JwtPayload) {
    return this.settingsService.getSettings(user.organizationId);
  }

  @Patch()
  updateSettings(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(
      user.organizationId,
      dto.defaultLowStockThreshold,
    );
  }
}
