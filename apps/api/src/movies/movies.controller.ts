import { Body, Controller, Get, Param, ParseIntPipe, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MoviesService } from './movies.service';
import { upsertRatingSchema } from './movies.schema';

@Controller('movies')
@UseGuards(JwtAuthGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get(':id/rating')
  getRating(@Param('id', ParseIntPipe) movieId: number, @Req() req: { user: { id: string } }) {
    return this.moviesService.getUserRating(req.user.id, movieId);
  }

  @Put(':id/rating')
  upsertRating(
    @Param('id', ParseIntPipe) movieId: number,
    @Req() req: { user: { id: string } },
    @Body() body: unknown,
  ) {
    const parsed = upsertRatingSchema.parse(body);
    return this.moviesService.upsertUserRating(req.user.id, movieId, parsed.value);
  }
}