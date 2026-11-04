export interface AdminShelterItemDto {
  id: string;
  userId: string;
  shelterName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  isVerified: boolean;
  petCount: number;
  createdAt: Date;
}

export interface AdminSheltersListResponseDto {
  shelters: AdminShelterItemDto[];
  total: number;
}
