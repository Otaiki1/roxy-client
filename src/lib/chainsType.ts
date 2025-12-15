export type ChainId = string;

export interface ChainInfo {
  blockHash: null | string;
  chainId: ChainId;
  nextBlockHeight: number;
  owner: string;
  pendingProposal: null | string;
  timestamp: number;
}

export interface Chains {
  [chainId: string]: ChainInfo;
}

export interface Wallet {
  chains: Chains;
  defaultChain: ChainId;
}

export class Convert {
  static toWallet(json: string): Wallet {
    try {
      return JSON.parse(json) as Wallet;
    } catch (error) {
      throw new Error(`Failed to parse wallet JSON: ${error}`);
    }
  }
}

