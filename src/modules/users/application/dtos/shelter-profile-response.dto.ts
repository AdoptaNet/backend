import { ApiProperty } from '@nestjs/swagger';

export class ShelterProfileResponseDto {
  @ApiProperty({ description: 'ID del perfil de albergue' })
  id: string;

  @ApiProperty({ description: 'ID del usuario asociado' })
  userId: string;

  @ApiProperty({
    description: 'Nombre de la organización o albergue',
    nullable: true,
  })
  organizationName: string | null;

  @ApiProperty({ description: 'Dirección física', nullable: true })
  address: string | null;

  @ApiProperty({ description: 'Ciudad o distrito', nullable: true })
  city: string | null;

  @ApiProperty({ description: 'Departamento', nullable: true })
  department: string | null;

  @ApiProperty({
    description: 'Teléfono o WhatsApp de contacto',
    nullable: true,
  })
  phoneNumber: string | null;

  @ApiProperty({
    description: 'Correo electrónico de contacto público',
    nullable: true,
  })
  contactEmail: string | null;

  @ApiProperty({
    description: 'Descripción o misión del albergue/rescatista',
    nullable: true,
  })
  description: string | null;

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
    description: 'Indica si el albergue fue verificado por un administrador',
  })
  isVerified: boolean;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}
