import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as backendIDL } from "../../../declarations/kintaraa_backend/kintaraa_backend.did.js";
import { getCanisterId } from "../config/canister_env";
import { AuthClient } from "@dfinity/auth-client";

let backendActor = null;

export const getBackendActor = async () => {  // Add export here
  if (!backendActor) {
    const authClient = await AuthClient.create();
    const identity = await authClient.getIdentity();
    const canisterId = getCanisterId("kintaraa_backend");
    
    console.log('Network:', process.env.DFX_NETWORK);
    console.log('Using canister ID:', canisterId);
    
    const isLocal = !process.env.DFX_NETWORK || process.env.DFX_NETWORK === 'local';
    const host = isLocal ? 'http://127.0.0.1:4943' : 'https://ic0.app';
    
    const agent = new HttpAgent({
      identity,
      host,
      verifyQuerySignatures: false
    });

    if (isLocal) {
      await agent.fetchRootKey().catch(console.error);
    }

    backendActor = Actor.createActor(backendIDL, {
      agent,
      canisterId,
    });
  }
  return backendActor;
};

export const getAuthClient = async () => {
  const client = await AuthClient.create({
    idleOptions: {
      disableIdle: true,
    },
  });
  return client;
};

export const api = {
  
  greet: async (name) => {
    try {
      const actor = await getBackendActor();
      return await actor.greet(name);
    } catch (error) {
      console.error("Error greeting:", error);
      throw error;
    }
  },
  submitReport: async (request) => {
    try {
      const formattedRequest = {
        service_type: { [request.service_type]: null },
        description: request.description,
        priority: { [request.priority]: null }
      };
      const actor = await getBackendActor();
      const result = await actor.submit_report(formattedRequest);
      return result;
    } catch (error) {
      console.error("Error submitting service request:", error);
      throw error;
    }
  },

  getServiceRequests: async () => {
    try {
      const actor = await getBackendActor();
      return await actor.get_service_requests();
    } catch (error) {
      console.error("Error getting service requests:", error);
      throw error;
    }
  },

  getTokenBalance: async (principal) => {
    try {
      const actor = await getBackendActor();
      return await actor.get_token_balance(principal);
    } catch (error) {
      console.error("Error getting token balance:", error);
      throw error;
    }
  },
  getTransactionHistory: async (principal) => {
    try {
      const actor = await getBackendActor();
      return await actor.get_transaction_history(principal);
    } catch (error) {
      console.error("Error getting transaction history:", error);
      throw error;
    }
  },
  initializeUserTokens: async () => {
    try {
      const actor = await getBackendActor();
      return await actor.initialize_user_tokens();
    } catch (error) {
      console.error("Error initializing user tokens:", error);
      throw error;
    }
  },
  checkIsAdmin: async (principal) => {
    try {
      const actor = await getBackendActor();
      return await actor.check_is_admin(principal);
    } catch (error) {
      console.error("Error checking if user is admin:", error);
      throw error;
    }
  }
  ,
  registerUser: async (userData) => {
    try {
      const actor = await getBackendActor();
      const registrationData = {
        user_type: userData.userType,
        full_name: userData.fullName,
        email: userData.email,
        license_number: userData.licenseNumber || "", // Optional field
        organization: userData.organization || "", // Optional field
      };
      return await actor.register_user(registrationData);
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },

};