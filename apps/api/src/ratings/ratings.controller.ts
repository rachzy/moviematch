import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  updateRatingSchema,
  upsertRatingSchema,
  type UpdateRatingDto,
  type UpsertRatingDto,
} from './ratings.schemas';
import { RatingsService } from './ratings.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratings: RatingsService) {}

  @Get('movies/:id/rating')
  get(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) movieId: number,
  ) {
    return this.ratings.get(user.id, movieId);
  }

  @Put('movies/:id/rating')
  upsert(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) movieId: number,
    @Body(new ZodValidationPipe(upsertRatingSchema)) body: UpsertRatingDto,
  ) {
    return this.ratings.upsert(user.id, movieId, body);
  }

  @Patch()
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) movieId: number,
    @Body(new ZodValidationPipe(updateRatingSchema)) body: UpdateRatingDto,
  ) {
    return this.ratings.update(user.id, movieId, body);
  }

  @Delete()
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) movieId: number,
  ) {
    return this.ratings.remove(user.id, movieId);
  }

  @Get('ratings/history')
  getHistory(@CurrentUser() user: AuthUser) {
    return this.ratings.getHistory(user.id);
  }
}
