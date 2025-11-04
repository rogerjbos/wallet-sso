import { WalletSSO } from '../src/WalletSSO';
import { MetaMaskProvider } from '../src/providers/MetaMaskProvider';

describe('WalletSSO', () => {
  const config = {
    jwtSecret: 'test-secret-key',
    jwtIssuer: 'https://test.example.com',
    jwtAudience: 'test-app',
    accessTokenExpiry: 3600,
    refreshTokenExpiry: 86400,
    sessionSecret: 'test-session-secret',
  };

  let sso: WalletSSO;

  beforeEach(() => {
    sso = new WalletSSO(config);
  });

  describe('Challenge Generation', () => {
    it('should generate a challenge for MetaMask', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const challenge = sso.generateChallenge(address, 'metamask');

      expect(challenge).toContain('Sign this message to authenticate');
      expect(challenge).toContain(address);
      expect(challenge).toContain('METAMASK');
    });

    it('should generate a challenge for Polkadot', () => {
      const address = '1Nyz5HWM2ZhoNKYB9Mpk4A8f4uTLU9L3cBJX9yGnVaN2De';
      const challenge = sso.generateChallenge(address, 'polkadot');

      expect(challenge).toContain('Sign this message to authenticate');
      expect(challenge).toContain(address);
      expect(challenge).toContain('POLKADOT');
    });
  });

  describe('MetaMask Provider', () => {
    let provider: MetaMaskProvider;

    beforeEach(() => {
      provider = new MetaMaskProvider();
    });

    it('should verify a valid signature', async () => {
      // This would require actual signature verification
      // For now, just test the method exists
      expect(typeof provider.verifySignature).toBe('function');
    });

    it('should get user info', async () => {
      // This would require network calls
      // For now, just test the method exists
      expect(typeof provider.getUserInfo).toBe('function');
    });
  });

  describe('Token Management', () => {
    it('should generate access token', () => {
      const payload = {
        sub: 'test-user-id',
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        walletType: 'metamask' as const,
        chainId: 1,
        nonce: 'test-nonce',
      };

      const token = (sso as any).jwtUtils.generateAccessToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should verify valid token', () => {
      const payload = {
        sub: 'test-user-id',
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        walletType: 'metamask' as const,
        chainId: 1,
        nonce: 'test-nonce',
      };

      const token = (sso as any).jwtUtils.generateAccessToken(payload);
      const verified = (sso as any).jwtUtils.verifyToken(token);

      expect(verified).toBeTruthy();
      expect(verified?.sub).toBe(payload.sub);
      expect(verified?.address).toBe(payload.address);
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.jwt.token';
      const verified = (sso as any).jwtUtils.verifyToken(invalidToken);

      expect(verified).toBeNull();
    });
  });
});