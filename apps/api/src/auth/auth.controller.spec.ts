import { BadRequestException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';

describe('AuthController', () => {
  const auth = { verifyEmailByCode: jest.fn(), resendVerification: jest.fn() };
  const controller = new AuthController(auth as unknown as AuthService);

  beforeEach(() => jest.resetAllMocks());

  it('verify-code repassa e-mail e código ao service', async () => {
    auth.verifyEmailByCode.mockResolvedValue({ message: 'ok' });
    await expect(
      controller.verifyCode({ email: 'a@a.com', code: '123456' }),
    ).resolves.toEqual({ message: 'ok' });
    expect(auth.verifyEmailByCode).toHaveBeenCalledWith('a@a.com', '123456');
  });

  it('verify-code valida o body com o schema (400 com issues)', async () => {
    const { ZodValidationPipe } = await import('../common/zod-validation.pipe');
    const { verifyCodeSchema } = await import('./auth.schemas');
    const pipe = new ZodValidationPipe(verifyCodeSchema);
    expect(() => pipe.transform({ email: 'a@a.com', code: '12' })).toThrow(
      BadRequestException,
    );
  });

  it('resend-verification repassa o e-mail', async () => {
    auth.resendVerification.mockResolvedValue({ message: 'ok' });
    await controller.resendVerification({ email: 'a@a.com' });
    expect(auth.resendVerification).toHaveBeenCalledWith('a@a.com');
  });
});
