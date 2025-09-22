import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { nanoid } from 'nanoid'

export type ConsensusMode = 'pow' | 'pos' | 'pbft'

export type GameNodeType = 'miner' | 'validator' | 'dapp' | 'research'

type NodeStatus = 'active' | 'building'

export interface GameNode {
  id: string
  type: GameNodeType
  name: string
  description: string
  level: number
  status: NodeStatus
  progress: number
  position: [number, number, number]
  lore: string
}

export interface ChainBlock {
  id: string
  index: number
  hash: string
  previousHash: string
  timestamp: string
  mintedBy: string
  consensus: ConsensusMode
  difficulty: number
  transactions: string[]
  insight: string
}

export interface ActivityLog {
  id: string
  timestamp: string
  category: 'tokens' | 'consensus' | 'contract' | 'education'
  message: string
}

export interface GameState {
  cycle: number
  tokens: number
  energy: number
  knowledge: number
  reputation: number
  studentsInspired: number
  consensusHealth: number
  nodes: GameNode[]
  chain: ChainBlock[]
  logs: ActivityLog[]
  consensusMode: ConsensusMode
  selectedNodeId: string | null
  smartContractLevel: number
  paused: boolean
}

export interface TutorialStep {
  id: string
  title: string
  description: string
  goal: string
  tip: string
  checkComplete: (state: GameState) => boolean
}

const NODE_POSITIONS: [number, number, number][] = [
  [-6, 0.5, -3],
  [-2, 0.5, -3],
  [2, 0.5, -3],
  [6, 0.5, -3],
  [-6, 0.5, 1],
  [-2, 0.5, 1],
  [2, 0.5, 1],
  [6, 0.5, 1],
]

const buildLore: Record<GameNodeType, string> = {
  miner:
    'Miners lossen cryptografische puzzels op en bewijzen dat ze energie hebben ingezet om blokken toe te voegen.',
  validator:
    'Validators checken transacties en stemmen over blokken. In proof-of-stake storten ze eigen tokens als borg.',
  dapp:
    'DApps (decentralized apps) gebruiken smart contracts om logica uit te voeren zonder centrale beheerder.',
  research:
    'Onderzoeks-labs doen experimenten met nieuwe protocollen en delen kennis met het netwerk.',
}

const NODE_LABELS: Record<GameNodeType, string> = {
  miner: 'Mining Rig',
  validator: 'Validator Node',
  dapp: 'Smart Contract Hub',
  research: 'Research Lab',
}

const BUILD_COST: Record<GameNodeType, { tokens: number; knowledge: number; energy: number }> = {
  miner: { tokens: 60, knowledge: 2, energy: 20 },
  validator: { tokens: 80, knowledge: 6, energy: 25 },
  dapp: { tokens: 90, knowledge: 10, energy: 15 },
  research: { tokens: 70, knowledge: 12, energy: 10 },
}

const UPGRADE_COST: Record<GameNodeType, { tokens: number; knowledge: number; energy: number }> = {
  miner: { tokens: 45, knowledge: 6, energy: 12 },
  validator: { tokens: 65, knowledge: 8, energy: 15 },
  dapp: { tokens: 70, knowledge: 12, energy: 10 },
  research: { tokens: 55, knowledge: 14, energy: 8 },
}

const NODE_PRODUCTION: Record<
  GameNodeType,
  { tokens: number; knowledge: number; reputation: number; energy: number; consensus: number; students: number }
