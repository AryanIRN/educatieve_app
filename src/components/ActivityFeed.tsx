import { ListGroup } from 'react-bootstrap'

interface ActivityFeedProps {
  messages: string[]
}

const ActivityFeed = ({ messages }: ActivityFeedProps) => {
  return (
    <section className="section" id="activity">
      <div className="section-header">
        <div>
          <h2 className="section-title">Activiteiten &amp; feedback</h2>
          <p className="section-subtitle">
            Deze feed vertelt je wat er in de simulatie gebeurt. Gebruik het als begeleide uitleg tijdens het
            experimenteren.
          </p>
        </div>
      </div>
      <ListGroup className="activity-feed">
        {messages.length === 0 && (
          <ListGroup.Item className="text-muted">Start een actie om uitleg te ontvangen.</ListGroup.Item>
        )}
        {messages.map((message, index) => (
          <ListGroup.Item key={`${message}-${index}`}>{message}</ListGroup.Item>
        ))}
      </ListGroup>
    </section>
  )
}

export default ActivityFeed
