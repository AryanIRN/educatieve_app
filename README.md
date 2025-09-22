# Web3 Impact Tycoon

Een educatieve blockchain-tycoon game waarin studenten op een speelse manier de kernprincipes van web3 beleven. Bouw in een 3D-campus miners, validators en smart contract hubs, beheer je tokens als een echte tycoon en volg tutorials die mining, consensusmechanismen en governance stap voor stap uitleggen. De opdracht is ontwikkeld voor de Web3 Impact Hub (Hogeschool Utrecht) en draagt bij aan SDG-4 (kwaliteitsonderwijs) door actief leren te stimuleren.

## Belangrijkste features
- **Volledige 3D-campus** – Met behulp van Three.js en react-three-fiber verken je een futuristische blockchain-campus. Klik op gebouwen om uitleg te krijgen over hun rol in het netwerk.
- **Tycoon-gameplay** – Verzamel tokens, kennis en reputatie. Bouw nieuwe nodes, upgrade infrastructuur en balanceer energieverbruik versus netwerkgezondheid.
- **Interactieve tutorials** – Een begeleid leerpad legt mining, consensus, smart contracts en governance uit. Doelen en tips helpen studenten zelfstandig verder.
- **Consensus-simulatie** – Schakel tussen Proof-of-Work, Proof-of-Stake en PBFT om verschillen in energiegebruik, finaliteit en veiligheid te ervaren.
- **Smart contract automation** – Deploy contractniveaus om certificaten en beloningen automatisch uit te keren. Workshops verhogen kennis en betrokken studenten.
- **Educatieve inzichten** – Accordion-panels en een glossarium koppelen elke game-actie aan theorie, ethiek en juridische reflectie rond blockchain.

## Installatie
1. Zorg dat [Node.js](https://nodejs.org/) versie 18 of hoger is geïnstalleerd.
2. Installeer dependencies:
   ```bash
   npm install
   ```
3. Start de ontwikkelserver:
   ```bash
   npm run dev
   ```
4. Navigeer in de browser naar de URL die Vite toont (standaard `http://localhost:5173`).

## Beschikbare scripts
- `npm run dev` – start de ontwikkelserver met hot module reloading.
- `npm run build` – bouwt een productieversie van de app.
- `npm run preview` – bekijk de productiebuild lokaal.
- `npm run lint` – voer ESLint-controles uit.

## Technologieën
- [React](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) voor bundling en development
- [Bootstrap 5](https://getbootstrap.com/) & [React-Bootstrap](https://react-bootstrap.github.io/) voor UI-componenten
- [three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction) en [@react-three/drei](https://github.com/pmndrs/drei) voor de 3D-wereld
- [nanoid](https://github.com/ai/nanoid) voor unieke IDs

## Didactische tips
- Gebruik de activiteitenfeed en tutorialkaart voor begeleide lessen of zelfstudie.
- Laat studenten scenario’s uitwerken (bijv. energiecrisis of smart contract bug) met behulp van de tycoon-metrics.
- Verbind interviews of literatuur aan de insights-accordion om blended learning te faciliteren.

Veel plezier met het bouwen van je eigen blockchain-impact hub! 🚀
