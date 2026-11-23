import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AffinityController } from './affinity.controller';
import { AffinityService } from './affinity.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AffinityController],
  providers: [AffinityService],
})
export class AffinityModule {}