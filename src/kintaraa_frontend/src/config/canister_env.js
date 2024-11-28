export const canisterId = {
    "local": {
      "kintaraa_backend": "bkyz2-fmaaa-aaaaa-qaaaq-cai",
      "kintaraa_frontend": "bd3sg-teaaa-aaaaa-qaaba-cai"
    },
    "ic": {
      "kintaraa_backend": "bkyz2-fmaaa-aaaaa-qaaaq-cai",
      "kintaraa_frontend": "bd3sg-teaaa-aaaaa-qaaba-cai"
    }
  };
  
  export function getCanisterId(name) {
    const network = process.env.DFX_NETWORK || 'local';
    return canisterId[network][name];
  }