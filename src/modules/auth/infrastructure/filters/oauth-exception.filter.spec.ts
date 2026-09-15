import { ArgumentsHost } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthExceptionFilter } from './oauth-exception.filter';

describe('OAuthExceptionFilter', () => {
  let filter: OAuthExceptionFilter;
  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    filter = new OAuthExceptionFilter(mockConfigService as unknown as ConfigService);
  });

  it('should redirect to login with error=oauth_cancelled', () => {
    mockConfigService.get.mockReturnValue('http://localhost:3001');

    const redirectMock = jest.fn();
    const mockResponse = { redirect: redirectMock };
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(new Error('access_denied'), mockHost);

    expect(redirectMock).toHaveBeenCalledWith(
      'http://localhost:3001/login?error=oauth_cancelled',
    );
  });
});
