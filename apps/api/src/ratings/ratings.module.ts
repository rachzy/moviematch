import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MoviesModule } from '../movies/movies.module';
import { RatingRepository } from './rating.repository';
import {
  RatingsController,
  RatingsHistoryController,
} from './ratings.controller';
import { RatingsService } from './ratings.service';

@Module({
  imports: [AuthModule, MoviesModule],
  controllers: [RatingsController, RatingsHistoryController],
  providers: [RatingsService, RatingRepository],
  exports: [RatingRepository],
})
export class RatingsModule {}