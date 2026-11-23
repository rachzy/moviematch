import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  getUserRating(userId: string, movieId: number) {
    return this.prisma.rating.findUnique({
      where: { userId_movieId: { userId, movieId } },
    });
  }

  upsertUserRating(userId: string, movieId: number, value: number) {
    return this.prisma.rating.upsert({
      where: { userId_movieId: { userId, movieId } },
      update: { value },
      create: { userId, movieId, value },
    });
  }
}