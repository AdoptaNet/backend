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

  async execute(
    isVerified?: boolean,
    verificationRequested?: boolean,
  ): Promise<AdminSheltersListResponseDto> {
    try {
      let query = `
        SELECT 
          sp.id,
          sp.user_id as "userId",
          COALESCE(sp.organization_name, 'Albergue sin nombre') as "shelterName",
          u.email,
          sp.phone_number as "phone",
          sp.address,
          sp.city,
          sp.is_verified as "isVerified",
          sp.verification_requested as "verificationRequested",
          sp.verification_requested_at as "verificationRequestedAt",
          sp.created_at as "createdAt",
          COUNT(p.id)::int as "petCount"
        FROM shelter_profiles sp
        JOIN users u ON u.id = sp.user_id
        LEFT JOIN pets p ON p.shelter_id = u.id AND p.deleted_at IS NULL
      `;

      const conditions: string[] = [];
      const params: any[] = [];

      if (typeof isVerified === 'boolean') {
        params.push(isVerified);
        conditions.push(`sp.is_verified = $${params.length}`);
      }

      if (typeof verificationRequested === 'boolean') {
        params.push(verificationRequested);
        conditions.push(`sp.verification_requested = $${params.length}`);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += `
        GROUP BY sp.id, sp.user_id, sp.organization_name, u.email, sp.phone_number, sp.address, sp.city, sp.is_verified, sp.verification_requested, sp.verification_requested_at, sp.created_at
        ORDER BY sp.verification_requested_at DESC NULLS LAST, sp.created_at DESC
      `;

      const rows: AdminShelterItemDto[] = await this.dataSource.query(
        query,
        params,
      );

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
