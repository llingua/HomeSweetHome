'use client';

import { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassSlider } from '@/components/ui/GlassSlider';
import { GlassToggle } from '@/components/ui/GlassToggle';
import { cn } from '@/lib/utils';

function LegacyShell({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <GlassCard className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink/90">{title}</h3>
        <span className="text-[10px] uppercase tracking-[0.3em] text-ink/50">core</span>
      </div>
      {children}
    </GlassCard>
  );
}

function LegacyModal({ title, summary }: { title: string; summary: string }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <GlassButton tone="ghost">Apri</GlassButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[min(90vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white/85 p-6 shadow-glass backdrop-blur-glass">
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-ink/70">
            {summary}
          </Dialog.Description>
          <div className="mt-5 space-y-3">
            <input
              className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm"
              placeholder="Nome"
            />
            <textarea
              className="min-h-[90px] w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm"
              placeholder="Note"
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <GlassButton tone="ghost">Chiudi</GlassButton>
            </Dialog.Close>
            <GlassButton tone="accent">Salva</GlassButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function BasicToggle({ label }: { label: string }) {
  const [checked, setChecked] = useState(true);
  return <GlassToggle checked={checked} onCheckedChange={setChecked} label={label} />;
}

function BasicSlider({ label }: { label: string }) {
  const [value, setValue] = useState([62]);
  return <GlassSlider value={value} onValueChange={setValue} label={label} />;
}

function ProgressBar() {
  const [value] = useState(72);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-ink/60">
        <span>Caricamento</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/30">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-sky-300/80 to-amber-200/80"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center gap-3 text-xs text-ink/60">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
      Sincronizzazione dati in corso
    </div>
  );
}

function Marquee() {
  return (
    <div className="relative overflow-hidden rounded-full bg-white/30 px-3 py-2">
      <div className="animate-[marquee_10s_linear_infinite] whitespace-nowrap text-xs text-ink/70">
        Scene attive · Luci serali · Modalita cinema · Risparmio energetico
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}

function CodeEditor() {
  return (
    <textarea
      className="min-h-[120px] w-full rounded-2xl border border-white/50 bg-white/70 p-3 font-mono text-xs"
      defaultValue={`// Custom logic\nreturn entity.state === 'on';`}
    />
  );
}

function InputClear() {
  const [value, setValue] = useState('Salotto');
  return (
    <div className="flex items-center gap-2">
      <input
        className="flex-1 rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <GlassButton tone="ghost" onClick={() => setValue('')}>
        Pulisci
      </GlassButton>
    </div>
  );
}

function ColorPicker() {
  const [color, setColor] = useState('#74c0fc');
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={color}
        onChange={(event) => setColor(event.target.value)}
      />
      <span className="text-xs text-ink/70">{color}</span>
    </div>
  );
}

function Select() {
  const [value, setValue] = useState('Auto');
  return (
    <select
      className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    >
      <option>Auto</option>
      <option>Eco</option>
      <option>Boost</option>
    </select>
  );
}

function SearchInput() {
  const [value, setValue] = useState('');
  return (
    <input
      className="w-full rounded-full border border-white/50 bg-white/70 px-4 py-2 text-sm"
      placeholder="Cerca dispositivo"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}

function CustomJs() {
  return (
    <textarea
      className="min-h-[90px] w-full rounded-2xl border border-white/50 bg-white/70 p-3 text-xs"
      defaultValue={`console.log('Custom JS');`}
    />
  );
}

function RangeSlider() {
  const [value, setValue] = useState([22]);
  return <GlassSlider value={value} onValueChange={setValue} label="Range" />;
}

function WheelPicker() {
  const options = ['00', '15', '30', '45'];
  const [value, setValue] = useState(options[1]);
  return (
    <select
      className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

function LightSlider() {
  const [value, setValue] = useState([78]);
  return <GlassSlider value={value} onValueChange={setValue} label="Luce" />;
}

function SimpleList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 text-xs text-ink/70">
      {items.map((item) => (
        <li key={item} className="flex items-center justify-between">
          <span>{item}</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
        </li>
      ))}
    </ul>
  );
}

function DividerLine() {
  return <div className="h-px w-full rounded-full bg-white/40" />;
}

function MediaPreview({ label }: { label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex h-24 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-white/50 to-white/10 text-xs text-ink/60">
        {label}
      </div>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-ink/50">
        <span>Live</span>
        <span>HD</span>
      </div>
    </div>
  );
}

function MiniChart({ label }: { label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-ink/50">
        <span>{label}</span>
        <span>oggi</span>
      </div>
      <div className="flex h-12 items-end gap-1">
        {[6, 10, 8, 12, 7, 9, 14].map((height, index) => (
          <div
            key={`${label}-${index}`}
            className="w-full rounded-full bg-gradient-to-t from-sky-300/70 to-amber-200/70"
            style={{ height: `${height * 4}px` }}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/50 bg-white/20 px-3 py-4 text-xs text-ink/60">
      Nessun dato disponibile per {label}
    </div>
  );
}

function StatusRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between text-xs text-ink/70">
      <span>{label}</span>
      <span className="rounded-full bg-emerald-200/70 px-2 py-1 text-[10px] uppercase tracking-[0.2em]">
        OK
      </span>
    </div>
  );
}

function TimeBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between text-xs text-ink/70">
      <span>{label}</span>
      <span className="rounded-full bg-white/60 px-2 py-1 text-[10px] uppercase tracking-[0.3em]">
        18:45
      </span>
    </div>
  );
}

function ActionPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs text-ink/60">
      <span>{label}</span>
      <GlassButton tone="ghost">Apri</GlassButton>
    </div>
  );
}

