import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Badge, Button, Card, Col, Form, ListGroup, Row, Table } from 'react-bootstrap'
import type { SmartContractState, Transaction, Wallet } from '../types'

interface SmartContractLabProps {
  wallets: Wallet[]
  connectedWalletId: string
  contractState: SmartContractState
  pendingTransactions: Transaction[]
  onDeposit: (amount: number, questName: string, reward: number) => void
  onComplete: (questName: string, reward: number) => void
}

const quests = [
  {
    id: 'quest-1',
    name: 'NFT Gallery Opzetten',
    description: 'Maak een mini-collectie en leer hoe eigendom wordt vastgelegd in een smart contract.',
    minStake: 12,
    reward: 4,
  },
  {
    id: 'quest-2',
    name: 'DAO Stemronde',
    description: 'Stake tokens om stemrecht te krijgen en ervaar hoe governance werkt.',
    minStake: 15,
    reward: 5,
  },
  {
    id: 'quest-3',
    name: 'Sustainability Oracle',
    description: 'Koppel data van buitenaf aan de blockchain om SDG-impact te meten.',
    minStake: 20,
    reward: 8,
  },
]

const SmartContractLab = ({
  wallets,
  connectedWalletId,
  contractState,
  pendingTransactions,
  onDeposit,
  onComplete,
}: SmartContractLabProps) => {
  const [selectedQuest, setSelectedQuest] = useState(quests[0])
  const [stakeAmount, setStakeAmount] = useState(quests[0].minStake)
  const [feedback, setFeedback] = useState<string | null>(null)

  const activeStake = useMemo(
    () => contractState.stakes[connectedWalletId] ?? 0,
    [contractState.stakes, connectedWalletId],
  )

  const pendingForWallet = useMemo(
    () =>
      pendingTransactions.filter(
        (tx) => tx.type === 'contract' && (tx.from === connectedWalletId || tx.to === connectedWalletId),
      ),
    [connectedWalletId, pendingTransactions],
  )

  const handleQuestSelect = (questId: string) => {
    const quest = quests.find((item) => item.id === questId) ?? quests[0]
    setSelectedQuest(quest)
    setStakeAmount(quest.minStake)
  }

  const handleDeposit = (event: FormEvent) => {
    event.preventDefault()
    if (stakeAmount < selectedQuest.minStake) {
      setFeedback(`Stake minimaal ${selectedQuest.minStake} tokens voor deze quest.`)
      return
    }
    onDeposit(stakeAmount, selectedQuest.name, selectedQuest.reward)
    setFeedback('Stake toegevoegd aan het contract. Mine een blok om het te bevestigen!')
  }

  const handleComplete = () => {
    if (activeStake === 0) {
      setFeedback('Je hebt nog geen bevestigde stake voor deze quest.')
      return
    }
    onComplete(selectedQuest.name, selectedQuest.reward)
    setFeedback('Uitbetaling aangevraagd! Mine een blok om je beloning te claimen.')
  }

  return (
    <section className="section" id="contracts">
      <div className="section-header">
        <div>
          <h2 className="section-title">Smart contract lab</h2>
          <p className="section-subtitle">
            Slimme contracten voeren automatisch voorwaarden uit. Stake tokens om mee te doen aan quests en
            ontvang beloningen zodra de voorwaarden zijn behaald.
          </p>
        </div>
        <Badge bg="dark" className="px-3 py-2">
          Locked in contract: {contractState.lockedTokens} tokens
        </Badge>
      </div>
      <Row className="g-4">
        <Col md={5}>
          <Card className="h-100">
            <Card.Header>
              <span className="fw-semibold">Kies een leerquest</span>
            </Card.Header>
            <ListGroup variant="flush">
              {quests.map((quest) => (
                <ListGroup.Item
                  key={quest.id}
                  action
                  active={quest.id === selectedQuest.id}
                  onClick={() => handleQuestSelect(quest.id)}
                  className="quest-item"
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="mb-1">{quest.name}</h5>
                      <p className="mb-1 text-muted small">{quest.description}</p>
                      <div className="text-muted small">Min. stake: {quest.minStake} tokens · Reward: +{quest.reward}</div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
        <Col md={7}>
          <Card className="h-100">
            <Card.Body>
              <h5 className="fw-semibold">Interacteer met het contract</h5>
              <p className="text-muted">
                Je actieve wallet kan tokens inzetten (locken) om de quest te starten. Zodra het blok met de
                stake is gemined, kun je het resultaat claimen via het contract.
              </p>
              <Form onSubmit={handleDeposit} className="mb-3">
                <Row className="g-3 align-items-end">
                  <Col md={5}>
                    <Form.Label className="fw-semibold">Stake bedrag</Form.Label>
                    <Form.Control
                      type="number"
                      min={selectedQuest.minStake}
                      value={stakeAmount}
                      onChange={(event) => setStakeAmount(Number(event.target.value))}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label className="fw-semibold">Huidige stake</Form.Label>
                    <div className="info-highlight">{activeStake} tokens</div>
                  </Col>
                  <Col md={3} className="d-grid">
                    <Button type="submit" variant="warning" className="fw-semibold">
                      Stake tokens
                    </Button>
                  </Col>
                </Row>
              </Form>
              <Row className="g-3">
                <Col md={6}>
                  <Button
                    variant="success"
                    className="w-100 fw-semibold"
                    onClick={handleComplete}
                    disabled={activeStake === 0}
                  >
                    Quest voltooien
                  </Button>
                </Col>
                <Col md={6} className="d-flex align-items-center">
                  <Alert variant="secondary" className="mb-0 w-100">
                    {pendingForWallet.length > 0
                      ? 'Er staan contractacties klaar om gemined te worden.'
                      : 'Geen openstaande contractacties.'}
                  </Alert>
                </Col>
              </Row>
              {feedback && (
                <Alert variant="info" className="mt-3" onClose={() => setFeedback(null)} dismissible>
                  {feedback}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="mt-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Contractgeschiedenis</span>
          <Badge bg="secondary">{contractState.history.length}</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          {contractState.history.length === 0 ? (
            <div className="p-4 text-center text-muted">Nog geen bevestigde interacties met het contract.</div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Moment</th>
                  <th>Wallet</th>
                  <th>Actie</th>
                  <th>Bedrag</th>
                  <th>Reward</th>
                </tr>
              </thead>
              <tbody>
                {contractState.history.map((entry) => {
                  const wallet = wallets.find((item) => item.id === entry.walletId)
                  return (
                    <tr key={entry.id}>
                      <td>{new Date(entry.timestamp).toLocaleTimeString()}</td>
                      <td>{wallet ? wallet.name : entry.walletId}</td>
                      <td>{entry.description}</td>
                      <td>{entry.amount}</td>
                      <td>{entry.reward}</td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </section>
  )
}

export default SmartContractLab
