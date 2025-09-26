import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { nanoid } from 'nanoid'

export type ConsensusMode = 'pow' | 'pos' | 'pbft'

export type GameNodeType = 'miner' | 'validator' | 'dapp' | 'research'

type NodeStatus = 'active' | 'building'

export type CampusDistrict = 'mining' | 'governance' | 'innovation' | 'knowledge'

export interface NodeLocation {
  plotId: string
  row: number
  col: number
  label: string
  district: CampusDistrict
}

export interface GameNode {
  id: string
  type: GameNodeType
  name: string
  description: string
  level: number
  status: NodeStatus
  progress: number
  location: NodeLocation
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

type CampusPlotDefinition = NodeLocation & {
  unlockDescription: string
  unlock: (state: GameState) => boolean
}

export interface CampusPlotState extends NodeLocation {
  unlockDescription: string
  locked: boolean
  occupiedBy?: GameNode
}

const buildLore: Record<GameNodeType, string> = {
  miner:
    'Miners lossen cryptografische puzzels op. Gebruik dit gebouw om hashing, moeilijkheid en energieverbruik te bespreken.',
  validator:
    'Validators stemmen over blokken en storten tokens als borg. Perfect om staking en slashing te verkennen.',
  dapp:
    'DApps voeren logica uit via smart contracts. Gebruik dit gebouw voor NFT-, DeFi- of certificaat-scenario’s.',
  research:
    'Onderzoekslabs analyseren nieuwe protocollen en governance. Ideaal voor ethiek, compliance en innovatie.',
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

const CAMPUS_PLOTS: CampusPlotDefinition[] = [
  {
    plotId: 'A1',
    row: 2,
    col: 2,
    label: 'Mining Hangar West',
    district: 'mining',
    unlockDescription: 'Starterplot voor de eerste proof-of-work demonstratie.',
    unlock: () => true,
  },
  {
    plotId: 'A2',
    row: 2,
    col: 3,
    label: 'Token Mint Plaza',
    district: 'mining',
    unlockDescription: 'Verzamel 15 kennis om het tokenlaboratorium te openen.',
    unlock: (state) => state.knowledge >= 15,
  },
  {
    plotId: 'B1',
    row: 2,
    col: 5,
    label: 'Validator Hall',
    district: 'governance',
    unlockDescription: 'Beschikbaar vanaf de start voor consensuslessen.',
    unlock: () => true,
  },
  {
    plotId: 'B2',
    row: 2,
    col: 6,
    label: 'Community Exchange',
    district: 'governance',
    unlockDescription: 'Inspireer 18 studenten om een beursvloer te openen.',
    unlock: (state) => state.studentsInspired >= 18,
  },
  {
    plotId: 'C1',
    row: 3,
    col: 2,
    label: 'Innovation Garage',
    district: 'innovation',
    unlockDescription: 'Bereik reputatie 28 voor een innovatielab.',
    unlock: (state) => state.reputation >= 28,
  },
  {
    plotId: 'C2',
    row: 3,
    col: 6,
    label: 'Governance Dome',
    district: 'governance',
    unlockDescription: 'Haal consensusgezondheid 70% om deze gouvernancehal te activeren.',
    unlock: (state) => state.consensusHealth >= 70 || state.chain.length >= 3,
  },
  {
    plotId: 'D1',
    row: 4,
    col: 2,
    label: 'Research Conservatory',
    district: 'knowledge',
    unlockDescription: 'Leg minstens drie blokken vast om onderzoeksdata te verzamelen.',
    unlock: (state) => state.chain.length >= 3,
  },
  {
    plotId: 'D2',
    row: 4,
    col: 6,
    label: 'Metaverse Studio',
    district: 'innovation',
    unlockDescription: 'Bereik smart contract niveau 1 om deze studio te openen.',
    unlock: (state) => state.smartContractLevel >= 1,
  },
]

const plotById = (plotId: string): CampusPlotDefinition => {
  const plot = CAMPUS_PLOTS.find((item) => item.plotId === plotId)
  if (!plot) {
    throw new Error(`Plot ${plotId} bestaat niet in het campusontwerp`)
  }
  return plot
}

const toLocation = (plot: CampusPlotDefinition): NodeLocation => ({
  plotId: plot.plotId,
  row: plot.row,
  col: plot.col,
  label: plot.label,
  district: plot.district,
})

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'intro',
    title: 'Welkom op de Blockchain Campus',
    description:
      'Bekijk de plattegrond vanuit vogelperspectief en klik op een gebouw om te ontdekken welke rol het speelt.',
    goal: 'Selecteer een bestaand gebouw op de campuskaart.',
    tip: 'De knipperende tegels geven aan waar je infrastructuur staat. Klik om details te openen.',
    checkComplete: (state) => state.selectedNodeId !== null,
  },
  {
    id: 'build',
    title: 'Breid je terrein uit',
    description:
      'Investeer tokens in een nieuw gebouw. Vrijgekomen plots lichten op zodra je de voorwaarden haalt.',
    goal: 'Plaats een extra node via het actiepanel.',
    tip: 'Let op de vereiste kennis, reputatie of studentenimpact om nieuwe zones te ontgrendelen.',
    checkComplete: (state) => state.nodes.length >= 3,
  },
  {
    id: 'consensus',
    title: 'Behaal netwerkconsensus',
    description: 'Start een consensusronde om een nieuw blok toe te voegen aan de blockchain.',
    goal: 'Voer een consensusronde uit.',
    tip: 'Zorg dat je minstens 30 energie hebt voordat je de ronde start.',
    checkComplete: (state) => state.chain.length > 1,
  },
  {
    id: 'contract',
    title: 'Activeer een smart contract',
    description: 'Gebruik kennis en tokens om een smart contract te deployen dat lessen automatiseert.',
    goal: 'Bereik minimaal smart contract niveau 1.',
    tip: 'De actie in het HUD geeft je reputatie en geautomatiseerde certificaten.',
    checkComplete: (state) => state.smartContractLevel > 0,
  },
  {
    id: 'governance',
    title: 'Vergelijk consensusmechanismen',
    description: 'Schakel tussen PoW, PoS en PBFT en bespreek met studenten de voor- en nadelen.',
    goal: 'Activeer een andere consensusmodus.',
    tip: 'Meer reputatie en kennis ontgrendelt extra consensusopties.',
    checkComplete: (state) => state.consensusMode !== 'pow',
  },
]

