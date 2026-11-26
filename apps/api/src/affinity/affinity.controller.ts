import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { affinityQuerySchema, type AffinityQueryDto } from './affinity.schemas';
import { AffinityService } from './affinity.service';

@Controller('affinity')
@UseGuards(JwtAuthGuard)
export class AffinityController {
  constructor(private readonly affinity: AffinityService) {}

  @Get()
  getConnections(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(affinityQuerySchema)) query: AffinityQueryDto,
  ) {
    return this.affinity.getConnections(user.id, query);
  }
}
