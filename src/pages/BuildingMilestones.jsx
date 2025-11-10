import React, { useEffect, useMemo, useState } from "react";
// Header component integrated into layout
import FormSection from "../components/FormSection";
import "../styles/utilities.css";
import { listUnitsByProject } from "../services/unitsClient";
import {
  saveUnitsSchedule,
  saveBuildingSchedule,
  readBuildingSchedules,
  fetchMilestonesTimeline,
} from "../services/milestonesClient";
import { saveSalesStatus } from "../services/salesStatusClient";
import { normalizeUnit } from "../utils/normalizeUnit";
import {
  STATUS_DEFINITIONS,
  STATUS_COLOR_BY_KEY,
  STATUS_POLARIS_LABEL_BY_KEY,
} from "../constants/statusCatalog";

// Milestone template with workday offsets
const BUILDING_STEPS = [
  { key: "construction_release", code: "B1", label: "B1 Construction Release (Cut 1)", offset: 0, manual: true },
  { key: "foundation_start", code: "B2", label: "B2 Foundation Start", offset: 0, manual: true },
  { key: "ground_plumbing_inspection", code: "B3", label: "B3 Ground Plumbing Inspection", offset: 10 },
  { key: "foundation_pour", code: "B4", label: "B4 Foundation Pour (Cut 2)", offset: 5 },
  { key: "first_floor_frame_complete", code: "B5", label: "B5 First Floor Frame Complete", offset: 20 },
  { key: "second_floor_frame_complete", code: "B6", label: "B6 Second Floor Frame Complete", offset: 15 },
  { key: "third_floor_frame_complete", code: "B7", label: "B7 Third Floor Frame Complete", offset: 15, conditional: "third" },
  { key: "fourth_floor_frame_complete", code: "B8", label: "B8 Fourth Floor Frame Complete", offset: 15, conditional: "fourth" },
  { key: "roof_truss_delivery", code: "B9", label: "B9 Roof Truss Delivery", offset: 10 },
  { key: "roof_nail_shear_nail_inspection", code: "B10", label: "B10 Roof Nail Shear Nail Inspection", offset: 7 },
  { key: "install_windows_exterior_doors", code: "B11", label: "B11 Install Windows Exterior Doors", offset: 14 },
];

const EARLY_STAGE_STEPS = BUILDING_STEPS.filter(step => step.stageUnitKey);
const EARLY_STAGE_KEYS = EARLY_STAGE_STEPS.map(step => step.key);

const UNIT_STEPS = [
  { key: "unit_frame_inspection", code: "U1", label: "U1 Unit Frame Inspection", offset: 0, manual: true },
  { key: "drywall_nail_inspection", code: "U2", label: "U2 Drywall Nail Inspection", offset: 14 },
  { key: "drywall_texture", code: "U3", label: "U3 Drywall Texture", offset: 16 },
  { key: "install_cabinets", code: "U4", label: "U4 Install Cabinets", offset: 12 },
  { key: "appliance_delivery", code: "U5", label: "U5 Appliance Delivery", offset: 12 },
  { key: "buyer_orientation", code: "U6", label: "U6 Buyer Orientation", offset: 243 },
];

// Project options (expandable; later from API)
const PROJECT_OPTIONS = ["Aria", "Fusion", "SoMi Towns", "SoMi A", "SoMi B", "Vida", "Vida 2"];

const PROJECT_CANONICAL_MAP = {
  "Fusion": "Fusion",
  "Fusion - Hayward": "Fusion",
  "Fusion Hayward": "Fusion",
  "Fusion - Live-Work": "Fusion",
  "SoMi Haypark": "SoMi Towns",
  "SoMi HayPark": "SoMi Towns",
  "SoMi Towns": "SoMi Towns",
  "SoMi HayView": "SoMi A",
  "SoMi Hayview": "SoMi A",
  "SoMi Building A": "SoMi A",
  "SoMi A": "SoMi A",
  "SoMi Building B": "SoMi B",
  "SoMi Haypark Condos": "SoMi B",
  "SoMi B": "SoMi B",
};

function getCanonicalProjectId(value) {
  if (!value) return "";
  return PROJECT_CANONICAL_MAP[value] || value;
}

