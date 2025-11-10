export const STATUS_DEFINITIONS = [
  {
    key: "projected_coe",
    polarisLabel: "Projected COE",
    cooLabel: "Projected COE",
    shortLabel: "Projected COE",
    color: "#9ecae1",
  },
  {
    key: "unreleased",
    polarisLabel: "Pending Release",
    cooLabel: "Unreleased",
    shortLabel: "Pending",
    color: "#636363",
  },
  {
    key: "inventory",
    polarisLabel: "Available",
    cooLabel: "Inventory",
    shortLabel: "Available",
    color: "#31a354",
  },
  {
    key: "offer",
    polarisLabel: "Offer - Out for signature",
    cooLabel: "Offer",
    shortLabel: "Offer",
    color: "#9c9ede",
  },
  {
    key: "backlog",
    polarisLabel: "Ratified - Fully executed",
    cooLabel: "Backlog",
    shortLabel: "Ratified",
    color: "#fdae6b",
  },
  {
    key: "closed",
    polarisLabel: "Closed",
    cooLabel: "Closed",
    shortLabel: "Closed",
    color: "#e34a33",
  },
];

export const STATUS_META = STATUS_DEFINITIONS.map(def => ({
  key: def.key,
  label: def.polarisLabel,
  short: def.shortLabel,
  color: def.color,
}));

export const STATUS_COLOR_BY_KEY = STATUS_META.reduce((map, meta) => {
  map[meta.key] = meta.color;
  return map;
}, {});

export const STATUS_POLARIS_LABEL_BY_KEY = STATUS_META.reduce((map, meta) => {
  map[meta.key] = meta.label;
  return map;
}, {});

export const STATUS_COO_LABEL_BY_KEY = STATUS_DEFINITIONS.reduce((map, def) => {
  map[def.key] = def.cooLabel;
  return map;
}, {});

export const STATUS_KEYS = STATUS_META.map(meta => meta.key);