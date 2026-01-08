export type HaEntity = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
};

export type HaServiceRequest = {
  domain: string;
  service: string;
  service_data?: Record<string, unknown>;
};

const addonBaseUrl = 'http://supervisor/core/api';

function normalizeBaseUrl(baseUrl: string) {
  if (baseUrl.endsWith('/api')) return baseUrl;
  return `${baseUrl.replace(/\/$/, '')}/api`;
}

export function getHaConfig() {
  const baseUrl = normalizeBaseUrl(process.env.HA_BASE_URL || addonBaseUrl);
  const token = process.env.HA_TOKEN || process.env.SUPERVISOR_TOKEN || process.env.HASSIO_TOKEN;
  const insecureTls = process.env.HA_INSECURE_TLS === 'true';

  if (insecureTls) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  return { baseUrl, token, insecureTls };
}

export async function fetchHaStates() {
  const { baseUrl, token } = getHaConfig();
  if (!token) {
    console.warn('Missing HA token, returning empty entities.');
    return [];
  }

  const response = await fetch(`${baseUrl}/states`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`HA states error: ${response.status}`);
  }

  return (await response.json()) as HaEntity[];
}

export async function fetchHaHistory(entityIds: string[], start: string) {
  const { baseUrl, token } = getHaConfig();
  if (!token) {
    console.warn('Missing HA token, returning empty history.');
    return [];
  }

  const params = new URLSearchParams();
  if (entityIds.length) {
    params.set('filter_entity_id', entityIds.join(','));
  }
  params.set('significant_changes', '0');

  const url = `${baseUrl}/history/period/${encodeURIComponent(start)}?${params.toString()}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`HA history error: ${response.status}`);
  }

  return response.json() as Promise<
    Array<
      Array<{
        entity_id: string;
        state: string;
        last_changed: string;
        last_updated: string;
        attributes: Record<string, unknown>;
      }>
    >
  >;
}

export async function callHaService(request: HaServiceRequest) {
  const { baseUrl, token } = getHaConfig();
  if (!token) {
    throw new Error('Missing HA token');
  }

  const response = await fetch(`${baseUrl}/services/${request.domain}/${request.service}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request.service_data ?? {}),
  });

  if (!response.ok) {
    throw new Error(`HA service error: ${response.status}`);
  }

  return response.json();
}
