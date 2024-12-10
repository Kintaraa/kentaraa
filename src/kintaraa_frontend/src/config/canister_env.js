export const canisterId = {
    "local": {
    "kintaraa_backend": "bd3sg-teaaa-aaaaa-qaaba-cai",  
    "kintaraa_frontend": "be2us-64aaa-aaaaa-qaabq-cai"
    },
    "ic": {
      "kintaraa_backend": "23c6c-xaaaa-aaaam-adxma-cai",
      "kintaraa_frontend": "24dyw-2yaaa-aaaam-adxmq-cai"
    }
  };
  
  export function getCanisterId(name) {
    const network = process.env.DFX_NETWORK || 'local';
    return canisterId[network][name];
  }