function fallbackRenderer(key: string, label: string) {
  if (key.includes('Toggle') || key.includes('Switch')) {
    return <BasicToggle label="On/Off" />;
  }

  if (key.includes('Slider') || key.includes('Resize') || key.includes('Drag')) {
    return <BasicSlider label="Intensita" />;
  }

  if (key.includes('Button') || key.endsWith('Button') || key.includes('Add')) {
    return <ActionPlaceholder label={label} />;
  }

  if (key.includes('Modal') || key.includes('Config') || key.includes('Editor') || key.includes('Templater')) {
    return <LegacyModal title={label} summary="Configura parametri e permessi." />;
  }

  if (
    key.includes('Camera') ||
    key.includes('Media') ||
    key.includes('Image') ||
    key.includes('Iframe') ||
    key.includes('Picture')
  ) {
    return <MediaPreview label="Preview media" />;
  }

  if (key.includes('Divider') || key.includes('Separator')) {
    return <DividerLine />;
  }

  if (key.includes('Time') || key.includes('Date')) {
    return <TimeBadge label={label} />;
  }

  if (key.includes('History') || key.includes('Notifications') || key.includes('Scenes') || key.includes('Views')) {
    return <SimpleList items={['Elemento 1', 'Elemento 2', 'Elemento 3']} />;
  }

  if (key.includes('Graph') || key.includes('Bar') || key.includes('Radial')) {
    return <MiniChart label={label} />;
  }

  if (key.includes('Sensor') || key.includes('Template') || key.includes('Navigate')) {
    return <StatusRow label={label} />;
  }

  if (key.includes('Input') || key.includes('Text')) {
    return <InputClear />;
  }

  if (key.includes('Index') || key.includes('Content') || key.includes('Section')) {
    return <SimpleList items={['Nodo A', 'Nodo B', 'Nodo C']} />;
  }

  if (key.includes('Empty') || key.includes('Unknown') || key.includes('Broken')) {
    return <EmptyState label={label} />;
  }

  return <ActionPlaceholder label={label} />;
}

