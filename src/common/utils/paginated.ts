import { Injectable } from '@nestjs/common';

@Injectable()
export class PaginatedResult<T> {
  data: T[];

  page: number;

  limit: number;

  totalCount: number; // Expect this to be provided externally

  totalPages: number; // Expect this to be provided externally

  constructor(data: T[], page: number, limit: number, totalCount: number) {
    this.data = data;
    this.page = page;
    this.limit = limit;
    this.totalCount = totalCount;
    this.totalPages = Math.ceil(totalCount / limit);
  }
}
