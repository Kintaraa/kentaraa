import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';

const IDENTITY_PROVIDER = "https://identity.ic0.app";
const LOCAL_II = `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`;

export class AuthService {
  static client = null;
  static identity = null;

  static async init() {
    this.client = await AuthClient.create();
    if (await this.client.isAuthenticated()) {
      this.identity = await this.client.getIdentity();
      return true;
    }
    return false;
  }

  static async login() {
    return new Promise((resolve) => {
      this.client.login({
        identityProvider: process.env.DFX_NETWORK === 'ic' ? IDENTITY_PROVIDER : LOCAL_II,
        onSuccess: async () => {
          this.identity = await this.client.getIdentity();
          resolve(true);
        },
        onError: (error) => {
          console.error('Login failed:', error);
          resolve(false);
        }
      });
    });
  }

  static async logout() {
    await this.client.logout();
    this.identity = null;
    window.location.reload();
  }

  static async getAgent() {
    if (!this.identity) {
      throw new Error('Not authenticated');
    }
    const agent = new HttpAgent({
      identity: this.identity,
      host: process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://localhost:4943'
    });

    if (process.env.DFX_NETWORK !== 'ic') {
      await agent.fetchRootKey();
    }
    return agent;
  }

  static async getPrincipal() {
    if (!this.identity) {
      throw new Error('Not authenticated');
    }
    return this.identity.getPrincipal();
  }

  static isAuthenticated() {
    return !!this.identity;
  }
}