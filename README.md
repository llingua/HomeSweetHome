# HomeSweetHome

Dashboard Home Assistant in stile iOS 26 "liquid glass" con Next.js (App Router) e UI premium.

## Stack
- Next.js App Router + React
- Tailwind + CSS variables per token glass
- Radix UI per interazioni accessibili
- TanStack Query + Zustand
- TanStack Virtual per liste data-heavy
- MapLibre GL per mappe
- Recharts per grafici

## Struttura
- `src/app` App Router
- `src/components/ui` design system glass
- `src/components/dashboard` demo dashboard
- `src/components/legacy` copertura componenti ha-fusion
- `addon-homesweethome` configurazione Home Assistant add-on

## Sviluppo locale
```bash
npm install
npm run dev
```

Apri `http://localhost:3000`.

### Collegamento Home Assistant (locale)
Imposta un token di Home Assistant per leggere le entita e inviare comandi:
```bash
export HA_BASE_URL="http://localhost:8123/api"
export HA_TOKEN="LONG_LIVED_TOKEN"
npm run dev
```

## Build e run produzione
```bash
npm run build
npm run start
```

### Avvio su porta custom
```bash
PORT=8092 npm run start
```

## Add-on Home Assistant
La directory `addon-homesweethome` contiene il package add-on. Usa `repository.yaml` alla root per registrare il repository in Home Assistant.

Parametri principali:
- slug: `homesweethome`
- porta ingress: `8092`
- nome add-on: HomeSweetHome Dashboard
- dati separati: `homesweethome`

In add-on, l'accesso a Home Assistant usa il token Supervisor (`SUPERVISOR_TOKEN`) senza configurazioni extra.

### Installazione add-on (Home Assistant)
1. Aggiungi questo repo come custom repository in Home Assistant (Supervisor → Add-on Store).
2. Installa l'add-on "HomeSweetHome Dashboard".
3. Avvia l'add-on e apri l'ingress.

### Build add-on (locale)
```bash
docker build -t homesweethome-addon ./addon-homesweethome
```

### Deploy produzione
- Pubblica immagini multi-arch con tag `ghcr.io/llingua/homesweethome-{arch}`.
- Verifica ingress attivo su porta `8092`.
- Se cambi repository/branch aggiorna `addon-homesweethome/Dockerfile`.

## Checklist finale
- `npm run lint`
- `npm run build`
- `npm run start`
- Verifica dashboard desktop + mobile
- Verifica ingress add-on (porta 8092) e slug `homesweethome`
- Verifica immagini `homesweethome-{arch}` pubblicate

## Note
Le componenti legacy sono mappate in `src/components/legacy/LegacyRegistry.tsx` e possono essere collegate alla logica HA reale.
