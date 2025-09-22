export type ConsensusMode = 'pow' | 'pos' | 'pbft'

export interface Wallet {
  id: string
  name: string
  address: string
  balance: number
  staked: number
  color: string
  achievements: string[]
}

export type TransactionCategory = 'transfer' | 'reward' | 'contract'

export interface TransactionMetadata {
  contractAction?: 'deposit' | 'complete'
  questName?: string
  reward?: number
  depositReleased?: number
}

export interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  note: string
  type: TransactionCategory
  metadata?: TransactionMetadata
}

export interface Block {
  index: number
  timestamp: string
  nonce: number
  difficulty: number
  previousHash: string
  hash: string
  miner: string
  consensus: ConsensusMode
  transactions: Transaction[]
}

export interface ConsensusNode {
  id: string
  name: string
  role: 'Miner' | 'Validator'
  power: number
  stake: number
  reliability: number
  wins: number
  lastAction: string
  color: string
}

export interface ContractHistoryEntry {
  id: string
  walletId: string
  action: 'deposit' | 'complete'
  amount: number
  reward: number
  timestamp: string
  description: string
}

export interface SmartContractState {
  lockedTokens: number
  stakes: Record<string, number>
  history: ContractHistoryEntry[]
}

export interface ConsensusHistoryEntry {
  id: string
  mode: ConsensusMode
  message: string
  timestamp: string
  winningNodeId?: string
}
