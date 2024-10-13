import * as crypto from 'crypto';
import { InitDataDto } from '../auth/dto/init-data.dto';

export function verifyTelegramWebAppData(
  botToken: string,
  initData: InitDataDto,
): boolean {
  const secret = crypto.createHash('sha256').update(botToken).digest();

  const checkString = Object.entries(initData)
    .filter(([key]) => key !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([key, value]) =>
        `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`,
    )
    .join('\n');

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(checkString)
    .digest('hex');

  return hmac === initData.hash;
}
