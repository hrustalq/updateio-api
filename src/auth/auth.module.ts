import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { QrCodeGateway } from './qr-code.gateway';
import { QrCodeService } from './qr-code.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { CombinedAuthGuard } from './guards/combined-auth.guard';
import { TelegramStrategy } from './strategies/telegram.strategy'; // Добавьте эту строку

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_AT_SECRET'),
        expiresIn: configService.get<number>('JWT_AT_EXP'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    QrCodeGateway,
    QrCodeService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    ApiKeyStrategy,
    CombinedAuthGuard,
    TelegramStrategy,
    ConfigService,
  ],
  exports: [AuthService, QrCodeGateway],
})
export class AuthModule {}
