import { Badge, Button, Card, Col, Form, ListGroup, Row } from 'react-bootstrap'
import type { ConsensusHistoryEntry, ConsensusMode, ConsensusNode } from '../types'

interface ConsensusPlaygroundProps {
  mode: ConsensusMode
  nodes: ConsensusNode[]
  history: ConsensusHistoryEntry[]
  lastMessage: string | null
  onModeChange: (mode: ConsensusMode) => void
  onRunRound: () => void
}

const modeLabels: Record<ConsensusMode, string> = {
  pow: 'Proof-of-Work',
  pos: 'Proof-of-Stake',
  pbft: 'PBFT (stemmen)',
}

const ConsensusPlayground = ({
  mode,
  nodes,
  history,
  lastMessage,
  onModeChange,
  onRunRound,
}: ConsensusPlaygroundProps) => {
  return (
    <section className="section" id="consensus">
      <div className="section-header">
        <div>
          <h2 className="section-title">Consensus speelplaats</h2>
          <p className="section-subtitle">
            Zie hoe verschillende consensusmechanismen bepalen wie een blok mag toevoegen. Elk knooppunt
            heeft eigen kenmerken zoals rekenkracht, stake en betrouwbaarheid.
          </p>
        </div>
      </div>
      <Row className="g-4 align-items-center mb-3">
        <Col md={4}>
          <Form.Label className="fw-semibold">Kies een consensusmechanisme</Form.Label>
          <Form.Select value={mode} onChange={(event) => onModeChange(event.target.value as ConsensusMode)}>
            <option value="pow">Proof-of-Work</option>
            <option value="pos">Proof-of-Stake</option>
            <option value="pbft">PBFT</option>
          </Form.Select>
        </Col>
        <Col md={5}>
          <p className="text-muted small mb-0">
            {mode === 'pow'
              ? 'Miner met de meeste rekenkracht heeft voordeel, maar geluk speelt mee.'
              : mode === 'pos'
                ? 'Validator met de meeste inzet heeft de grootste kans om gekozen te worden.'
                : 'Validatoren stemmen en hebben minimaal ⅔ overeenstemming nodig.'}
          </p>
        </Col>
        <Col md={3} className="text-md-end">
          <Button variant="primary" size="lg" className="fw-semibold w-100" onClick={onRunRound}>
            Start consensusronde
          </Button>
        </Col>
      </Row>
      <Row className="g-4">
        {nodes.map((node) => (
          <Col md={4} key={node.id}>
            <Card className="node-card h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <Card.Title className="mb-0">{node.name}</Card.Title>
                    <Card.Subtitle className="text-muted small">{node.role}</Card.Subtitle>
                  </div>
                  <Badge bg={node.color} className="px-3 py-2">
                    {node.wins} win(s)
                  </Badge>
                </div>
                <ListGroup variant="flush" className="node-stats">
                  <ListGroup.Item>
                    <span>⚡ Rekenpower</span>
                    <strong>{node.power}</strong>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <span>🪙 Stake</span>
                    <strong>{node.stake}</strong>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <span>✅ Betrouwbaarheid</span>
                    <strong>{Math.round(node.reliability * 100)}%</strong>
                  </ListGroup.Item>
                </ListGroup>
                <div className="mt-3 text-muted small">{node.lastAction}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Card className="mt-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold">Consensuslog</span>
            <Badge bg="secondary">{history.length}</Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {history.length === 0 ? (
            <div className="p-4 text-center text-muted">Nog geen simulaties uitgevoerd.</div>
          ) : (
            <ListGroup variant="flush">
              {history.map((entry) => (
                <ListGroup.Item key={entry.id}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold">{modeLabels[entry.mode]}</div>
                      <div className="small text-muted">{entry.message}</div>
                    </div>
                    <Badge bg="light" text="dark">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
        {lastMessage && (
          <Card.Footer className="text-primary fw-semibold">{lastMessage}</Card.Footer>
        )}
      </Card>
    </section>
  )
}

export default ConsensusPlayground
