import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  verifyCodeSchema,
  type LoginDto,
  type RegisterDto,
  type VerifyEmailDto,
  type ResendVerificationDto,
  type VerifyCodeDto,
} from './auth.schemas';
import { AuthService } from './auth.service';
import { CurrentUser, type AuthUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

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
    @Body(new ZodValidationPipe(resendVerificationSchema))
    body: ResendVerificationDto,
  ) {
    return this.auth.resendVerification(body.email);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return { id: user.id, email: user.email };
  }

  @Post('verify-code')
  @HttpCode(200)
  verifyCode(
    @Body(new ZodValidationPipe(verifyCodeSchema)) body: VerifyCodeDto,
  ) {
    return this.auth.verifyEmailByCode(body.email, body.code);
  }
}
