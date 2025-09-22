import { Badge, Card, Col, ListGroup, OverlayTrigger, ProgressBar, Row, Stack, Tooltip } from 'react-bootstrap'
import type {
  ActivityLog,
  ConsensusMode,
  GameNode,
  GameNodeType,
  GameState,
  TutorialStep,
} from '../hooks/useTycoonGame'

const consensusLabels: Record<ConsensusMode, string> = {
  pow: 'Proof-of-Work',
  pos: 'Proof-of-Stake',
  pbft: 'Practical Byzantine Fault Tolerance',
}

const consensusDescriptions: Record<ConsensusMode, string> = {
  pow: 'Miner knooppunten lossen een puzzel op. Energieverbruik is hoog maar het netwerk blijft open en permissionless.',
  pos: 'Validators storten tokens als zekerheid en stemmen. Energieverbruik daalt en finaliteit stijgt.',
  pbft: 'Een leider stelt een blok voor, andere nodes bevestigen. Perfect om PBFT te tonen in consortia en onderwijsnetwerken.',
}

const buildOptions: Array<{
  type: GameNodeType
  label: string
  description: string
}> = [
  {
    type: 'miner',
    label: 'Bouw Mining Rig',
    description: 'Laat studenten ervaren hoe proof-of-work hashing en moeilijkheid werken.',
  },
  {
    type: 'validator',
    label: 'Start Validator',
    description: 'Leer over staking, bonds en wat er gebeurt bij slashing.',
  },
  {
    type: 'dapp',
    label: 'Open Smart Contract Hub',
    description: 'Simuleer NFT-marktplaatsen of DeFi-logica met veilige smart contracts.',
  },
  {
    type: 'research',
    label: 'Start Research Lab',
    description: 'Onderzoek nieuwe consensusprotocollen en governance scenario’s.',
  },
]

interface TutorialProgress extends TutorialStep {
  completed: boolean
}

interface GameHUDProps {
  state: GameState
  unlockedConsensus: ConsensusMode[]
  currentTutorial: TutorialProgress
  tutorialStatus: TutorialProgress[]
  onBuild: (type: GameNodeType) => void
  onUpgrade: (id: string) => void
  onSelectNode: (id: string | null) => void
  onRunConsensus: () => void
  onDeployContract: () => void
  onWorkshop: () => void
  onSwitchConsensus: (mode: ConsensusMode) => void
}

const ResourceBar = ({ state }: { state: GameState }) => (
  <Card className="resource-card">
    <Card.Body>
      <Row className="gy-3">
        <Col md={3} xs={6}>
          <h6 className="text-uppercase text-muted">Tokens</h6>
          <Stack direction="horizontal" gap={3} className="align-items-end">
            <div className="resource-value">{Math.round(state.tokens)}</div>
            <ProgressBar now={Math.min(100, (state.tokens / 250) * 100)} variant="warning" className="flex-fill" />
          </Stack>
        </Col>
        <Col md={3} xs={6}>
          <h6 className="text-uppercase text-muted">Kennis</h6>
          <Stack direction="horizontal" gap={3} className="align-items-end">
            <div className="resource-value">{Math.round(state.knowledge)}</div>
            <ProgressBar now={Math.min(100, (state.knowledge / 160) * 100)} variant="info" className="flex-fill" />
          </Stack>
        </Col>
        <Col md={3} xs={6}>
          <h6 className="text-uppercase text-muted">Reputatie</h6>
          <Stack direction="horizontal" gap={3} className="align-items-end">
            <div className="resource-value">{Math.round(state.reputation)}</div>
            <ProgressBar now={Math.min(100, (state.reputation / 140) * 100)} variant="success" className="flex-fill" />
          </Stack>
        </Col>
        <Col md={3} xs={6}>
          <h6 className="text-uppercase text-muted">Energie</h6>
          <Stack direction="horizontal" gap={3} className="align-items-end">
            <div className="resource-value">{Math.round(state.energy)}</div>
            <ProgressBar now={Math.min(100, (state.energy / 200) * 100)} variant="danger" className="flex-fill" />
          </Stack>
        </Col>
      </Row>
      <Row className="mt-3 gy-3">
        <Col md={4} xs={6}>
          <div className="metric-card">
            <span className="metric-label">Studenten geïnspireerd</span>
            <span className="metric-value">{Math.round(state.studentsInspired)}</span>
          </div>
        </Col>
        <Col md={4} xs={6}>
          <div className="metric-card">
            <span className="metric-label">Consensus gezondheid</span>
            <span className="metric-value">{Math.round(state.consensusHealth)}%</span>
          </div>
        </Col>
        <Col md={4} xs={12}>
          <div className="metric-card">
            <span className="metric-label">Smart contract niveau</span>
            <span className="metric-value">{state.smartContractLevel}</span>
          </div>
        </Col>
      </Row>
    </Card.Body>
  </Card>
)

