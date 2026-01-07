export const energySeries = [
  { time: '06:00', consumption: 2.2, solar: 0.4, grid: 1.8 },
  { time: '08:00', consumption: 3.1, solar: 1.1, grid: 2.0 },
  { time: '10:00', consumption: 2.8, solar: 2.6, grid: 0.4 },
  { time: '12:00', consumption: 3.9, solar: 3.6, grid: 0.5 },
  { time: '14:00', consumption: 4.1, solar: 3.2, grid: 1.1 },
  { time: '16:00', consumption: 3.5, solar: 2.1, grid: 1.4 },
  { time: '18:00', consumption: 3.8, solar: 0.8, grid: 3.0 },
  { time: '20:00', consumption: 2.9, solar: 0.2, grid: 2.7 },
];

export const climateZones = [
  { name: 'Salotto', temperature: 22.4, humidity: 46 },
  { name: 'Camera', temperature: 21.1, humidity: 52 },
  { name: 'Studio', temperature: 20.3, humidity: 41 },
];

export const scenes = [
  { name: 'Rientro', status: 'Attiva', tone: 'accent' },
  { name: 'Cinema', status: 'Pronta', tone: 'primary' },
  { name: 'Notte', status: 'Programmato', tone: 'ghost' },
];

export const comfortSeries = [
  { time: '06:00', temp: 20.1, humidity: 48 },
  { time: '09:00', temp: 21.4, humidity: 45 },
  { time: '12:00', temp: 22.6, humidity: 41 },
  { time: '15:00', temp: 23.1, humidity: 39 },
  { time: '18:00', temp: 22.2, humidity: 43 },
  { time: '21:00', temp: 21.3, humidity: 46 },
];

export const mapLocations: Array<{
  id: string;
  name: string;
  coords: [number, number];
  status: 'OK' | 'Allerta';
}> = [
  { id: 'hub', name: 'Hub Centrale', coords: [12.487, 41.894], status: 'OK' },
  { id: 'mesh-1', name: 'Mesh Nord', coords: [12.503, 41.912], status: 'OK' },
  { id: 'mesh-2', name: 'Mesh Sud', coords: [12.475, 41.885], status: 'Allerta' },
  { id: 'cam', name: 'Camera Est', coords: [12.515, 41.902], status: 'OK' },
];

export const devices = Array.from({ length: 120 }).map((_, index) => ({
  id: `device-${index + 1}`,
  name: `Sensore ${index + 1}`,
  status: index % 3 === 0 ? 'Allerta' : 'OK',
  value: `${18 + (index % 6)}°C`,
}));
