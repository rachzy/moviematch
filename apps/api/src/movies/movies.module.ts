import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { TmdbClient } from './tmdb.client';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MoviesController],
  providers: [MoviesService, TmdbClient],
})
export class MoviesModule {}