> = {
  miner: { tokens: 14, knowledge: 1, reputation: 1, energy: -12, consensus: 4, students: 1 },
  validator: { tokens: 8, knowledge: 2, reputation: 4, energy: -6, consensus: 7, students: 1 },
  dapp: { tokens: 10, knowledge: 5, reputation: 3, energy: -4, consensus: 3, students: 4 },
  research: { tokens: 5, knowledge: 7, reputation: 2, energy: 6, consensus: 5, students: 3 },
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'intro',
    title: 'Welkom bij de Blockchain Tycoon',
    description:
      'Bekijk de 3D-campus en klik op een gebouw om te ontdekken welke rol het speelt in het netwerk.',
    goal: 'Selecteer een bestaande node om zijn uitleg te lezen.',
    tip: 'Gebruik je muis om rond te draaien en klik op een knipperend gebouw.',
    checkComplete: (state) => state.selectedNodeId !== null,
  },
  {
    id: 'build',
    title: 'Breid je netwerk uit',
    description:
      'Je hebt tokens ontvangen in de genesis-block. Investeer ze in een nieuwe infrastructuur.',
    goal: 'Bouw een extra node met een van de bouwacties.',
    tip: 'Kies een type dat past bij je leerdoel, bijvoorbeeld een validator voor consensuslessen.',
    checkComplete: (state) => state.nodes.length >= 3,
  },
  {
    id: 'consensus',
    title: 'Behaal netwerkconsensus',
    description:
      'Start een consensusronde om een nieuw blok toe te voegen en beloningen te claimen.',
    goal: 'Voer een consensusronde uit.',
    tip: 'Klik op "Start consensusronde" wanneer je genoeg energie hebt (>30).',
    checkComplete: (state) => state.chain.length > 1,
  },
  {
    id: 'contract',
    title: 'Activeer een smart contract',
    description:
      'Smart contracts voeren automatisch regels uit. Gebruik kennis om een contract te deployen.',
    goal: 'Deploy minimaal één smart contract-upgrade.',
    tip: 'De knop kost tokens en kennis maar vergroot je reputatie.',
    checkComplete: (state) => state.smartContractLevel > 0,
  },
  {
    id: 'governance',
    title: 'Experimenteer met consensusmodi',
    description:
      'Vergelijk proof-of-work, proof-of-stake en PBFT en zie wat er gebeurt met de netwerkgezondheid.',
    goal: 'Schakel naar een andere consensusmodus.',
    tip: 'Nieuwe modi ontgrendel je door kennis en reputatie op te bouwen.',
    checkComplete: (state) => state.consensusMode !== 'pow',
  },
]

const initialNodes: GameNode[] = [
  {
    id: nanoid(),
    type: 'miner',
    name: 'Genesis Mining Rig',
    description: 'Produceert de eerste blokken en leert je over proof-of-work.',
    level: 1,
    status: 'active',
    progress: 1,
    position: NODE_POSITIONS[1],
    lore: buildLore.miner,
  },
  {
    id: nanoid(),
    type: 'validator',
    name: 'Validator College',
    description: 'Studenten oefenen hier met stake-based consensus en stemrondes.',
    level: 1,
    status: 'active',
    progress: 1,
    position: NODE_POSITIONS[2],
    lore: buildLore.validator,
  },
]

const initialBlock: ChainBlock = {
  id: nanoid(),
  index: 0,
  hash: '0xGENESIS',
  previousHash: '0x0',
  timestamp: new Date().toISOString(),
  mintedBy: 'Web3 Impact Hub',
  consensus: 'pow',
  difficulty: 1,
  transactions: [
    'Genesis distributie: tokens naar opleidingen',
    'Educatief budget voor onderzoeks-lab',
  ],
  insight: 'Het genesisblok bevat de beginsituatie van je netwerk.',
}

const initialState: GameState = {
  cycle: 0,
  tokens: 160,
  energy: 110,
  knowledge: 18,
  reputation: 20,
  studentsInspired: 12,
  consensusHealth: 55,
  nodes: initialNodes,
  chain: [initialBlock],
  logs: [
    {
      id: nanoid(),
      timestamp: new Date().toISOString(),
      category: 'education',
      message:
        'Welkom! Deze campus toont hoe miners, validators en DApps samenwerken. Volg de tutorial om op te starten.',
    },
  ],
  consensusMode: 'pow',
  selectedNodeId: null,
  smartContractLevel: 0,
  paused: false,
}

