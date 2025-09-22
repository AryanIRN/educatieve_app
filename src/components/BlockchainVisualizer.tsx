import { Badge, Card, Col, Container, Row } from 'react-bootstrap'
import type { Block, Transaction, Wallet } from '../types'

interface BlockchainVisualizerProps {
  blocks: Block[]
  wallets: Wallet[]
}

const renderTransactionLabel = (transaction: Transaction, wallets: Wallet[]) => {
  const fromWallet = wallets.find((wallet) => wallet.id === transaction.from)
  const toWallet = wallets.find((wallet) => wallet.id === transaction.to)
  if (transaction.type === 'reward') {
    return `Blokreward voor ${toWallet ? toWallet.name : transaction.to}`
  }
  if (transaction.type === 'contract') {
    const actor = fromWallet ?? toWallet
    return `${transaction.metadata?.contractAction === 'deposit' ? 'Stake' : 'Uitbetaling'} · ${actor ? actor.name : transaction.from}`
  }
  return `${fromWallet ? fromWallet.name : transaction.from} → ${toWallet ? toWallet.name : transaction.to}`
}

const BlockchainVisualizer = ({ blocks, wallets }: BlockchainVisualizerProps) => {
  return (
    <section className="section" id="blockchain">
      <div className="section-header">
        <div>
          <h2 className="section-title">Visuele blockchain</h2>
          <p className="section-subtitle">
            Elke kaart stelt een blok voor. Bekijk hoe de keten groeit, wie het blok heeft geproduceerd en
            welke transacties zijn vastgelegd.
          </p>
        </div>
      </div>
      <Container fluid className="px-0">
        <Row className="g-4 blockchain-grid">
          {blocks.map((block) => (
            <Col key={block.hash} md={6} xl={4}>
              <Card className="block-card h-100">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="fw-semibold">Blok #{block.index}</span>
                      <div className="small text-muted">{new Date(block.timestamp).toLocaleString()}</div>
                    </div>
                    <Badge bg="primary">{block.consensus.toUpperCase()}</Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="small text-muted text-uppercase">Producer</div>
                    <div className="fw-semibold">
                      {wallets.find((wallet) => wallet.id === block.miner)?.name ?? block.miner}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="small text-muted text-uppercase">Nonce</div>
                    <div>{block.nonce}</div>
                  </div>
                  <div className="mb-3">
                    <div className="small text-muted text-uppercase">Hash</div>
                    <code className="text-break">{block.hash.slice(0, 32)}…</code>
                  </div>
                  <div className="mb-3">
                    <div className="small text-muted text-uppercase">Vorige hash</div>
                    <code className="text-break">{block.previousHash.slice(0, 32)}…</code>
                  </div>
                  <div>
                    <div className="small text-muted text-uppercase mb-2">Transacties</div>
                    {block.transactions.map((transaction) => (
                      <div key={transaction.id} className="transaction-pill">
                        <Badge
                          bg={
                            transaction.type === 'contract'
                              ? 'warning'
                              : transaction.type === 'reward'
                                ? 'success'
                                : 'secondary'
                          }
                        >
                          {transaction.type === 'contract'
                            ? 'Smart contract'
                            : transaction.type === 'reward'
                              ? 'Reward'
                              : 'Transfer'}
                        </Badge>
                        <span>{renderTransactionLabel(transaction, wallets)}</span>
                        <strong>{transaction.amount}</strong>
                      </div>
                    ))}
                  </div>
                </Card.Body>
                <Card.Footer>
                  <div className="d-flex justify-content-between text-muted small">
                    <span>Moeilijkheid: {block.difficulty}</span>
                    <span>{block.transactions.length} tx</span>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default BlockchainVisualizer
