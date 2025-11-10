// src/utils/normalizeUnit.js
// Maps upstream fusion_units items into a canonical shape used by ops UI.

export function normalizeUnit(item = {}) {
  return {
    project_id: item.project_id ?? item.projectId ?? "",
    building_id: item.building_id ?? item.buildingId ?? "",
    unit_number: item.unit_number ?? item.unitNumber ?? "",
    plan_type: item.plan_type ?? item.plan ?? "",
    plan_sf: num(item.plan_sf ?? item.sqft ?? item.planSqft),
    address: item.address ?? "",
    bedrooms: num(item.bedrooms),
    bathrooms: num(item.bathrooms),
    region: item.region ?? item.Region ?? "",
    // add through-only fields as needed
  };
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}