type GameAction =
  | { type: 'tick' }
  | { type: 'build'; payload: GameNodeType }
  | { type: 'upgrade'; id: string }
  | { type: 'select'; id: string | null }
  | { type: 'switchConsensus'; payload: ConsensusMode }
  | { type: 'runConsensus' }
  | { type: 'deployContract' }
  | { type: 'launchWorkshop' }
  | { type: 'togglePause' }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const getNodeProduction = (node: GameNode) => {
  const output = NODE_PRODUCTION[node.type]
  const multiplier = 1 + (node.level - 1) * 0.35
  return {
    tokens: output.tokens * multiplier,
    knowledge: output.knowledge * multiplier,
    reputation: output.reputation * multiplier,
    energy: output.energy * multiplier,
    consensus: output.consensus * multiplier,
    students: output.students * multiplier,
  }
}

const describeConsensus = (mode: ConsensusMode) => {
  switch (mode) {
    case 'pow':
      return 'Proof-of-Work: miners leveren energie om blokken te maken en worden beloond met tokens.'
    case 'pos':
      return 'Proof-of-Stake: validators storten tokens als borg en stemmen over blokken.'
    case 'pbft':
      return 'PBFT: een stemronde met leiders en bevestigers voor snelle finaliteit in kleine netwerken.'
    default:
      return ''
  }
}

const createLog = (category: ActivityLog['category'], message: string): ActivityLog => ({
  id: nanoid(),
  timestamp: new Date().toISOString(),
  category,
  message,
})

const reducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'tick': {
      if (state.paused) {
        return state
      }
      const cycle = state.cycle + 1
      let tokens = state.tokens
      let knowledge = state.knowledge
      let reputation = state.reputation
      let energy = state.energy
      let consensusHealth = state.consensusHealth
      let studentsInspired = state.studentsInspired
      let logs: ActivityLog[] = [...state.logs]

      const nodes: GameNode[] = state.nodes.map((node) => {
        if (node.status !== 'building') return node
        const progress = Math.min(1, node.progress + 0.35)
        if (progress >= 1) {
          logs = [
            createLog('education', `${node.name} is nu operationeel. Bespreek met studenten welke rol dit gebouw vervult.`),
            ...logs,
          ]
          return { ...node, status: 'active' as const, progress: 1 }
        }
        return { ...node, progress }
      })

      for (const node of nodes) {
        if (node.status !== 'active') continue
        const production = getNodeProduction(node)
        tokens += production.tokens
        knowledge += production.knowledge
        reputation += production.reputation
        energy += production.energy
        consensusHealth += production.consensus
        studentsInspired += production.students
      }

      energy = clamp(energy, 0, 200)
      consensusHealth = clamp(consensusHealth, 0, 120)

      if (cycle % 3 === 0) {
        logs.unshift(
          createLog(
            'education',
            'Je netwerk produceerde resources. Bekijk de resourcebalk om te zien wat elk gebouw heeft opgeleverd.',
          ),
        )
      }

      return {
        ...state,
        cycle,
        tokens,
        knowledge,
        reputation,
        energy,
        consensusHealth,
        studentsInspired,
        logs: logs.slice(0, 40),
        nodes,
      }
    }
    case 'build': {
      const position = NODE_POSITIONS[state.nodes.length] ?? [0, 0.5, 4]
      const cost = BUILD_COST[action.payload]
      if (!cost) return state
      if (
        state.tokens < cost.tokens ||
        state.knowledge < cost.knowledge ||
        state.energy < cost.energy
      ) {
        return {
          ...state,
          logs: [
            createLog(
              'education',
              'Niet genoeg middelen om dit gebouw te plaatsen. Verzamel eerst meer tokens, kennis of energie.',
            ),
            ...state.logs,
          ].slice(0, 40),
        }
      }
      const node: GameNode = {
        id: nanoid(),
        type: action.payload,
        name: `${NODE_LABELS[action.payload]} ${state.nodes.length + 1}`,
        description: `Elke upgrade verhoogt productie exponentieel. ${buildLore[action.payload]}`,
        level: 1,
        status: 'building',
        progress: 0,
        position,
        lore: buildLore[action.payload],
      }
      return {
        ...state,
        tokens: state.tokens - cost.tokens,
        knowledge: state.knowledge - cost.knowledge,
        energy: clamp(state.energy - cost.energy, 0, 200),
        nodes: [...state.nodes, node],
        logs: [
          createLog(
            'tokens',
            `Nieuw gebouw gestart: ${node.name}. Binnen korte tijd wordt het actief en produceert het middelen.`,
          ),
          ...state.logs,
        ].slice(0, 40),
        selectedNodeId: node.id,
      }
    }
    case 'upgrade': {
      const nodeIndex = state.nodes.findIndex((item) => item.id === action.id)
      if (nodeIndex === -1) return state
      const node = state.nodes[nodeIndex]
      const cost = UPGRADE_COST[node.type]
      if (
        state.tokens < cost.tokens ||
        state.knowledge < cost.knowledge ||
        state.energy < cost.energy
      ) {
        return {
          ...state,
          logs: [
            createLog('education', 'Je mist middelen voor een upgrade. Overweeg een workshop om kennis te verhogen.'),
            ...state.logs,
          ].slice(0, 40),
        }
      }
      const updatedNode: GameNode = {
        ...node,
        level: node.level + 1,
        status: 'active',
        progress: 1,
      }
      const nodes = [...state.nodes]
      nodes[nodeIndex] = updatedNode
      return {
        ...state,
        tokens: state.tokens - cost.tokens,
        knowledge: state.knowledge - cost.knowledge,
        energy: clamp(state.energy - cost.energy, 0, 200),
        nodes,
        logs: [
          createLog(
            'education',
            `${updatedNode.name} niveau ${updatedNode.level} ontgrendelt nieuwe lessen over ${
              updatedNode.type === 'miner'
                ? 'hashing en moeilijkheid'
                : updatedNode.type === 'validator'
                  ? 'staking en slashing'
                  : updatedNode.type === 'dapp'
                    ? 'smart contracts'
                    : 'protocoldesign'
            }.`,
          ),
          ...state.logs,
        ].slice(0, 40),
      }
    }
    case 'select': {
      return { ...state, selectedNodeId: action.id }
    }
    case 'switchConsensus': {
      if (state.consensusMode === action.payload) return state
      return {
        ...state,
        consensusMode: action.payload,
        logs: [createLog('consensus', describeConsensus(action.payload)), ...state.logs].slice(0, 40),
      }
    }
    case 'runConsensus': {
      if (state.energy < 30) {
        return {
          ...state,
          logs: [
            createLog(
              'consensus',
              'Je hebt minimaal 30 energie nodig om de netwerkapparatuur te draaien voor een consensusronde.',
            ),
            ...state.logs,
          ].slice(0, 40),
        }
      }
      const bestNode = state.nodes.reduce((prev, current) => {
        if (!prev) return current
        return prev.level >= current.level ? prev : current
      }, state.nodes[0])
      const block: ChainBlock = {
        id: nanoid(),
        index: state.chain.length,
        hash: `0x${nanoid(12).toUpperCase()}`,
        previousHash: state.chain[state.chain.length - 1]?.hash ?? '0x0',
        timestamp: new Date().toISOString(),
        mintedBy: bestNode ? bestNode.name : 'Onbekende node',
        consensus: state.consensusMode,
        difficulty: state.consensusMode === 'pow' ? 5 : state.consensusMode === 'pos' ? 3 : 2,
        transactions: [
          'Educatieve tokenreward voor studenten',
          'Smart contract logging: digitale certificaten uitgegeven',
        ],
        insight:
          state.consensusMode === 'pow'
            ? 'Proof-of-Work benadrukt energiegebruik en moeilijkheidsaanpassingen.'
            : state.consensusMode === 'pos'
              ? 'Proof-of-Stake verhoogt finaliteit door economische prikkels.'
              : 'PBFT gebruikt rondes van stemmen: ideaal voor kleine, vertrouwde netwerken.',
      }
      return {
        ...state,
        chain: [...state.chain, block],
        tokens: state.tokens + 45,
        reputation: state.reputation + 8,
        energy: clamp(state.energy - 35, 0, 200),
        consensusHealth: clamp(state.consensusHealth + 12, 0, 120),
        logs: [
          createLog('consensus', `Nieuw blok ${block.index} gecreëerd door ${block.mintedBy}. ${block.insight}`),
          ...state.logs,
        ].slice(0, 40),
      }
    }
    case 'deployContract': {
      const costTokens = 70 + state.smartContractLevel * 20
      const costKnowledge = 14 + state.smartContractLevel * 6
      if (state.tokens < costTokens || state.knowledge < costKnowledge) {
        return {
          ...state,
          logs: [
            createLog(
              'contract',
              'Niet genoeg tokens of kennis om dit smart contract te deployen. Volg een workshop of laat miners werken.',
            ),
            ...state.logs,
          ].slice(0, 40),
        }
      }
      const nextLevel = state.smartContractLevel + 1
      return {
        ...state,
        smartContractLevel: nextLevel,
        tokens: state.tokens - costTokens + 40,
        knowledge: state.knowledge - costKnowledge + 12,
        reputation: state.reputation + 10,
        studentsInspired: state.studentsInspired + 6,
        logs: [
          createLog(
            'contract',
            `Smart contract niveau ${nextLevel} geactiveerd: studenten claimen nu automatisch certificaten via de blockchain!`,
          ),
          ...state.logs,
        ].slice(0, 40),
      }
    }
    case 'launchWorkshop': {
      const costTokens = 40
      if (state.tokens < costTokens) {
        return {
          ...state,
          logs: [
            createLog(
              'education',
              'Workshops kosten minimaal 40 tokens voor materiaal. Verdien meer tokens of verlaag je uitgaven.',
            ),
            ...state.logs,
          ].slice(0, 40),
        }
      }
      return {
        ...state,
        tokens: state.tokens - costTokens,
        knowledge: state.knowledge + 18,
        reputation: state.reputation + 4,
        studentsInspired: state.studentsInspired + 10,
        logs: [
          createLog('education', 'Workshop gehouden! Studenten leren nu over smart contracts en governance.'),
          ...state.logs,
        ].slice(0, 40),
      }
    }
    case 'togglePause': {
      return { ...state, paused: !state.paused }
    }
    default:
      return state
  }
}

