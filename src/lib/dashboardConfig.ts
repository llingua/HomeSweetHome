export type WidgetType =
  | 'stat'
  | 'toggle'
  | 'slider'
  | 'chart'
  | 'list'
  | 'climate'
  | 'map';

export type DashboardWidget = {
  id: string;
  title: string;
  type: WidgetType;
  entityId?: string;
  chartEntityIds?: string[];
  chartRangeHours?: number;
  chartMode?: 'history' | 'forecast';
  chartEntityLabels?: Record<string, string>;
  chartEntityColors?: Record<string, string>;
  unit?: string;
  span?: number;
};

export type DashboardView = {
  id: string;
  name: string;
  widgets: DashboardWidget[];
};

export type DashboardConfig = {
  views: DashboardView[];
  updatedAt: string;
};

export const defaultConfig: DashboardConfig = {
  views: [
    {
      id: 'home',
      name: 'Overview',
      widgets: [
        { id: 'w-energy', title: 'Energia in tempo reale', type: 'chart', span: 2 },
        { id: 'w-climate', title: 'Comfort zone', type: 'climate' },
        { id: 'w-devices', title: 'Sensori principali', type: 'list', span: 2 },
        { id: 'w-map', title: 'Mappa dispositivi', type: 'map' },
      ],
    },
    {
      id: 'automation',
      name: 'Automazioni',
      widgets: [
        { id: 'w-scenes', title: 'Scene rapide', type: 'list' },
        { id: 'w-switches', title: 'Toggle principali', type: 'toggle' },
        { id: 'w-lights', title: 'Illuminazione', type: 'slider', span: 2 },
      ],
    },
    {
      id: 'energy',
      name: 'Energia',
      widgets: [
        { id: 'w-energy-1', title: 'Consumi', type: 'chart', span: 2 },
        { id: 'w-energy-2', title: 'Batteria', type: 'stat' },
        { id: 'w-energy-3', title: 'Produzione', type: 'stat' },
      ],
    },
  ],
  updatedAt: new Date().toISOString(),
};