function getProjectAliasCandidates(value) {
  const canonical = getCanonicalProjectId(value);
  if (!canonical) return [];
  const candidates = new Set([canonical]);
  for (const [alias, target] of Object.entries(PROJECT_CANONICAL_MAP)) {
    if (target === canonical) {
      candidates.add(alias);
    }
  }
  return Array.from(candidates);
}

// Workday add (Mon-Fri) with optional holidays set (YYYY-MM-DD)
function addWorkdays(startISO, days, holidays = new Set()) {
  if (!startISO || Number(days) === 0) return startISO || "";
  let d = new Date(startISO + "T00:00:00");
  let remaining = Number(days);
  const forward = remaining >= 0;
  if (!forward) remaining = Math.abs(remaining);
  while (remaining > 0) {
    d.setDate(d.getDate() + (forward ? 1 : -1));
    const iso = toISO(d);
    const day = d.getDay(); // 0 Sun .. 6 Sat
    const isWeekend = day === 0 || day === 6;
    const isHoliday = holidays.has(iso);
    if (!isWeekend && !isHoliday) remaining -= 1;
  }
  return toISO(d);
}
function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function unitKey(buildingId, unitNumber) {
  return `${buildingId || ''}#${unitNumber || ''}`;
}

const BUILDING_ITEM_SK = '#building';

const SALES_STATUS_KEYS = ["unreleased", "inventory", "offer", "backlog", "closed"];
const SALES_STATUS_OPTIONS = STATUS_DEFINITIONS.filter(def => SALES_STATUS_KEYS.includes(def.key));

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function toDateString(value) {
  return typeof value === 'string' ? value : '';
}