export const useTycoonGame = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: 'tick' }), 4000)
    return () => clearInterval(interval)
  }, [])

  const buildNode = useCallback((type: GameNodeType) => dispatch({ type: 'build', payload: type }), [])
  const upgradeNode = useCallback((id: string) => dispatch({ type: 'upgrade', id }), [])
  const selectNode = useCallback((id: string | null) => dispatch({ type: 'select', id }), [])
  const runConsensus = useCallback(() => dispatch({ type: 'runConsensus' }), [])
  const deployContract = useCallback(() => dispatch({ type: 'deployContract' }), [])
  const launchWorkshop = useCallback(() => dispatch({ type: 'launchWorkshop' }), [])
  const togglePause = useCallback(() => dispatch({ type: 'togglePause' }), [])
  const switchConsensus = useCallback(
    (mode: ConsensusMode) => dispatch({ type: 'switchConsensus', payload: mode }),
    [],
  )

  const unlockedConsensus = useMemo(() => {
    const modes: ConsensusMode[] = ['pow']
    if (state.knowledge >= 40 || state.smartContractLevel > 0) modes.push('pos')
    if (state.reputation >= 60 && state.consensusHealth >= 70) modes.push('pbft')
    return modes
  }, [state.knowledge, state.reputation, state.smartContractLevel, state.consensusHealth])

  const tutorialStatus = useMemo(
    () =>
      TUTORIAL_STEPS.map((step) => ({
        ...step,
        completed: step.checkComplete(state),
      })),
    [state],
  )

  const currentTutorial = useMemo(
    () => tutorialStatus.find((step) => !step.completed) ?? tutorialStatus[tutorialStatus.length - 1],
    [tutorialStatus],
  )

  return {
    state,
    buildNode,
    upgradeNode,
    selectNode,
    runConsensus,
    deployContract,
    launchWorkshop,
    togglePause,
    switchConsensus,
    unlockedConsensus,
    tutorialStatus,
    currentTutorial,
  }
}

export type TycoonController = ReturnType<typeof useTycoonGame>
