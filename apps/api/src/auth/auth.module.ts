import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule, //Utillizar o UserRepository para dar certo
    MailModule,
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
