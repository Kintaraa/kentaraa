import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as backendIDL } from "../../../declarations/kintaraa_backend/kintaraa_backend.did.js";
import { getCanisterId } from "../config/canister_env";

const agent = new HttpAgent({
  host: process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://127.0.0.1:4943",
});

// Only fetch the root key when we're not in production
if (process.env.NODE_ENV !== "production") {
  agent.fetchRootKey().catch(err => {
    console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
    console.error(err);
  });
}

const canisterId = getCanisterId("kintaraa_backend");

export const backendActor = Actor.createActor(backendIDL, {
  agent,
  canisterId,
});

export const api = {
  // Reports
  submitReport: async (description) => {
    try {
      return await backendActor.submit_report(description);
    } catch (error) {
      console.error("Error submitting report:", error);
      throw error;
    }
  },

  getReport: async (id) => {
    try {
      return await backendActor.get_report(id);
    } catch (error) {
      console.error("Error getting report:", error);
      throw error;
    }
  },

  getUserReports: async (principal) => {
    try {
      return await backendActor.get_user_reports(principal);
    } catch (error) {
      console.error("Error getting user reports:", error);
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
};