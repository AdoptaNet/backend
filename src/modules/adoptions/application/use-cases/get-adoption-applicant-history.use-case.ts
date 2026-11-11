import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdoptionRequestRepository } from '../../domain/repositories/adoption-request.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import {
  AdopterHistoryPreviousPetDto,
  AdopterHistoryResponseDto,
  AdopterHistoryReturnDto,
  AdopterHistorySummaryDto,
} from '../dtos/adopter-history-response.dto';

const RETURN_REASON_LABELS: Record<string, string> = {
  severe_allergy: 'Alergia severa sobrevenida',
  behavioral_issue: 'Desafíos conductuales no superados',
  landlord_issue: 'Cambio habitacional o restricción de vivienda',
  unforeseen_emergency: 'Emergencia imprevista de fuerza mayor',
  other: 'Otra causa justificada',
};

@Injectable()
export class GetAdoptionApplicantHistoryUseCase {
  constructor(
    private readonly adoptionRepo: AdoptionRequestRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    adoptionId: string,
    requesterUserId: string,
    requesterRole: UserRole,
  ): Promise<AdopterHistoryResponseDto> {
    const adoption = await this.adoptionRepo.findById(adoptionId);
    if (!adoption) {
      throw new NotFoundException(
        `No se encontró la solicitud de adopción #${adoptionId}`,
      );
    }

    if (
      requesterRole !== UserRole.ADMIN &&
      adoption.shelterId !== requesterUserId
    ) {
      throw new ForbiddenException(
        'Solo el albergue receptor o un administrador pueden consultar el historial del postulante',
      );
    }

    return this.getHistoryForAdopter(
      adoption.adopterId,
      adoption.adopter?.fullName || null,
    );
  }

