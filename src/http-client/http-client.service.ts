import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HttpClientService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>(
      'TELEGRAM_BOT_API_URL',
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.get<T>(`${this.baseUrl}${url}`, config),
    );
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.post<T>(`${this.baseUrl}${url}`, data, config),
    );
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.put<T>(`${this.baseUrl}${url}`, data, config),
    );
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.delete<T>(`${this.baseUrl}${url}`, config),
    );
    return response.data;
  }
}
