import { Badge, Button, Col, Container, Row } from 'react-bootstrap'

interface HeaderIntroProps {
  onGetStarted?: () => void
}

const HeaderIntro = ({ onGetStarted }: HeaderIntroProps) => {
  return (
    <div className="bg-gradient text-light py-5" id="intro">
      <Container>
        <Row className="align-items-center">
          <Col md={7} className="mb-4 mb-md-0">
            <Badge bg="warning" text="dark" className="mb-3 shadow-sm">
              SDG 4 - Kwaliteitsonderwijs
            </Badge>
            <h1 className="display-5 fw-bold">
              Leer blockchain door te doen met de Web3 Impact Hub
            </h1>
            <p className="lead mt-3">
              Experimenteer met mining, tokens, smart contracts en consensus in een veilige
              leeromgeving. Deze app begeleidt je stap voor stap door de belangrijkste
              bouwstenen van web3 en laat je ontdekken hoe de technologie achter crypto werkt.
            </p>
            <div className="d-flex gap-3 flex-wrap">
              <Button size="lg" variant="light" onClick={onGetStarted} className="fw-semibold">
                Start met bouwen
              </Button>
              <Button
                size="lg"
                variant="outline-light"
                href="#blockchain"
                className="fw-semibold"
              >
                Bekijk de blockchain
              </Button>
            </div>
          </Col>
          <Col md={5}>
            <div className="info-card p-4 text-start text-md-end h-100">
              <h5 className="text-uppercase text-muted">Wat je gaat ervaren</h5>
              <ul className="list-unstyled fs-6 mt-3">
                <li>⚒️ Blokken minen met proof-of-work en proof-of-stake</li>
                <li>🪙 Tokens verzenden, verdienen en beheren in je wallet</li>
                <li>📜 Interactie met slimme contracten en quests</li>
                <li>🧠 Consensus spelen met je eigen netwerk</li>
              </ul>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default HeaderIntro
