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

export function getHaConfig() {
  const baseUrl = process.env.HA_BASE_URL || addonBaseUrl;
  const token = process.env.HA_TOKEN || process.env.SUPERVISOR_TOKEN || process.env.HASSIO_TOKEN;

  return { baseUrl, token };
}

export async function fetchHaStates() {
  const { baseUrl, token } = getHaConfig();
  if (!token) {
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