  async getHistoryForAdopter(
    adopterId: string,
    adopterName?: string | null,
  ): Promise<AdopterHistoryResponseDto> {
    // 1. Resumen de solicitudes de adopción
    const [adoptionsStats] = await this.dataSource.query(
      `
      SELECT 
        COUNT(*)::int as "totalApplications",
        COUNT(CASE WHEN status = 'approved' THEN 1 END)::int as "approvedAdoptions",
        COUNT(CASE WHEN status IN ('pending', 'under_review') THEN 1 END)::int as "activeApplications",
        COUNT(CASE WHEN status = 'rejected' THEN 1 END)::int as "rejectedApplications",
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::int as "cancelledApplications"
      FROM adoption_requests
      WHERE adopter_id = $1
    `,
      [adopterId],
    );

    // 2. Resumen de seguimientos y certificados
    const [followUpsStats] = await this.dataSource.query(
      `
      SELECT 
        COUNT(*)::int as "totalFollowUps",
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::int as "completedFollowUps",
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END)::int as "inProgressFollowUps",
        COUNT(CASE WHEN certificate_code IS NOT NULL THEN 1 END)::int as "certificatesCount"
      FROM follow_up_records
      WHERE adopter_id = $1
    `,
      [adopterId],
    );

    // 3. Retornos registrados
    const rawReturns = await this.dataSource.query(
      `
      SELECT 
        pr.id,
        pr.pet_id as "petId",
        p.name as "petName",
        pr.reason,
        pr.explanation,
        pr.status,
        pr.created_at as "createdAt",
        COALESCE(sp.organization_name, 'Albergue') as "shelterName"
      FROM pet_returns pr
      JOIN pets p ON p.id = pr.pet_id
      LEFT JOIN shelter_profiles sp ON sp.user_id = pr.shelter_id
      WHERE pr.adopter_id = $1
      ORDER BY pr.created_at DESC
    `,
      [adopterId],
    );

    const returns: AdopterHistoryReturnDto[] = rawReturns.map((r: any) => ({
      id: r.id,
      petId: r.petId,
      petName: r.petName,
      reason: r.reason,
      reasonLabel: RETURN_REASON_LABELS[r.reason] || r.reason || 'No especificada',
      explanation: r.explanation || null,
      status: r.status,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      shelterName: r.shelterName || null,
    }));

    // 4. Mascotas adoptadas previamente (aprobadas)
    const rawPreviousPets = await this.dataSource.query(
      `
      SELECT 
        ar.id as "adoptionId",
        p.id as "petId",
        p.name as "petName",
        p.species as "species",
        p.breed as "breed",
        (
          SELECT pp.url FROM pet_photos pp
          WHERE pp.pet_id = p.id AND pp.deleted_at IS NULL
          ORDER BY pp.is_primary DESC, pp."order" ASC
          LIMIT 1
        ) as "photoUrl",
        COALESCE(sp.organization_name, 'Albergue') as "shelterName",
        ar.approved_at as "adoptedAt",
        fur.status as "followUpStatus",
        fur.certificate_code as "certificateCode"
      FROM adoption_requests ar
      JOIN pets p ON p.id = ar.pet_id
      LEFT JOIN shelter_profiles sp ON sp.user_id = ar.shelter_id
      LEFT JOIN follow_up_records fur ON fur.adoption_id = ar.id
      WHERE ar.adopter_id = $1 AND ar.status = 'approved'
      ORDER BY ar.approved_at DESC NULLS LAST, ar.created_at DESC
    `,
      [adopterId],
    );

    const previousAdoptions: AdopterHistoryPreviousPetDto[] = rawPreviousPets.map(
      (p: any) => ({
        adoptionId: p.adoptionId,
        petId: p.petId,
        petName: p.petName,
        species: p.species,
        breed: p.breed,
        photoUrl: p.photoUrl || null,
        shelterName: p.shelterName || 'Albergue',
        adoptedAt: p.adoptedAt ? new Date(p.adoptedAt).toISOString() : null,
        followUpStatus: p.followUpStatus || null,
        certificateCode: p.certificateCode || null,
      }),
    );

    const summary: AdopterHistorySummaryDto = {
      totalApplications: Number(adoptionsStats?.totalApplications || 0),
      approvedAdoptions: Number(adoptionsStats?.approvedAdoptions || 0),
      activeApplications: Number(adoptionsStats?.activeApplications || 0),
      rejectedApplications: Number(adoptionsStats?.rejectedApplications || 0),
      cancelledApplications: Number(adoptionsStats?.cancelledApplications || 0),
      completedFollowUps: Number(followUpsStats?.completedFollowUps || 0),
      inProgressFollowUps: Number(followUpsStats?.inProgressFollowUps || 0),
      certificatesCount: Number(followUpsStats?.certificatesCount || 0),
      totalReturns: returns.filter((r) => r.status === 'returned').length,
    };

    // 5. Determinar nivel de confianza y badge
    let trustLevel: 'first_time' | 'experienced' | 'certified' | 'with_returns';
    let badgeLabel: string;
    let badgeDescription: string;

    if (summary.totalReturns > 0) {
      trustLevel = 'with_returns';
      badgeLabel = 'Con Devolución Previa';
      badgeDescription =
        'El adoptante tiene al menos un retorno registrado en la plataforma. Se recomienda revisar el motivo documentado en la entrevista.';
    } else if (summary.completedFollowUps > 0 || summary.certificatesCount > 0) {
      trustLevel = 'certified';
      badgeLabel = 'Adoptante Certificado';
      badgeDescription =
        'Cuenta con constancia oficial de adopción responsable y ha completado satisfactoriamente el protocolo de seguimiento.';
    } else if (summary.approvedAdoptions > 0) {
      trustLevel = 'experienced';
      badgeLabel = 'Adoptante con Historial';
      badgeDescription =
        'Ha formalizado adopciones previas con albergues en la plataforma.';
    } else {
      trustLevel = 'first_time';
      badgeLabel = 'Primerizo en la Plataforma';
      badgeDescription =
        'Esta es la primera postulación formalizada del adoptante en la plataforma.';
    }

    return {
      adopterId,
      adopterName: adopterName || null,
      trustLevel,
      badgeLabel,
      badgeDescription,
      summary,
      previousAdoptions,
      returns,
    };
  }
}
