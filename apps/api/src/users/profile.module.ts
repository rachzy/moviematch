import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

// Separado do UsersModule: o AuthModule já importa o UsersModule, então o
// controller (que usa o JwtAuthGuard) vive aqui para não criar ciclo.
@Module({
  imports: [AuthModule, UsersModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class ProfileModule {}
