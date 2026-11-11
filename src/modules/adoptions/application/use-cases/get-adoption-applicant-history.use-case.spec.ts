import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetAdoptionApplicantHistoryUseCase } from './get-adoption-applicant-history.use-case';
import { AdoptionRequestRepository } from '../../domain/repositories/adoption-request.repository';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { DataSource } from 'typeorm';

describe('GetAdoptionApplicantHistoryUseCase', () => {
  let useCase: GetAdoptionApplicantHistoryUseCase;
  let mockAdoptionRepo: jest.Mocked<Partial<AdoptionRequestRepository>>;
  let mockDataSource: { query: jest.Mock };

  beforeEach(() => {
    mockAdoptionRepo = {
      findById: jest.fn(),
    };
    mockDataSource = {
      query: jest.fn(),
    };

    useCase = new GetAdoptionApplicantHistoryUseCase(
      mockAdoptionRepo as any,
      mockDataSource as any,
    );
  });

  it('debe lanzar NotFoundException si la solicitud de adopción no existe', async () => {
    mockAdoptionRepo.findById!.mockResolvedValue(null);

    await expect(
      useCase.execute('invalid-id', 'shelter-1', UserRole.SHELTER),
    ).rejects.toThrow(NotFoundException);
  });

  it('debe lanzar ForbiddenException si el usuario no es el albergue receptor ni admin', async () => {
    mockAdoptionRepo.findById!.mockResolvedValue({
      id: 'adopt-1',
      shelterId: 'shelter-1',
      adopterId: 'adopter-1',
    } as any);

    await expect(
      useCase.execute('adopt-1', 'shelter-other', UserRole.SHELTER),
    ).rejects.toThrow(ForbiddenException);
  });

  it('debe retornar nivel "first_time" para un postulante primerizo', async () => {
    mockAdoptionRepo.findById!.mockResolvedValue({
      id: 'adopt-1',
      shelterId: 'shelter-1',
      adopterId: 'adopter-1',
      adopter: { fullName: 'Carlos Adoptante' },
    } as any);

    mockDataSource.query
      .mockResolvedValueOnce([
        {
          totalApplications: 1,
          approvedAdoptions: 0,
          activeApplications: 1,
          rejectedApplications: 0,
          cancelledApplications: 0,
        },
      ])
      .mockResolvedValueOnce([
        {
          totalFollowUps: 0,
          completedFollowUps: 0,
          inProgressFollowUps: 0,
          certificatesCount: 0,
        },
      ])
      .mockResolvedValueOnce([]) // 0 returns
      .mockResolvedValueOnce([]); // 0 previous pets

    const result = await useCase.execute('adopt-1', 'shelter-1', UserRole.SHELTER);

    expect(result.adopterId).toBe('adopter-1');
    expect(result.adopterName).toBe('Carlos Adoptante');
    expect(result.trustLevel).toBe('first_time');
    expect(result.badgeLabel).toBe('Primerizo en la Plataforma');
    expect(result.summary.totalApplications).toBe(1);
    expect(result.summary.approvedAdoptions).toBe(0);
    expect(result.previousAdoptions).toHaveLength(0);
    expect(result.returns).toHaveLength(0);
  });

  it('debe retornar nivel "certified" si el adoptante tiene seguimientos completados con constancia', async () => {
    mockAdoptionRepo.findById!.mockResolvedValue({
      id: 'adopt-1',
      shelterId: 'shelter-1',
      adopterId: 'adopter-1',
      adopter: { fullName: 'María Experta' },
    } as any);

    mockDataSource.query
      .mockResolvedValueOnce([
        {
          totalApplications: 2,
          approvedAdoptions: 1,
          activeApplications: 1,
          rejectedApplications: 0,
          cancelledApplications: 0,
        },
      ])
      .mockResolvedValueOnce([
        {
          totalFollowUps: 1,
          completedFollowUps: 1,
          inProgressFollowUps: 0,
          certificatesCount: 1,
        },
      ])
      .mockResolvedValueOnce([]) // 0 returns
      .mockResolvedValueOnce([
        {
          adoptionId: 'adopt-old',
          petId: 'pet-1',
          petName: 'Bobby',
          species: 'dog',
          breed: 'Mestizo',
          photoUrl: 'https://img.jpg',
          shelterName: 'Albergue Amigos',
          adoptedAt: '2026-01-10T00:00:00.000Z',
          followUpStatus: 'completed',
          certificateCode: 'CERT-2026-BF92',
        },
      ]);

    const result = await useCase.execute('adopt-1', 'shelter-1', UserRole.SHELTER);

    expect(result.trustLevel).toBe('certified');
    expect(result.badgeLabel).toBe('Adoptante Certificado');
    expect(result.summary.completedFollowUps).toBe(1);
    expect(result.previousAdoptions).toHaveLength(1);
    expect(result.previousAdoptions[0].petName).toBe('Bobby');
    expect(result.previousAdoptions[0].certificateCode).toBe('CERT-2026-BF92');
  });

  it('debe retornar nivel "with_returns" si tiene al menos un retorno registrado', async () => {
    mockAdoptionRepo.findById!.mockResolvedValue({
      id: 'adopt-1',
      shelterId: 'shelter-1',
      adopterId: 'adopter-1',
      adopter: { fullName: 'Pedro' },
    } as any);

    mockDataSource.query
      .mockResolvedValueOnce([
        {
          totalApplications: 2,
          approvedAdoptions: 1,
          activeApplications: 1,
          rejectedApplications: 0,
          cancelledApplications: 0,
        },
      ])
      .mockResolvedValueOnce([
        {
          totalFollowUps: 1,
          completedFollowUps: 0,
          inProgressFollowUps: 0,
          certificatesCount: 0,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'ret-1',
          petId: 'pet-2',
          petName: 'Luna',
          reason: 'severe_allergy',
          explanation: 'Alergia severa en familiar',
          status: 'returned',
          createdAt: '2026-03-01T00:00:00.000Z',
          shelterName: 'Albergue San Roque',
        },
      ])
      .mockResolvedValueOnce([]);

    const result = await useCase.execute('adopt-1', 'shelter-1', UserRole.SHELTER);

    expect(result.trustLevel).toBe('with_returns');
    expect(result.badgeLabel).toBe('Con Devolución Previa');
    expect(result.returns).toHaveLength(1);
    expect(result.returns[0].reasonLabel).toBe('Alergia severa sobrevenida');
  });

  it('debe permitir la consulta si el solicitante es ADMIN aunque no sea el albergue de la solicitud', async () => {
    mockAdoptionRepo.findById!.mockResolvedValue({
      id: 'adopt-1',
      shelterId: 'shelter-1',
      adopterId: 'adopter-1',
      adopter: { fullName: 'Juan' },
    } as any);

    mockDataSource.query
      .mockResolvedValueOnce([{ totalApplications: 1 }])
      .mockResolvedValueOnce([{ totalFollowUps: 0 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await useCase.execute('adopt-1', 'admin-user', UserRole.ADMIN);

    expect(result).toBeDefined();
    expect(result.adopterId).toBe('adopter-1');
  });
});