const NodeDetails = ({ node, onUpgrade }: { node: GameNode; onUpgrade: (id: string) => void }) => {
  const handleUpgrade = () => onUpgrade(node.id)
  return (
    <Card className="node-detail">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-bold">{node.name}</div>
            <div className="small text-muted">Level {node.level}</div>
          </div>
          <Badge bg="dark">{node.type}</Badge>
        </div>
      </Card.Header>
      <Card.Body>
        <p className="mb-2">{node.description}</p>
        <p className="text-muted small">{node.lore}</p>
        <button type="button" className="btn btn-outline-light w-100" onClick={handleUpgrade}>
          Upgrade voor meer productie
        </button>
      </Card.Body>
    </Card>
  )
}

const TutorialCard = ({ tutorial, status }: { tutorial: TutorialProgress; status: TutorialProgress[] }) => (
  <Card className="tutorial-card">
    <Card.Body>
      <h5 className="mb-1">{tutorial.title}</h5>
      <p className="text-muted small">{tutorial.description}</p>
      <div className="tutorial-goal">
        <strong>Doel:</strong> {tutorial.goal}
      </div>
      <div className="tutorial-tip">💡 {tutorial.tip}</div>
      <hr />
      <h6 className="text-uppercase small text-muted">Leerpad</h6>
      <ListGroup variant="flush" className="tutorial-progress">
        {status.map((step) => (
          <ListGroup.Item key={step.id} className={step.completed ? 'completed' : ''}>
            {step.completed ? '✅' : '⏳'} {step.title}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card.Body>
  </Card>
)

const ActionPanel = ({
  onBuild,
  unlockedConsensus,
  onSwitchConsensus,
  currentMode,
  onRunConsensus,
  onDeployContract,
  onWorkshop,
}: {
  onBuild: (type: GameNodeType) => void
  unlockedConsensus: ConsensusMode[]
  onSwitchConsensus: (mode: ConsensusMode) => void
  currentMode: ConsensusMode
  onRunConsensus: () => void
  onDeployContract: () => void
  onWorkshop: () => void
}) => (
  <Card className="action-panel">
    <Card.Body>
      <h5 className="mb-3">Acties</h5>
      <div className="d-grid gap-2 mb-4">
        {buildOptions.map((option) => (
          <OverlayTrigger
            key={option.type}
            placement="left"
            overlay={<Tooltip id={`tip-${option.type}`}>{option.description}</Tooltip>}
          >
            <button
              type="button"
              className="btn btn-outline-info text-start"
              onClick={() => onBuild(option.type)}
            >
              {option.label}
            </button>
          </OverlayTrigger>
        ))}
      </div>
      <h6 className="text-uppercase text-muted small">Consensus</h6>
      <Stack direction="horizontal" gap={2} className="flex-wrap mb-3">
        {(['pow', 'pos', 'pbft'] as ConsensusMode[]).map((mode) => {
          const unlocked = unlockedConsensus.includes(mode)
          const styleClass =
            currentMode === mode
              ? 'btn-warning'
              : unlocked
                ? 'btn-outline-warning'
                : 'btn-outline-secondary'
          return (
            <button
              key={mode}
              type="button"
              className={`btn btn-sm ${styleClass}`}
              disabled={!unlocked}
              onClick={() => onSwitchConsensus(mode)}
            >
              {consensusLabels[mode]}
            </button>
          )
        })}
      </Stack>
      <button type="button" className="btn btn-warning w-100 mb-2" onClick={onRunConsensus}>
        Start consensusronde
      </button>
      <button type="button" className="btn btn-success w-100 mb-2" onClick={onDeployContract}>
        Deploy smart contract
      </button>
      <button type="button" className="btn btn-primary w-100" onClick={onWorkshop}>
        Organiseer workshop
      </button>
    </Card.Body>
  </Card>
)

const LogFeed = ({ logs }: { logs: ActivityLog[] }) => (
  <Card className="log-feed">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Activiteiten</h5>
        <Badge bg="secondary">Laatste {Math.min(10, logs.length)}</Badge>
      </div>
      <ListGroup variant="flush">
        {logs.slice(0, 10).map((log) => (
          <ListGroup.Item key={log.id}>
            <div className="d-flex justify-content-between">
              <span>{log.message}</span>
              <span className="small text-muted">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card.Body>
  </Card>
)

const ConsensusInfo = ({
  currentMode,
  unlockedConsensus,
}: {
  currentMode: ConsensusMode
  unlockedConsensus: ConsensusMode[]
}) => (
  <Card className="consensus-info">
    <Card.Body>
      <h6 className="text-uppercase text-muted small">Huidige consensus</h6>
      <h4>{consensusLabels[currentMode]}</h4>
      <p className="small text-light">{consensusDescriptions[currentMode]}</p>
      {unlockedConsensus.length < 3 && (
        <div className="unlock-hint">
          🔓 Bouw reputatie en kennis om meer consensusmechanismen te ontgrendelen.
        </div>
      )}
    </Card.Body>
  </Card>
)

const GameHUD = ({
  state,
  unlockedConsensus,
  currentTutorial,
  tutorialStatus,
  onBuild,
  onUpgrade,
  onSelectNode,
  onRunConsensus,
  onDeployContract,
  onWorkshop,
  onSwitchConsensus,
}: GameHUDProps) => {
  const selectedNode = state.nodes.find((node) => node.id === state.selectedNodeId)

  return (
    <div className="hud">
      <ResourceBar state={state} />
      <Row className="gy-4 mt-1">
        <Col lg={3} md={6}>
          <ActionPanel
            onBuild={onBuild}
            unlockedConsensus={unlockedConsensus}
            onSwitchConsensus={onSwitchConsensus}
            currentMode={state.consensusMode}
            onRunConsensus={onRunConsensus}
            onDeployContract={onDeployContract}
            onWorkshop={onWorkshop}
          />
        </Col>
        <Col lg={3} md={6}>
          {selectedNode ? (
            <NodeDetails node={selectedNode} onUpgrade={onUpgrade} />
          ) : (
            <Card className="node-placeholder">
              <Card.Body>
                <h5 className="mb-2">Selecteer een gebouw</h5>
                <p className="text-muted small">
                  Klik in de 3D-wereld op een gebouw om de rol binnen de blockchain te ontdekken.
                </p>
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={() => onSelectNode(state.nodes[0]?.id ?? null)}
                >
                  Focus op genesis-node
                </button>
              </Card.Body>
            </Card>
          )}
          <ConsensusInfo currentMode={state.consensusMode} unlockedConsensus={unlockedConsensus} />
        </Col>
        <Col lg={3} md={6}>
          <TutorialCard tutorial={currentTutorial} status={tutorialStatus} />
        </Col>
        <Col lg={3} md={6}>
          <LogFeed logs={state.logs} />
        </Col>
      </Row>
    </div>
  )
}

export default GameHUD
