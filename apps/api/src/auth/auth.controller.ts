import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  type LoginDto,
  type RegisterDto,
  type VerifyEmailDto,
} from './auth.schemas';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body(new ZodValidationPipe(registerSchema)) body: RegisterDto) {
    return this.auth.register(body);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginDto) {
    return this.auth.login(body);
  }

  @Get('verify-email')
  verifyEmail(
    @Query(new ZodValidationPipe(verifyEmailSchema)) { token }: VerifyEmailDto,
  ) {
    return this.auth.verifyEmail(token);
  }
}
