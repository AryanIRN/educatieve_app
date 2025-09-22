import { Canvas } from '@react-three/fiber'
import { Float, Html, OrbitControls, Stars } from '@react-three/drei'
import type { ChainBlock, GameNode } from '../hooks/useTycoonGame'
import { useMemo } from 'react'

const NODE_COLORS: Record<GameNode['type'], string> = {
  miner: '#ffb703',
  validator: '#06d6a0',
  dapp: '#a855f7',
  research: '#2196f3',
}

const NODE_EMISSIVE: Record<GameNode['type'], string> = {
  miner: '#fb8500',
  validator: '#219653',
  dapp: '#7c3aed',
  research: '#2563eb',
}

const typeLabel: Record<GameNode['type'], string> = {
  miner: 'Proof-of-Work',
  validator: 'Proof-of-Stake',
  dapp: 'Smart Contracts',
  research: 'Research & Governance',
}

interface NodeProps {
  node: GameNode
  selected: boolean
  onSelect: (id: string) => void
}

const NodeBuilding = ({ node, selected, onSelect }: NodeProps) => {
  const color = NODE_COLORS[node.type]
  const emissive = NODE_EMISSIVE[node.type]
  const highlight = selected ? 0.6 : 0.25
  return (
    <Float
      rotationIntensity={0.1}
      floatIntensity={selected ? 1.4 : 0.6}
      speed={selected ? 2 : 1.2}
      position={node.position}
    >
      <group
        onClick={(event) => {
          event.stopPropagation()
          onSelect(node.id)
        }}
        onPointerOver={(event) => event.stopPropagation()}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.8, 1.5 + node.level * 0.35, 1.8]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={highlight}
            metalness={0.2}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, 1 + node.level * 0.35, 0]}>
          <boxGeometry args={[1.2, 0.2, 1.2]} />
          <meshStandardMaterial color="#0d1b2a" metalness={0.4} roughness={0.8} />
        </mesh>
        <Html
          center
          distanceFactor={10}
          position={[0, 1.3 + node.level * 0.4, 0]}
          className="node-label"
        >
          <div>
            <strong>{node.name}</strong>
            <small>{typeLabel[node.type]}</small>
          </div>
        </Html>
      </group>
    </Float>
  )
}

interface ChainProps {
  chain: ChainBlock[]
}

const BlockchainRibbon = ({ chain }: ChainProps) => {
  const positions = useMemo(
    () =>
      chain.map((block, index) => ({
        block,
        position: [-10 + index * 2.2, 0.4, 4] as [number, number, number],
      })),
    [chain],
  )
  return (
    <group>
      {positions.map(({ block, position }) => (
        <Float key={block.id} position={position} floatIntensity={0.5} speed={1}>
          <mesh>
            <boxGeometry args={[1.6, 0.8, 1.6]} />
            <meshStandardMaterial
              color={block.consensus === 'pow' ? '#ffd166' : block.consensus === 'pos' ? '#8ecae6' : '#ef476f'}
              emissive={block.consensus === 'pow' ? '#f77f00' : block.consensus === 'pos' ? '#219ebc' : '#d62839'}
              emissiveIntensity={0.45}
              metalness={0.3}
              roughness={0.25}
            />
          </mesh>
          <Html center distanceFactor={12} className="block-label">
            <div>
              <strong>Blok {block.index}</strong>
              <small>{block.consensus.toUpperCase()}</small>
            </div>
          </Html>
        </Float>
      ))}
    </group>
  )
}

interface BlockchainWorldProps {
  nodes: GameNode[]
  chain: ChainBlock[]
  selectedNodeId: string | null
  onSelectNode: (id: string) => void
}

const BlockchainWorld = ({ nodes, chain, selectedNodeId, onSelectNode }: BlockchainWorldProps) => {
  return (
    <div className="world-container">
      <Canvas shadows camera={{ position: [0, 6, 12], fov: 55 }}>
        <color attach="background" args={[0.03, 0.05, 0.1]} />
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 12, 5]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-6, 5, -4]} intensity={0.6} color="#8ecae6" />
        <pointLight position={[6, 5, 4]} intensity={0.6} color="#ffafcc" />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={6} maxDistance={18} />
        <Stars radius={80} depth={40} count={8000} factor={4} saturation={0} fade />

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#14213d" metalness={0.1} roughness={0.8} />
        </mesh>

        <gridHelper args={[40, 20, '#0d6efd', '#0d6efd']} />

        {nodes.map((node) => (
          <NodeBuilding
            key={node.id}
            node={node}
            selected={node.id === selectedNodeId}
            onSelect={onSelectNode}
          />
        ))}

        <BlockchainRibbon chain={chain.slice(-8)} />
      </Canvas>
    </div>
  )
}

export default BlockchainWorld
