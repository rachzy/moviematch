import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RatingsModule } from '../ratings/ratings.module';
import { AffinityController } from './affinity.controller';
import { AffinityService } from './affinity.service';

@Module({
  imports: [AuthModule, RatingsModule],
  controllers: [AffinityController],
  providers: [AffinityService],
})
export class AffinityModule {}