function useRenderer(key: string, label: string) {
  return useMemo(() => {
    const overrides: Record<string, React.ReactNode> = {
      ColorPicker: <ColorPicker />,
      Loader: <Loader />,
      InputClear: <InputClear />,
      CustomJs: <CustomJs />,
      Marquee: <Marquee />,
      Progress: <ProgressBar />,
      WheelPicker: <WheelPicker />,
      TokenModal: <LegacyModal title={label} summary="Gestisci token e permessi." />,
      CodeEditor: <CodeEditor />,
      RangeSlider: <RangeSlider />,
      ResizeHandle: <BasicSlider label="Ridimensiona" />,
      Select: <Select />,
      Toggle: <BasicToggle label="On/Off" />,
      LightSlider: <LightSlider />,
      Theme: <SimpleList items={['Liquid Dawn', 'Aurora', 'Studio Noir']} />,
      SearchInput: <SearchInput />,
      ComputeIcon: <MiniChart label="Icone" />,
      StateLogic: <CodeEditor />,
      WeatherForecast: <SimpleList items={['Oggi 26°', 'Domani 24°', 'Sabato 23°']} />,
      Weather: <SimpleList items={['Temp 25°', 'Umidita 46%', 'Vento 12 km/h']} />,
      Timer: <SimpleList items={['Lavanderia 00:15', 'Irrigazione 01:20']} />,
      Notifications: <SimpleList items={['Filtro acqua', 'Porta garage']} />,
      Graph: <SimpleList items={['Consumi energia', 'Solare', 'Pompa calore']} />,
      Bar: <SimpleList items={['Energia', 'Comfort', 'Sicurezza']} />,
      Camera: <MediaPreview label="Camera Live" />,
      Info: <StatusRow label="Segnale camera" />,
      HLS: <MediaPreview label="Stream HLS" />,
      Proxy: <MediaPreview label="Proxy attivo" />,
      WebRTC: <MediaPreview label="WebRTC" />,
      Broken: <EmptyState label="Feed camera" />,
    };

    return overrides[key] ?? fallbackRenderer(key, label);
  }, [key, label]);
}

function createLegacyComponent(category: string, name: string) {
  return function LegacyComponent() {
    const renderer = useRenderer(name, `${category} / ${name}`);

    return (
      <LegacyShell title={`${category} / ${name}`}>
        {renderer ?? (
          <div className="flex items-center justify-between gap-3 text-xs text-ink/60">
            <span>Configura {name}</span>
            <GlassButton tone="ghost">Apri</GlassButton>
          </div>
        )}
      </LegacyShell>
    );
  };
}

function buildCategory(category: string, names: string[]) {
  return Object.fromEntries(names.map((name) => [name, createLegacyComponent(category, name)])) as Record<
    string,
    () => JSX.Element
  >;
}

export const Components = buildCategory('Components', [
  'ColorPicker',
  'Loader',
  'InputClear',
  'CustomJs',
  'Marquee',
  'Progress',
  'WheelPicker',
  'TokenModal',
  'CodeEditor',
  'RangeSlider',
  'ResizeHandle',
  'Select',
  'ComputeIcon',
  'StateLogic',
  'Toggle',
  'LightSlider',
  'Theme',
]);

export const Settings = buildCategory('Settings', [
  'Logout',
  'Token',
  'Motion',
  'Index',
  'Addons',
  'Version',
  'Language',
  'CustomJs',
]);

export const Drawer = buildCategory('Drawer', [
  'ViewButton',
  'ObjectButton',
  'SidebarButton',
  'SearchInput',
  'HistoryButtons',
  'AppearanceButton',
  'SaveButton',
  'MenuButton',
  'SectionButton',
  'Separator',
  'HorizontalStackButton',
  'SettingsButton',
  'AddDropdown',
  'ScenesButton',
  'SayButton',
  'CodeButton',
  'Index',
  'EditModeButton',
]);

export const Sidebar = buildCategory('Sidebar', [
  'WeatherForecast',
  'Template',
  'Weather',
  'Index',
  'Iframe',
  'Configure',
  'Timer',
  'History',
  'Toast',
  'Divider',
  'Time',
  'Camera',
  'Sensor',
  'Notifications',
  'Graph',
  'Bar',
  'Date',
  'Navigate',
  'Image',
  'Radial',
]);

export const Universal = buildCategory('Universal', ['Bar']);