const initialNodes: GameNode[] = [
  {
    id: nanoid(),
    type: 'miner',
    name: 'Genesis Mining Hangar',
    description: 'Produceert de eerste blokken en toont hoe proof-of-work werkt.',
    level: 1,
    status: 'active',
    progress: 1,
    location: toLocation(plotById('A1')),
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
    location: toLocation(plotById('B1')),
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
        'Welkom! Gebruik de campuskaart om te laten zien hoe miners, validators en dApps samenwerken. Volg de tutorial om te starten.',
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
            createLog(
              'education',
              `${node.name} op ${node.location.label} is nu operationeel. Bespreek met studenten welke lessen bij dit district horen.`,
            ),
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
            'Je campus heeft resources geproduceerd. Gebruik de HUD om de impact op tokens, kennis en reputatie te bespreken.',
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
      const cost = BUILD_COST[action.payload]
      if (!cost) return state
      const availablePlot = CAMPUS_PLOTS.find(
        (plot) =>
          plot.unlock(state) &&
          !state.nodes.some((node) => node.location.plotId === plot.plotId),
      )

      if (!availablePlot) {
        return {
          ...state,
          logs: [
            createLog(
              'education',
              'Alle bouwplaatsen zijn nog vergrendeld. Voldoe aan de vereisten op de kaart om nieuwe zones vrij te spelen.',
            ),
            ...state.logs,
          ].slice(0, 40),
        }
      }

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

      const location = toLocation(availablePlot)
      const node: GameNode = {
        id: nanoid(),
        type: action.payload,
        name: `${NODE_LABELS[action.payload]} ${state.nodes.length + 1}`,
        description: `Elke upgrade verhoogt productie exponentieel. ${buildLore[action.payload]}`,
        level: 1,
        status: 'building',
        progress: 0,
        location,
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
            `Campusuitbreiding gestart: ${node.name} verrijst op ${location.label} in de ${location.district}-zone.`,
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
            `${updatedNode.name} niveau ${updatedNode.level} in de ${updatedNode.location.district}-zone ontgrendelt nieuwe lessen over ${
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
              'Je hebt minimaal 30 energie nodig om de apparatuur voor een consensusronde aan te sturen.',
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

  const campusPlots = useMemo<CampusPlotState[]>(
    () =>
      CAMPUS_PLOTS.map((plot) => {
        const occupiedBy = state.nodes.find((node) => node.location.plotId === plot.plotId)
        const locked = !occupiedBy && !plot.unlock(state)
        return {
          plotId: plot.plotId,
          row: plot.row,
          col: plot.col,
          label: plot.label,
          district: plot.district,
          unlockDescription: plot.unlockDescription,
          locked,
          occupiedBy,
        }
      }),
    [state],
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
    campusPlots,
  }
}

export type TycoonController = ReturnType<typeof useTycoonGame>
