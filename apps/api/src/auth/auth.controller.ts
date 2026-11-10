import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  loginSchema,
  registerSchema,
  type LoginDto,
  type RegisterDto,
} from './auth.schemas';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(201)
  register(@Body(new ZodValidationPipe(registerSchema)) body: RegisterDto) {
    return this.auth.register(body);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginDto) {
    return this.auth.login(body);
  }
}