'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

type EntityOption = {
  entity_id: string;
  state?: string;
  attributes?: Record<string, unknown>;
};

async function fetchConfig(): Promise<DashboardConfig> {
  const response = await fetch('api/dashboard', { cache: 'no-store' });
  return response.json();
}

async function saveConfig(config: DashboardConfig) {
  const response = await fetch('api/dashboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return response.json();
}

const widgetTypes: WidgetType[] = ['stat', 'toggle', 'slider', 'chart', 'list', 'climate', 'map'];
const widgetTypeLabels: Record<WidgetType, string> = {
  stat: 'Valore',
  toggle: 'Interruttore',
  slider: 'Regolazione',
  chart: 'Grafico',
  list: 'Lista',
  climate: 'Clima',
  map: 'Mappa',
};
const chartRanges = [
  { label: '6h', value: 6 },
  { label: '12h', value: 12 },
  { label: '24h', value: 24 },
  { label: '3g', value: 72 },
  { label: '7g', value: 168 },
];

function parseEntityIds(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getEntityLabel(entity: EntityOption) {
  return (entity.attributes?.friendly_name as string | undefined) ?? entity.entity_id;
}

function getEntityDomain(entityId: string) {
  return entityId.split('.')[0] ?? '';
}

function getEntityFilterForWidget(type: WidgetType, chartMode?: 'history' | 'forecast') {
  if (type === 'chart') {
    return chartMode === 'forecast' ? 'forecast' : 'numeric';
  }
  if (type === 'toggle') return 'toggle';
  if (type === 'slider') return 'slider';
  if (type === 'climate') return 'climate';
  return 'any';
}

function matchesEntityFilter(entity: EntityOption, filter: string) {
  if (filter === 'numeric') {
    const value = Number.parseFloat(entity.state ?? '');
    return Number.isFinite(value);
  }
  if (filter === 'forecast') {
    return Array.isArray(entity.attributes?.forecast);
  }
  if (filter === 'toggle') {
    const domain = getEntityDomain(entity.entity_id);
    return (
      entity.state === 'on' ||
      entity.state === 'off' ||
      ['switch', 'light', 'input_boolean', 'fan', 'automation', 'scene', 'script'].includes(domain)
    );
  }
  if (filter === 'slider') {
    const domain = getEntityDomain(entity.entity_id);
    return ['light', 'cover', 'climate', 'fan'].includes(domain);
  }
  if (filter === 'climate') {
    return getEntityDomain(entity.entity_id) === 'climate';
  }
  return true;
}

function addEntityId(current: string[], value: string) {
  const trimmed = value.trim();
  if (!trimmed) return current;
  if (current.includes(trimmed)) return current;
  return [...current, trimmed];
}

function updateEntityLabel(
  labels: Record<string, string> | undefined,
  entityId: string,
  value: string,
) {
  const next = { ...(labels ?? {}) };
  const trimmed = value.trim();
  if (!trimmed) {
    delete next[entityId];
  } else {
    next[entityId] = trimmed;
  }
  return next;
}

function removeEntityLabel(labels: Record<string, string> | undefined, entityId: string) {
  const next = { ...(labels ?? {}) };
  delete next[entityId];
  return next;
}

function updateEntityColor(
  colors: Record<string, string> | undefined,
  entityId: string,
  value: string,
) {
  const next = { ...(colors ?? {}) };
  if (!value) {
    delete next[entityId];
  } else {
    next[entityId] = value;
  }
  return next;
}

function removeEntityColor(colors: Record<string, string> | undefined, entityId: string) {
  const next = { ...(colors ?? {}) };
  delete next[entityId];
  return next;
}

export function DashboardShell({ viewId }: DashboardShellProps) {
  const queryClient = useQueryClient();
  const { editMode, toggleEditMode } = useDashboardStore();
  const router = useRouter();
  const { data: config } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchConfig,
  });

  const { mutateAsync } = useMutation({
    mutationFn: saveConfig,
    onSuccess: (next) => queryClient.setQueryData(['dashboard'], next),
  });

  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [widgetDraft, setWidgetDraft] = useState<DashboardWidget | null>(null);
  const [widgetDraftBaseline, setWidgetDraftBaseline] = useState<DashboardWidget | null>(null);
  const [newWidget, setNewWidget] = useState<DashboardWidget>({
    id: '',
    title: '',
    type: 'stat',
    chartEntityIds: [],
    chartRangeHours: 24,
    chartMode: 'history',
    chartEntityLabels: {},
    chartEntityColors: {},
  });
  const [entityQuery, setEntityQuery] = useState('');
  const [chartEntityDraft, setChartEntityDraft] = useState('');
  const [newChartEntityDraft, setNewChartEntityDraft] = useState('');
  const [entityFilter, setEntityFilter] = useState('any');

  const { data: entities } = useQuery({
    queryKey: ['ha-entities', entityQuery],
    queryFn: async () => {
      const response = await fetch(`api/ha/entities?q=${encodeURIComponent(entityQuery)}`);
      const payload = await response.json();
      return payload.entities as EntityOption[];
    },
  });

  const activeView = useMemo(() => {
    if (!config) return undefined;
    return config.views.find((view) => view.id === viewId) ?? config.views[0];
  }, [config, viewId]);

  useEffect(() => {
    if (!activeView || !selectedWidgetId) {
      setWidgetDraft(null);
      setWidgetDraftBaseline(null);
      setChartEntityDraft('');
      return;
    }
    const widget = activeView.widgets.find((item) => item.id === selectedWidgetId);
    const snapshot = widget ? (JSON.parse(JSON.stringify(widget)) as DashboardWidget) : null;
    setWidgetDraft(snapshot);
    setWidgetDraftBaseline(snapshot);
    setChartEntityDraft('');
  }, [activeView, selectedWidgetId]);

  const hasWidgetDraftChanges = useMemo(() => {
    if (!widgetDraft || !widgetDraftBaseline) return false;
    return JSON.stringify(widgetDraft) !== JSON.stringify(widgetDraftBaseline);
  }, [widgetDraft, widgetDraftBaseline]);

  const entityIdsToResolve = useMemo(() => {
    const ids = new Set<string>();
    activeView?.widgets.forEach((widget) => {
      if (widget.entityId) ids.add(widget.entityId);
      (widget.chartEntityIds ?? []).forEach((entry) => ids.add(entry));
    });
    if (newWidget.entityId) ids.add(newWidget.entityId);
    (newWidget.chartEntityIds ?? []).forEach((entry) => ids.add(entry));
    if (chartEntityDraft) {
      parseEntityIds(chartEntityDraft).forEach((entry) => ids.add(entry));
    }
    if (newChartEntityDraft) {
      parseEntityIds(newChartEntityDraft).forEach((entry) => ids.add(entry));
    }
    return Array.from(ids);
  }, [activeView?.widgets, newWidget, chartEntityDraft, newChartEntityDraft]);

  const { data: resolvedEntities } = useQuery({
    queryKey: ['ha-entities-by-id', entityIdsToResolve.join(',')],
    queryFn: async () => {
      if (entityIdsToResolve.length === 0) return [] as EntityOption[];
      const response = await fetch(
        `api/ha/entities?ids=${encodeURIComponent(entityIdsToResolve.join(','))}`,
      );
      const payload = await response.json();
      return payload.entities as EntityOption[];
    },
    enabled: entityIdsToResolve.length > 0,
  });

  const filteredEntities = useMemo(() => {
    return (entities ?? []).filter((entity) => matchesEntityFilter(entity, entityFilter));
  }, [entities, entityFilter]);

  const entityNameById = useMemo(() => {
    const map = new Map<string, string>();
    (resolvedEntities ?? []).forEach((entity) => {
      map.set(entity.entity_id, getEntityLabel(entity));
    });
    (entities ?? []).forEach((entity) => {
      if (!map.has(entity.entity_id)) {
        map.set(entity.entity_id, getEntityLabel(entity));
      }
    });
    return map;
  }, [entities, resolvedEntities]);

  const getEntityDisplayName = (id: string) => entityNameById.get(id) ?? id;

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
    setNewWidget({
      id: '',
      title: '',
      type: 'stat',
      chartEntityIds: [],
      chartRangeHours: 24,
      chartMode: 'history',
      chartEntityLabels: {},
      chartEntityColors: {},
    });
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
    setWidgetDraft(null);
    setWidgetDraftBaseline(null);
    await mutateAsync(next);
  };

  const handleSaveWidget = async () => {
    if (!selectedWidgetId || !widgetDraft) return;
    const { id: _id, ...partial } = widgetDraft;
    await handleUpdateWidget(partial);
    setWidgetDraftBaseline(widgetDraft);
  };

  const handleAddView = async () => {
    const next = JSON.parse(JSON.stringify(config)) as DashboardConfig;
    const id = `view-${Date.now()}`;
    const view: DashboardView = {
      id,
      name: `Vista ${next.views.length + 1}`,
      widgets: [],
    };
    next.views.push(view);
    await mutateAsync(next);
    router.push(`views/${id}`);
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
          <GlassButton tone="accent" onClick={handleAddView}>
            Nuova vista
          </GlassButton>
        </div>
      </GlassPanel>

      <div className="flex flex-wrap gap-2">
        {config.views.map((view) => (
          <Link
            key={view.id}
            href={`views/${view.id}`}
            className={`glass-button rounded-full border border-white/40 px-4 py-2 text-xs font-semibold transition ${
              view.id === activeView.id ? 'bg-white/70 text-ink shadow-glow' : 'bg-white/20 text-ink'
            }`}
          >
            {view.name}
          </Link>
        ))}
      </div>

      <div className={`grid gap-6 ${editMode ? 'lg:grid-cols-[1fr_320px]' : ''}`}>
        <GlassPanel className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeView.widgets.map((widget) => (
            <GlassCard
              key={widget.id}
              className={`space-y-3 ${widget.span === 2 ? 'sm:col-span-2' : ''}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{widget.title}</p>
                {editMode && (
                  <GlassButton
                    tone="ghost"
                    className="px-2 py-1 text-[10px]"
                    onClick={() =>
                      setSelectedWidgetId((current) => (current === widget.id ? null : widget.id))
                    }
                  >
                    {selectedWidgetId === widget.id ? 'Chiudi' : 'Modifica'}
                  </GlassButton>
                )}
              </div>
              <WidgetRenderer widget={widget} />
              {editMode && selectedWidgetId === widget.id && widgetDraft && (
                <div className="space-y-2 rounded-2xl border border-white/60 bg-white/60 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ink/60">Modifica widget</p>
                  <input
                    className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                    placeholder="Titolo"
                    value={widgetDraft.title}
                    onChange={(event) =>
                      setWidgetDraft((current) =>
                        current ? { ...current, title: event.target.value } : current,
                      )
                    }
                  />
                  <select
                    className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                    value={widgetDraft.type}
                    onChange={(event) => {
                      const nextType = event.target.value as WidgetType;
                      setWidgetDraft((current) =>
                        current
                          ? {
                              ...current,
                              type: nextType,
                              chartMode:
                                nextType === 'chart'
                                  ? current.chartMode ?? 'history'
                                  : current.chartMode,
                            }
                          : current,
                      );
                    }}
                  >
                    {widgetTypes.map((type) => (
                      <option key={type} value={type}>
                        {widgetTypeLabels[type]}
                      </option>
                    ))}
                  </select>
                  {widgetDraft.type === 'chart' ? (
                    <>
                      <select
                        className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                        value={widgetDraft.chartMode ?? 'history'}
                        onChange={(event) => {
                          const nextMode = event.target.value as 'history' | 'forecast';
                          setWidgetDraft((current) =>
                            current ? { ...current, chartMode: nextMode } : current,
                          );
                          setEntityFilter(getEntityFilterForWidget(widgetDraft.type, nextMode));
                        }}
                        onFocus={() =>
                          setEntityFilter(
                            getEntityFilterForWidget(
                              widgetDraft.type,
                              widgetDraft.chartMode ?? 'history',
                            ),
                          )
                        }
                      >
                        <option value="history">Storico</option>
                        <option value="forecast">Previsione</option>
                      </select>
                      <div className="flex flex-wrap gap-2">
                        {(widgetDraft.chartEntityIds ?? []).length === 0 ? (
                          <span className="text-xs text-ink/50">Nessuna entita selezionata.</span>
                        ) : (
                          (widgetDraft.chartEntityIds ?? []).map((entry) => (
                            <div
                              key={entry}
                              className="w-full rounded-2xl border border-white/50 bg-white/60 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-ink/60"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate">{getEntityDisplayName(entry)}</span>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    className="h-6 w-8 cursor-pointer rounded border border-white/50 bg-white/70 p-0"
                                    value={widgetDraft.chartEntityColors?.[entry] ?? '#63d1ff'}
                                    onChange={(event) =>
                                      setWidgetDraft((current) =>
                                        current
                                          ? {
                                              ...current,
                                              chartEntityColors: updateEntityColor(
                                                current.chartEntityColors,
                                                entry,
                                                event.target.value,
                                              ),
                                            }
                                          : current,
                                      )
                                    }
                                  />
                                  <button
                                    type="button"
                                    className="text-ink/60 transition hover:text-ink"
                                    onClick={() =>
                                      setWidgetDraft((current) =>
                                        current
                                          ? {
                                              ...current,
                                              chartEntityIds: (current.chartEntityIds ?? []).filter(
                                                (value) => value !== entry,
                                              ),
                                              chartEntityLabels: removeEntityLabel(
                                                current.chartEntityLabels,
                                                entry,
                                              ),
                                              chartEntityColors: removeEntityColor(
                                                current.chartEntityColors,
                                                entry,
                                              ),
                                            }
                                          : current,
                                      )
                                    }
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                              <input
                                className="mt-2 w-full rounded-lg border border-white/50 bg-white/70 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-ink/70"
                                placeholder="Nome serie"
                                value={widgetDraft.chartEntityLabels?.[entry] ?? ''}
                                onChange={(event) =>
                                  setWidgetDraft((current) =>
                                    current
                                      ? {
                                          ...current,
                                          chartEntityLabels: updateEntityLabel(
                                            current.chartEntityLabels,
                                            entry,
                                            event.target.value,
                                          ),
                                        }
                                      : current,
                                  )
                                }
                              />
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                          placeholder="entity_id"
                          value={chartEntityDraft}
                          onChange={(event) => {
                            setChartEntityDraft(event.target.value);
                            setEntityQuery(event.target.value);
                            setEntityFilter(
                              getEntityFilterForWidget(
                                widgetDraft.type,
                                widgetDraft.chartMode ?? 'history',
                              ),
                            );
                          }}
                          onFocus={() =>
                            setEntityFilter(
                              getEntityFilterForWidget(
                                widgetDraft.type,
                                widgetDraft.chartMode ?? 'history',
                              ),
                            )
                          }
                          list="ha-entities"
                        />
                        <GlassButton
                          tone="ghost"
                          className="px-3 text-[10px] uppercase tracking-[0.2em]"
                          onClick={() => {
                            const entries = parseEntityIds(chartEntityDraft);
                            if (entries.length === 0) return;
                            let next = widgetDraft.chartEntityIds ?? [];
                            entries.forEach((entry) => {
                              next = addEntityId(next, entry);
                            });
                            setWidgetDraft((current) =>
                              current ? { ...current, chartEntityIds: next } : current,
                            );
                            setChartEntityDraft('');
                          }}
                        >
                          Aggiungi
                        </GlassButton>
                      </div>
                      {widgetDraft.chartMode !== 'forecast' && (
                        <select
                          className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                          value={widgetDraft.chartRangeHours ?? 24}
                          onChange={(event) =>
                            setWidgetDraft((current) =>
                              current
                                ? { ...current, chartRangeHours: Number(event.target.value) }
                                : current,
                            )
                          }
                        >
                          {chartRanges.map((range) => (
                            <option key={range.value} value={range.value}>
                              {range.label}
                            </option>
                          ))}
                        </select>
                      )}
                      <input
                        className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                        placeholder="Unita asse Y (es. °C, kWh)"
                        value={widgetDraft.unit ?? ''}
                        onChange={(event) =>
                          setWidgetDraft((current) =>
                            current ? { ...current, unit: event.target.value } : current,
                          )
                        }
                      />
                    </>
                  ) : (
                    <input
                      className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                      placeholder="entity_id (opzionale)"
                      value={widgetDraft.entityId ?? ''}
                      onChange={(event) => {
                        setEntityQuery(event.target.value);
                        setEntityFilter(getEntityFilterForWidget(widgetDraft.type));
                        setWidgetDraft((current) =>
                          current ? { ...current, entityId: event.target.value } : current,
                        );
                      }}
                      onFocus={() => setEntityFilter(getEntityFilterForWidget(widgetDraft.type))}
                      list="ha-entities"
                    />
                  )}
                  {hasWidgetDraftChanges && (
                    <p className="text-[10px] uppercase tracking-[0.2em] text-orange-600">
                      Modifiche non salvate
                    </p>
                  )}
                  <div className="flex gap-2">
                    <GlassButton
                      tone="accent"
                      className="w-full"
                      onClick={handleSaveWidget}
                      disabled={!hasWidgetDraftChanges}
                    >
                      Salva widget
                    </GlassButton>
                    <GlassButton tone="ghost" className="w-full" onClick={handleRemoveWidget}>
                      Rimuovi widget
                    </GlassButton>
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </GlassPanel>

        {editMode && (
          <GlassPanel className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Editor</p>
              <h2 className="text-lg font-semibold">Configura widget</h2>
            </div>

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
                  onChange={(event) => {
                    const nextType = event.target.value as WidgetType;
                    setNewWidget((current) => ({
                      ...current,
                      type: nextType,
                      chartRangeHours:
                        nextType === 'chart' ? current.chartRangeHours ?? 24 : current.chartRangeHours,
                      chartMode: nextType === 'chart' ? current.chartMode ?? 'history' : current.chartMode,
                    }));
                  }}
                >
                    {widgetTypes.map((type) => (
                      <option key={type} value={type}>
                        {widgetTypeLabels[type]}
                      </option>
                    ))}
                  </select>
                {newWidget.type === 'chart' ? (
                  <>
                    <select
                      className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                      value={newWidget.chartMode ?? 'history'}
                      onChange={(event) => {
                        const nextMode = event.target.value as 'history' | 'forecast';
                        setNewWidget({
                          ...newWidget,
                          chartMode: nextMode,
                        });
                        setEntityFilter(getEntityFilterForWidget(newWidget.type, nextMode));
                      }}
                      onFocus={() =>
                        setEntityFilter(
                          getEntityFilterForWidget(newWidget.type, newWidget.chartMode ?? 'history'),
                        )
                      }
                    >
                      <option value="history">Storico</option>
                      <option value="forecast">Previsione</option>
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {(newWidget.chartEntityIds ?? []).length === 0 ? (
                        <span className="text-xs text-ink/50">Nessuna entita selezionata.</span>
                      ) : (
                        (newWidget.chartEntityIds ?? []).map((entry) => (
                          <div
                            key={entry}
                            className="w-full rounded-2xl border border-white/50 bg-white/60 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-ink/60"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate">{getEntityDisplayName(entry)}</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  className="h-6 w-8 cursor-pointer rounded border border-white/50 bg-white/70 p-0"
                                  value={newWidget.chartEntityColors?.[entry] ?? '#63d1ff'}
                                  onChange={(event) =>
                                    setNewWidget({
                                      ...newWidget,
                                      chartEntityColors: updateEntityColor(
                                        newWidget.chartEntityColors,
                                        entry,
                                        event.target.value,
                                      ),
                                    })
                                  }
                                />
                                <button
                                  type="button"
                                  className="text-ink/60 transition hover:text-ink"
                                  onClick={() =>
                                    setNewWidget({
                                      ...newWidget,
                                      chartEntityIds: (newWidget.chartEntityIds ?? []).filter(
                                        (value) => value !== entry,
                                      ),
                                      chartEntityLabels: removeEntityLabel(
                                        newWidget.chartEntityLabels,
                                        entry,
                                      ),
                                      chartEntityColors: removeEntityColor(
                                        newWidget.chartEntityColors,
                                        entry,
                                      ),
                                    })
                                  }
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                            <input
                              className="mt-2 w-full rounded-lg border border-white/50 bg-white/70 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-ink/70"
                              placeholder="Nome serie"
                              value={newWidget.chartEntityLabels?.[entry] ?? ''}
                              onChange={(event) =>
                                setNewWidget({
                                  ...newWidget,
                                  chartEntityLabels: updateEntityLabel(
                                    newWidget.chartEntityLabels,
                                    entry,
                                    event.target.value,
                                  ),
                                })
                              }
                            />
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2">
                        <input
                          className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                          placeholder="entity_id"
                          value={newChartEntityDraft}
                          onChange={(event) => {
                            setNewChartEntityDraft(event.target.value);
                            setEntityQuery(event.target.value);
                            setEntityFilter(
                              getEntityFilterForWidget(newWidget.type, newWidget.chartMode ?? 'history'),
                            );
                          }}
                          onFocus={() =>
                            setEntityFilter(
                              getEntityFilterForWidget(newWidget.type, newWidget.chartMode ?? 'history'),
                            )
                          }
                          list="ha-entities"
                        />
                      <GlassButton
                        tone="ghost"
                        className="px-3 text-[10px] uppercase tracking-[0.2em]"
                        onClick={() => {
                          const entries = parseEntityIds(newChartEntityDraft);
                          if (entries.length === 0) return;
                          let next = newWidget.chartEntityIds ?? [];
                          entries.forEach((entry) => {
                            next = addEntityId(next, entry);
                          });
                          setNewWidget({ ...newWidget, chartEntityIds: next });
                          setNewChartEntityDraft('');
                        }}
                      >
                        Aggiungi
                      </GlassButton>
                    </div>
                    {newWidget.chartMode !== 'forecast' && (
                      <select
                        className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                        value={newWidget.chartRangeHours ?? 24}
                        onChange={(event) =>
                          setNewWidget({
                            ...newWidget,
                            chartRangeHours: Number(event.target.value),
                          })
                        }
                      >
                        {chartRanges.map((range) => (
                          <option key={range.value} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    )}
                    <input
                      className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                      placeholder="Unita asse Y (es. °C, kWh)"
                      value={newWidget.unit ?? ''}
                      onChange={(event) =>
                        setNewWidget({
                          ...newWidget,
                          unit: event.target.value,
                        })
                      }
                    />
                  </>
                ) : (
                  <input
                    className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                    placeholder="entity_id (opzionale)"
                    value={newWidget.entityId ?? ''}
                    onChange={(event) => {
                      setEntityQuery(event.target.value);
                      setEntityFilter(getEntityFilterForWidget(newWidget.type));
                      setNewWidget({ ...newWidget, entityId: event.target.value });
                    }}
                    onFocus={() => setEntityFilter(getEntityFilterForWidget(newWidget.type))}
                    list="ha-entities"
                  />
                )}
                <GlassButton tone="accent" className="w-full" onClick={handleAddWidget}>
                  Aggiungi
                </GlassButton>
              </div>

            </div>
          </GlassPanel>
        )}
      </div>
      <datalist id="ha-entities">
        {filteredEntities.slice(0, 10).map((entity) => (
          <option
            key={entity.entity_id}
            value={entity.entity_id}
            label={getEntityLabel(entity)}
          />
        ))}
      </datalist>
    </main>
  );
}
