import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';

const IDENTITY_PROVIDER = "https://identity.ic0.app";
const LOCAL_II = `http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:4943/`;

export class AuthService {
  static identity = null;
  static client = null;

  static async init() {
    this.client = await AuthClient.create();
    
    if (await this.client.isAuthenticated()) {
      this.identity = await this.client.getIdentity();
      const agent = new HttpAgent({
        identity: this.identity,
        host: process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://127.0.0.1:4943",
      });

      // Fetch root key only for local development
      if (process.env.DFX_NETWORK !== "ic") {
        await agent.fetchRootKey().catch(err => {
          console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
          console.error(err);
        });
      }

      return true;
    }
    return false;
  }

  static async login() {
    if (!this.client) {
      this.client = await AuthClient.create();
    }
    
    return new Promise((resolve) => {
      this.client.login({
        identityProvider: process.env.DFX_NETWORK === "ic" 
          ? IDENTITY_PROVIDER
          : LOCAL_II,
        onSuccess: async () => {
          this.identity = await this.client.getIdentity();
          resolve(true);
        },
        onError: () => resolve(false),
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
    console.log('Environment:', process.env.DFX_NETWORK);
    console.log('Agent Host:', agent.fetchRootKey());


    if (process.env.DFX_NETWORK !== 'ic') {
      try {
        console.log('Fetching root key from:', agent.host); 
        await agent.fetchRootKey();
        console.log('Fetching root key Fetched:', agent.host); 

      } catch (error) {
        console.error('Failed to fetch root key:', error);
      }
      
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