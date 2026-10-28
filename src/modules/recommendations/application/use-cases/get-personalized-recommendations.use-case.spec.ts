import { GetPersonalizedRecommendationsUseCase } from './get-personalized-recommendations.use-case';
import { PetStatus } from '../../../pets/domain/value-objects/pet-status.enum';
import { PetSpecies } from '../../../pets/domain/value-objects/pet-species.enum';
import { PetSize } from '../../../pets/domain/value-objects/pet-size.enum';
import { PetGender } from '../../../pets/domain/value-objects/pet-gender.enum';
import { PetAgeCategory } from '../../../pets/domain/value-objects/pet-age-category.enum';

describe('GetPersonalizedRecommendationsUseCase', () => {
  let useCase: GetPersonalizedRecommendationsUseCase;
  let mockUserRepo: any;
  let mockCacheRepo: any;
  let mockPetRepo: any;
  let mockMlClient: any;

  beforeEach(() => {
    mockUserRepo = {
      findByIdWithProfile: jest.fn(),
    };
    mockCacheRepo = {
      findByAdopterId: jest.fn(),
      saveMany: jest.fn(),
      deleteByAdopterId: jest.fn(),
    };
    mockPetRepo = {
      findAvailableForRecommendations: jest.fn(),
    };
    mockMlClient = {
      computeMatch: jest.fn(),
    };

    useCase = new GetPersonalizedRecommendationsUseCase(
      mockUserRepo,
      mockCacheRepo,
      mockPetRepo,
      mockMlClient,
    );
  });

  it('debe retornar isSurveyCompleted = false si el perfil no tiene encuesta completa', async () => {
    mockUserRepo.findByIdWithProfile.mockResolvedValue({
      id: 'user-1',
      adopterProfile: { isSurveyCompleted: false },
    });

    const result = await useCase.execute({ id: 'user-1' } as any, { limit: 10 });

    expect(result.isSurveyCompleted).toBe(false);
    expect(result.recommendations).toHaveLength(0);
    expect(mockCacheRepo.findByAdopterId).not.toHaveBeenCalled();
  });

  it('debe servir recomendaciones instantáneamente desde la caché persistida (Cache Hit < 50ms)', async () => {
    const mockPet: any = {
      id: 'pet-1',
      name: 'Max',
      species: PetSpecies.DOG,
      status: PetStatus.AVAILABLE,
      size: PetSize.MEDIUM,
      gender: PetGender.MALE,
      ageMonths: 24,
      ageCategory: PetAgeCategory.ADULT,
      photos: [],
      shelter: { shelterProfile: { organizationName: 'Refugio Esperanza' } },
    };

    mockUserRepo.findByIdWithProfile.mockResolvedValue({
      id: 'user-1',
      adopterProfile: { isSurveyCompleted: true },
    });

    mockCacheRepo.findByAdopterId.mockResolvedValue([
      {
        adopterId: 'user-1',
        petId: 'pet-1',
        score: 1.0865,
        reasonBadges: [{ badge: 'Ideal para departamento' }],
        isFallback: false,
        pet: mockPet,
      },
    ]);

    const result = await useCase.execute({ id: 'user-1' } as any, { limit: 5 });

    expect(result.isSurveyCompleted).toBe(true);
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].pet.name).toBe('Max');
    expect(result.recommendations[0].reasonBadges).toEqual([
      { badge: 'Ideal para departamento' },
    ]);
    expect(mockMlClient.computeMatch).not.toHaveBeenCalled();
  });

  it('debe orquestar inferencia en ML Service y persistir en caché ante Cache Miss', async () => {
    const mockPet: any = {
      id: 'pet-10',
      name: 'Pelusa',
      species: PetSpecies.CAT,
      status: PetStatus.AVAILABLE,
      size: PetSize.SMALL,
      gender: PetGender.FEMALE,
      ageMonths: 12,
      ageCategory: PetAgeCategory.YOUNG,
      characteristics: {},
      photos: [],
      shelter: { shelterProfile: {} },
    };

    mockUserRepo.findByIdWithProfile.mockResolvedValue({
      id: 'user-1',
      adopterProfile: { isSurveyCompleted: true, department: 'Lima' },
    });

    // Cache Miss
    mockCacheRepo.findByAdopterId.mockResolvedValue([]);
    mockPetRepo.findAvailableForRecommendations.mockResolvedValue([mockPet]);
    mockMlClient.computeMatch.mockResolvedValue({
      modelo: { nombre: 'adoptanet-recomendador', version: '1.0.0' },
      recomendaciones: [
        {
          posicion: 1,
          pet_id: 'pet-10',
          score: 1.15,
          p_interes: 0.95,
          compatibilidad: 0.92,
          motivos: ['Tolera tus horas a solas', 'Compatible con departamento'],
          alertas: [],
        },
      ],
      n_viables: 1,
      tiempo_ms: 20,
    });

    const result = await useCase.execute({ id: 'user-1' } as any, { limit: 10 });

    expect(result.isSurveyCompleted).toBe(true);
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].pet.name).toBe('Pelusa');
    expect(mockCacheRepo.saveMany).toHaveBeenCalled();
  });
});