export const Main = buildCategory('Main', [
  'EyeIndicator',
  'SectionTitle',
  'SectionHeader',
  'HorizontalStackHeader',
  'EditViewButton',
  'DeleteButton',
  'DragIndicator',
  'Views',
  'ConditionalMedia',
  'Camera',
  'Button',
  'PictureElements',
  'Index',
  'Empty',
  'Configure',
  'VisibilitySectionButton',
  'Intro',
  'Content',
  'Scenes',
]);

export const ModalConfigControls = buildCategory('ModalConfig', [
  'SwitchModal',
  'YoutubeModal',
  'InputTextModal',
  'ScriptModal',
  'TimerConfig',
  'TimerModal',
  'CoverModal',
  'ConfirmAlert',
  'AlarmControlPanelModal',
  'SidebarItemConfig',
  'DeviceTrackerModal',
  'ImageModal',
  'IframeConfig',
  'AppearanceConfig',
  'LightModal',
  'CounterModal',
  'NotificationsConfig',
  'Unknown',
  'CalendarEventModal',
  'SensorConfig',
  'TimeConfig',
  'ViewConfig',
  'DividerConfig',
  'ConditionalMediaConfig',
  'CalendarModal',
  'FanModal',
  'LawnMowerModal',
  'WeatherConfig',
  'GroupModal',
  'WaterHeaterModal',
  'Templater',
  'InputNumberModal',
  'GraphConfig',
  'MainItemConfig',
  'InputSelectModal',
  'CodeConfig',
  'TemplateConfig',
  'InputDateModal',
  'WeatherForecastConfig',
  'ScenesConfig',
  'ImageConfig',
  'ConfigButtons',
  'RadialConfig',
  'ButtonConfig',
  'HistoryConfig',
  'Index',
  'CameraConfig',
  'TodoModal',
  'DateConfig',
  'UpdateModal',
  'LockModal',
  'VacuumModal',
  'ThemeEditor',
  'NavigateConfig',
  'MediaPlayer',
  'BarConfig',
  'ValveModal',
  'ClimateModal',
  'SensorModal',
  'AutomationModal',
  'CameraModal',
  'EmptyConfig',
  'HumidifierModal',
]);

export const ModalPictureElements = buildCategory('ModalPictureElements', [
  'KeyboardHandler',
  'PictureElementsConfig',
  'TextPanel',
  'ActionPanel',
  'ElementsPanel',
  'ResizePanel',
  'HelpOverlay',
  'Toolbar',
  'SelectedAttributes',
  'TransformAttributes',
]);

export const ModalVisibilityConfig = buildCategory('ModalVisibilityConfig', [
  'AddConditionButtons',
  'CollapseButton',
  'NumericCondition',
  'StateCondition',
  'Index',
  'ScreenCondition',
  'EvaluateCondition',
  'ItemHeader',
  'Explanation',
  'RemoveButton',
]);

export const MainCamera = buildCategory('MainCamera', ['Info', 'Broken', 'HLS', 'Proxy', 'WebRTC']);

export const LegacyRegistry = {
  Components,
  Settings,
  Drawer,
  Sidebar,
  Universal,
  Main,
  ModalConfigControls,
  ModalPictureElements,
  ModalVisibilityConfig,
  MainCamera,
};

export const LegacyRegistryFlat = Object.entries(LegacyRegistry).flatMap(([group, entries]) =>
  Object.entries(entries).map(([name, Component]) => ({ group, name, Component })),
);

export function LegacyShowcaseGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {LegacyRegistryFlat.map(({ group, name, Component }) => (
        <div key={`${group}-${name}`} className="animate-fadeUp">
          <Component />
        </div>
      ))}
    </div>
  );
}

export function LegacyGroupTabs() {
  const groups = Object.keys(LegacyRegistry);
  const [active, setActive] = useState(groups[0]);
  const entries = LegacyRegistry[active as keyof typeof LegacyRegistry];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <GlassButton
            key={group}
            tone={group === active ? 'accent' : 'ghost'}
            onClick={() => setActive(group)}
          >
            {group}
          </GlassButton>
        ))}
      </div>
      <div className={cn('grid gap-4 md:grid-cols-2 xl:grid-cols-3')}>
        {Object.entries(entries).map(([name, Component]) => (
          <Component key={name} />
        ))}
      </div>
    </div>
  );
}
