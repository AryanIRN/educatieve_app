import { useMemo, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, ProgressBar, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import type { ConsensusMode, Transaction, Wallet } from '../types'

interface MiningSimulatorProps {
  wallets: Wallet[]
  connectedWalletId: string
  pendingTransactions: Transaction[]
  difficulty: number
  consensusMode: ConsensusMode
  miningState: 'idle' | 'mining' | 'complete'
  miningProgress: number
  onDifficultyChange: (value: number) => void
  onMine: (minerId: string) => void
  onConsensusModeChange: (mode: ConsensusMode) => void
}

const consensusDescriptions: Record<ConsensusMode, string> = {
  pow: 'Proof-of-Work vergt rekenkracht. De eerste miner die de puzzel oplost, mag het blok toevoegen.',
  pos: 'Proof-of-Stake kiest een validator op basis van inzet (staking). Geen zware puzzel maar een loting.',
  pbft: 'Practical Byzantine Fault Tolerance stemt met meerdere validators totdat ⅔ akkoord is.',
}

const MiningSimulator = ({
  wallets,
  connectedWalletId,
  pendingTransactions,
  difficulty,
  consensusMode,
  miningState,
  miningProgress,
  onDifficultyChange,
  onMine,
  onConsensusModeChange,
}: MiningSimulatorProps) => {
  const [selectedMiner, setSelectedMiner] = useState(connectedWalletId)

  const pendingTransfers = useMemo(
    () => pendingTransactions.filter((tx) => tx.type === 'transfer'),
    [pendingTransactions],
  )

  const canMine = pendingTransactions.length > 0

  const miningHint = useMemo(() => {
    switch (consensusMode) {
      case 'pos':
        return 'In Proof-of-Stake kies je welke validator het blok voorstelt. Geen puzzel, maar wel consensus.'
      case 'pbft':
        return 'Bij PBFT coördineert een leider de stemmen. Gebruik de consensus-speelplaats om dit te ervaren.'
      default:
        return 'Proof-of-Work vereist meerdere pogingen. Hogere moeilijkheid betekent meer kans op een langere puzzel.'
    }
  }, [consensusMode])

  const handleMine = () => {
    onMine(selectedMiner)
  }

  return (
    <section className="section" id="mining">
      <div className="section-header">
        <div>
          <h2 className="section-title">Mining &amp; blokproductie</h2>
          <p className="section-subtitle">
            Bepaal de moeilijkheidsgraad en ontdek hoe miners of validators nieuwe blokken toevoegen aan de
            keten. Elk blok bevestigt de transacties uit de mempool.
          </p>
        </div>
      </div>
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-4 align-items-center">
            <Col md={6}>
              <Form.Label className="fw-semibold">Consensusmodus</Form.Label>
              <ToggleButtonGroup
                type="radio"
                name="consensus-mode"
                value={consensusMode}
                onChange={(val) => onConsensusModeChange(val as ConsensusMode)}
                className="d-flex gap-2 flex-wrap"
              >
                <ToggleButton id="pow" value="pow" variant={consensusMode === 'pow' ? 'primary' : 'outline-primary'}>
                  Proof-of-Work
                </ToggleButton>
                <ToggleButton id="pos" value="pos" variant={consensusMode === 'pos' ? 'primary' : 'outline-primary'}>
                  Proof-of-Stake
                </ToggleButton>
                <ToggleButton
                  id="pbft"
                  value="pbft"
                  variant={consensusMode === 'pbft' ? 'primary' : 'outline-primary'}
                >
                  PBFT
                </ToggleButton>
              </ToggleButtonGroup>
              <Alert variant="light" className="mt-3 border-start border-3 border-primary">
                {consensusDescriptions[consensusMode]}
              </Alert>
            </Col>
            <Col md={6}>
              <Form.Label className="fw-semibold">Moeilijkheidsgraad proof-of-work</Form.Label>
              <Form.Range
                min={1}
                max={5}
                value={difficulty}
                onChange={(event) => onDifficultyChange(Number(event.target.value))}
                disabled={consensusMode !== 'pow'}
              />
              <div className="d-flex justify-content-between text-muted small">
                <span>Gemakkelijk</span>
                <span>Expert</span>
              </div>
              <div className="mt-3 text-muted small">{miningHint}</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <Row className="g-4 align-items-center">
            <Col md={4}>
              <Form.Label className="fw-semibold">Kies een miner / validator</Form.Label>
              <Form.Select value={selectedMiner} onChange={(event) => setSelectedMiner(event.target.value)}>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} — {wallet.address.slice(0, 6)}...
                  </option>
                ))}
              </Form.Select>
              {consensusMode === 'pos' && (
                <Alert variant="info" className="mt-3">
                  Validators met meer staking hebben meer kans. Kijk bij het smart contract om tokens in te
                  zetten.
                </Alert>
              )}
            </Col>
            <Col md={5}>
              <p className="text-muted mb-2">Transacties in dit blok</p>
              <div className="d-flex flex-wrap gap-2">
                {pendingTransactions.map((tx) => (
                  <Badge key={tx.id} bg={tx.type === 'contract' ? 'warning' : tx.type === 'reward' ? 'success' : 'secondary'}>
                    {tx.type === 'contract' ? 'Smart contract' : tx.type === 'reward' ? 'Reward' : 'Transfer'} ·{' '}
                    {tx.amount} tokens
                  </Badge>
                ))}
                {pendingTransactions.length === 0 && <span className="text-muted">Nog geen transacties</span>}
              </div>
              {pendingTransfers.length > 0 && (
                <div className="mt-3 text-muted small">
                  {pendingTransfers.length} gewone transfer(s) wachten op bevestiging.
                </div>
              )}
            </Col>
            <Col md={3} className="text-md-end">
              <Button
                size="lg"
                variant={canMine ? 'success' : 'outline-secondary'}
                disabled={!canMine || miningState === 'mining'}
                onClick={handleMine}
                className="fw-semibold w-100"
              >
                {consensusMode === 'pow' ? 'Start mining' : 'Produseer blok'}
              </Button>
              <div className="mt-3">
                <ProgressBar now={miningProgress} label={`${Math.round(miningProgress)}%`} animated />
                <div className="text-muted small mt-2">Status: {miningState === 'idle' ? 'Wachtend' : miningState === 'mining' ? 'Bezig met berekenen' : 'Blok klaar!'}</div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </section>
  )
}

export default MiningSimulator
