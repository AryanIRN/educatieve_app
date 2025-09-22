# Educatieve blockchain-app

Deze webapplicatie is ontwikkeld voor de Web3 Impact Hub van Hogeschool Utrecht. Studenten ontdekken op een speelse manier de kernprincipes van blockchain, zoals mining, tokens, smart contracts en consensus. De applicatie is gebouwd met React, TypeScript, Vite en Bootstrap.

## Functionaliteiten
- **Walletbeheer** – Maak wallets aan, verbind er één en bekijk balans, staking en behaalde badges.
- **Token oefenarena** – Verstuur EduTokens tussen wallets en volg openstaande transacties in de mempool.
- **Mining simulator** – Ervaar proof-of-work, proof-of-stake en PBFT met een visuele voortgang en instelbare moeilijkheid.
- **Smart contract lab** – Stake tokens in leerquests, voltooi uitdagingen en ontvang beloningen via automatische contractlogica.
- **Consensus speelplaats** – Simuleer rondes tussen netwerkdeelnemers en zie hoe stemmen, rekenkracht en staking het resultaat bepalen.
- **Blockchainvisualisatie** – Bekijk de keten als kaarten met blokdetails, transacties en hashes.
- **Activiteitenfeed & leerpad** – Real-time uitleg bij elke stap en een overzichtelijk leerpad volgens SDG 4 (kwaliteitsonderwijs).

## Installatie
1. Zorg dat [Node.js](https://nodejs.org/) is geïnstalleerd (versie 18 of hoger aanbevolen).
2. Installeer de dependencies:
   ```bash
   npm install
   ```
3. Start de ontwikkelserver:
   ```bash
   npm run dev
   ```
4. Open de applicatie in de browser op de URL die Vite toont (standaard `http://localhost:5173`).

## Scripts
- `npm run dev` – start de ontwikkelserver met hot module reloading.
- `npm run build` – bouwt de geoptimaliseerde productieversie.
- `npm run preview` – bekijk de productiebuild lokaal.
- `npm run lint` – controleer de codebase met ESLint.

## Technologieën
- [React](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) als ontwikkeltool
- [React-Bootstrap](https://react-bootstrap.github.io/) en [Bootstrap 5](https://getbootstrap.com/)
- [crypto-js](https://github.com/brix/crypto-js) voor hashfuncties
- [nanoid](https://github.com/ai/nanoid) voor unieke ID's

## Verdere ontwikkeling
- Voeg extra quests of contracttypen toe om juridische en governance-aspecten uit te diepen.
- Koppel interviews of lesmateriaal aan de leerpadkaarten voor blended learning.
- Breid de consensus-speelplaats uit met scenario's zoals netwerkstoringen of byzantijnse deelnemers.

Veel leerplezier met het verkennen van web3! 🎓
