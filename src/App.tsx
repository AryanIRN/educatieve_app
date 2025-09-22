import { useMemo, useState } from 'react'
import { Container } from 'react-bootstrap'
import CryptoJS from 'crypto-js'
import { nanoid } from 'nanoid'
import HeaderIntro from './components/HeaderIntro'
import WalletManager from './components/WalletManager'
import TokenPlayground from './components/TokenPlayground'
import MiningSimulator from './components/MiningSimulator'
import BlockchainVisualizer from './components/BlockchainVisualizer'
import SmartContractLab from './components/SmartContractLab'
import ConsensusPlayground from './components/ConsensusPlayground'
import ActivityFeed from './components/ActivityFeed'
import LearningGuide from './components/LearningGuide'
import type {
  Block,
  ConsensusHistoryEntry,
  ConsensusMode,
  ConsensusNode,
  ContractHistoryEntry,
  SmartContractState,
  Transaction,
  Wallet,
} from './types'
import './App.css'

const colors = ['primary', 'success', 'info', 'warning', 'danger'] as const

const createAddress = () => `0x${nanoid(10).toUpperCase()}`

const createInitialData = () => {
  const baseNames = ['Ayla', 'Bram', 'Chiara']
  const wallets: Wallet[] = baseNames.map((name, index) => ({
    id: nanoid(),
    name,
    address: createAddress(),
    balance: 100 - index * 10 + 20,
    staked: 0,
    color: colors[index % colors.length],
    achievements: [],
  }))
  const genesisTransactions: Transaction[] = wallets.map((wallet) => ({
    id: `genesis-${wallet.id}`,
    from: 'Web3 Impact Hub',
    to: wallet.id,
    amount: wallet.balance,
    note: 'Startbalans voor de simulatie',
    type: 'reward',
  }))
  const genesisBlock: Block = {
    index: 0,
    timestamp: new Date().toISOString(),
    nonce: 0,
    difficulty: 1,
    previousHash: '0'.repeat(64),
    hash: CryptoJS.SHA256(JSON.stringify(genesisTransactions)).toString(),
    miner: 'Web3 Impact Hub',
    consensus: 'pow',
    transactions: genesisTransactions,
  }
  return { wallets, genesisBlock }
}

const pickWeighted = <T,>(items: T[], weightFn: (item: T) => number) => {
  if (items.length === 0) return null
  const total = items.reduce((sum, item) => sum + Math.max(0, weightFn(item)), 0)
  if (total === 0) return items[0]
  let threshold = Math.random() * total
  for (const item of items) {
    threshold -= Math.max(0, weightFn(item))
    if (threshold <= 0) return item
  }
  return items[items.length - 1]
}

const learningTips = [
  {
    icon: '🎒',
    title: '1. Kies je rol en wallet',
    description:
      'Start met het verbinden van een wallet. Ontdek hoe een publiek adres eruitziet en welke tokens je krijgt.',
  },
  {
    icon: '⚒️',
    title: '2. Mine of valideer een blok',
    description:
      'Pas de moeilijkheid aan, kies een consensusmechanisme en ervaar hoe transacties definitief worden.',
  },
  {
    icon: '📜',
    title: '3. Experimenteer met smart contracts',
    description:
      'Stake tokens in een leerquest en claim je beloning. Zo zie je hoe automatische afspraken werken.',
  },
  {
    icon: '🧠',
    title: '4. Speel met consensus',
    description:
      'Gebruik de consensus speelplaats om te testen hoe stemrondes, staking en mining elkaar beïnvloeden.',
  },
]

