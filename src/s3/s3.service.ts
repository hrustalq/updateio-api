import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      endpoint: this.configService.get('API_S3_URL'),
      region: this.configService.get('API_S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get('API_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('API_S3_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true, // This is important for compatibility with Timeweb Cloud S3
    });
    this.bucketName = this.configService.get('API_S3_BUCKET');
  }

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    return this.getPublicUrl(key);
  }

  getPublicUrl(key: string): string {
    return `${this.configService.get('API_S3_URL')}/${this.bucketName}/${key}`;
  }

  async getPresignedPostUrl(
    key: string,
  ): Promise<{ url: string; fields: any }> {
    const { url, fields } = await createPresignedPost(this.s3Client, {
      Bucket: this.bucketName,
      Key: key,
      Expires: 3600, // URL expires in 1 hour
    });

    return { url, fields };
  }
}
