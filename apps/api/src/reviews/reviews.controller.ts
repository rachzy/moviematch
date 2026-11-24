import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { updateReviewSchema, type UpdateReviewDto } from './reviews.schemas';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: { id: string } | { sub: string },
    @Body(new ZodValidationPipe(updateReviewSchema)) dto: UpdateReviewDto,
  ) {
    const userId = 'id' in user ? user.id : user.sub;
    return this.reviews.update(id, userId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: { id: string } | { sub: string },
  ) {
    const userId = 'id' in user ? user.id : user.sub;
    return this.reviews.remove(id, userId);
  }
} 