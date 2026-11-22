import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { searchMoviesSchema, type SearchMoviesDto } from './movies.schemas';
import { MoviesService } from './movies.service';

@Controller('movies')
@UseGuards(JwtAuthGuard)
export class MoviesController {
  constructor(private readonly movies: MoviesService) {}

  @Get()
  search(@Query(new ZodValidationPipe(searchMoviesSchema)) query: SearchMoviesDto) {
    return this.movies.search(query);
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory: () => new NotFoundException('Filme não encontrado'),
      }),
    )
    id: number,
  ) {
    return this.movies.findOne(id);
  }
}
