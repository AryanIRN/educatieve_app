import { useMemo } from 'react'
import { Badge } from 'react-bootstrap'
import type { CampusPlotState } from '../hooks/useTycoonGame'

interface CampusMapProps {
  plots: CampusPlotState[]
  selectedNodeId: string | null
  onSelectNode: (id: string | null) => void
}

const GRID_LAYOUT: string[][] = [
  ['tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree', 'tree'],
  ['tree', 'road', 'road', 'road', 'road', 'road', 'road', 'road', 'road', 'road', 'road', 'tree'],
  ['tree', 'road', 'plot:A1', 'plot:A2', 'plaza', 'plot:B1', 'plot:B2', 'road', 'facility', 'facility', 'road', 'tree'],
  ['tree', 'road', 'plot:C1', 'plaza', 'plaza', 'plaza', 'plot:C2', 'road', 'facility', 'facility', 'road', 'tree'],
  ['tree', 'road', 'plot:D1', 'walk', 'park', 'walk', 'plot:D2', 'road', 'dorm', 'dorm', 'road', 'tree'],
  ['tree', 'road', 'road', 'road', 'road', 'road', 'road', 'road', 'road', 'road', 'road', 'tree'],
  ['tree', 'forest', 'forest', 'road', 'energy', 'energy', 'road', 'forest', 'forest', 'forest', 'tree', 'tree'],
  ['tree', 'forest', 'forest', 'road', 'energy', 'energy', 'road', 'forest', 'forest', 'forest', 'tree', 'tree'],
]

const districtLabels: Record<string, string> = {
  mining: 'Mining District',
  governance: 'Governance Quarter',
  innovation: 'Innovation Wing',
  knowledge: 'Knowledge Garden',
}

const typeIcons: Record<string, string> = {
  miner: '⛏️',
  validator: '🛡️',
  dapp: '🧠',
  research: '🔬',
}

const tileClass = (cell: string) => {
  if (cell.startsWith('plot:')) return 'tile-plot'
  switch (cell) {
    case 'road':
      return 'tile-road'
    case 'plaza':
      return 'tile-plaza'
    case 'walk':
      return 'tile-walk'
    case 'park':
      return 'tile-park'
    case 'facility':
      return 'tile-facility'
    case 'dorm':
      return 'tile-dorm'
    case 'forest':
      return 'tile-forest'
    case 'energy':
      return 'tile-energy'
    case 'tree':
    default:
      return 'tile-border'
  }
}

const MapLegend = () => (
  <div className="map-legend">
    <div className="legend-group">
      <span className="legend-label">Node typen</span>
      <div className="legend-items">
        <span><strong>⛏️</strong> Proof-of-Work</span>
        <span><strong>🛡️</strong> Proof-of-Stake</span>
        <span><strong>🧠</strong> Smart Contracts</span>
        <span><strong>🔬</strong> Research & Workshops</span>
      </div>
    </div>
    <div className="legend-group">
      <span className="legend-label">Kaarticonen</span>
      <div className="legend-items">
        <span className="legend-badge legend-road">Campusweg</span>
        <span className="legend-badge legend-park">Park</span>
        <span className="legend-badge legend-facility">Energievoorziening</span>
        <span className="legend-badge legend-locked">🔒 Slotvereiste</span>
      </div>
    </div>
  </div>
)

const CampusMap = ({ plots, selectedNodeId, onSelectNode }: CampusMapProps) => {
  const plotMap = useMemo(() => {
    const map = new Map<string, CampusPlotState>()
    plots.forEach((plot) => {
      map.set(plot.plotId, plot)
    })
    return map
  }, [plots])

  return (
    <div className="campus-map">
      <div className="campus-grid">
        {GRID_LAYOUT.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = `${rowIndex}-${colIndex}`
            const baseClass = tileClass(cell)
            if (cell.startsWith('plot:')) {
              const plotId = cell.split(':')[1]
              const plot = plotMap.get(plotId)
              const occupant = plot?.occupiedBy
              const isSelected = occupant?.id === selectedNodeId
              const classes = [
                'map-tile',
                baseClass,
                occupant ? 'tile-built' : 'tile-available',
                plot?.locked && !occupant ? 'tile-locked' : '',
                isSelected ? 'tile-selected' : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <div
                  key={key}
                  className={classes}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectNode(occupant ? occupant.id : null)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      onSelectNode(occupant ? occupant.id : null)
                    }
                  }}
                >
                  {plot ? (
                    <div className={`plot-card ${occupant ? 'plot-occupied' : plot.locked ? 'plot-locked' : 'plot-empty'}`}>
                      <div className="plot-header">
                        <span className="plot-district">{districtLabels[plot.district]}</span>
                        {!occupant && plot.locked && <span className="plot-lock">🔒</span>}
                      </div>
                      {occupant ? (
                        <>
                          <div className="plot-name">
                            <span className="plot-icon">{typeIcons[occupant.type]}</span>
                            {occupant.name}
                          </div>
                          <div className="plot-meta">
                            <Badge bg="dark" className="plot-badge">Lvl {occupant.level}</Badge>
                            <span className="plot-label">{plot.label}</span>
                          </div>
                          {occupant.status === 'building' ? (
                            <div className="plot-progress">
                              <div className="plot-progress-bar" style={{ width: `${Math.round(occupant.progress * 100)}%` }} />
                              <span className="plot-progress-text">Bouw {Math.round(occupant.progress * 100)}%</span>
                            </div>
                          ) : (
                            <p className="plot-description">{occupant.lore}</p>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="plot-name">{plot.label}</div>
                          <p className="plot-description">
                            {plot.locked
                              ? plot.unlockDescription
                              : 'Vrije kavel: kies een bouwactie in het HUD om deze plek te benutten.'}
                          </p>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              )
            }

            return <div key={key} className={`map-tile ${baseClass}`} />
          }),
        )}
      </div>
      <MapLegend />
    </div>
  )
}

export default CampusMap
