import { v4 as uuidv4 } from 'uuid';
import { Challenge } from '../types';

export class ChallengeUtils {
  private challenges: Map<string, Challenge> = new Map();

  generateChallenge(address: string, walletType: 'metamask' | 'polkadot'): string {
    const nonce = uuidv4();
    const message = `Sign this message to authenticate with ${walletType.toUpperCase()} wallet ${address} at ${new Date().toISOString()}. Nonce: ${nonce}`;

    const challenge: Challenge = {
      message,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      used: false,
    };

    // Store challenge with nonce as key
    this.challenges.set(nonce, challenge);

    // Clean up expired challenges
    this.cleanup();

    return message;
  }

  verifyChallenge(message: string): boolean {
    // Find challenge by message content
    for (const [nonce, challenge] of this.challenges.entries()) {
      if (challenge.message === message) {
        if (challenge.used || challenge.expiresAt < new Date()) {
          return false;
        }

        // Mark as used
        challenge.used = true;
        return true;
      }
    }

    return false;
  }

  private cleanup(): void {
    const now = new Date();
    for (const [nonce, challenge] of this.challenges.entries()) {
      if (challenge.expiresAt < now || challenge.used) {
        this.challenges.delete(nonce);
      }
    }
  }

  getChallengeCount(): number {
    this.cleanup();
    return this.challenges.size;
  }
}