import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap'
import type { Transaction, Wallet } from '../types'

interface TokenPlaygroundProps {
  wallets: Wallet[]
  connectedWalletId: string
  pendingTransactions: Transaction[]
  availableBalance: number
  onTransfer: (toId: string, amount: number, note: string) => void
}

const TokenPlayground = ({
  wallets,
  connectedWalletId,
  pendingTransactions,
  availableBalance,
  onTransfer,
}: TokenPlaygroundProps) => {
  const [recipientId, setRecipientId] = useState('')
  const [amount, setAmount] = useState(5)
  const [note, setNote] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const connectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === connectedWalletId),
    [wallets, connectedWalletId],
  )

  const outgoingPending = useMemo(
    () =>
      pendingTransactions.filter((tx) => tx.from === connectedWalletId && tx.type === 'transfer'),
    [connectedWalletId, pendingTransactions],
  )

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!recipientId || recipientId === connectedWalletId) {
      setFeedback('Kies een andere wallet als ontvanger.')
      return
    }
    if (amount <= 0) {
      setFeedback('Het bedrag moet groter zijn dan nul.')
      return
    }
    if (amount > availableBalance) {
      setFeedback('Onvoldoende vrije tokens. Wacht op mining of verlaag het bedrag.')
      return
    }
    onTransfer(recipientId, amount, note)
    setFeedback('Transactie toegevoegd aan de mempool! Mine een blok om hem te bevestigen.')
    setAmount(5)
    setNote('')
  }

  return (
    <section className="section" id="tokens">
      <div className="section-header">
        <div>
          <h2 className="section-title">Token oefenarena</h2>
          <p className="section-subtitle">
            Verstuur EduTokens naar andere wallets en bekijk hoe transacties wachten in de mempool
            totdat ze in een blok belanden. Tokens komen alleen definitief over zodra een blok is
            gemined.
          </p>
        </div>
      </div>
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Label className="fw-semibold">Ontvanger</Form.Label>
                <Form.Select
                  value={recipientId}
                  onChange={(event) => setRecipientId(event.target.value)}
                  required
                >
                  <option value="">Selecteer een wallet</option>
                  {wallets
                    .filter((wallet) => wallet.id !== connectedWalletId)
                    .map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} — {wallet.address.slice(0, 6)}...
                      </option>
                    ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="fw-semibold">Bedrag</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                />
              </Col>
              <Col md={4}>
                <Form.Label className="fw-semibold">Beschrijving (optioneel)</Form.Label>
                <Form.Control
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Bijv. beloning, lesmateriaal"
                />
              </Col>
              <Col md={1} className="d-grid">
                <Button type="submit" variant="success" className="fw-semibold">
                  Verstuur
                </Button>
              </Col>
            </Row>
          </Form>
          <div className="d-flex gap-3 align-items-center mt-4 flex-wrap">
            <Badge bg="primary" className="px-3 py-2">
              Vrije tokens: {availableBalance}
            </Badge>
            {connectedWallet && (
              <span className="text-muted small">
                Totaal saldo: {connectedWallet.balance} | Ingezet: {connectedWallet.staked}
              </span>
            )}
          </div>
          {feedback && (
            <Alert variant="info" className="mt-3 mb-0" onClose={() => setFeedback(null)} dismissible>
              {feedback}
            </Alert>
          )}
        </Card.Body>
      </Card>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Openstaande transacties (mempool)</span>
          <Badge bg="secondary">{pendingTransactions.length}</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          {pendingTransactions.length === 0 ? (
            <div className="p-4 text-center text-muted">Geen transacties in afwachting. Start er één!</div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Van</th>
                  <th>Naar</th>
                  <th>Tokens</th>
                  <th>Omschrijving</th>
                </tr>
              </thead>
              <tbody>
                {pendingTransactions.map((tx) => {
                  const fromWallet = wallets.find((wallet) => wallet.id === tx.from)
                  const toWallet = wallets.find((wallet) => wallet.id === tx.to)
                  return (
                    <tr key={tx.id}>
                      <td>
                        <Badge bg={tx.type === 'contract' ? 'warning' : tx.type === 'reward' ? 'success' : 'info'}>
                          {tx.type === 'contract'
                            ? 'Smart contract'
                            : tx.type === 'reward'
                              ? 'Reward'
                              : 'Transfer'}
                        </Badge>
                      </td>
                      <td>{fromWallet ? fromWallet.name : tx.from}</td>
                      <td>{toWallet ? toWallet.name : tx.to}</td>
                      <td>{tx.amount}</td>
                      <td>{tx.note || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
        {outgoingPending.length > 0 && (
          <Card.Footer className="text-muted small">
            Je hebt {outgoingPending.length} transfer(s) in afwachting van mining.
          </Card.Footer>
        )}
      </Card>
    </section>
  )
}

export default TokenPlayground
