import { Module } from '@nestjs/common';
import { AffinityModule } from './affinity/affinity.module';
import { AuthModule } from './auth/auth.module';
import { MoviesModule } from './movies/movies.module';
import { PrismaModule } from './prisma/prisma.module';
import { RatingsModule } from './ratings/ratings.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MoviesModule,
    RatingsModule,
    AffinityModule,
    ReviewsModule,
  ],
})
export class AppModule {}
