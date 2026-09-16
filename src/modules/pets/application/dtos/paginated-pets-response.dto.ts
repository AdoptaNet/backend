import { ApiProperty } from '@nestjs/swagger';
import { PetResponseDto } from './pet-response.dto';

export class PaginatedPetsResponseDto {
  @ApiProperty({ type: [PetResponseDto] })
  items: PetResponseDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
