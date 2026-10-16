import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { Roles } from '../../../../shared/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../auth/infrastructure/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/value-objects/user-role.enum';
import { AnalyzePetPhotosResponseDto } from '../../application/dtos/analyze-pet-photos-response.dto';
import { CreatePetDto } from '../../application/dtos/create-pet.dto';
import { PaginatedPetsResponseDto } from '../../application/dtos/paginated-pets-response.dto';
import { PetResponseDto } from '../../application/dtos/pet-response.dto';
import { QueryPublicPetsDto } from '../../application/dtos/query-public-pets.dto';
import { QueryShelterPetsDto } from '../../application/dtos/query-shelter-pets.dto';
import { SimilarPetResponseDto } from '../../application/dtos/similar-pet-response.dto';
import { UpdatePetStatusDto } from '../../application/dtos/update-pet-status.dto';
import { UpdatePetDto } from '../../application/dtos/update-pet.dto';
import { AnalyzePetPhotosUseCase } from '../../application/use-cases/analyze-pet-photos.use-case';
import { CreatePetUseCase } from '../../application/use-cases/create-pet.use-case';
import { DeletePetUseCase } from '../../application/use-cases/delete-pet.use-case';
import { GetMyPetsUseCase } from '../../application/use-cases/get-my-pets.use-case';
import { GetPetByIdUseCase } from '../../application/use-cases/get-pet-by-id.use-case';
import { ListPublicPetsUseCase } from '../../application/use-cases/list-public-pets.use-case';
import { SearchSimilarPetsUseCase } from '../../application/use-cases/search-similar-pets.use-case';
import { UpdatePetStatusUseCase } from '../../application/use-cases/update-pet-status.use-case';
import { UpdatePetUseCase } from '../../application/use-cases/update-pet.use-case';
import { PetSpecies } from '../../domain/value-objects/pet-species.enum';

@ApiTags('pets')
@Controller('pets')
export class PetsController {
  constructor(
    private readonly createPetUseCase: CreatePetUseCase,
    private readonly getMyPetsUseCase: GetMyPetsUseCase,
    private readonly getPetByIdUseCase: GetPetByIdUseCase,
    private readonly listPublicPetsUseCase: ListPublicPetsUseCase,
    private readonly updatePetUseCase: UpdatePetUseCase,
    private readonly updatePetStatusUseCase: UpdatePetStatusUseCase,
    private readonly deletePetUseCase: DeletePetUseCase,
    private readonly analyzePetPhotosUseCase: AnalyzePetPhotosUseCase,
    private readonly searchSimilarPetsUseCase: SearchSimilarPetsUseCase,
  ) {}

  @Post('analyze-photos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHELTER)
  @UseInterceptors(
    FilesInterceptor('photos', 6, {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Analizar fotos con DINOv2 para autocompletar ficha de mascota',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AnalyzePetPhotosResponseDto,
    description: 'Atributos sugeridos y embedding calculados por IA',
  })
  async analyzePhotos(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<AnalyzePetPhotosResponseDto> {
    return this.analyzePetPhotosUseCase.execute(files);
  }

  @Post('search-similar')
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Buscar mascotas en adopción por similitud visual de foto',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [SimilarPetResponseDto],
    description: 'Listado de mascotas ordenadas por similitud visual',
  })
  async searchSimilar(
    @UploadedFile() file: Express.Multer.File,
    @Query('limit') limit?: number,
    @Query('species') species?: PetSpecies,
    @Query('threshold') threshold?: number,
  ): Promise<SimilarPetResponseDto[]> {
    return this.searchSimilarPetsUseCase.execute(file, {
      limit: limit ? Number(limit) : undefined,
      species,
      threshold: threshold ? Number(threshold) : undefined,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHELTER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar una nueva mascota para adopción' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: PetResponseDto,
    description: 'Mascota creada exitosamente',
  })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreatePetDto,
  ): Promise<PetResponseDto> {
    return this.createPetUseCase.execute(user, dto);
  }

  @Get('my-pets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHELTER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar las mascotas registradas por el albergue autenticado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedPetsResponseDto,
    description: 'Listado paginado de mascotas del albergue',
  })
  async getMyPets(
    @CurrentUser() user: User,
    @Query() query: QueryShelterPetsDto,
  ): Promise<PaginatedPetsResponseDto> {
    return this.getMyPetsUseCase.execute(user, query);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Obtener el detalle público de una mascota' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PetResponseDto,
    description: 'Detalle de la mascota encontrada',
  })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: User,
  ): Promise<PetResponseDto> {
    return this.getPetByIdUseCase.execute(id, user);
  }

  @Get()
  @ApiOperation({ summary: 'Catálogo público de mascotas en adopción' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedPetsResponseDto,
    description: 'Listado público paginado de mascotas',
  })
  async listPublic(
    @Query() query: QueryPublicPetsDto,
  ): Promise<PaginatedPetsResponseDto> {
    return this.listPublicPetsUseCase.execute(query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHELTER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar la ficha de una mascota' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PetResponseDto,
    description: 'Mascota actualizada exitosamente',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdatePetDto,
  ): Promise<PetResponseDto> {
    return this.updatePetUseCase.execute(id, user, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHELTER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar el estado del ciclo de vida de una mascota',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PetResponseDto,
    description: 'Estado de la mascota actualizado exitosamente',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdatePetStatusDto,
  ): Promise<PetResponseDto> {
    return this.updatePetStatusUseCase.execute(id, user, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHELTER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar suavemente una mascota' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Mascota eliminada exitosamente',
  })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.deletePetUseCase.execute(id, user);
  }
}
