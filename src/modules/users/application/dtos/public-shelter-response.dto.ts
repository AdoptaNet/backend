import { ApiProperty } from '@nestjs/swagger';
import { PetResponseDto } from '../../../pets/application/dtos/pet-response.dto';

export class PublicShelterResponseDto {
  @ApiProperty({ description: 'ID del perfil de albergue' })
  id: string;

  @ApiProperty({ description: 'ID del usuario propietario' })
  userId: string;

  @ApiProperty({ description: 'Nombre oficial del albergue u organización' })
  organizationName: string;

  @ApiProperty({ description: 'Descripción o misión del albergue', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Dirección física de referencia', nullable: true })
  address: string | null;

  @ApiProperty({ description: 'Ciudad o distrito', nullable: true })
  city: string | null;

  @ApiProperty({ description: 'Departamento del Perú', nullable: true })
  department: string | null;

  @ApiProperty({ description: 'Teléfono o WhatsApp de contacto', nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ description: 'Correo electrónico de contacto público', nullable: true })
  contactEmail: string | null;

  @ApiProperty({ description: 'Capacidad estimada de rescate', nullable: true })
  rescueCapacity: number | null;

  @ApiProperty({ description: 'URL de Facebook', nullable: true })
  facebookUrl: string | null;

  @ApiProperty({ description: 'URL de Instagram', nullable: true })
  instagramUrl: string | null;

  @ApiProperty({ description: 'Latitud GPS', nullable: true })
  latitude: number | null;

  @ApiProperty({ description: 'Longitud GPS', nullable: true })
  longitude: number | null;

  @ApiProperty({
    description: 'Distintivo oficial de albergue verificado',
    example: true,
  })
  isVerified: boolean;

  @ApiProperty({ description: 'URL del logo o foto de perfil', nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ description: 'Fecha de registro en la plataforma' })
  createdAt: Date;

  @ApiProperty({
    description: 'Catálogo de mascotas del albergue en estado disponible',
    type: () => [PetResponseDto],
  })
  availablePets: PetResponseDto[];
}
