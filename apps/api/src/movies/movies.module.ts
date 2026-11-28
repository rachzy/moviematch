import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { TmdbClient } from './tmdb.client';

@Module({
  imports: [AuthModule],
  controllers: [MoviesController],
  providers: [
    MoviesService,
    {
      provide: TmdbClient,
      useFactory: () => {
        // Sem token a API não sobe, como no JWT_SECRET.
        const token = process.env.TMDB_READ_ACCESS_TOKEN;
        if (!token) throw new Error('TMDB_READ_ACCESS_TOKEN é obrigatório');
        return new TmdbClient(token);
      },
    },
  ],
  exports: [TmdbClient],
})
export class MoviesModule {}