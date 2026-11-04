import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AdminShelterItemDto,
  AdminSheltersListResponseDto,
} from '../dtos/admin-shelters-list-response.dto';

@Injectable()
export class GetAdminSheltersUseCase {
  private readonly logger = new Logger(GetAdminSheltersUseCase.name);

  constructor(private readonly dataSource: DataSource) {}

  async execute(isVerified?: boolean): Promise<AdminSheltersListResponseDto> {
    try {
      let query = `
        SELECT 
          sp.id,
          sp.user_id as "userId",
          sp.shelter_name as "shelterName",
          u.email,
          sp.phone,
          sp.address,
          sp.city,
          sp.is_verified as "isVerified",
          sp.created_at as "createdAt",
          COUNT(p.id)::int as "petCount"
        FROM shelter_profiles sp
        JOIN users u ON u.id = sp.user_id
        LEFT JOIN pets p ON p.shelter_id = u.id AND p.status != 'archived'
      `;

      const params: any[] = [];
      if (typeof isVerified === 'boolean') {
        params.push(isVerified);
        query += ` WHERE sp.is_verified = $1`;
      }

      query += `
        GROUP BY sp.id, sp.user_id, sp.shelter_name, u.email, sp.phone, sp.address, sp.city, sp.is_verified, sp.created_at
        ORDER BY sp.created_at DESC
      `;

      const rows: AdminShelterItemDto[] = await this.dataSource.query(query, params);

      return {
        shelters: rows,
        total: rows.length,
      };
    } catch (error) {
      this.logger.error(`Error querying admin shelters: ${error.message}`);
      return { shelters: [], total: 0 };
    }
  }
}
