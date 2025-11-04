import { WalletSSO } from '../src/WalletSSO';

// Example client-side usage (would run in browser or Node.js with wallet access)
class WalletSSOClient {
  private sso: WalletSSO;
  private baseUrl: string;

  constructor(config: any, baseUrl = 'http://localhost:3001') {
    this.sso = new WalletSSO(config);
    this.baseUrl = baseUrl;
  }

  // Generate authentication challenge
  async generateChallenge(address: string, walletType: 'metamask' | 'polkadot') {
    const response = await fetch(`${this.baseUrl}/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, walletType })
    });

    if (!response.ok) {
      throw new Error('Failed to generate challenge');
    }

    return await response.json();
  }

  // Sign message with MetaMask
  async signWithMetaMask(message: string, address: string) {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    return await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address]
    });
  }

  // Sign message with Polkadot extension
  async signWithPolkadot(message: string, address: string) {
    const { web3FromAddress } = await import('@polkadot/extension-dapp');
    const { stringToHex } = await import('@polkadot/util');

    const injector = await web3FromAddress(address);
    if (!injector?.signer?.signRaw) {
      throw new Error('Polkadot extension not available');
    }

    const { signature } = await injector.signer.signRaw({
      address,
      data: stringToHex(message),
      type: 'bytes'
    });

    return signature;
  }

  // Authenticate with signed message
  async authenticate(
    message: string,
    signature: string,
    address: string,
    walletType: 'metamask' | 'polkadot',
    chainId?: number
  ) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        signature,
        address,
        walletType,
        chainId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Authentication failed');
    }

    return await response.json();
  }

  // Verify token
  async verifyToken(token: string) {
    const response = await fetch(`${this.baseUrl}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    return await response.json();
  }

  // Get user profile
  async getUserProfile(token: string) {
    const response = await fetch(`${this.baseUrl}/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }

    return await response.json();
  }

  // Refresh token
  async refreshToken(refreshToken: string) {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return await response.json();
  }

  // Complete authentication flow for MetaMask
  async authenticateWithMetaMask(address: string, chainId?: number) {
    // 1. Generate challenge
    const { message } = await this.generateChallenge(address, 'metamask');

    // 2. Sign message
    const signature = await this.signWithMetaMask(message, address);

    // 3. Authenticate
    const tokens = await this.authenticate(message, signature, address, 'metamask', chainId);

    return tokens;
  }

  // Complete authentication flow for Polkadot
  async authenticateWithPolkadot(address: string) {
    // 1. Generate challenge
    const { message } = await this.generateChallenge(address, 'polkadot');

    // 2. Sign message
    const signature = await this.signWithPolkadot(message, address);

    // 3. Authenticate
    const tokens = await this.authenticate(message, signature, address, 'polkadot');

    return tokens;
  }
}

// Example usage
async function exampleUsage() {
  const config = {
    jwtSecret: 'demo-secret',
    jwtIssuer: 'http://localhost:3001',
    jwtAudience: 'demo-app',
    accessTokenExpiry: 3600,
    refreshTokenExpiry: 86400,
    sessionSecret: 'demo-session',
  };

  const client = new WalletSSOClient(config);

  try {
    // MetaMask authentication
    const metamaskAddress = '0x1234...abcd'; // Get from MetaMask
    const metamaskTokens = await client.authenticateWithMetaMask(metamaskAddress, 1);

    console.log('MetaMask authentication successful:', metamaskTokens);

    // Verify token
    const userInfo = await client.verifyToken(metamaskTokens.accessToken);
    console.log('User info:', userInfo);

    // Get profile
    const profile = await client.getUserProfile(metamaskTokens.accessToken);
    console.log('User profile:', profile);

  } catch (error) {
    console.error('Authentication failed:', error);
  }
}

// Export for use in other files
export { WalletSSOClient };
export default WalletSSOClient;