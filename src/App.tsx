import { Badge, Col, Container, Row } from 'react-bootstrap'
import CampusMap from './components/CampusMap'
import GameHUD from './components/GameHUD'
import EducationalInsights from './components/EducationalInsights'
import BlockchainTimeline from './components/BlockchainTimeline'
import { useTycoonGame } from './hooks/useTycoonGame'
import './App.css'

function App() {
  const {
    state,
    campusPlots,
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
      <header className="top-bar">
        <Container fluid>
          <div className="top-bar__inner">
            <div>
              <h1>Blockchain Campus Tycoon</h1>
              <p>
                Bouw en beheer een bovenaanzicht van een blockchain-campus. Plaats miners, validators en smart contract hubs en
                leg stap voor stap uit hoe web3 werkt.
              </p>
            </div>
            <div className="stat-chips">
              <div className="stat-chip">
                <span>Tokens</span>
                <strong>{Math.round(state.tokens)}</strong>
              </div>
              <div className="stat-chip">
                <span>Kennis</span>
                <strong>{Math.round(state.knowledge)}</strong>
              </div>
              <div className="stat-chip">
                <span>Reputatie</span>
                <strong>{Math.round(state.reputation)}</strong>
              </div>
              <div className="stat-chip">
                <span>Energie</span>
                <strong>{Math.round(state.energy)}</strong>
              </div>
              <button type="button" className="btn btn-outline-light btn-sm" onClick={togglePause}>
                {state.paused ? 'Ga verder' : 'Pauzeer simulatie'}
              </button>
            </div>
          </div>
        </Container>
      </header>
      <main className="main-layout">
        <Container fluid>
          <Row className="g-4 align-items-start">
            <Col xl={7} lg={8} className="d-flex flex-column gap-4">
              <section className="panel campus-panel">
                <div className="panel-header">
                  <div>
                    <h2 className="mb-1">Campusoverzicht</h2>
                    <p className="text-muted mb-0">
                      Klik op gebouwen om details te lezen en gebruik het HUD om nieuwe infrastructuur op vrije kavels te
                      plaatsen.
                    </p>
                  </div>
                  <Badge bg="dark">Cycle {state.cycle}</Badge>
                </div>
                <CampusMap plots={campusPlots} selectedNodeId={state.selectedNodeId} onSelectNode={selectNode} />
              </section>
              <BlockchainTimeline chain={state.chain} />
            </Col>
            <Col xl={5} lg={4} className="d-flex flex-column gap-4">
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
              <EducationalInsights chain={state.chain} state={state} />
            </Col>
          </Row>
        </Container>
      </main>
      <footer className="app-footer">
        <Container fluid>
          <div className="footer-inner">
            <span>
              Web3 Impact Hub · SDG-4 Kwaliteitsonderwijs · Leer blockchainprincipes door simulatie, reflectie en beheer.
            </span>
            <span>© {new Date().getFullYear()} Blockchain Education Lab</span>
          </div>
        </Container>
      </footer>
    </div>
  )
}

export default App
