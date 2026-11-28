import { Module } from '@nestjs/common';
import { AffinityModule } from './affinity/affinity.module';
import { AuthModule } from './auth/auth.module';
import { MoviesModule } from './movies/movies.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './users/profile.module';
import { RatingsModule } from './ratings/ratings.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MoviesModule,
    RatingsModule,
    AffinityModule,
    ProfileModule,
  ],
})
export class AppModule {}
