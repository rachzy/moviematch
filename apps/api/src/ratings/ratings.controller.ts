import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { upsertRatingSchema, type UpsertRatingDto } from './ratings.schemas';
import { RatingsService } from './ratings.service';

@Controller('movies/:id/rating')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratings: RatingsService) {}

  @Get()
  get(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) movieId: number,
  ) {
    return this.ratings.get(user.id, movieId);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) movieId: number,
    @Body(new ZodValidationPipe(upsertRatingSchema)) body: UpsertRatingDto,
  ) {
    return this.ratings.upsert(user.id, movieId, body);
  }

  @Delete()
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) movieId: number,
  ) {
    return this.ratings.remove(user.id, movieId);
  }
}
