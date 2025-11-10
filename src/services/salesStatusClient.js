// Sales status API client for unified platform
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function saveSalesStatus({
  project_id,
  building_id,
  unit_number,
  contract_unit_number,
  status_key,
  status_date,
  status_label,
  status_color
}) {
  const response = await fetch(`${API_BASE}/sales/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_id,
      building_id,
      unit_number,
      contract_unit_number,
      status_key,
      status_date,
      status_label,
      status_color
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to save sales status: ${response.statusText}`);
  }
  
  return response.json();
}