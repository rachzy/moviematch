import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MoviesModule } from './movies/movies.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({ imports: [PrismaModule, AuthModule, MoviesModule] })
export class AppModule {}
