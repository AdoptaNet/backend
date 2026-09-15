import { ApiProperty } from '@nestjs/swagger';

export class UploadMediaResponseDto {
  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/v12345/avatar.webp',
    description: 'URL segura pública de la imagen alojada en CDN',
  })
  url: string;

  @ApiProperty({
    example: 'firu-api/avatars/abc123xyz',
    description:
      'Identificador público en Cloudinary para futuras operaciones o eliminación',
  })
  publicId: string;

  @ApiProperty({ example: 'webp', description: 'Formato de la imagen' })
  format: string;

  @ApiProperty({ example: 102400, description: 'Tamaño en bytes del archivo' })
  bytes: number;
}
