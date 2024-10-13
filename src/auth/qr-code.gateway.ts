import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QrCodeService } from './qr-code.service';
import { allowedOrigins } from 'src/common/config/app.config';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new UnauthorizedException('Request is not allowed by CORS'));
      }
    },
    methods: process.env.CORS_METHODS,
  },
  transports: ['websocket'],
})
export class QrCodeGateway {
  @WebSocketServer()
  server: Server;

  constructor(private qrCodeService: QrCodeService) {}

  @SubscribeMessage('subscribeToQrCode')
  async handleSubscribeToQrCode(
    @MessageBody() qrCode: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(qrCode);
    const status = await this.qrCodeService.checkQRCodeStatus(qrCode);
    this.server.to(qrCode).emit('qrCodeStatus', { qrCode, status });
  }

  async sendQrCodeStatusUpdate(qrCode: string, status: string) {
    console.log({ qrCode });
    console.log({ status });
    this.server.to(qrCode).emit('qrCodeStatus', { qrCode, status });
  }
}
