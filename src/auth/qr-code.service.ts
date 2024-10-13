import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QrCodeService {
  constructor(private readonly prismaService: PrismaService) {}

  async generateQRCode(): Promise<string> {
    const code = uuidv4();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    await this.prismaService.qRCodeSession.create({
      data: {
        code,
        expiresAt,
        status: 'PENDING',
      },
    });

    return code;
  }

  async confirmQRCode(userId: string, code: string): Promise<void> {
    await this.prismaService.qRCodeSession.update({
      where: { code },
      data: {
        userId,
        status: 'CONFIRMED',
      },
    });
  }

  async checkQRCodeStatus(code: string): Promise<string> {
    const session = await this.prismaService.qRCodeSession.findUnique({
      where: { code },
    });

    if (!session) {
      return 'NOT_FOUND';
    }

    if (session.expiresAt < new Date() && session.status === 'PENDING') {
      await this.prismaService.qRCodeSession.update({
        where: { id: session.id },
        data: { status: 'EXPIRED' },
      });
      return 'EXPIRED';
    }

    return session.status;
  }

  async getQRCodeSession(code: string) {
    return this.prismaService.qRCodeSession.findUnique({
      where: { code },
      include: { user: true },
    });
  }
}
