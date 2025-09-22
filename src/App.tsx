import { Badge, Card, Col, Container, ListGroup, Row } from 'react-bootstrap'
import BlockchainWorld from './game/BlockchainWorld'
import GameHUD from './components/GameHUD'
import EducationalInsights from './components/EducationalInsights'
import { useTycoonGame } from './hooks/useTycoonGame'
import './App.css'

function App() {
  const {
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
  } = useTycoonGame()

  return (
    <div className="app-shell">
      <header className="app-header">
        <Container>
          <div className="header-content">
            <div>
              <h1>Web3 Impact Tycoon</h1>
              <p>
                Bouw een blockchain-campus in 3D, beheer middelen als een tycoon en ontdek stap voor stap hoe mining,
                consensus en smart contracts samenwerken.
              </p>
            </div>
            <div className="header-badges">
              <Badge bg="warning" text="dark">
                Blokken: {state.chain.length}
              </Badge>
              <Badge bg="info" text="dark">
                Nodes: {state.nodes.length}
              </Badge>
              <Badge bg="success">Studenten: {Math.round(state.studentsInspired)}</Badge>
              <button type="button" className="btn btn-outline-light btn-sm" onClick={togglePause}>
                {state.paused ? 'Ga verder' : 'Pauzeer simulatie'}
              </button>
            </div>
          </div>
        </Container>
      </header>
      <main className="app-main">
        <Container fluid>
          <Row className="gy-4">
            <Col xl={6} lg={7}>
              <section className="world-section">
                <div className="section-heading">
                  <div>
                    <h2>3D Blockchain-campus</h2>
                    <p className="text-muted mb-0">
                      Gebruik je muis om te draaien en klik op gebouwen om lessen over hun blockchainrol te ontgrendelen.
                    </p>
                  </div>
                  <Badge bg="secondary">Cycle {state.cycle}</Badge>
                </div>
                <BlockchainWorld
                  nodes={state.nodes}
                  chain={state.chain}
                  selectedNodeId={state.selectedNodeId}
                  onSelectNode={selectNode}
                />
              </section>
            </Col>
            <Col xl={6} lg={5}>
              <section className="hud-section">
                <GameHUD
                  state={state}
                  unlockedConsensus={unlockedConsensus}
                  currentTutorial={currentTutorial}
                  tutorialStatus={tutorialStatus}
                  onBuild={buildNode}
                  onUpgrade={upgradeNode}
                  onSelectNode={selectNode}
                  onRunConsensus={runConsensus}
                  onDeployContract={deployContract}
                  onWorkshop={launchWorkshop}
                  onSwitchConsensus={switchConsensus}
                />
              </section>
            </Col>
          </Row>
          <Row className="gy-4 mt-1">
            <Col xl={8}>
              <EducationalInsights chain={state.chain} state={state} />
            </Col>
            <Col xl={4}>
              <Card className="scenario-card">
                <Card.Body>
                  <h4 className="mb-3">Tycoon-mijlpalen</h4>
                  <ListGroup variant="flush" className="scenario-list">
                    <ListGroup.Item>
                      🛠️ Bouw {Math.max(0, 4 - state.nodes.length)} extra infrastructuren om alle rollen te tonen.
                    </ListGroup.Item>
                    <ListGroup.Item>
                      🔄 Start {Math.max(0, 3 - (state.chain.length - 1))} consensusrondes om het ketenarchief te vullen.
                    </ListGroup.Item>
                    <ListGroup.Item>
                      📜 Bereik smart contract niveau {state.smartContractLevel + 1} om automatische certificaten te demonstreren.
                    </ListGroup.Item>
                    <ListGroup.Item>
                      🎓 Inspireer {Math.max(0, 50 - Math.round(state.studentsInspired))} extra studenten voor SDG-4 impact.
                    </ListGroup.Item>
                  </ListGroup>
                  <div className="mt-3 small text-muted">
                    Tip: Combineer workshops en consensusrondes om tokens in kennis en reputatie om te zetten.
                  </div>
                </Card.Body>
              </Card>
              <Card className="glossary-card mt-3">
                <Card.Body>
                  <h5>Mini-glossarium</h5>
                  <ListGroup variant="flush" className="glossary-list">
                    <ListGroup.Item>
                      <strong>Tokenisatie:</strong> Maak tastbare en niet-tastbare assets digitaal verhandelbaar binnen je campus.
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Wallet-simulatie:</strong> Elke node representeert een wallet met rollen en verantwoordelijkheden.
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Governance:</strong> Gebruik reputatie om stemgewicht en PBFT-besluiten te modelleren.
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Finaliteit:</strong> Leg uit dat PBFT sneller finaliteit bereikt maar minder deelnemers schaalbaar maakt.
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
      <footer className="app-footer">
        <Container>
          <div className="d-flex flex-wrap justify-content-between gap-2">
            <span>
              Web3 Impact Hub · SDG-4 Kwaliteitsonderwijs · Leer door te bouwen, experimenteren en reflecteren.
            </span>
            <span>© {new Date().getFullYear()} Blockchain Education Lab</span>
          </div>
        </Container>
      </footer>
    </div>
  )
}

export default App
