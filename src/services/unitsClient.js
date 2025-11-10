// Units API client for unified platform
const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.hbfa-unified.com/dev/api';

export async function listUnitsByProject({ project_id }) {
  const response = await fetch(`${API_BASE}/units?project_id=${encodeURIComponent(project_id)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch units: ${response.statusText}`);
  }
  return response.json();
}