import { Accordion, Badge, Card, ListGroup } from 'react-bootstrap'
import type { ChainBlock, GameState } from '../hooks/useTycoonGame'

interface EducationalInsightsProps {
  chain: ChainBlock[]
  state: GameState
}

const EducationalInsights = ({ chain, state }: EducationalInsightsProps) => {
  const latestBlock = chain[chain.length - 1]

  return (
    <Card className="insights-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-0">Educatieve inzichten</h4>
            <small className="text-muted">
              Koppel de game-actie aan blockchain-theorie en leerdoelen uit SDG-4.
            </small>
          </div>
          <Badge bg="light" text="dark">
            Laatste blok #{latestBlock?.index ?? 0}
          </Badge>
        </div>
        <Accordion alwaysOpen>
          <Accordion.Item eventKey="mining">
            <Accordion.Header>Mining & Proof-of-Work</Accordion.Header>
            <Accordion.Body>
              <p>
                Je miners produceren tokens door hashingpuzzels op te lossen. In het spel zie je het energieverbruik terug in de
                energiestatus. Bespreek met studenten hoe moeilijkheidsgraad en hashfuncties bepalen wie het volgende blok
                mag maken.
              </p>
              <ListGroup variant="flush" className="concept-list">
                <ListGroup.Item>Hashing is eenrichtingsverkeer: probeer de hash van blok {latestBlock?.index ?? 0} te raden.</ListGroup.Item>
                <ListGroup.Item>De beloning van {latestBlock ? 45 : 0} tokens weerspiegelt block rewards in echte netwerken.</ListGroup.Item>
                <ListGroup.Item>Energiestress? Stimuleer studenten om duurzame alternatieven te bespreken.</ListGroup.Item>
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="tokens">
            <Accordion.Header>Tokens & Economie</Accordion.Header>
            <Accordion.Body>
              <p>
                Tokens financieren je campus. Ze representeren waarde binnen het ecosysteem en worden gebruikt om upgrades te
                betalen. Door schaarste in te bouwen leren studenten economische trade-offs.
              </p>
              <ListGroup variant="flush" className="concept-list">
                <ListGroup.Item>Let op de balans tussen tokens ({Math.round(state.tokens)}) en kennis ({Math.round(state.knowledge)}).
                </ListGroup.Item>
                <ListGroup.Item>Experimenteer met tokenomics: wat gebeurt er als je te veel miners bouwt?</ListGroup.Item>
                <ListGroup.Item>Gebruik workshops om sociale impact (SDG-4) te vergroten via onderwijs.</ListGroup.Item>
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="contracts">
            <Accordion.Header>Smart Contracts</Accordion.Header>
            <Accordion.Body>
              <p>
                Elk smart contract-level activeert automatisering: certificaten, stemmen of micro-betalingen. Studenten ervaren
                zo hoe code als wet fungeert en waar auditability belangrijk is.
              </p>
              <ListGroup variant="flush" className="concept-list">
                <ListGroup.Item>
                  Niveau {state.smartContractLevel} betekent dat {state.smartContractLevel * 6} studenten per cyclus automatisch
                  een certificaat claimen.
                </ListGroup.Item>
                <ListGroup.Item>Bespreek gas-kosten: welke middelen betaal je om een contract te deployen?</ListGroup.Item>
                <ListGroup.Item>Maak een scenario waarin een bug in een contract de reputatie verlaagt.</ListGroup.Item>
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="consensus">
            <Accordion.Header>Consensus & Governance</Accordion.Header>
            <Accordion.Body>
              <p>
                De consensusgezondheid geeft aan hoe betrouwbaar het netwerk is. Wissel tussen PoW, PoS en PBFT en observeer de
                impact op reputatie en energieverbruik.
              </p>
              <ListGroup variant="flush" className="concept-list">
                <ListGroup.Item>Huidige modus: {state.consensusMode.toUpperCase()} – {Math.round(state.consensusHealth)}% health.</ListGroup.Item>
                <ListGroup.Item>Vergelijk hoe snel blokken finaliteit bereiken onder verschillende modi.</ListGroup.Item>
                <ListGroup.Item>Voer een debat over decentralisatie versus snelheid.</ListGroup.Item>
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="compliance">
            <Accordion.Header>Compliance & Juridische aspecten</Accordion.Header>
            <Accordion.Body>
              <p>
                Governance gaat ook over wetgeving. Denk aan AVG, identiteitsbeheer en verantwoordelijk datadelen. Gebruik de
                reputatie-metric om dit gesprek te starten.
              </p>
              <ListGroup variant="flush" className="concept-list">
                <ListGroup.Item>Welke persoonsgegevens mag een smart contract opslaan?</ListGroup.Item>
                <ListGroup.Item>Hoe veranker je beslissingen van studenten in on-chain governance?</ListGroup.Item>
                <ListGroup.Item>Reflecteer op sustainability en ethiek binnen blockchainprojecten.</ListGroup.Item>
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Card.Body>
    </Card>
  )
}

export default EducationalInsights