function App() {
  const initialData = useMemo(() => createInitialData(), [])
  const [wallets, setWallets] = useState<Wallet[]>(initialData.wallets)
  const [blocks, setBlocks] = useState<Block[]>([initialData.genesisBlock])
  const [connectedWalletId, setConnectedWalletId] = useState(initialData.wallets[0]?.id ?? '')
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([])
  const [difficulty, setDifficulty] = useState(2)
  const [consensusMode, setConsensusMode] = useState<ConsensusMode>('pow')
  const [miningState, setMiningState] = useState<'idle' | 'mining' | 'complete'>('idle')
  const [miningProgress, setMiningProgress] = useState(0)
  const [activityMessages, setActivityMessages] = useState<string[]>([])
  const [contractState, setContractState] = useState<SmartContractState>({
    lockedTokens: 0,
    stakes: {},
    history: [],
  })
  const [consensusNodes, setConsensusNodes] = useState<ConsensusNode[]>([
    {
      id: 'node-1',
      name: 'Validator Vega',
      role: 'Validator',
      power: 40,
      stake: 18,
      reliability: 0.87,
      wins: 0,
      lastAction: 'Klaar voor een nieuwe ronde',
      color: 'primary',
    },
    {
      id: 'node-2',
      name: 'Miner Malik',
      role: 'Miner',
      power: 65,
      stake: 10,
      reliability: 0.7,
      wins: 0,
      lastAction: 'Observeert het netwerk',
      color: 'success',
    },
    {
      id: 'node-3',
      name: 'Validator Noor',
      role: 'Validator',
      power: 30,
      stake: 22,
      reliability: 0.9,
      wins: 0,
      lastAction: 'Wacht op een voorstel',
      color: 'info',
    },
  ])
  const [consensusHistory, setConsensusHistory] = useState<ConsensusHistoryEntry[]>([])
  const [lastConsensusMessage, setLastConsensusMessage] = useState<string | null>(null)

  const getAvailableBalance = (walletId: string) => {
    const wallet = wallets.find((item) => item.id === walletId)
    if (!wallet) return 0
    const reserved = pendingTransactions
      .filter(
        (tx) =>
          tx.from === walletId &&
          (tx.type === 'transfer' || (tx.type === 'contract' && tx.metadata?.contractAction === 'deposit')),
      )
      .reduce((sum, tx) => sum + tx.amount, 0)
    return Math.max(0, wallet.balance - reserved)
  }

  const availableBalance = getAvailableBalance(connectedWalletId)

  const logMessage = (message: string) => {
    setActivityMessages((prev) => [message, ...prev.slice(0, 9)])
  }

  const handleCreateWallet = (name: string) => {
    const baseBalance = 80 + Math.floor(Math.random() * 40)
    const newWallet: Wallet = {
      id: nanoid(),
      name,
      address: createAddress(),
      balance: baseBalance,
      staked: 0,
      color: colors[(wallets.length + 1) % colors.length],
      achievements: [],
    }
    setWallets((prev) => [...prev, newWallet])
    logMessage(`🆕 Nieuwe wallet ${name} aangemaakt met ${baseBalance} EduTokens.`)
  }

  const handleTransfer = (toId: string, amount: number, note: string) => {
    const sender = wallets.find((wallet) => wallet.id === connectedWalletId)
    const receiver = wallets.find((wallet) => wallet.id === toId)
    const transfer: Transaction = {
      id: nanoid(),
      from: connectedWalletId,
      to: toId,
      amount,
      note: note || 'Token transfer',
      type: 'transfer',
    }
    setPendingTransactions((prev) => [...prev, transfer])
    logMessage(
      `💸 ${sender?.name ?? 'Wallet'} verstuurt ${amount} tokens naar ${receiver?.name ?? 'wallet'} (in mempool).`,
    )
  }

  const handleDeposit = (amount: number, questName: string, reward: number) => {
    if (amount > availableBalance) {
      logMessage('⚠️ Onvoldoende vrije tokens om deze stake te plaatsen. Mine eerst een blok of verlaag het bedrag.')
      return
    }
    const wallet = wallets.find((item) => item.id === connectedWalletId)
    const transaction: Transaction = {
      id: nanoid(),
      from: connectedWalletId,
      to: 'QuestContract',
      amount,
      note: `Stake voor ${questName}`,
      type: 'contract',
      metadata: { contractAction: 'deposit', questName, reward },
    }
    setPendingTransactions((prev) => [...prev, transaction])
    logMessage(`📜 ${wallet?.name ?? 'Wallet'} zet ${amount} tokens in voor '${questName}'.`)
  }

  const handleCompleteQuest = (questName: string, reward: number) => {
    const staked = contractState.stakes[connectedWalletId] ?? 0
    if (staked === 0) {
      logMessage('ℹ️ Er is geen bevestigde stake om vrij te geven. Mine eerst het stake-blok.')
      return
    }
    const payout = staked + reward
    const transaction: Transaction = {
      id: nanoid(),
      from: 'QuestContract',
      to: connectedWalletId,
      amount: payout,
      note: `Quest voltooid: ${questName}`,
      type: 'contract',
      metadata: { contractAction: 'complete', questName, reward, depositReleased: staked },
    }
    setPendingTransactions((prev) => [...prev, transaction])
    logMessage(`🏆 Uitbetaling aangevraagd voor '${questName}' met ${payout} tokens.`)
  }

  const applyBlockEffects = (block: Block) => {
    setWallets((prev) => {
      const updated = prev.map((wallet) => ({ ...wallet, achievements: [...wallet.achievements] }))
      const findWallet = (id: string) => updated.find((wallet) => wallet.id === id)
      block.transactions.forEach((tx) => {
        if (tx.type === 'transfer') {
          const fromWallet = findWallet(tx.from)
          const toWallet = findWallet(tx.to)
          if (fromWallet) fromWallet.balance = Math.max(0, fromWallet.balance - tx.amount)
          if (toWallet) toWallet.balance += tx.amount
        } else if (tx.type === 'reward') {
          const rewardWallet = findWallet(tx.to)
          if (rewardWallet) rewardWallet.balance += tx.amount
        } else if (tx.type === 'contract') {
          if (tx.metadata?.contractAction === 'deposit') {
            const fromWallet = findWallet(tx.from)
            if (fromWallet) {
              fromWallet.balance = Math.max(0, fromWallet.balance - tx.amount)
              fromWallet.staked += tx.amount
            }
          } else if (tx.metadata?.contractAction === 'complete') {
            const toWallet = findWallet(tx.to)
            if (toWallet) {
              const released = tx.metadata?.depositReleased ?? 0
              toWallet.staked = Math.max(0, toWallet.staked - released)
              toWallet.balance += tx.amount
            }
          }
        }
      })
      const minerWallet = findWallet(block.miner)
      if (minerWallet && !minerWallet.achievements.includes('⛏️ Eerste blok')) {
        minerWallet.achievements.push('⛏️ Eerste blok')
      }
      updated.forEach((wallet) => {
        if (wallet.staked > 0 && !wallet.achievements.includes('🪙 Stakingheld')) {
          wallet.achievements.push('🪙 Stakingheld')
        }
      })
      return updated
    })

    setContractState((prev) => {
      let locked = prev.lockedTokens
      const stakes = { ...prev.stakes }
      let history = [...prev.history]
      block.transactions.forEach((tx) => {
        if (tx.type !== 'contract') return
        if (tx.metadata?.contractAction === 'deposit') {
          locked += tx.amount
          stakes[tx.from] = (stakes[tx.from] ?? 0) + tx.amount
          const entry: ContractHistoryEntry = {
            id: tx.id,
            walletId: tx.from,
            action: 'deposit',
            amount: tx.amount,
            reward: 0,
            timestamp: block.timestamp,
            description: `Stake voor ${tx.metadata?.questName ?? 'leerquest'}`
          }
          history = [entry, ...history].slice(0, 12)
        }
        if (tx.metadata?.contractAction === 'complete') {
          const released = tx.metadata?.depositReleased ?? 0
          locked = Math.max(0, locked - released)
          stakes[tx.to] = Math.max(0, (stakes[tx.to] ?? 0) - released)
          const entry: ContractHistoryEntry = {
            id: tx.id,
            walletId: tx.to,
            action: 'complete',
            amount: released,
            reward: tx.metadata?.reward ?? 0,
            timestamp: block.timestamp,
            description: `Quest voltooid: ${tx.metadata?.questName ?? 'leerquest'}`
          }
          history = [entry, ...history].slice(0, 12)
        }
      })
      return { lockedTokens: locked, stakes, history }
    })
  }

  const finalizeBlock = (block: Block, successMessage?: string) => {
    const minerName = wallets.find((wallet) => wallet.id === block.miner)?.name ?? block.miner
    setBlocks((prev) => [...prev, block])
    setPendingTransactions([])
    applyBlockEffects(block)
    setMiningState('complete')
    setMiningProgress(100)
    logMessage(
      successMessage ??
        `✅ Blok #${block.index} toegevoegd door ${minerName}. ${block.transactions.length} transacties vastgelegd.`,
    )
    setTimeout(() => {
      setMiningState('idle')
      setMiningProgress(0)
    }, 1500)
  }

  const simulateProofOfWork = async (minerId: string) => {
    const miner = wallets.find((wallet) => wallet.id === minerId)
    setMiningState('mining')
    setMiningProgress(5)
    const pending = [...pendingTransactions]
    if (pending.length === 0) {
      logMessage('ℹ️ Voeg eerst transacties toe voordat je gaat minen.')
      setMiningState('idle')
      setMiningProgress(0)
      return
    }
    const rewardAmount = 6 + pending.length
    const reward: Transaction = {
      id: nanoid(),
      from: 'Netwerk',
      to: minerId,
      amount: rewardAmount,
      note: 'Mining beloning',
      type: 'reward',
    }
    const previousHash = blocks[blocks.length - 1].hash
    const target = '0'.repeat(difficulty)
    let nonce = 0
    let hash = ''
    const payload = JSON.stringify(pending)
    while (!hash.startsWith(target)) {
      nonce += 1
      hash = CryptoJS.SHA256(`${previousHash}-${payload}-${nonce}`).toString()
      if (nonce % 800 === 0) {
        setMiningProgress(Math.min(95, (nonce / (8000 * difficulty)) * 100))
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }
    setMiningProgress(98)
    const block: Block = {
      index: blocks.length,
      timestamp: new Date().toISOString(),
      nonce,
      difficulty,
      previousHash,
      hash,
      miner: minerId,
      consensus: 'pow',
      transactions: [...pending, reward],
    }
    finalizeBlock(
      block,
      `⛏️ Proof-of-Work: ${miner?.name ?? 'Miner'} vond een nonce na ${nonce.toLocaleString()} pogingen.`,
    )
  }

  const simulateProofOfStake = async () => {
    setMiningState('mining')
    setMiningProgress(10)
    const validators = wallets.filter((wallet) => wallet.staked > 0)
    if (validators.length === 0) {
      logMessage('ℹ️ Geen validators met staking. Stake tokens via het smart contract.')
      setMiningState('idle')
      setMiningProgress(0)
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 400))
    const chosen = pickWeighted(validators, (wallet) => wallet.staked) ?? validators[0]
    setMiningProgress(60)
    await new Promise((resolve) => setTimeout(resolve, 400))
    const rewardAmount = Math.max(3, Math.round(chosen.staked * 0.2) + pendingTransactions.length)
    const reward: Transaction = {
      id: nanoid(),
      from: 'Netwerk',
      to: chosen.id,
      amount: rewardAmount,
      note: 'Validator beloning',
      type: 'reward',
    }
    const block: Block = {
      index: blocks.length,
      timestamp: new Date().toISOString(),
      nonce: Math.floor(Math.random() * 1000),
      difficulty,
      previousHash: blocks[blocks.length - 1].hash,
      hash: CryptoJS.SHA256(`${Date.now()}-${chosen.id}-${Math.random()}`).toString(),
      miner: chosen.id,
      consensus: 'pos',
      transactions: [...pendingTransactions, reward],
    }
    finalizeBlock(block, `🌱 Proof-of-Stake: ${chosen.name} ontving ${rewardAmount} tokens als beloning.`)
  }

  const simulatePBFT = async (proposerId: string) => {
    setMiningState('mining')
    setMiningProgress(15)
    await new Promise((resolve) => setTimeout(resolve, 400))
    const votes = consensusNodes.map((node) => ({ node, agree: Math.random() < node.reliability }))
    const agreeing = votes.filter((vote) => vote.agree)
    const threshold = Math.ceil((2 / 3) * consensusNodes.length)
    if (agreeing.length < threshold) {
      setConsensusNodes((prev) =>
        prev.map((node) => ({
          ...node,
          lastAction: votes.find((vote) => vote.node.id === node.id)?.agree ? 'Stem: akkoord' : 'Stem: afwezig',
        })),
      )
      logMessage(`⚠️ PBFT consensus mislukte: ${agreeing.length}/${consensusNodes.length} validators akkoord.`)
      setMiningState('idle')
      setMiningProgress(0)
      return
    }
    const proposer = wallets.find((wallet) => wallet.id === proposerId) ?? wallets[0]
    const rewardAmount = 4 + pendingTransactions.length
    const reward: Transaction = {
      id: nanoid(),
      from: 'Netwerk',
      to: proposer.id,
      amount: rewardAmount,
      note: 'PBFT beloning',
      type: 'reward',
    }
    const block: Block = {
      index: blocks.length,
      timestamp: new Date().toISOString(),
      nonce: Math.floor(Math.random() * 500),
      difficulty,
      previousHash: blocks[blocks.length - 1].hash,
      hash: CryptoJS.SHA256(`pbft-${Date.now()}-${Math.random()}`).toString(),
      miner: proposer.id,
      consensus: 'pbft',
      transactions: [...pendingTransactions, reward],
    }
    setConsensusNodes((prev) =>
      prev.map((node) => ({
        ...node,
        wins: node.id === proposer.id ? node.wins + 1 : node.wins,
        lastAction: votes.find((vote) => vote.node.id === node.id)?.agree
          ? node.id === proposer.id
            ? '🏆 Leider van deze PBFT ronde'
            : 'Stem: akkoord'
          : 'Stem: afwezig',
      })),
    )
    finalizeBlock(block, `🤝 PBFT: ${agreeing.length} validators keurden het blok goed. Beloning voor ${proposer.name}.`)
  }

  const mineBlock = async (minerId: string) => {
    if (pendingTransactions.length === 0) {
      logMessage('ℹ️ Geen transacties in de mempool. Voeg transfers of contractacties toe.')
      return
    }
    if (consensusMode === 'pow') {
      await simulateProofOfWork(minerId)
    } else if (consensusMode === 'pos') {
      await simulateProofOfStake()
    } else {
      await simulatePBFT(minerId)
    }
  }

  const runConsensusRound = () => {
    setConsensusNodes((prevNodes) => {
      let winner: ConsensusNode | null = null
      let message = ''
      let updatedNodes: ConsensusNode[] = prevNodes

      if (consensusMode === 'pbft') {
        const votes = prevNodes.map((node) => ({ node, agree: Math.random() < node.reliability }))
        const agreeing = votes.filter((vote) => vote.agree)
        const threshold = Math.ceil((2 / 3) * prevNodes.length)
        if (agreeing.length >= threshold) {
          winner = agreeing.sort((a, b) => b.node.reliability - a.node.reliability)[0]?.node ?? prevNodes[0]
          message = `PBFT geslaagd: ${agreeing.length}/${prevNodes.length} validators akkoord. ${winner.name} leidde de ronde.`
          updatedNodes = prevNodes.map((node) => ({
            ...node,
            wins: node.id === winner?.id ? node.wins + 1 : node.wins,
            lastAction: votes.find((vote) => vote.node.id === node.id)?.agree
              ? node.id === winner?.id
                ? '🏆 Leider van deze ronde'
                : 'Stem: akkoord'
              : 'Stem: afwezig',
          }))
        } else {
          message = `PBFT ronde faalde: ${agreeing.length}/${prevNodes.length} validators stemden mee.`
          updatedNodes = prevNodes.map((node) => ({
            ...node,
            lastAction: votes.find((vote) => vote.node.id === node.id)?.agree ? 'Stem: akkoord' : 'Stem: afwezig',
          }))
        }
      } else if (consensusMode === 'pow') {
        winner = pickWeighted(prevNodes, (node) => (node.role === 'Miner' ? node.power : node.power / 2)) ?? prevNodes[0]
        message = `${winner.name} wint via proof-of-work dankzij ${winner.power} hashpower.`
        updatedNodes = prevNodes.map((node) => ({
          ...node,
          wins: node.id === winner?.id ? node.wins + 1 : node.wins,
          lastAction: node.id === winner?.id ? '🏆 Loste de puzzel' : `Probeert met power ${node.power}`,
        }))
      } else {
        winner = pickWeighted(prevNodes, (node) => Math.max(1, node.stake)) ?? prevNodes[0]
        message = `${winner.name} werd geselecteerd dankzij ${winner.stake} stake.`
        updatedNodes = prevNodes.map((node) => ({
          ...node,
          wins: node.id === winner?.id ? node.wins + 1 : node.wins,
          lastAction: node.id === winner?.id ? '🏆 Geselecteerd als validator' : `Staat klaar met ${node.stake} stake`,
        }))
      }

      setConsensusHistory((prevHistory) => [
        {
          id: nanoid(),
          mode: consensusMode,
          message,
          timestamp: new Date().toISOString(),
          winningNodeId: winner?.id,
        },
        ...prevHistory,
      ].slice(0, 10))
      setLastConsensusMessage(message)
      logMessage(`🧠 ${message}`)
      return updatedNodes
    })
  }

  const handleConsensusModeChange = (mode: ConsensusMode) => {
    if (mode === consensusMode) return
    setConsensusMode(mode)
    logMessage(`🔄 Consensusmodus gewijzigd naar ${mode.toUpperCase()}.`)
  }

  const handleGetStarted = () => {
    document.getElementById('wallets')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="App">
      <HeaderIntro onGetStarted={handleGetStarted} />
      <Container className="py-5">
        <WalletManager
          wallets={wallets}
          connectedWalletId={connectedWalletId}
          onSelect={setConnectedWalletId}
          onCreate={handleCreateWallet}
        />
        <TokenPlayground
          wallets={wallets}
          connectedWalletId={connectedWalletId}
          pendingTransactions={pendingTransactions}
          availableBalance={availableBalance}
          onTransfer={handleTransfer}
        />
        <MiningSimulator
          wallets={wallets}
          connectedWalletId={connectedWalletId}
          pendingTransactions={pendingTransactions}
          difficulty={difficulty}
          consensusMode={consensusMode}
          miningState={miningState}
          miningProgress={miningProgress}
          onDifficultyChange={setDifficulty}
          onMine={(minerId) => {
            void mineBlock(minerId)
          }}
          onConsensusModeChange={handleConsensusModeChange}
        />
        <BlockchainVisualizer blocks={blocks} wallets={wallets} />
        <SmartContractLab
          wallets={wallets}
          connectedWalletId={connectedWalletId}
          contractState={contractState}
          pendingTransactions={pendingTransactions}
          onDeposit={handleDeposit}
          onComplete={handleCompleteQuest}
        />
        <ConsensusPlayground
          mode={consensusMode}
          nodes={consensusNodes}
          history={consensusHistory}
          lastMessage={lastConsensusMessage}
          onModeChange={handleConsensusModeChange}
          onRunRound={runConsensusRound}
        />
        <ActivityFeed messages={activityMessages} />
        <LearningGuide tips={learningTips} />
      </Container>
      <footer className="app-footer text-center py-4">
        <small>
          Web3 Impact Hub · Educatieve blockchain simulatie · SDG 4 Kwaliteitsonderwijs
        </small>
      </footer>
    </div>
  )
}

export default App
