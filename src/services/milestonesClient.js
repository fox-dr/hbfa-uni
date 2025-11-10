// Milestones API client for unified platform
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function saveUnitsSchedule({ project_id, building_id, unit_number, unit }) {
  const response = await fetch(`${API_BASE}/milestones/units`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_id,
      building_id,
      unit_number,
      unit
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to save unit schedule: ${response.statusText}`);
  }
  
  return response.json();
}

export async function saveBuildingSchedule({ project_id, building_id, building }) {
  const response = await fetch(`${API_BASE}/milestones/buildings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_id,
      building_id,
      building
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to save building schedule: ${response.statusText}`);
  }
  
  return response.json();
}

export async function readBuildingSchedules({ project_id, building_id }) {
  const response = await fetch(`${API_BASE}/milestones/buildings/${encodeURIComponent(project_id)}/${encodeURIComponent(building_id)}`);
  
  if (!response.ok) {
    throw new Error(`Failed to read building schedules: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchMilestonesTimeline({ project_id, building_id, include_units = false, include_events = false }) {
  const params = new URLSearchParams({
    project_id,
    building_id,
    include_units: include_units.toString(),
    include_events: include_events.toString()
  });
  
  const response = await fetch(`${API_BASE}/milestones/timeline?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch milestones timeline: ${response.statusText}`);
  }
  
  return response.json();
}