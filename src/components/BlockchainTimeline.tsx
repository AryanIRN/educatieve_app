import { Badge, Card } from 'react-bootstrap'
import type { ChainBlock } from '../hooks/useTycoonGame'

const modeClass: Record<string, string> = {
  pow: 'mode-pow',
  pos: 'mode-pos',
  pbft: 'mode-pbft',
}

interface BlockchainTimelineProps {
  chain: ChainBlock[]
}

const BlockchainTimeline = ({ chain }: BlockchainTimelineProps) => {
  const recentBlocks = [...chain].slice(-6).reverse()

  return (
    <Card className="timeline-card">
      <Card.Body>
        <div className="panel-header">
          <div>
            <h5 className="mb-0">Blockchain tijdlijn</h5>
            <small className="text-muted">Volg hoe je campus nieuwe blokken produceert.</small>
          </div>
          <Badge bg="light" text="dark">Lengte {chain.length}</Badge>
        </div>
        <div className="timeline-list">
          {recentBlocks.map((block) => (
            <div key={block.id} className="timeline-block">
              <div className="timeline-index">
                <span className={`mode-pill ${modeClass[block.consensus] ?? ''}`}>{block.consensus.toUpperCase()}</span>
                <strong>Blok {block.index}</strong>
              </div>
              <div className="timeline-meta">
                <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
                <span>{block.mintedBy}</span>
              </div>
              <p className="timeline-insight">{block.insight}</p>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  )
}

export default BlockchainTimeline