export default function BuildingMilestones() {
  const [projectId, setProjectId] = useState("Aria");
  const [resolvedProjectId, setResolvedProjectId] = useState("");
  const [units, setUnits] = useState([]);

  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const activeProjectId = useMemo(() => getCanonicalProjectId(projectId), [projectId]);

  // Per-building anchors, overrides, activation
  const [buildingAnchors, setBuildingAnchors] = useState({}); // building_id -> YYYY-MM-DD
  const [buildingOverrides, setBuildingOverrides] = useState({}); // building_id -> { stepKey: date }
  const [buildingActivation, setBuildingActivation] = useState({}); // building_id -> { third: bool, fourth: bool }
  const [buildingStages, setBuildingStages] = useState({}); // building_id -> { stageKey: { complete, date } }
  const [buildingPreKickoff, setBuildingPreKickoff] = useState({}); // building_id -> bool
  const [buildingProjectedCoe, setBuildingProjectedCoe] = useState({}); // building_id -> YYYY-MM-DD (Ops COE)

  // Per-unit anchors and overrides
  const [unitAnchors, setUnitAnchors] = useState({}); // (bldg#unit) -> YYYY-MM-DD
  const [unitOverrides, setUnitOverrides] = useState({}); // (bldg#unit) -> { stepKey: date }
  const [unitSalesStatus, setUnitSalesStatus] = useState({}); // (bldg#unit) -> sales payload
  const [salesStatusDraft, setSalesStatusDraft] = useState(null);
  const [loadingSalesStatus, setLoadingSalesStatus] = useState(false);
  const [salesStatusError, setSalesStatusError] = useState("");

  // Holidays from API (ops-holidays)
  const [holidayDates, setHolidayDates] = useState([]); // ["YYYY-MM-DD"]
  const holidaysSet = useMemo(() => new Set(holidayDates || []), [holidayDates]);

  useEffect(() => {
    setResolvedProjectId("");
    setSelectedBuilding("");
    setSelectedUnit("");
  }, [projectId]);

  function prioritizeCandidates(list) {
    if (!resolvedProjectId || !list.includes(resolvedProjectId)) return list;
    const ordered = [resolvedProjectId, ...list];
    return Array.from(new Set(ordered));
  }

  // Load units for project
  useEffect(() => {
    let abort = false;
    async function run() {
      const canonical = activeProjectId || projectId;
      if (!canonical) return;
      const candidates = prioritizeCandidates(getProjectAliasCandidates(canonical));
      let loaded = false;
      for (const candidate of candidates) {
        try {
          const rsp = await listUnitsByProject({ project_id: candidate });
          const items = (rsp.items || rsp || []).map(normalizeUnit);
          if (abort) return;
          if (items.length > 0) {
            setResolvedProjectId(candidate);
            setUnits(items);
            const firstB = items[0].building_id || "";
            setSelectedBuilding(prev => prev || firstB);
            const firstU = items.find(u => u.building_id === firstB)?.unit_number || items[0].unit_number || "";
            setSelectedUnit(prev => prev || firstU);
            loaded = true;
            break;
          }
        } catch (e) {
          console.error("units load error", candidate, e);
        }
      }
      if (!loaded && !abort) {
        setUnits([]);
      }
    }
    run();
    return () => { abort = true; };
  }, [activeProjectId, projectId]);

  // Load holidays for project
  useEffect(() => {
    let abort = false;
    async function run() {
      const canonical = activeProjectId || projectId;
      if (!canonical) return;
      try {
        // TODO: Update to use Lambda function endpoint
        const res = await fetch(`/api/holidays?project_id=${encodeURIComponent(canonical)}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const dates = Array.isArray(data.items) ? data.items.map(x => x.date).filter(Boolean) : [];
        if (!abort) setHolidayDates(dates);
      } catch (e) {
        console.warn('holidays load error', e);
        if (!abort) setHolidayDates([]);
      }
    }
    run();
    return () => { abort = true; };
  }, [activeProjectId, projectId]);

  useEffect(() => {
    const canonical = activeProjectId || projectId;
    const projectKey = resolvedProjectId || canonical;
    if (!projectKey || !selectedBuilding) {
      setUnitSalesStatus({});
      setSalesStatusDraft(null);
      return;
    }
    let abort = false;
    async function run() {
      setLoadingSalesStatus(true);
      setSalesStatusError("");
      try {
        const timeline = await fetchMilestonesTimeline({
          project_id: projectKey,
          building_id: selectedBuilding,
          include_units: true,
          include_events: false,
        });
        if (abort) return;
        const map = {};
        (timeline.units || []).forEach(unit => {
          const key = unitKey(unit.building_id, unit.unit_number);
          if (key) map[key] = unit.sales_status || null;
        });
        setUnitSalesStatus(map);
        setSalesStatusDraft(map[unitKey(selectedBuilding, selectedUnit)] || null);
      } catch (err) {
        if (!abort) setSalesStatusError(err?.message || String(err));
      } finally {
        if (!abort) setLoadingSalesStatus(false);
      }
    }
    run();
    return () => { abort = true; };
  }, [activeProjectId, projectId, resolvedProjectId, selectedBuilding, selectedUnit]);

  useEffect(() => {
    const key = unitKey(selectedBuilding, selectedUnit);
    setSalesStatusDraft(unitSalesStatus[key] || null);
  }, [selectedBuilding, selectedUnit, unitSalesStatus]);

  useEffect(() => {
    if (!projectId || !selectedBuilding) return;
    let abort = false;
    async function run() {
      const canonical = activeProjectId || projectId;
      if (!canonical) return;
      const candidates = prioritizeCandidates(getProjectAliasCandidates(canonical));
      let applied = false;
      for (const candidate of candidates) {
        try {
          const res = await readBuildingSchedules({ project_id: candidate, building_id: selectedBuilding });
          if (abort) return;
          const items = res?.items || [];
          if (items.length > 0) {
            setResolvedProjectId(candidate);
          }
          const payload = pickBuildingPayloadFromItems(items);
          if (payload && Object.keys(payload).length > 0) {
            applyBuildingPayload(payload);
            applied = true;
            break;
          }
        } catch (err) {
          console.warn('building schedule load error', candidate, err);
        }
      }
      if (!applied && !abort) {
        applyBuildingPayload(null);
      }
    }
    run();
    return () => { abort = true; };
  }, [activeProjectId, projectId, selectedBuilding]);

  const buildings = useMemo(() => Array.from(new Set(units.map(u => u.building_id).filter(Boolean))).sort(), [units]);
  const unitsInBuilding = useMemo(
    () => units.filter(u => u.building_id === selectedBuilding).map(u => u.unit_number),
    [units, selectedBuilding]
  );

  useEffect(() => {
    if (!selectedBuilding) {
      setSelectedUnit("");
      return;
    }
    const availableUnits = units.filter(u => u.building_id === selectedBuilding).map(u => u.unit_number);
    if (availableUnits.length === 0) {
      setSelectedUnit("");
      return;
    }
    if (!availableUnits.includes(selectedUnit)) {
      setSelectedUnit(availableUnits[0]);
    }
  }, [selectedBuilding, units]);

  // Current per-building state helpers
  const bldgAnchor = buildingAnchors[selectedBuilding] || "";
  const bldgAct = buildingActivation[selectedBuilding] || { third: false, fourth: false };
  const bldgOv = buildingOverrides[selectedBuilding] || {};
  const bldgStages = buildingStages[selectedBuilding] || {};
  const bldgPreKickoff = !!buildingPreKickoff[selectedBuilding];
  const bldgProjectedCoe = buildingProjectedCoe[selectedBuilding] || "";

  const effectiveBldgAnchor = bldgPreKickoff ? "" : bldgAnchor;
  const effectiveBldgAct = bldgPreKickoff ? { third: false, fourth: false } : bldgAct;
  const effectiveBldgOv = bldgPreKickoff ? {} : bldgOv;
  const effectiveBldgStages = bldgPreKickoff ? {} : bldgStages;

  // Current per-unit state helpers
  const uKey = unitKey(selectedBuilding, selectedUnit);
  const unitAnchor = unitAnchors[uKey] || "";
  const uOv = unitOverrides[uKey] || {};
  const effectiveUnitAnchor = bldgPreKickoff ? "" : unitAnchor;
  const effectiveUnitOverrides = bldgPreKickoff ? {} : uOv;

  function setBuildingAnchor(val) {
    setBuildingAnchors(prev => ({ ...prev, [selectedBuilding]: val || "" }));
  }
  function setBuildingProjectedCoeValue(val) {
    setBuildingProjectedCoe(prev => ({ ...prev, [selectedBuilding]: val || "" }));
  }
  function setUnitAnchor(val) {
    setUnitAnchors(prev => ({ ...prev, [uKey]: val || "" }));
  }
  function setBuildingOverride(stepKey, val) {
    setBuildingOverrides(prev => ({ ...prev, [selectedBuilding]: { ...(prev[selectedBuilding] || {}), [stepKey]: val || "" } }));
  }
  function setUnitOverride(stepKey, val) {
    setUnitOverrides(prev => ({ ...prev, [uKey]: { ...(prev[uKey] || {}), [stepKey]: val || "" } }));
  }
  function setActivation(which, checked) {
    setBuildingActivation(prev => ({ ...prev, [selectedBuilding]: { ...(prev[selectedBuilding] || {}), [which]: !!checked } }));
  }

  function setPreKickoffFlag(val) {
    if (!selectedBuilding) return;
    setBuildingPreKickoff(prev => ({ ...prev, [selectedBuilding]: !!val }));
  }

  function updateStageState(stageKey, updater) {
    if (!selectedBuilding) return;
    setBuildingStages(prev => {
      const existing = prev[selectedBuilding] || {};
      const current = existing[stageKey] || { complete: false, date: '' };
      const nextValue = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [selectedBuilding]: { ...existing, [stageKey]: nextValue } };
    });
  }

  function handleStageToggle(stageKey, checked) {
    if (!selectedBuilding) return;
    const existing = bldgStages[stageKey] || { complete: false, date: '' };
    let nextDate = typeof existing.date === 'string' ? existing.date : '';
    if (checked && !nextDate) {
      const row = buildingRows.find(r => r.key === stageKey);
      if (row && typeof row.computed === 'string' && row.computed) {
        nextDate = row.computed;
      } else if (stageKey === 'foundation_start' && bldgAnchor) {
        nextDate = bldgAnchor;
      }
    }
    updateStageState(stageKey, { complete: !!checked, date: nextDate });
  }

  function handleStageDateChange(stageKey, value) {
    if (!selectedBuilding) return;
    const nextDate = value || '';
    updateStageState(stageKey, nextDate ? { complete: true, date: nextDate } : { complete: false, date: '' });
  }

  function normalizeOverrideMap(map) {
    if (!isPlainObject(map)) return {};
    const out = {};
    for (const [k, v] of Object.entries(map)) {
      if (v == null) continue;
      if (typeof v === 'string') {
        out[k] = v;
      } else if (typeof v === 'number') {
        out[k] = String(v);
      }
    }
    return out;
  }

  function normalizeActivation(value) {
    if (!isPlainObject(value)) return { third: false, fourth: false };
    return { third: !!value.third, fourth: !!value.fourth };
  }

  function normalizeStageState(payload) {
    const stageDates = isPlainObject(payload?.stage_dates) ? payload.stage_dates : {};
    const stagesObj = isPlainObject(payload?.stages) ? payload.stages : {};
    const overrides = isPlainObject(payload?.overrides) ? payload.overrides : {};
    const anchor = toDateString(payload?.anchor);
    const out = {};
    for (const key of EARLY_STAGE_KEYS) {
      const stageEntry = stagesObj[key];
      let date = '';
      let completeFlag;
      let derivedFromAnchor = false;
      if (isPlainObject(stageEntry)) {
        if (typeof stageEntry.date === 'string') {
          date = stageEntry.date;
        } else if (typeof stageEntry.completed_at === 'string') {
          date = stageEntry.completed_at;
        }
        if (typeof stageEntry.complete === 'boolean') {
          completeFlag = stageEntry.complete;
        }
      } else if (typeof stageEntry === 'string') {
        date = stageEntry;
      }
      if (!date && typeof stageDates[key] === 'string') {
        date = stageDates[key];
      }
      if (!date && typeof overrides[key] === 'string') {
        date = overrides[key];
      }
      if (!date && key === 'foundation_start' && anchor) {
        date = anchor;
        derivedFromAnchor = true;
      }
      let complete;
      if (typeof completeFlag === 'boolean') {
        complete = completeFlag;
      } else if (date && !derivedFromAnchor) {
        complete = true;
      } else {
        complete = false;
      }
      out[key] = { complete, date: date || '' };
    }
    return out;
  }

  function pickBuildingPayloadFromItems(items) {
    if (!Array.isArray(items)) return null;
    for (const item of items) {
      if (!item) continue;
      if (item.type === 'building' || item.sk === BUILDING_ITEM_SK) {
        const data = item.data || {};
        if (isPlainObject(data.building)) return data.building;
        if (isPlainObject(data)) return data;
      }
    }
    for (const item of items) {
      const data = item?.data;
      if (isPlainObject(data?.building)) return data.building;
    }
    return null;
  }

  function applyBuildingPayload(payload) {
    if (!selectedBuilding) return;
    const data = isPlainObject(payload) ? payload : {};
    const anchor = toDateString(data.anchor);
    const overrides = normalizeOverrideMap(data.overrides);
    const activation = normalizeActivation(data.activation);
    const stageState = normalizeStageState({ ...data, overrides, anchor });
    const preKickoff = !!data.pre_kickoff;
    const projectedCoe = toDateString(data.projected_coe);

    setBuildingAnchors(prev => ({ ...prev, [selectedBuilding]: anchor }));
    setBuildingOverrides(prev => ({ ...prev, [selectedBuilding]: overrides }));
    setBuildingActivation(prev => ({ ...prev, [selectedBuilding]: activation }));
    setBuildingStages(prev => ({ ...prev, [selectedBuilding]: stageState }));
    setBuildingPreKickoff(prev => ({ ...prev, [selectedBuilding]: preKickoff }));
    setBuildingProjectedCoe(prev => ({ ...prev, [selectedBuilding]: projectedCoe }));
  }

  function computeBuildingRows() {
    let prev = effectiveBldgAnchor || "";
    const rows = [];
    for (const step of BUILDING_STEPS) {
      if (step.conditional === "third" && !effectiveBldgAct.third) { rows.push({ ...step, active: false, computed: "" }); continue; }
      if (step.conditional === "fourth" && !effectiveBldgAct.fourth) { rows.push({ ...step, active: false, computed: "" }); continue; }
      const stageInfo = step.stageUnitKey ? (effectiveBldgStages[step.key] || {}) : null;
      let computed = "";
      if (stageInfo) {
        const stageDate = typeof stageInfo.date === "string" ? stageInfo.date : "";
        const override = effectiveBldgOv[step.key] || "";
        if (stageDate) {
          computed = stageDate;
        } else if (override) {
          computed = override;
        } else if (step.manual) {
          computed = prev;
        } else {
          computed = prev ? addWorkdays(prev, step.offset, holidaysSet) : "";
        }
        prev = computed;
        rows.push({ ...step, active: true, computed, stageComplete: !!stageInfo.complete });
        continue;
      }
      if (step.manual) {
        computed = prev;
      } else {
        const ov = effectiveBldgOv[step.key] || "";
        computed = ov || (prev ? addWorkdays(prev, step.offset, holidaysSet) : "");
      }
      prev = computed;
      rows.push({ ...step, active: true, computed });
    }
    return rows;
  }

  function computeUnitRows() {
    const rows = [];
    let prev = effectiveUnitAnchor || "";
    for (const step of UNIT_STEPS) {
      let computed = "";
      if (step.manual) {
        computed = prev;
      } else {
        const ov = effectiveUnitOverrides[step.key] || "";
        computed = ov || (prev ? addWorkdays(prev, step.offset, holidaysSet) : "");
      }
      prev = computed;
      rows.push({ ...step, active: true, computed });
    }

    return rows;
  }

  const buildingRows = useMemo(() => computeBuildingRows(), [effectiveBldgAnchor, effectiveBldgOv, effectiveBldgAct, effectiveBldgStages, holidaysSet]);
  const unitRows = useMemo(() => computeUnitRows(), [effectiveUnitAnchor, effectiveUnitOverrides, holidaysSet, uKey]);
  const currentSalesMeta = salesStatusDraft?.status_key
    ? SALES_STATUS_OPTIONS.find(opt => opt.key === salesStatusDraft.status_key)
    : null;
  const currentSalesColor = currentSalesMeta ? currentSalesMeta.color : null;

  async function handleSaveUnit() {
    const canonical = activeProjectId || projectId;
    const projectKey = resolvedProjectId || canonical;
    if (!projectKey || !selectedBuilding || !selectedUnit) {
      alert("Select project, building, and unit first");
      return;
    }
     const unitMeta = units.find(u => u.unit_number === selectedUnit);
     if (!unitMeta || unitMeta.building_id !== selectedBuilding) {
       alert("The selected unit does not belong to the current building. Please re-select both.");
       return;
     }
    const unit = { anchor: unitAnchor || "", overrides: uOv || {} };
    const salesPayload = salesStatusDraft && salesStatusDraft.status_key
      ? {
          status_key: salesStatusDraft.status_key,
          status_date: salesStatusDraft.status_date || "",
        }
      : null;
    if (salesPayload && !salesPayload.status_date) {
      alert("Select a sales status date before saving.");
      return;
    }
    try {
      await saveUnitsSchedule({ project_id: projectKey, building_id: selectedBuilding, unit_number: selectedUnit, unit });
      if (salesPayload) {
        const meta = SALES_STATUS_OPTIONS.find(opt => opt.key === salesPayload.status_key);
        const response = await saveSalesStatus({
          project_id: projectKey,
          building_id: selectedBuilding,
          unit_number: selectedUnit,
          contract_unit_number: selectedUnit,
          status_key: salesPayload.status_key,
          status_date: salesPayload.status_date,
          status_label: meta?.polarisLabel || STATUS_POLARIS_LABEL_BY_KEY[salesPayload.status_key] || salesPayload.status_key,
          status_color: meta?.color || STATUS_COLOR_BY_KEY[salesPayload.status_key] || "#4b5563",
        });
        const savedStatus = response?.item
          ? {
              status_key: response.item.status_key || salesPayload.status_key,
              status_label: response.item.status_label || meta?.polarisLabel || "",
              status_color: response.item.status_color || meta?.color || "",
              status_date: response.item.status_date || salesPayload.status_date,
            }
          : {
              status_key: salesPayload.status_key,
              status_label: meta?.polarisLabel || "",
              status_color: meta?.color || "",
              status_date: salesPayload.status_date,
            };
        const key = unitKey(selectedBuilding, selectedUnit);
        setUnitSalesStatus(prev => ({ ...prev, [key]: savedStatus }));
        setSalesStatusDraft(savedStatus);
      }
      alert(`Saved unit schedule for Building ${selectedBuilding}, Unit ${selectedUnit}`);
    } catch (e) {
      console.error("save unit error", e);
      alert(String(e?.message || e));
    }
  }

  async function handleSaveBuilding() {
    const canonical = activeProjectId || projectId;
    const projectKey = resolvedProjectId || canonical;
    if (!projectKey || !selectedBuilding) {
      alert("Select project and building first");
      return;
    }
    const stageState = buildingStages[selectedBuilding] || {};
    const stagesPayload = {};
    const stageDatesPayload = {};
    for (const step of EARLY_STAGE_STEPS) {
      const entry = stageState[step.key] || {};
      const date = typeof entry.date === 'string' ? entry.date : '';
      const hasDate = !!date;
      const isComplete = !!entry.complete && hasDate;
      if (entry.complete !== undefined || hasDate) {
        stagesPayload[step.key] = { complete: !!entry.complete, date: hasDate ? date : null };
      }
      if (isComplete) {
        stageDatesPayload[step.key] = date;
      }
    }
    const building = { anchor: bldgAnchor || '', overrides: bldgOv || {}, activation: bldgAct || {} };
    if (Object.keys(stagesPayload).length) building.stages = stagesPayload;
    if (Object.keys(stageDatesPayload).length) building.stage_dates = stageDatesPayload;
    if (typeof bldgPreKickoff === "boolean") building.pre_kickoff = bldgPreKickoff;
    if (bldgProjectedCoe) building.projected_coe = bldgProjectedCoe;
    const ok = window.confirm("This will overwrite the building schedule for all units in this building. Proceed?");
    if (!ok) return;
    try {
      await saveBuildingSchedule({ project_id: projectKey, building_id: selectedBuilding, building });
      alert(`Saved building schedule for Building ${selectedBuilding}`);
    } catch (e) {
      console.error("save building error", e);
      alert(String(e?.message || e));
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Building Milestones</h2>
        <p>Milestone tracking and schedule management</p>
      </div>

      <FormSection title="Context">
        <div className="grid-2">
          <label>
            Project ID
            <select value={projectId} onChange={e => { setProjectId(getCanonicalProjectId(e.target.value)); }}>
              {PROJECT_OPTIONS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Building ID
            <select value={selectedBuilding} onChange={e => { setSelectedBuilding(e.target.value); setSelectedUnit(""); }}>
              <option value="">-- Select --</option>
              {buildings.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={bldgPreKickoff}
              disabled={!selectedBuilding}
              onChange={e => setPreKickoffFlag(e.target.checked)}
            />
            Hold building until B1 (pre-kickoff)
          </label>
        </div>
      </FormSection>

      <FormSection title="Building schedule">
        <div className="grid-2">
          <label>
            Building anchor (Foundation Start)
            <input
              type="date"
              value={effectiveBldgAnchor}
              onChange={e => setBuildingAnchor(e.target.value)}
              disabled={!selectedBuilding || bldgPreKickoff}
            />
          </label>
          <div style={{ display: 'flex', alignItems: 'end', gap: 16 }}>
            <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!bldgAct.third}
                onChange={e => setActivation('third', e.target.checked)}
                disabled={!selectedBuilding || bldgPreKickoff}
              />
              Activate 3rd floor framing
            </label>
            <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={!!bldgAct.fourth}
                onChange={e => setActivation('fourth', e.target.checked)}
                disabled={!selectedBuilding || bldgPreKickoff}
              />
              Activate 4th floor framing
            </label>
          </div>
          <label>
            Projected COE (Ops)
            <input
              type="date"
              value={bldgProjectedCoe}
              onChange={e => setBuildingProjectedCoeValue(e.target.value)}
              disabled={!selectedBuilding}
            />
          </label>
        </div>
        {bldgPreKickoff && (
          <div className="banner info" style={{ marginTop: 12 }}>
            Building marked pre-kickoff. Milestones and overrides are paused until B1 is released.
          </div>
        )}
        {EARLY_STAGE_STEPS.length > 0 && (
          <div className="stage-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 12 }}>
            {EARLY_STAGE_STEPS.map(stage => {
              const state = bldgStages[stage.key] || { complete: false, date: '' };
              const disabled = !selectedBuilding || bldgPreKickoff;
              return (
                <div key={stage.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={!!state.complete}
                      disabled={disabled}
                      onChange={e => handleStageToggle(stage.key, e.target.checked)}
                    />
                    <span>{stage.label}</span>
                  </label>
                  <input
                    type="date"
                    value={state.date || ''}
                    disabled={disabled || !state.complete}
                    onChange={e => handleStageDateChange(stage.key, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        )}
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Milestone</th>
                <th>Offset (workdays)</th>
                <th>Date</th>
                <th>Override</th>
              </tr>
            </thead>
            <tbody>
              {buildingRows.map(r => (
              <tr key={r.key} className={!r.active ? 'row-alt' : ''}>
                <td className="text-strong">{r.label}</td>
                <td>{r.manual ? '-' : r.offset}</td>
                <td>{r.computed || ''}</td>
                <td>
                    {!r.manual && r.active && (
                      <input
                        type="date"
                        value={bldgPreKickoff ? '' : (bldgOv[r.key] || '')}
                        onChange={e => setBuildingOverride(r.key, e.target.value)}
                        disabled={bldgPreKickoff}
                      />
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </FormSection>

      <FormSection title="Unit schedule">
        <div className="grid-2">
            <label>
            Unit #
            <select value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)}>
              <option value="">-- Select --</option>
              {unitsInBuilding.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </label>
          <label>
            Unit anchor (frame inspection)
            <input
              type="date"
              value={effectiveUnitAnchor}
              onChange={e => setUnitAnchor(e.target.value)}
              disabled={!selectedBuilding || !selectedUnit || bldgPreKickoff}
            />
          </label>
        </div>
        <div className="grid-2" style={{ marginTop: 12 }}>
          <label>
            Sales status
            <select
              value={salesStatusDraft?.status_key || ""}
              onChange={e =>
                setSalesStatusDraft(prev => ({
                  ...(prev || {}),
                  status_key: e.target.value,
                  status_label: STATUS_POLARIS_LABEL_BY_KEY[e.target.value] || "",
                  status_color: STATUS_COLOR_BY_KEY[e.target.value] || "",
                }))
              }
              disabled={!selectedUnit || bldgPreKickoff || loadingSalesStatus}
            >
              <option value="">-- Select --</option>
              {SALES_STATUS_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>
                  {opt.polarisLabel}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status date
            <input
              type="date"
              value={salesStatusDraft?.status_date || ""}
              onChange={e =>
                setSalesStatusDraft(prev => ({
                  ...(prev || {}),
                  status_date: e.target.value,
                }))
              }
              disabled={!selectedUnit || !salesStatusDraft?.status_key || bldgPreKickoff || loadingSalesStatus}
            />
          </label>
        </div>
        {salesStatusError && (
          <div className="banner warn" style={{ marginTop: 8 }}>
            {salesStatusError}
          </div>
        )}
        {currentSalesMeta && (
          <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
            <span
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: 999,
                backgroundColor: currentSalesColor || "#4b5563",
                color: "#fff",
                fontSize: 12,
                textTransform: "uppercase",
              }}
            >
              {currentSalesMeta.shortLabel || currentSalesMeta.polarisLabel}
            </span>
            {salesStatusDraft?.status_date && (
              <span style={{ fontSize: 12, color: "#374151" }}>{salesStatusDraft.status_date}</span>
            )}
          </div>
        )}

        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Milestone</th>
                <th>Offset (workdays)</th>
                <th>Date</th>
                <th>Override</th>
              </tr>
            </thead>
            <tbody>
              {unitRows.map(r => (
                <tr key={r.key}>
                <td className="text-strong">{r.label}</td>
                <td>{r.manual ? '-' : r.offset}</td>
                <td>{r.computed || ''}</td>
                <td>
                    {!r.manual && (
                      <input
                        type="date"
                        value={bldgPreKickoff ? '' : (uOv[r.key] || '')}
                        onChange={e => setUnitOverride(r.key, e.target.value)}
                        disabled={!selectedUnit || bldgPreKickoff}
                      />
                    )}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </FormSection>

      <div className="actions">
        <button className="btn" onClick={() => window.print()}>Print</button>
        <button className="btn" title="Overwrites building milestones for this building" onClick={handleSaveBuilding}>Save building</button>
        <button className="btn primary" onClick={handleSaveUnit}>Save unit</button>
      </div>
    </div>
  );
}