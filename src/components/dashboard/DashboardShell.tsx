'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { useDashboardStore } from '@/lib/store/dashboardStore';
import { DashboardConfig, DashboardView, DashboardWidget, WidgetType } from '@/lib/dashboardConfig';
import { WidgetRenderer } from '@/components/dashboard/WidgetRenderer';

type DashboardShellProps = {
  viewId: string;
};

async function fetchConfig(): Promise<DashboardConfig> {
  const response = await fetch('/api/dashboard', { cache: 'no-store' });
  return response.json();
}

async function saveConfig(config: DashboardConfig) {
  const response = await fetch('/api/dashboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return response.json();
}

const widgetTypes: WidgetType[] = ['stat', 'toggle', 'slider', 'chart', 'list', 'climate', 'map'];

export function DashboardShell({ viewId }: DashboardShellProps) {
  const queryClient = useQueryClient();
  const { editMode, toggleEditMode } = useDashboardStore();
  const { data: config } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchConfig,
  });

  const { mutateAsync } = useMutation({
    mutationFn: saveConfig,
    onSuccess: (next) => queryClient.setQueryData(['dashboard'], next),
  });

  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [newWidget, setNewWidget] = useState<DashboardWidget>({
    id: '',
    title: '',
    type: 'stat',
  });
  const [entityQuery, setEntityQuery] = useState('');

  const { data: entities } = useQuery({
    queryKey: ['ha-entities', entityQuery],
    queryFn: async () => {
      const response = await fetch(`/api/ha/entities?q=${encodeURIComponent(entityQuery)}`);
      const payload = await response.json();
      return payload.entities as Array<{ entity_id: string }>;
    },
  });

  const activeView = useMemo(() => {
    if (!config) return undefined;
    return config.views.find((view) => view.id === viewId) ?? config.views[0];
  }, [config, viewId]);

  if (!config || !activeView) {
    return (
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
        <GlassPanel>Caricamento dashboard...</GlassPanel>
      </main>
    );
  }

  const handleViewRename = async (value: string) => {
    const next = JSON.parse(JSON.stringify(config)) as DashboardConfig;
    const view = next.views.find((entry) => entry.id === activeView.id);
    if (!view) return;
    view.name = value;
    await mutateAsync(next);
  };

  const handleAddWidget = async () => {
    if (!newWidget.title.trim()) return;
    const next = JSON.parse(JSON.stringify(config)) as DashboardConfig;
    const view = next.views.find((entry) => entry.id === activeView.id);
    if (!view) return;
    const widget: DashboardWidget = {
      ...newWidget,
      id: `w-${Date.now()}`,
      title: newWidget.title.trim(),
      span: newWidget.span || 1,
    };
    view.widgets.push(widget);
    setNewWidget({ id: '', title: '', type: 'stat' });
    await mutateAsync(next);
  };

  const handleUpdateWidget = async (partial: Partial<DashboardWidget>) => {
    if (!selectedWidgetId) return;
    const next = JSON.parse(JSON.stringify(config)) as DashboardConfig;
    const view = next.views.find((entry) => entry.id === activeView.id);
    if (!view) return;
    const widget = view.widgets.find((item) => item.id === selectedWidgetId);
    if (!widget) return;
    Object.assign(widget, partial);
    await mutateAsync(next);
  };

  const handleRemoveWidget = async () => {
    if (!selectedWidgetId) return;
    const next = JSON.parse(JSON.stringify(config)) as DashboardConfig;
    const view = next.views.find((entry) => entry.id === activeView.id);
    if (!view) return;
    view.widgets = view.widgets.filter((item) => item.id !== selectedWidgetId);
    setSelectedWidgetId(null);
    await mutateAsync(next);
  };

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <GlassPanel className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-ink/50">HomeSweetHome</p>
          <input
            className="mt-2 w-full bg-transparent text-2xl font-semibold focus:outline-none"
            value={activeView.name}
            onChange={(event) => handleViewRename(event.target.value)}
          />
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] text-ink/50">
            <span className="rounded-full bg-white/50 px-3 py-1">Live</span>
            <span className="rounded-full bg-white/40 px-3 py-1">Edit {editMode ? 'On' : 'Off'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton tone="ghost" onClick={toggleEditMode}>
            {editMode ? 'Esci edit' : 'Modifica'}
          </GlassButton>
          <GlassButton tone="accent">Nuova vista</GlassButton>
        </div>
      </GlassPanel>

      <div className="flex flex-wrap gap-2">
        {config.views.map((view) => (
          <Link
            key={view.id}
            href={`/views/${view.id}`}
            className={`glass-button rounded-full border border-white/40 px-4 py-2 text-xs font-semibold transition ${
              view.id === activeView.id ? 'bg-white/70 text-ink shadow-glow' : 'bg-white/20 text-ink'
            }`}
          >
            {view.name}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <GlassPanel className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeView.widgets.map((widget) => (
            <GlassCard
              key={widget.id}
              className={`space-y-3 ${widget.span === 2 ? 'sm:col-span-2' : ''}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{widget.title}</p>
                {editMode && (
                  <GlassButton tone="ghost" className="px-2 py-1 text-[10px]" onClick={() => setSelectedWidgetId(widget.id)}>
                    Modifica
                  </GlassButton>
                )}
              </div>
              <WidgetRenderer widget={widget} />
            </GlassCard>
          ))}
        </GlassPanel>

        <GlassPanel className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Editor</p>
            <h2 className="text-lg font-semibold">Configura widget</h2>
          </div>

          {!editMode ? (
            <p className="text-sm text-ink/60">Attiva la modalita modifica per editare i widget.</p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Nuovo widget</p>
                <input
                  className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                  placeholder="Titolo"
                  value={newWidget.title}
                  onChange={(event) => setNewWidget({ ...newWidget, title: event.target.value })}
                />
                <select
                  className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                  value={newWidget.type}
                  onChange={(event) =>
                    setNewWidget({ ...newWidget, type: event.target.value as WidgetType })
                  }
                >
                  {widgetTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                  placeholder="entity_id (opzionale)"
                  value={newWidget.entityId ?? ''}
                  onChange={(event) => {
                    setEntityQuery(event.target.value);
                    setNewWidget({ ...newWidget, entityId: event.target.value });
                  }}
                  list="ha-entities"
                />
                <GlassButton tone="accent" className="w-full" onClick={handleAddWidget}>
                  Aggiungi
                </GlassButton>
              </div>

              {selectedWidgetId && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Widget selezionato</p>
                  <input
                    className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                    placeholder="Titolo"
                    value={activeView.widgets.find((w) => w.id === selectedWidgetId)?.title ?? ''}
                    onChange={(event) => handleUpdateWidget({ title: event.target.value })}
                  />
                  <select
                    className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                    value={activeView.widgets.find((w) => w.id === selectedWidgetId)?.type ?? 'stat'}
                    onChange={(event) =>
                      handleUpdateWidget({ type: event.target.value as WidgetType })
                    }
                  >
                    {widgetTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <input
                    className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                    placeholder="entity_id (opzionale)"
                    value={activeView.widgets.find((w) => w.id === selectedWidgetId)?.entityId ?? ''}
                    onChange={(event) => {
                      setEntityQuery(event.target.value);
                      handleUpdateWidget({ entityId: event.target.value });
                    }}
                    list="ha-entities"
                  />
                  <GlassButton tone="ghost" className="w-full" onClick={handleRemoveWidget}>
                    Rimuovi widget
                  </GlassButton>
                </div>
              )}
            </div>
          )}
        </GlassPanel>
      </div>
      <datalist id="ha-entities">
        {(entities ?? []).map((entity) => (
          <option key={entity.entity_id} value={entity.entity_id} />
        ))}
      </datalist>
    </main>
  );
}
