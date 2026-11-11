import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  type LoginDto,
  type RegisterDto,
  type VerifyEmailDto,
  type ResendVerificationDto,
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

  @Post('verify-email')
  @HttpCode(200)
  verifyEmail(
    @Body(new ZodValidationPipe(verifyEmailSchema)) { token }: VerifyEmailDto,
  ) {
    return this.auth.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(200)
  resendVerification(
    @Body(new ZodValidationPipe(resendVerificationSchema)) body: ResendVerificationDto,
  ) {
    return this.auth.resendVerification(body.email);
  }

  @Post('verify-code')
  @HttpCode(200)
  verifyCode(@Body() body: { code: string }) {
    return this.auth.verifyEmailByCode(body.code);
  }
}