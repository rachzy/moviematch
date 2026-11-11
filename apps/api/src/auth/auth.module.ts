import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule, //Utillizar o UserRepository para dar certo
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'moviematch_secret_key_super_segura',
      signOptions: { expiresIn: '7d' }, //uma semana!!
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}