import { useState } from 'react'
import type { FormEvent } from 'react'
import { Badge, Button, Card, Col, Form, Row } from 'react-bootstrap'
import type { Wallet } from '../types'

interface WalletManagerProps {
  wallets: Wallet[]
  connectedWalletId: string
  onSelect: (id: string) => void
  onCreate: (name: string) => void
}

const WalletManager = ({ wallets, connectedWalletId, onSelect, onCreate }: WalletManagerProps) => {
  const [newWalletName, setNewWalletName] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!newWalletName.trim()) return
    onCreate(newWalletName.trim())
    setNewWalletName('')
  }

  return (
    <section className="section" id="wallets">
      <div className="section-header">
        <div>
          <h2 className="section-title">Wallets &amp; tokenbeheer</h2>
          <p className="section-subtitle">
            Kies een wallet om transacties te verzenden, tokens te verdienen en smart contracts uit te
            proberen. Elke wallet heeft een eigen identiteit en adres.
          </p>
        </div>
      </div>
      <Form onSubmit={handleSubmit} className="mb-4">
        <Row className="g-3 align-items-end">
          <Col md={5}>
            <Form.Label className="fw-semibold">Maak een extra wallet aan</Form.Label>
            <Form.Control
              value={newWalletName}
              placeholder="Naam van student of team"
              onChange={(event) => setNewWalletName(event.target.value)}
            />
          </Col>
          <Col md="auto">
            <Button type="submit" variant="primary" className="fw-semibold">
              Wallet genereren
            </Button>
          </Col>
          <Col className="text-muted small">
            Tip: voeg wallets toe voor verschillende rollen zoals docent, student of validator.
          </Col>
        </Row>
      </Form>
      <Row className="g-4">
        {wallets.map((wallet) => {
          const classes = `wallet-card border-${wallet.color} ${wallet.id === connectedWalletId ? 'wallet-card-active' : ''}`
          return (
            <Col md={4} key={wallet.id}>
              <Card className={classes}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <Card.Title className="mb-0">{wallet.name}</Card.Title>
                      <Card.Subtitle className="text-muted small">{wallet.address}</Card.Subtitle>
                    </div>
                    {wallet.id === connectedWalletId ? (
                      <Badge bg={wallet.color} className="px-3 py-2">
                        Verbonden
                      </Badge>
                    ) : (
                      <Button size="sm" variant={`outline-${wallet.color}`} onClick={() => onSelect(wallet.id)}>
                        Verbinden
                      </Button>
                    )}
                  </div>
                  <Row>
                    <Col>
                      <p className="display-6 fw-bold mb-0">{wallet.balance}</p>
                      <span className="text-muted">EduTokens</span>
                    </Col>
                    <Col className="text-end">
                      <p className="h5 mb-0">{wallet.staked}</p>
                      <span className="text-muted">Ingezet (staking)</span>
                    </Col>
                  </Row>
                  {wallet.achievements.length > 0 && (
                    <div className="mt-3">
                      <span className="fw-semibold text-muted small d-block mb-2">Behaalde badges</span>
                      <div className="d-flex flex-wrap gap-2">
                        {wallet.achievements.map((achievement) => (
                          <Badge bg="info" key={achievement} className="rounded-pill">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          )
        })}
      </Row>
    </section>
  )
}

export default WalletManager
