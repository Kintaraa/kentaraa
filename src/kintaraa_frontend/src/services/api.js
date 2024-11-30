import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as backendIDL } from "../../../declarations/kintaraa_backend/kintaraa_backend.did.js";
import { getCanisterId } from "../config/canister_env";
import { AuthClient } from "@dfinity/auth-client";

const agent = new HttpAgent({
  host: process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://127.0.0.1:4943",
});

// Modify the root key fetching logic
if (process.env.DFX_NETWORK !== "ic") {
  try {
    await agent.fetchRootKey();
  } catch (err) {
    console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
    console.error(err);
  }
}

const canisterId = getCanisterId("kintaraa_backend");

console.log("canisterId", canisterId);
export const backendActor = Actor.createActor(backendIDL, {
  agent,
  canisterId,
});

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
      return await backendActor.greet(name);
    } catch (error) {
      console.error("Error greeting:", error);
      throw error;
    }
  },
  submitServiceRequest: async (request) => {
    try {
      const formattedRequest = {
        service_type: { [request.service_type]: null },
        description: request.description,
        priority: { [request.priority]: null }
      };
      const result = await backendActor.submit_service_request(formattedRequest);
      return result;
    } catch (error) {
      console.error("Error submitting service request:", error);
      throw error;
    }
  },

  getServiceRequests: async () => {
    try {
      return await backendActor.get_service_requests();
    } catch (error) {
      console.error("Error getting service requests:", error);
      throw error;
    }
  },

  scheduleAppointment: async (appointment) => {
    try {
      const formattedAppointment = {
        service_type: { [appointment.service_type]: null },
        datetime: appointment.datetime,
        notes: appointment.notes
      };
      return await backendActor.schedule_appointment(formattedAppointment);
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      throw error;
    }
  },

  getAppointments: async () => {
    try {
      return await backendActor.get_appointments();
    } catch (error) {
      console.error("Error getting appointments:", error);
      throw error;
    }
  },

  getTokenBalance: async (principal) => {
    try {
      return await backendActor.get_token_balance(principal);
    } catch (error) {
      console.error("Error getting token balance:", error);
      throw error;
    }
  },

  initializeUserTokens: async () => {
    try {
      return await backendActor.initialize_user_tokens();
    } catch (error) {
      console.error("Error initializing user tokens:", error);
      throw error;
    }
  }
};