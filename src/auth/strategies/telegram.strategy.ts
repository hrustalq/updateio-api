import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { AuthService } from '../auth.service';

@Injectable()
export class TelegramStrategy extends PassportStrategy(Strategy, 'telegram') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: any): Promise<any> {
    const { initData, raw } = req.body;
    if (!initData?.user?.id) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const user = await this.authService.validateInitData(initData, raw);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    return user;
  }
}
