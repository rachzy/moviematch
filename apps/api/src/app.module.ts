import { Module } from '@nestjs/common';
import { AffinityModule } from './affinity/affinity.module';
import { AuthModule } from './auth/auth.module';
import { MoviesModule } from './movies/movies.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, MoviesModule, AffinityModule],
})
export class AppModule {}