import { Card, Col, Row } from 'react-bootstrap'

interface LearningGuideProps {
  tips: { title: string; description: string; icon: string }[]
}

const LearningGuide = ({ tips }: LearningGuideProps) => {
  return (
    <section className="section" id="guide">
      <div className="section-header">
        <div>
          <h2 className="section-title">Leerpad &amp; begrippen</h2>
          <p className="section-subtitle">
            Volg deze stappen om zelfstandig met blockchain aan de slag te gaan en de theorie aan praktijk te
            koppelen.
          </p>
        </div>
      </div>
      <Row className="g-4">
        {tips.map((tip) => (
          <Col md={6} key={tip.title}>
            <Card className="guide-card h-100">
              <Card.Body>
                <div className="guide-icon">{tip.icon}</div>
                <Card.Title>{tip.title}</Card.Title>
                <Card.Text className="text-muted">{tip.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  )
}

export default LearningGuide
