import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';
import { api } from './api';

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
        host: process.env.DFX_NETWORK === "local" ?  "http://127.0.0.1:4943":"https://ic0.app" ,
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
        // identityProvider: "https://identity.ic0.app",
        onSuccess: async () => {
          this.identity = await this.client.getIdentity();
          // Cache authentication data
          const principal = this.identity.getPrincipal();
          localStorage.setItem('auth_principal', principal);
          localStorage.setItem('auth_identity', JSON.stringify(this.identity));
          console.log("=====Checking if user is admin=====", principal.toString())

          // Initialize tokens for new users
          try {
            await api.initializeUserTokens();
          } catch (error) {
            console.log("Token initialization error (might be already initialized):", error);
          }
          // Check if user is admin
          const isAdmin = await AuthService.checkIsAdmin(principal);
          console.log("=====User is admin=====", isAdmin)
          localStorage.setItem('is_admin', isAdmin);

          resolve(true);
        },
        onError: () => resolve(false),
      });
    });
  }

  static async checkIsAdmin(principal) {
    try {
      console.log("=====Checking admin status for principal=====");
      const isAdmin = await api.checkIsAdmin(principal);
      console.log("=====Admin check response=====", isAdmin);
      return isAdmin;
    } catch (error) {
      console.error("Error checking if user is admin from authService:", error);
      return false;
    }
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

  static async setUser(userData) {
    if (!this.identity) {
      throw new Error('Not authenticated');
    }
    
    // Store user data in localStorage for persistence
    localStorage.setItem('user_data', JSON.stringify(userData));
    this.userData = userData;
    return true;
  }
  static getUser() {
    if (!this.userData) {
      const storedData = localStorage.getItem('user_data');
      this.userData = storedData ? JSON.parse(storedData) : null;
    }
    return this.userData;
  }
}