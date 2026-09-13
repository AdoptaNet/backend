import { SnakePluralNamingStrategy } from './naming.strategy';

describe('SnakePluralNamingStrategy', () => {
  let strategy: SnakePluralNamingStrategy;

  beforeEach(() => {
    strategy = new SnakePluralNamingStrategy();
  });

  describe('tableName', () => {
    it('should pluralize and convert to snake_case stripping OrmEntity suffix', () => {
      expect(strategy.tableName('PetOrmEntity', undefined)).toBe('pets');
      expect(strategy.tableName('AdoptionRequestOrmEntity', undefined)).toBe(
        'adoption_requests',
      );
      expect(
        strategy.tableName('PostAdoptionFollowUpOrmEntity', undefined),
      ).toBe('post_adoption_follow_ups');
    });

    it('should pluralize and convert to snake_case stripping Entity suffix', () => {
      expect(strategy.tableName('UserEntity', undefined)).toBe('users');
    });

    it('should pluralize plain class names without suffix', () => {
      expect(strategy.tableName('User', undefined)).toBe('users');
      expect(strategy.tableName('AdopterProfile', undefined)).toBe(
        'adopter_profiles',
      );
    });

    it('should respect custom userSpecifiedName when provided', () => {
      expect(strategy.tableName('PetOrmEntity', 'custom_pets_table')).toBe(
        'custom_pets_table',
      );
    });
  });

  describe('columnName', () => {
    it('should convert camelCase properties to snake_case', () => {
      expect(strategy.columnName('createdAt', '', [])).toBe('created_at');
      expect(strategy.columnName('shelterId', '', [])).toBe('shelter_id');
      expect(strategy.columnName('isSterilized', '', [])).toBe('is_sterilized');
    });

    it('should handle embedded prefixes in snake_case', () => {
      expect(strategy.columnName('city', '', ['address'])).toBe('address_city');
    });

    it('should respect customName when provided', () => {
      expect(strategy.columnName('name', 'custom_name', [])).toBe(
        'custom_name',
      );
    });
  });

  describe('relations and join columns', () => {
    it('should format joinColumnName in snake_case', () => {
      expect(strategy.joinColumnName('shelter', 'id')).toBe('shelter_id');
      expect(strategy.joinColumnName('adopterProfile', 'id')).toBe(
        'adopter_profile_id',
      );
    });
  });
});
