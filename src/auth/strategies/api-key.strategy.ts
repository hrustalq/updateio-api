import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(private usersService: UsersService) {
    super();
  }

  async validate(req: Request): Promise<any> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('apiKey ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const apiKey = authHeader.split(' ')[1];

    if (!apiKey.length) throw new UnauthorizedException('Invalid Api key');

    const user = await this.usersService.findByApiKey(apiKey);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    return user;
  }
}
