'use client';

import { useMemo, useState } from 'react';
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
  const [newWidget, setNewWidget] = useState<DashboardWidget>({
    id: '',
    title: '',
    type: 'stat',
    chartEntityIds: [],
    chartRangeHours: 24,
    chartMode: 'history',
  });
  const [entityQuery, setEntityQuery] = useState('');
  const [chartEntityDraft, setChartEntityDraft] = useState('');
  const [newChartEntityDraft, setNewChartEntityDraft] = useState('');
  const [entityFilter, setEntityFilter] = useState('any');

  const { data: entities } = useQuery({
    queryKey: ['ha-entities', entityQuery],
    queryFn: async () => {
      const response = await fetch(`/api/ha/entities?q=${encodeURIComponent(entityQuery)}`);
      const payload = await response.json();
      return payload.entities as EntityOption[];
    },
  });

  const filteredEntities = useMemo(() => {
    return (entities ?? []).filter((entity) => matchesEntityFilter(entity, entityFilter));
  }, [entities, entityFilter]);

  const entityNameById = useMemo(() => {
    return new Map((entities ?? []).map((entity) => [entity.entity_id, getEntityLabel(entity)]));
  }, [entities]);

  const getEntityDisplayName = (id: string) => entityNameById.get(id) ?? id;

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
    setNewWidget({
      id: '',
      title: '',
      type: 'stat',
      chartEntityIds: [],
      chartRangeHours: 24,
      chartMode: 'history',
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
    await mutateAsync(next);
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
              {editMode && selectedWidgetId === widget.id && (
                <div className="space-y-2 rounded-2xl border border-white/60 bg-white/60 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ink/60">Modifica widget</p>
                  <input
                    className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                    placeholder="Titolo"
                    value={widget.title}
                    onChange={(event) => handleUpdateWidget({ title: event.target.value })}
                  />
                  <select
                    className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                    value={widget.type}
                    onChange={(event) => {
                      const nextType = event.target.value as WidgetType;
                      handleUpdateWidget({
                        type: nextType,
                        chartMode: nextType === 'chart' ? widget.chartMode ?? 'history' : widget.chartMode,
                      });
                    }}
                  >
                    {widgetTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {widget.type === 'chart' ? (
                    <>
                      <select
                        className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                        value={widget.chartMode ?? 'history'}
                        onChange={(event) => {
                          const nextMode = event.target.value as 'history' | 'forecast';
                          handleUpdateWidget({ chartMode: nextMode });
                          setEntityFilter(getEntityFilterForWidget(widget.type, nextMode));
                        }}
                        onFocus={() =>
                          setEntityFilter(
                            getEntityFilterForWidget(widget.type, widget.chartMode ?? 'history'),
                          )
                        }
                      >
                        <option value="history">Storico</option>
                        <option value="forecast">Previsione</option>
                      </select>
                      <div className="flex flex-wrap gap-2">
                        {(widget.chartEntityIds ?? []).length === 0 ? (
                          <span className="text-xs text-ink/50">Nessuna entita selezionata.</span>
                        ) : (
                          (widget.chartEntityIds ?? []).map((entry) => (
                            <span
                              key={entry}
                              className="flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ink/60"
                            >
                              {getEntityDisplayName(entry)}
                              <button
                                type="button"
                                className="text-ink/60 transition hover:text-ink"
                                onClick={() =>
                                  handleUpdateWidget({
                                    chartEntityIds: (widget.chartEntityIds ?? []).filter(
                                      (value) => value !== entry,
                                    ),
                                  })
                                }
                              >
                                ✕
                              </button>
                            </span>
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
                              getEntityFilterForWidget(widget.type, widget.chartMode ?? 'history'),
                            );
                          }}
                          onFocus={() =>
                            setEntityFilter(
                              getEntityFilterForWidget(widget.type, widget.chartMode ?? 'history'),
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
                            let next = widget.chartEntityIds ?? [];
                            entries.forEach((entry) => {
                              next = addEntityId(next, entry);
                            });
                            handleUpdateWidget({ chartEntityIds: next });
                            setChartEntityDraft('');
                          }}
                        >
                          Aggiungi
                        </GlassButton>
                      </div>
                      {widget.chartMode !== 'forecast' && (
                        <select
                          className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                          value={widget.chartRangeHours ?? 24}
                          onChange={(event) =>
                            handleUpdateWidget({ chartRangeHours: Number(event.target.value) })
                          }
                        >
                          {chartRanges.map((range) => (
                            <option key={range.value} value={range.value}>
                              {range.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </>
                  ) : (
                    <input
                      className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm"
                      placeholder="entity_id (opzionale)"
                      value={widget.entityId ?? ''}
                      onChange={(event) => {
                        setEntityQuery(event.target.value);
                        setEntityFilter(getEntityFilterForWidget(widget.type));
                        handleUpdateWidget({ entityId: event.target.value });
                      }}
                      onFocus={() => setEntityFilter(getEntityFilterForWidget(widget.type))}
                      list="ha-entities"
                    />
                  )}
                  <GlassButton tone="ghost" className="w-full" onClick={handleRemoveWidget}>
                    Rimuovi widget
                  </GlassButton>
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
                      {type}
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
                          <span
                            key={entry}
                            className="flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ink/60"
                          >
                            {getEntityDisplayName(entry)}
                            <button
                              type="button"
                              className="text-ink/60 transition hover:text-ink"
                              onClick={() =>
                                setNewWidget({
                                  ...newWidget,
                                  chartEntityIds: (newWidget.chartEntityIds ?? []).filter(
                                    (value) => value !== entry,
                                  ),
                                })
                              }
                            >
                              ✕
                            </button>
                          </span>
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
