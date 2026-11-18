/*
 * ha-cards – Dashboard-Karten für Home Assistant im Stil der Growatt-SPH-Karte.
 *
 *   custom:hc-weather-station-card   Wetterstation (Homematic HM-WDS100 u. ä.)
 *   custom:hc-diskstation-card       Synology DiskStation (Integration synology_dsm)
 *   custom:hc-dishwasher-card        Geschirrspüler (Integration home_connect)
 *   custom:hc-wallbox-card           Tesla Wall Connector (Integration tesla_wall_connector)
 *   custom:hc-printer-card           Drucker (Integration ipp)
 *
 * Beide Karten finden ihre Entitäten selbst; die minimale Konfiguration ist nur der Typ.
 * Gestaltung angelehnt an die Karten von BavarianData (Chris Krammer, MIT),
 * https://github.com/JustChr/BavarianData – eigener Code, keine Grafiken übernommen.
 * MIT-Lizenz, Nutzung auf eigene Verantwortung.
 */

const HC_VERSION = "0.3.0";

// Material-Design-Icons (Apache 2.0, Pictogrammers) als Inline-SVG
const HC_ICONS = {
  sun: "M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.04,15.5C18.46,14.77 18.73,14 18.87,13.21L20.64,17M12,22L9.59,18.56C10.33,18.83 11.14,19 12,19C12.82,19 13.63,18.83 14.37,18.56L12,22Z",
  drop: "M12,20A6,6 0 0,1 6,14C6,10 12,3.25 12,3.25C12,3.25 18,10 18,14A6,6 0 0,1 12,20Z",
  humidity: "M12,3.25C12,3.25 6,10 6,14C6,17.32 8.69,20 12,20A6,6 0 0,0 18,14C18,10 12,3.25 12,3.25M14.47,9.97L15.53,11.03L9.53,17.03L8.47,15.97M10,10A1,1 0 0,1 11,11A1,1 0 0,1 10,12A1,1 0 0,1 9,11A1,1 0 0,1 10,10M14,14A1,1 0 0,1 15,15A1,1 0 0,1 14,16A1,1 0 0,1 13,15A1,1 0 0,1 14,14Z",
  wind: "M4,10A1,1 0 0,1 3,9A1,1 0 0,1 4,8H12A2,2 0 0,0 14,6A2,2 0 0,0 12,4C11.45,4 10.95,4.22 10.59,4.59C10.2,5 9.56,5 9.17,4.59C8.78,4.2 8.78,3.56 9.17,3.17C9.9,2.45 10.9,2 12,2A4,4 0 0,1 16,6A4,4 0 0,1 12,10H4M19,12A1,1 0 0,0 20,11A1,1 0 0,0 19,10C18.72,10 18.47,10.11 18.29,10.29C17.9,10.68 17.27,10.68 16.88,10.29C16.5,9.9 16.5,9.27 16.88,8.88C17.42,8.34 18.17,8 19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14H5A1,1 0 0,1 4,13A1,1 0 0,1 5,12H19M18,18H4A1,1 0 0,1 3,17A1,1 0 0,1 4,16H18A3,3 0 0,1 21,19A3,3 0 0,1 18,22C17.17,22 16.42,21.66 15.88,21.12C15.5,20.73 15.5,20.1 15.88,19.71C16.27,19.32 16.9,19.32 17.29,19.71C17.47,19.89 17.72,20 18,20A1,1 0 0,0 19,19A1,1 0 0,0 18,18Z",
  cloud: "M6.5,20Q4.22,20 2.61,18.43Q1,16.85 1,14.58Q1,12.63 2.17,11.1Q3.35,9.57 5.25,9.15Q5.88,6.85 7.75,5.43Q9.63,4 12,4Q14.93,4 16.96,6.04Q19,8.07 19,11Q20.73,11.2 21.86,12.5Q23,13.78 23,15.5Q23,17.38 21.69,18.69Q20.38,20 18.5,20Z",
  thermo: "M15,13V5A3,3 0 0,0 9,5V13A5,5 0 1,0 15,13M12,4A1,1 0 0,1 13,5V8H11V5A1,1 0 0,1 12,4Z",
  battery: "M16,20H8V6H16M16.67,4H15V2H9V4H7.33A1.33,1.33 0 0,0 6,5.33V20.67C6,21.4 6.6,22 7.33,22H16.67A1.33,1.33 0 0,0 18,20.67V5.33C18,4.6 17.4,4 16.67,4Z",
  cpu: "M17,17H7V7H17M21,11V9H19V7C19,5.89 18.1,5 17,5H15V3H13V5H11V3H9V5H7C5.89,5 5,5.89 5,7V9H3V11H5V13H3V15H5V17A2,2 0 0,0 7,19H9V21H11V19H13V21H15V19H17A2,2 0 0,0 19,17V15H21V13H19V11M13,13H11V11H13M15,9H9V15H15V9Z",
  memory: "M6,4H18V5H21V7H18V9H21V11H18V13H21V15H18V17H21V19H18V20H6V19H3V17H6V15H3V13H6V11H3V9H6V7H3V5H6V4M11,15V18H12V15H11M13,15V18H14V15H13M15,15V18H16V15H15Z",
  upload: "M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z",
  download: "M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z",
  disk: "M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M12,4A6,6 0 0,0 6,10C6,13.31 8.69,16 12.1,16L11.22,13.77C10.95,13.29 11.11,12.68 11.59,12.4L12.45,11.9C12.93,11.63 13.54,11.79 13.82,12.27L15.74,14.69C17.12,13.59 18,11.9 18,10A6,6 0 0,0 12,4M12,9A1,1 0 0,1 13,10A1,1 0 0,1 12,11A1,1 0 0,1 11,10A1,1 0 0,1 12,9M7,18A1,1 0 0,0 6,19A1,1 0 0,0 7,20A1,1 0 0,0 8,19A1,1 0 0,0 7,18M12.09,13.27L14.58,19.58L17.17,18.08L12.95,12.77L12.09,13.27Z",
  shield: "M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z",
  alert: "M13,14H11V9H13M13,18H11V16H13M1,21H23L12,2L1,21Z",
  printer: "M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z",
  ev: "M19.77,7.23L19.78,7.22L16.06,3.5L15,4.56L17.11,6.67C16.17,7.03 15.5,7.93 15.5,9A2.5,2.5 0 0,0 18,11.5C18.36,11.5 18.69,11.42 19,11.29V18.5A1,1 0 0,1 18,19.5A1,1 0 0,1 17,18.5V14A2,2 0 0,0 15,12H14V5A2,2 0 0,0 12,3H6A2,2 0 0,0 4,5V21H14V13.5H15.5V18.5A2.5,2.5 0 0,0 18,21A2.5,2.5 0 0,0 20.5,18.5V9C20.5,8.31 20.22,7.68 19.77,7.23M18,10A1,1 0 0,1 17,9A1,1 0 0,1 18,8A1,1 0 0,1 19,9A1,1 0 0,1 18,10M8,18V13.5H6L10,6V11H12L8,18Z",
  clock: "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z",
  door: "M8,3C6.89,3 6,3.89 6,5V21H18V5C18,3.89 17.11,3 16,3H8M8,5H16V19H8V5M13,11V13H15V11H13Z",
  bolt: "M11,15H6L13,1V9H18L11,23V15Z",
  chart: "M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z",
  play: "M8,5.14V19.14L19,12.14L8,5.14Z",
  stop: "M18,18H6V6H18V18Z",
  salt: "M12,2L9,9H15L12,2M7,10A2,2 0 0,0 5,12V20A2,2 0 0,0 7,22H17A2,2 0 0,0 19,20V12A2,2 0 0,0 17,10H7Z",
  wifi: "M12,21L15.6,16.2C14.6,15.45 13.35,15 12,15C10.65,15 9.4,15.45 8.4,16.2L12,21M12,3C7.95,3 4.21,4.34 1.2,6.6L3,9C5.5,7.12 8.62,6 12,6C15.38,6 18.5,7.12 21,9L22.8,6.6C19.79,4.34 16.05,3 12,3M12,9C9.3,9 6.81,9.89 4.8,11.4L6.6,13.8C8.1,12.67 9.97,12 12,12C14.03,12 15.9,12.67 17.4,13.8L19.2,11.4C17.19,9.89 14.7,9 12,9Z",
  qrcode: "M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H11V13H9V11M15,11H17V13H19V11H21V13H19V15H21V19H19V21H17V19H13V21H11V17H15V15H17V13H15V11M19,19V15H17V19H19M15,3H21V9H15V3M17,5V7H19V5H17M3,3H9V9H3V3M5,5V7H7V5H5M3,15H9V21H3V15M5,17V19H7V17H5Z",
  lan: "M10,2C8.89,2 8,2.89 8,4V7C8,8.11 8.89,9 10,9H11V11H2V13H6V15H5C3.89,15 3,15.89 3,17V20C3,21.11 3.89,22 5,22H9C10.11,22 11,21.11 11,20V17C11,15.89 10.11,15 9,15H8V13H16V15H15C13.89,15 13,15.89 13,17V20C13,21.11 13.89,22 15,22H19C20.11,22 21,21.11 21,20V17C21,15.89 20.11,15 19,15H18V13H22V11H13V9H14C15.11,9 16,8.11 16,7V4C16,2.89 15.11,2 14,2H10M10,4H14V7H10V4M5,17H9V20H5V17M15,17H19V20H15V17Z",
  router: "M20.2,5.9L21,5.1C19.6,3.7 17.8,3 16,3C14.2,3 12.4,3.7 11,5.1L11.8,5.9C13,4.8 14.5,4.2 16,4.2C17.5,4.2 19,4.8 20.2,5.9M19.3,6.7C18.4,5.8 17.2,5.3 16,5.3C14.8,5.3 13.6,5.8 12.7,6.7L13.5,7.5C14.2,6.8 15.1,6.5 16,6.5C16.9,6.5 17.8,6.8 18.5,7.5L19.3,6.7M19,13H17V9H15V13H5A2,2 0 0,0 3,15V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V15A2,2 0 0,0 19,13M8,18H6V16H8V18M11.5,18H9.5V16H11.5V18M15,18H13V16H15V18Z",
};

const hcIcon = (name, cls = "") =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${HC_ICONS[name]}"/></svg>`;
const hcEsc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---------------------------------------------------------------------------
// Gemeinsame Basis: Rendering, Formatierung, Detaildialog, Statistikabruf
// ---------------------------------------------------------------------------
class HcBaseCard extends HTMLElement {
  setConfig(config) {
    this._config = { ...(config || {}) };
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    }
    this._map = null;
    this._last = "";
    this._paint();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._map) this._discover();
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => {
      this._raf = null;
      this._paint();
    });
  }

  getCardSize() {
    return 7;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  // ---- Zugriff ----
  _st(key) {
    const id = this._map?.[key];
    return id ? this._hass.states[id] : undefined;
  }

  _num(key) {
    const s = this._st(key);
    if (!s) return null;
    const v = parseFloat(s.state);
    return Number.isFinite(v) ? v : null;
  }

  _on(key) {
    const s = this._st(key);
    return s ? s.state === "on" : null;
  }

  // Zustand als Text in der Sprache von HA (Übersetzungen der Integration), sonst eigene Tabelle
  _stateText(key, fallback = {}) {
    const st = this._st(key);
    if (!st) return "–";
    if (fallback[st.state]) return fallback[st.state];
    try {
      if (this._hass.formatEntityState) return this._hass.formatEntityState(st);
    } catch (e) { /* ältere Frontends */ }
    return st.state;
  }

  // Entitäten einer Integration nach Rollen zuordnen: {rolle: [[translation_keys], /muster in entity_id/]}
  _discoverPlatform(platform, roles, anchorRole) {
    const hass = this._hass;
    if (!hass?.entities) return null;
    const ents = Object.values(hass.entities).filter((e) => e.platform === platform);
    if (!ents.length) return null;
    const match = (e, [keys, re]) => keys.includes(e.translation_key) || (re && re.test(e.entity_id));
    let device = this._config.device_id;
    if (!device) device = (ents.find((e) => match(e, roles[anchorRole])) || ents[0]).device_id;
    const own = ents.filter((e) => e.device_id === device);
    const map = {};
    for (const [role, spec] of Object.entries(roles)) {
      const hit = own.find((e) => spec[0].includes(e.translation_key)) || own.find((e) => spec[1] && spec[1].test(e.entity_id));
      if (hit) map[role] = hit.entity_id;
    }
    for (const [role, id] of Object.entries(this._config.entities || {})) if (id) map[role] = id;
    this._deviceId = device;
    return { map, own };
  }

  _devName(fallback) {
    const d = this._hass.devices?.[this._deviceId];
    return d?.name_by_user || d?.name || fallback;
  }

  _clock(t) {
    return new Date(t).toLocaleTimeString(this._lang, { hour: "2-digit", minute: "2-digit" });
  }

  _confirmCall(question, domain, service, data) {
    if (!window.confirm(question)) return;
    this._hass.callService(domain, service, data).catch((err) => {
      this.dispatchEvent(new CustomEvent("hass-notification", { detail: { message: err?.message || String(err) }, bubbles: true, composed: true }));
    });
  }

  // ---- Formatierung ----
  get _lang() {
    return this._hass?.locale?.language || this._hass?.language || "de";
  }

  _fmt(v, digits = 0) {
    if (v === null || v === undefined || !Number.isFinite(v)) return "–";
    return v.toLocaleString(this._lang, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }

  _freshest() {
    let best = null;
    for (const id of Object.values(this._map || {})) {
      const st = this._hass.states[id];
      if (!st || st.state === "unavailable") continue;
      const t = Date.parse(st.last_reported || st.last_updated || "");
      if (Number.isFinite(t) && (best === null || t > best)) best = t;
    }
    return best;
  }

  _ago(t) {
    if (t === null || t === undefined) return "";
    const s = Math.max(0, Math.round((Date.now() - t) / 1000));
    if (s < 60) return `vor ${s} s`;
    const m = Math.round(s / 60);
    return m < 60 ? `vor ${m} min` : `vor ${Math.round(m / 60)} h`;
  }

  _pill(staleAfterMs, bad = false) {
    const fresh = this._freshest();
    const stale = fresh !== null && Date.now() - fresh > staleAfterMs;
    return `<div class="pill" title="Letzte Daten"><span class="dot ${bad || stale ? "bad" : ""}"></span>${hcEsc(this._ago(fresh))}</div>`;
  }

  // ---- Bausteine ----
  _tile(icon, value, label, cls = "", key = null) {
    const inner = `${hcIcon(icon, cls)}<div><div class="tv">${value}</div><div class="tl">${hcEsc(label)}</div></div>`;
    return key && this._map?.[key]
      ? `<button class="tile click" data-more="${key}" aria-label="${hcEsc(label)}: Verlauf anzeigen">${inner}</button>`
      : `<div class="tile">${inner}</div>`;
  }

  _paint() {
    if (!this.shadowRoot || !this._config) return;
    let body = "";
    if (this._hass) body = this._map ? this._render() : `<div class="empty">${hcEsc(this._emptyText())}</div>`;
    const html = `<style>${HC_STYLES}${this._styles ? this._styles() : ""}</style><ha-card>${body}</ha-card>`;
    if (html === this._last) return;
    this._last = html;
    this.shadowRoot.innerHTML = html;
  }

  _onClick(ev) {
    const act = ev.composedPath().find((n) => n.dataset && n.dataset.action);
    if (act && this._action) { this._action(act.dataset.action); return; }
    const el = ev.composedPath().find((n) => n.dataset && n.dataset.more);
    if (!el) return;
    const entityId = this._map?.[el.dataset.more];
    if (entityId) {
      this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
    }
  }

  // Stündliche Langzeitstatistik ab gestern 23:00 holen (alle 10 min), Ergebnis in this._stats
  _ensureStats(keys) {
    const ids = keys.map((k) => this._map?.[k]).filter(Boolean);
    if (!ids.length || this._statsLoading) return;
    const now = Date.now();
    const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
    if (this._statsAt && now - this._statsAt < 600000 && this._statsDay === midnight.getTime()) return;
    if (this._statsFailedAt && now - this._statsFailedAt < 60000) return;
    this._statsLoading = true;
    this._hass.callWS({
      type: "recorder/statistics_during_period",
      start_time: new Date(midnight.getTime() - 3600e3).toISOString(),
      statistic_ids: ids,
      period: "hour",
      types: ["state", "min", "max", "change"],
    }).then((res) => {
      this._stats = { res, midnight: midnight.getTime() };
      this._statsAt = Date.now();
      this._statsDay = midnight.getTime();
      this._statsLoading = false;
      this._last = "";
      this._paint();
    }).catch(() => {
      this._statsLoading = false;
      this._statsFailedAt = Date.now();
    });
  }

  _rows(key) {
    const id = this._map?.[key];
    return (id && this._stats?.res?.[id]) || [];
  }

  // Zuwachs eines Zählers seit Mitternacht (Stand jetzt − Stand um 0 Uhr; bei Rücksetzen Summe der Änderungen)
  _sinceMidnight(key) {
    const rows = this._rows(key);
    const cur = this._num(key);
    if (!rows.length || cur === null) return null;
    const mid = this._stats.midnight;
    const start = (r) => (typeof r.start === "number" ? r.start : Date.parse(r.start));
    const before = rows.filter((r) => start(r) < mid).pop();
    if (before && before.state !== null && before.state !== undefined && cur >= before.state) return cur - before.state;
    return rows.filter((r) => start(r) >= mid).reduce((a, r) => a + Math.max(0, r.change ?? 0), 0);
  }

  _minMaxToday(key) {
    const mid = this._stats?.midnight;
    const start = (r) => (typeof r.start === "number" ? r.start : Date.parse(r.start));
    const rows = this._rows(key).filter((r) => start(r) >= mid);
    const cur = this._num(key);
    const mins = rows.map((r) => r.min).filter((v) => v !== null && v !== undefined);
    const maxs = rows.map((r) => r.max).filter((v) => v !== null && v !== undefined);
    if (cur !== null) { mins.push(cur); maxs.push(cur); }
    if (!mins.length) return { min: null, max: null };
    return { min: Math.min(...mins), max: Math.max(...maxs) };
  }
}

// ---------------------------------------------------------------------------
// Wetterstation
// ---------------------------------------------------------------------------
// Homematic-Parameter -> Rolle; andere Stationen über device_class bzw. Konfiguration
const HC_WX_PARAMS = {
  TEMPERATURE: "temperature", HUMIDITY: "humidity", WIND_SPEED: "wind_speed",
  WIND_DIRECTION: "wind_direction", WIND_DIRECTION_RANGE: "wind_range", RAIN_COUNTER: "rain_total",
  RAINING: "raining", SUNSHINEDURATION: "sunshine", BRIGHTNESS: "brightness", LOWBAT: "battery_low",
};
const HC_WX_KEYS = Object.values(HC_WX_PARAMS);
const HC_DIRS = ["Nord", "Nordost", "Ost", "Südost", "Süd", "Südwest", "West", "Nordwest"];

class HcWeatherStationCard extends HcBaseCard {
  static getStubConfig() {
    return {};
  }

  static getConfigElement() {
    return document.createElement("hc-weather-station-card-editor");
  }

  _emptyText() {
    return "Keine Wetterstation gefunden. In der Kartenkonfiguration unter entities zuordnen (temperature, humidity, wind_speed, …).";
  }

  _discover() {
    const hass = this._hass;
    if (!hass?.states) return;
    const map = {};
    // 1) Gerät mit Regenzähler/Windmesser suchen (Homematic: Attribut "parameter")
    let device = this._config.device_id;
    if (!device && hass.entities) {
      for (const ent of Object.values(hass.entities)) {
        const p = hass.states[ent.entity_id]?.attributes?.parameter;
        if (p === "RAIN_COUNTER" || p === "WIND_SPEED") { device = ent.device_id; break; }
      }
    }
    if (device && hass.entities) {
      for (const ent of Object.values(hass.entities)) {
        if (ent.device_id !== device) continue;
        const role = HC_WX_PARAMS[hass.states[ent.entity_id]?.attributes?.parameter];
        if (role && !map[role]) map[role] = ent.entity_id;
      }
      this._deviceId = device;
    }
    // 2) Ausdrückliche Zuordnung aus der Konfiguration gewinnt
    for (const [role, id] of Object.entries(this._config.entities || {})) {
      if (HC_WX_KEYS.includes(role) && id) map[role] = id;
    }
    if (map.temperature) this._map = map;
  }

  _model() {
    const raining = this._on("raining") === true;
    const sun = this._hass.states["sun.sun"];
    const brightness = this._num("brightness");
    const night = sun ? sun.state === "below_horizon" : brightness !== null && brightness < 15;
    const sunSt = this._st("sunshine");
    const sunny = !night && !raining && sunSt && Date.now() - Date.parse(sunSt.last_changed) < 20 * 60000;
    const wind = this._num("wind_speed");
    return {
      temp: this._num("temperature"), hum: this._num("humidity"), wind, dir: this._num("wind_direction"),
      range: this._num("wind_range"), raining, night, sunny, windy: (wind ?? 0) >= 20, calm: (wind ?? 0) < 2,
      rainToday: this._sinceMidnight("rain_total"), sunToday: this._sinceMidnight("sunshine"),
      mm: this._minMaxToday("temperature"), lowbat: this._on("battery_low") === true,
    };
  }

  _dirName(deg) {
    if (deg === null) return "";
    return HC_DIRS[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
  }

  _hero(m) {
    const scene = m.raining ? "rain" : m.night ? "night" : m.sunny ? "sunny" : "cloudy";
    const drops = m.raining
      ? Array.from({ length: 11 }, (_, i) => `<line class="drop" x1="${136 + i * 14}" y1="136" x2="${130 + i * 14}" y2="150" style="animation-delay:${(i % 5) * 0.18}s"/>`).join("")
      : "";
    const windLines = m.windy
      ? `<path class="gust" d="M20 140 H120 a10 10 0 1 0 -10 -10"/><path class="gust g2" d="M40 160 H180"/>` : "";
    return `
      <div class="hero wx ${scene}">
        <div class="hero__top"><div class="hero__title">${hcEsc(this._config.title || "Wetterstation")}</div>${this._pill(15 * 60000, m.lowbat)}</div>
        <svg class="scene" viewBox="0 0 400 190" role="img" aria-label="Wetter">
          ${scene === "night" || (m.night && m.raining) ? `<path class="moon" d="M318 44a20 20 0 1 0 16 33a17 17 0 0 1-16-33z"/><circle class="star" cx="250" cy="40" r="1.6"/><circle class="star" cx="280" cy="70" r="1.2"/><circle class="star" cx="360" cy="96" r="1.4"/>` : ""}
          ${scene === "sunny" ? `<g class="sunrays"><circle class="sunc" cx="300" cy="70" r="26"/></g>` : ""}
          ${scene === "cloudy" ? `<circle class="sunc dim" cx="300" cy="66" r="22"/>` : ""}
          <g class="clouds ${m.windy ? "fast" : ""}">
            ${scene !== "sunny" ? `<path class="cloud big" d="M120 96 a26 26 0 0 1 50 -12 a32 32 0 0 1 60 12 a20 20 0 0 1 0 36 h-110 a18 18 0 0 1 0 -36z"/>` : ""}
            <path class="cloud small" d="M250 120 a16 16 0 0 1 30 -8 a20 20 0 0 1 38 8 a12 12 0 0 1 0 22 h-68 a11 11 0 0 1 0 -22z"/>
          </g>
          ${drops}
          ${windLines}
          <path class="hill" d="M0 170 Q100 150 200 166 T400 160 V190 H0 Z"/>
        </svg>
      </div>`;
  }

  _compass(m) {
    const deg = m.dir ?? 0;
    const range = Math.max(0, Math.min(180, m.range ?? 0));
    // Fächer = Schwankungsbereich der Richtung
    const arc = (a) => {
      const r = 38, rad = ((a - 90) * Math.PI) / 180;
      return [50 + r * Math.cos(rad), 50 + r * Math.sin(rad)];
    };
    const [x1, y1] = arc(deg - range / 2);
    const [x2, y2] = arc(deg + range / 2);
    const fan = range > 4 ? `<path class="fan" d="M50 50 L${x1} ${y1} A38 38 0 ${range > 180 ? 1 : 0} 1 ${x2} ${y2} Z"/>` : "";
    return `<svg class="compass" viewBox="0 0 100 100" aria-hidden="true">
      <circle class="ring" cx="50" cy="50" r="44"/>
      ${["N", "O", "S", "W"].map((t, i) => {
        const [x, y] = [[50, 15], [87, 54], [50, 93], [13, 54]][i];
        return `<text x="${x}" y="${y}">${t}</text>`;
      }).join("")}
      ${m.dir !== null && !m.calm ? fan : ""}
      ${m.dir !== null && !m.calm ? `<g transform="rotate(${deg + 180} 50 50)"><path class="arrow" d="M50 18 L58 40 L50 35 L42 40 Z"/><line class="shaft" x1="50" y1="35" x2="50" y2="74"/></g>` : ""}
    </svg>`;
  }

  _render() {
    this._ensureStats(["temperature", "rain_total", "sunshine"]);
    const m = this._model();
    const calm = m.calm;
    const windTxt = calm ? "Windstill" : `Wind ${this._fmt(m.wind, 0)} km/h aus ${this._dirName(m.dir)}`;
    let title;
    if (m.raining) title = `Es regnet${m.rainToday ? ` · ${this._fmt(m.rainToday, 1)} mm heute` : ""}`;
    else if (m.sunny) title = "Sonnig";
    else if (m.night) title = "Trockene Nacht";
    else title = (m.rainToday ?? 0) > 0.2 ? "Trocken – heute schon Regen" : "Bewölkt, trocken";
    const sunH = m.sunToday === null ? null : m.sunToday / 60;
    return `
      ${this._hero(m)}
      <div class="main">
        <div class="head">${hcEsc(title)}</div>
        <div class="sub">${hcEsc(windTxt)}</div>
        <div class="big">
          <button class="soc click" data-more="temperature" aria-label="Temperatur: Verlauf anzeigen">
            <span class="bn">${this._fmt(m.temp, 1)}</span><span class="bu">°C</span><div class="bl">jetzt</div></button>
          <div class="right"><div class="hilo"><span>↑ ${this._fmt(m.mm.max, 1)}°</span><span>↓ ${this._fmt(m.mm.min, 1)}°</span></div><div class="bl">heute</div></div>
        </div>
        <div class="windrow">
          ${this._compass(m)}
          <div class="windinfo"><div class="tv">${calm ? "Windstill" : `${this._fmt(m.wind, 0)} km/h`}</div>
            <div class="tl">${calm || m.dir === null ? "keine Windrichtung" : `aus ${hcEsc(this._dirName(m.dir))} (${this._fmt(m.dir, 0)}°)${m.range ? ` · schwankt ±${this._fmt(m.range / 2, 0)}°` : ""}`}</div></div>
        </div>
        <div class="tiles">
          ${this._tile("humidity", `${this._fmt(m.hum, 0)} %`, "Luftfeuchte", "blue", "humidity")}
          ${this._tile("wind", calm ? "0 km/h" : `${this._fmt(m.wind, 0)} km/h`, "Wind", "", "wind_speed")}
          ${this._tile("drop", `${this._fmt(m.rainToday, 1)} mm`, "Regen heute", m.raining ? "blue" : "", "rain_total")}
          ${this._tile("sun", sunH === null ? "–" : `${this._fmt(sunH, 1)} h`, "Sonne heute", "amber", "sunshine")}
        </div>
      </div>
      <div class="foot">
        ${m.lowbat ? `<span class="warn">${hcIcon("alert")}Batterie der Wetterstation schwach</span>` : `<span>${hcIcon("battery")}Batterie in Ordnung</span>`}
        <span>${hcIcon("sun")}Helligkeit ${this._fmt(this._num("brightness"), 0)} · Regen gesamt ${this._fmt(this._num("rain_total"), 1)} mm</span>
      </div>`;
  }

  _styles() {
    return `
      .hero.wx.sunny { background: linear-gradient(180deg, #4f97e3 0%, #8ec1f2 55%, #cfe6fb 100%); }
      .hero.wx.cloudy { background: linear-gradient(180deg, #8a99ab 0%, #b7c3d1 55%, #dde4ec 100%); }
      .hero.wx.rain { background: linear-gradient(180deg, #5d6b7c 0%, #7f8c9b 55%, #aab5c1 100%); }
      .hero.wx.night { background: linear-gradient(180deg, #172238 0%, #2c3d5c 55%, #455877 100%); }
      .scene .cloud { fill: #f4f6f9; } .rain .scene .cloud, .cloudy .scene .cloud.big { fill: #e3e8ee; }
      .night .scene .cloud { fill: #6f7f99; opacity: .8; }
      .scene .clouds { animation: hc-drift 18s ease-in-out infinite alternate; }
      .scene .clouds.fast { animation-duration: 5s; }
      @keyframes hc-drift { from { transform: translateX(-10px); } to { transform: translateX(14px); } }
      .scene .sunc { fill: #ffd34a; filter: drop-shadow(0 0 12px rgba(255,210,60,.9)); }
      .scene .sunc.dim { fill: #f3e2a6; filter: none; opacity: .8; }
      .scene .moon { fill: #f1f3f8; } .scene .star { fill: #fff; }
      .scene .drop { stroke: #3b82d6; stroke-width: 2.4; stroke-linecap: round; animation: hc-rain .9s linear infinite; }
      @keyframes hc-rain { from { transform: translateY(-6px); opacity: 0; } 30% { opacity: 1; } to { transform: translateY(40px); opacity: 0; } }
      .scene .gust { fill: none; stroke: rgba(255,255,255,.85); stroke-width: 3; stroke-linecap: round; stroke-dasharray: 60 200; animation: hc-gust 2.2s linear infinite; }
      .scene .gust.g2 { animation-delay: .8s; }
      @keyframes hc-gust { from { stroke-dashoffset: 260; } to { stroke-dashoffset: 0; } }
      .scene .hill { fill: rgba(70,120,70,.35); } .night .scene .hill { fill: rgba(20,30,45,.6); }
      .hilo { display: flex; flex-direction: column; align-items: flex-end; font-size: 20px; font-weight: 800; line-height: 1.25; }
      .windrow { display: flex; align-items: center; gap: 16px; margin: 16px 0 4px; }
      .compass { width: 96px; height: 96px; flex: none; }
      .compass .ring { fill: var(--hc-tile); stroke: var(--hc-track); stroke-width: 2; }
      .compass text { font-size: 10px; font-weight: 700; fill: var(--hc-fg2); text-anchor: middle; dominant-baseline: middle; }
      .compass .fan { fill: color-mix(in srgb, var(--hc-blue) 22%, transparent); }
      .compass .arrow { fill: var(--hc-blue); } .compass .shaft { stroke: var(--hc-blue); stroke-width: 3; stroke-linecap: round; }
      @media (prefers-reduced-motion: reduce) { .scene .clouds, .scene .drop, .scene .gust { animation: none; } }`;
  }
}

// ---------------------------------------------------------------------------
// Synology DiskStation
// ---------------------------------------------------------------------------
// translation_key (Integration synology_dsm) -> Rolle, mit Ausweichmuster auf die entity_id
const HC_NAS_MAIN = {
  cpu: [["cpu_total_load"], /cpu.*(gesamt|total)/],
  ram: [["memory_real_usage"], /speichernutzung|memory_real_usage|memory_usage/],
  up: [["network_up"], /upload|network_up/],
  down: [["network_down"], /download|network_down/],
  temp: [["temperature"], /^sensor\.[a-z0-9_]+_(temperatur|temperature)$/],
  security: [["status"], /sicherheit|security/],
  uptime: [["uptime"], /uptime|letzter_start|betriebszeit/],
};

class HcDiskStationCard extends HcBaseCard {
  static getStubConfig() {
    return {};
  }

  static getConfigElement() {
    return document.createElement("hc-diskstation-card-editor");
  }

  _emptyText() {
    return "Keine Synology DiskStation gefunden (Integration „Synology DSM“).";
  }

  _discover() {
    const hass = this._hass;
    if (!hass?.entities) return;
    const ents = Object.values(hass.entities).filter((e) => e.platform === "synology_dsm");
    if (!ents.length) return;
    const devName = (id) => {
      const d = hass.devices?.[id];
      return d?.name_by_user || d?.name || "";
    };
    // Hauptgerät: das, über das die Platten angebunden sind; sonst das mit CPU-Wert
    let main = this._config.device_id;
    if (!main) {
      const drive = ents.find((e) => /\(Drive \d+\)|disk_/.test(devName(e.device_id) + (e.translation_key || "")));
      main = drive && hass.devices?.[drive.device_id]?.via_device_id;
      if (!main) main = ents.find((e) => e.translation_key === "cpu_total_load" || /cpu/.test(e.entity_id))?.device_id;
    }
    if (!main) return;
    const map = {};
    const mainEnts = ents.filter((e) => e.device_id === main);
    for (const [role, [keys, re]] of Object.entries(HC_NAS_MAIN)) {
      const hit = mainEnts.find((e) => keys.includes(e.translation_key)) || mainEnts.find((e) => re.test(e.entity_id));
      if (hit) map[role] = hit.entity_id;
    }
    const upd = mainEnts.find((e) => e.entity_id.startsWith("update."));
    if (upd) map.update = upd.entity_id;
    // Platten und Volumes über ihre Untergeräte
    const drives = [], volumes = [];
    for (const [id, d] of Object.entries(hass.devices || {})) {
      if (d.via_device_id !== main) continue;
      const name = d.name_by_user || d.name || "";
      const own = ents.filter((e) => e.device_id === id);
      const pick = (keys, re) => (own.find((e) => keys.includes(e.translation_key)) || own.find((e) => re.test(e.entity_id)))?.entity_id;
      const dm = name.match(/Drive (\d+)/i);
      const vm = name.match(/Volume (\d+)/i);
      if (dm || own.some((e) => e.translation_key === "disk_status")) {
        const n = dm ? parseInt(dm[1], 10) : drives.length + 1;
        drives.push({
          n, model: d.model, status: pick(["disk_status"], /_status$/),
          temp: pick(["disk_temp"], /temp/), bad: pick(["disk_exceed_bad_sector_thr"], /sektor|sector/),
          life: pick(["disk_below_remain_life_thr"], /lebensdauer|remain_life/),
        });
      } else if (vm || own.some((e) => e.translation_key === "volume_status")) {
        volumes.push({
          n: vm ? parseInt(vm[1], 10) : volumes.length + 1, status: pick(["volume_status"], /_status$/),
          pct: pick(["volume_percentage_used"], /nutzung|percentage|verwendet/),
          used: pick(["volume_size_used"], /belegt|size_used/),
          tmax: pick(["volume_disk_temp_max"], /maximal|temp_max/),
        });
      }
    }
    drives.sort((a, b) => a.n - b.n);
    volumes.sort((a, b) => a.n - b.n);
    drives.forEach((dr) => {
      for (const k of ["status", "temp", "bad", "life"]) if (dr[k]) map[`drive${dr.n}_${k}`] = dr[k];
    });
    volumes.forEach((v) => {
      for (const k of ["status", "pct", "used", "tmax"]) if (v[k]) map[`vol${v.n}_${k}`] = v[k];
    });
    this._drives = drives;
    this._volumes = volumes;
    this._deviceId = main;
    this._map = map;
  }

  _rate(key) {
    const st = this._st(key);
    const v = st ? parseFloat(st.state) : NaN;
    if (!Number.isFinite(v)) return { text: "–", bps: 0 };
    const unit = st.attributes.unit_of_measurement || "kB/s";
    const factor = { "B/s": 1, "kB/s": 1e3, "KiB/s": 1024, "MB/s": 1e6, "MiB/s": 1048576, "GB/s": 1e9, "kbit/s": 125, "Mbit/s": 125000 }[unit] ?? 1e3;
    const bps = v * factor;
    const text = bps >= 1e6 ? `${this._fmt(bps / 1e6, 1)} MB/s` : `${this._fmt(bps / 1e3, 0)} kB/s`;
    return { text, bps };
  }

  _diskState(dr) {
    const s = this._st(`drive${dr.n}_status`)?.state;
    const bad = this._on(`drive${dr.n}_bad`) === true;
    const life = this._on(`drive${dr.n}_life`) === true;
    if (s === undefined || s === "unavailable") return { cls: "off", text: "nicht erreichbar" };
    if (bad) return { cls: "bad", text: "zu viele fehlerhafte Sektoren" };
    if (life) return { cls: "warn", text: "Restlebensdauer gering" };
    if (s === "normal") return { cls: "ok", text: "in Ordnung" };
    if (s === "not_use" || s === "not_initialized") return { cls: "off", text: "nicht genutzt" };
    const de = { crashed: "defekt", failing: "fällt aus", warning: "Warnung", abnormal: "auffällig", initialized: "wird eingerichtet" };
    return { cls: s === "crashed" || s === "failing" ? "bad" : "warn", text: de[s] || s };
  }

  _security() {
    const st = this._st("security");
    if (!st || st.state !== "on") return [];
    const names = { malware: "Malware", network: "Netzwerk", securitySetting: "Sicherheitseinstellungen",
      systemCheck: "Systemprüfung", update: "Updates", userInfo: "Benutzerkonten" };
    return Object.entries(names).filter(([k]) => st.attributes[k] && st.attributes[k] !== "safe").map(([, n]) => n);
  }

  _hero(drives, up, down) {
    const n = Math.max(2, Math.min(8, drives.length || 4));
    const w = 150, x0 = 125, bayW = (w - 24) / n;
    const bays = Array.from({ length: n }, (_, i) => {
      const dr = drives[i];
      const cls = dr ? this._diskState(dr).cls : "off";
      const x = x0 + 12 + i * bayW;
      return `<rect class="bay" x="${x + 2}" y="58" width="${bayW - 4}" height="96" rx="3"/>
        <circle class="led ${cls}" cx="${x + bayW / 2}" cy="70" r="3.4"/>
        <line class="grip" x1="${x + 8}" y1="138" x2="${x + bayW - 8}" y2="138"/>`;
    }).join("");
    const flow = (on, cls, d) => `<path class="flow ${on ? "on" : ""} ${cls}" d="${d}"/>`;
    return `
      <div class="hero nas">
        <div class="hero__top"><div class="hero__title">${hcEsc(this._config.title || this._devName())}</div>${this._pill(5 * 60000)}</div>
        <svg class="scene" viewBox="0 0 400 190" role="img" aria-label="DiskStation">
          <rect class="box" x="${x0}" y="40" width="${w}" height="128" rx="10"/>
          ${bays}
          <circle class="pwr" cx="${x0 + w - 14}" cy="50" r="3"/>
          ${flow(up.bps > 5000, "up", `M${x0 + w + 6} 90 C ${x0 + w + 40} 90 330 80 370 70`)}
          ${flow(down.bps > 5000, "down", `M370 120 C 330 110 ${x0 + w + 40} 120 ${x0 + w + 6} 120`)}
          <g class="cloudicon" transform="translate(352 84) scale(1.4)"><path d="${HC_ICONS.cloud}"/></g>
          <line class="ground" x1="20" y1="169" x2="380" y2="169"/>
        </svg>
      </div>`;
  }

  _devName() {
    const d = this._hass.devices?.[this._deviceId];
    return d?.name_by_user || d?.name || "DiskStation";
  }

  _render() {
    const drives = this._drives || [];
    const vol = (this._volumes || [])[0];
    const dev = this._hass.devices?.[this._deviceId] || {};
    const up = this._rate("up"), down = this._rate("down");
    const pct = vol ? this._num(`vol${vol.n}_pct`) : null;
    const used = vol ? this._num(`vol${vol.n}_used`) : null;
    const usedUnit = vol ? this._st(`vol${vol.n}_used`)?.attributes.unit_of_measurement || "TB" : "TB";
    const free = pct && used !== null && pct > 0 ? (used / pct) * (100 - pct) : null;
    const volState = vol ? this._st(`vol${vol.n}_status`)?.state : null;
    // Statuszeile: das Wichtigste zuerst
    const badDisks = drives.map((d) => ({ d, s: this._diskState(d) })).filter((x) => x.s.cls === "bad" || x.s.cls === "warn");
    const sec = this._security();
    const updateOn = this._st("update")?.state === "on";
    let title, sub, level = "ok";
    if (badDisks.length) {
      level = badDisks.some((x) => x.s.cls === "bad") ? "bad" : "warn";
      title = `Platte ${badDisks.map((x) => x.d.n).join(", ")}: ${badDisks[0].s.text}`;
      sub = "Datensicherung prüfen";
    } else if (volState && volState !== "normal") {
      const vde = { degraded: "eingeschränkt", crashed: "defekt", attention: "Achtung", repairing: "wird repariert", expanding: "wird erweitert" };
      level = volState === "crashed" ? "bad" : "warn"; title = `Volume ${vol.n}: ${vde[volState] || volState}`; sub = "Speicher-Manager in DSM prüfen";
    } else if (updateOn) {
      level = "warn"; title = "DSM-Update verfügbar"; sub = this._st("update").attributes.latest_version || "";
    } else if (sec.length) {
      level = "warn"; title = "Sicherheitsberater: Hinweise"; sub = sec.join(" · ");
    } else {
      title = "Alles in Ordnung"; sub = [dev.model, dev.sw_version].filter(Boolean).join(" · ");
    }
    const fill = pct === null ? 0 : Math.max(0, Math.min(100, pct));
    const barCls = fill >= 90 ? "bad" : fill >= 80 ? "warn" : "ok";
    const diskRows = drives.map((dr) => {
      const s = this._diskState(dr);
      const t = this._num(`drive${dr.n}_temp`);
      return `<button class="disk click" data-more="drive${dr.n}_temp" aria-label="Platte ${dr.n}: Temperaturverlauf">
        <span class="led2 ${s.cls}"></span><span class="dn">Platte ${dr.n}</span>
        <span class="dm">${hcEsc((dr.model || "").trim())}</span>
        <span class="ds ${s.cls}">${hcEsc(s.text)}</span><span class="dt">${this._fmt(t, 0)} °C</span></button>`;
    }).join("");
    return `
      ${this._hero(drives, up, down)}
      <div class="main">
        <div class="head ${level}">${hcEsc(title)}</div>
        <div class="sub">${hcEsc(sub)}</div>
        <div class="big">
          <button class="soc click" data-more="${vol ? `vol${vol.n}_pct` : ""}" aria-label="Belegung: Verlauf anzeigen">
            <span class="bn">${this._fmt(pct, 0)}</span><span class="bu">%</span><div class="bl">belegt${vol ? ` · Volume ${vol.n}` : ""}</div></button>
          <div class="right"><span class="bn2">${free === null ? "–" : `${this._fmt(free, 1)} ${hcEsc(usedUnit)}`}</span><div class="bl">frei</div></div>
        </div>
        <div class="bar"><span class="fill ${barCls}" style="width:${fill}%"></span></div>
        <div class="barlbl"><span>${used === null ? "" : `${this._fmt(used, 2)} ${hcEsc(usedUnit)} belegt`}</span><span>${free === null || pct === null ? "" : `${this._fmt(used + free, 1)} ${hcEsc(usedUnit)} gesamt`}</span></div>
        <div class="tiles">
          ${this._tile("cpu", `${this._fmt(this._num("cpu"), 0)} %`, "CPU", "", "cpu")}
          ${this._tile("memory", `${this._fmt(this._num("ram"), 0)} %`, "Arbeitsspeicher", "", "ram")}
          ${this._tile("upload", up.text, "Upload", up.bps > 5000 ? "green" : "", "up")}
          ${this._tile("download", down.text, "Download", down.bps > 5000 ? "blue" : "", "down")}
        </div>
      </div>
      <div class="disks">${diskRows}</div>
      <div class="foot">
        <span>${hcIcon("thermo")}System ${this._fmt(this._num("temp"), 0)} °C${vol && this._num(`vol${vol.n}_tmax`) !== null ? ` · Platten max. ${this._fmt(this._num(`vol${vol.n}_tmax`), 0)} °C` : ""}</span>
        <span>${hcIcon("shield")}${sec.length ? `Sicherheitsberater: ${hcEsc(sec.join(", "))}` : "Sicherheitsberater: keine Hinweise"}</span>
      </div>`;
  }

  _styles() {
    return `
      .hero.nas { background: linear-gradient(180deg, #5f6f86 0%, #93a3b8 55%, #d6dee8 100%); }
      .scene .box { fill: #2b2f36; stroke: #1b1e23; stroke-width: 2; }
      .scene .bay { fill: #3a3f48; stroke: #4b515c; }
      .scene .grip { stroke: #5b626e; stroke-width: 2; stroke-linecap: round; }
      .scene .pwr { fill: #4aa3ff; filter: drop-shadow(0 0 4px #4aa3ff); }
      .scene .led.ok { fill: #3ddc84; filter: drop-shadow(0 0 3px #3ddc84); }
      .scene .led.warn { fill: #f0b429; filter: drop-shadow(0 0 3px #f0b429); }
      .scene .led.bad { fill: #ff5f57; filter: drop-shadow(0 0 4px #ff5f57); animation: hc-blink 1s steps(2) infinite; }
      .scene .led.off { fill: #555b66; }
      @keyframes hc-blink { 50% { opacity: .25; } }
      .scene .cloudicon path { fill: #eef3f8; }
      .scene .flow.up { --c: #3ddc84; } .scene .flow.down { --c: #4aa3ff; }
      .head.warn { color: #b7791f; } .head.bad { color: var(--hc-red); }
      .fill.ok { background: var(--hc-blue); } .fill.warn { background: var(--hc-amber); } .fill.bad { background: var(--hc-red); }
      .disks { border-top: 1px solid var(--divider-color, #e1e6ee); padding: 6px 8px; }
      .disk { display: grid; grid-template-columns: 14px auto 1fr auto auto; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border-radius: 12px; text-align: left; }
      .led2 { width: 10px; height: 10px; border-radius: 50%; background: #9aa3ad; }
      .led2.ok { background: var(--hc-green); } .led2.warn { background: var(--hc-amber); } .led2.bad { background: var(--hc-red); }
      .dn { font-weight: 700; } .dm { color: var(--hc-fg2); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ds { font-size: 14px; } .ds.ok { color: var(--hc-green); } .ds.warn { color: #b7791f; } .ds.bad { color: var(--hc-red); }
      .dt { color: var(--hc-fg2); font-size: 14px; min-width: 44px; text-align: right; }`;
  }
}

// ---------------------------------------------------------------------------
// Geschirrspüler (Integration home_connect)
// ---------------------------------------------------------------------------
const HC_DW_ROLES = {
  state: [["operation_state"], /betriebszustand|operation_state/],
  progress: [["program_progress"], /fortschritt|program_progress/],
  finish: [["program_finish_time", "finish_time"], /endzeit|finish_time/],
  door: [["door"], /_tur$|_door$/],
  salt: [["salt_nearly_empty"], /salz_fast_leer|salt_nearly_empty/],
  rinse: [["rinse_aid_nearly_empty"], /klarspuler_fast_leer|rinse_aid_nearly_empty/],
  finished: [["program_finished"], /programm_beendet|program_finished/],
  active: [["active_program"], /aktives_programm|active_program/],
  selected: [["selected_program"], /ausgewahltes_programm|selected_program/],
  stop: [["stop_program"], /programm_stoppen|stop_program/],
  remote_start: [["remote_start"], /fernstart|remote_start/],
  care: [["machine_care_reminder"], /erinnerung_zur_maschinenpflege$|machine_care_reminder/],
};
const HC_DW_STATE = {
  inactive: "Aus", ready: "Bereit", delayedstart: "Startvorwahl", run: "Läuft", pause: "Pause",
  actionrequired: "Aktion erforderlich", finished: "Fertig", error: "Störung", aborting: "Wird abgebrochen",
};
const HC_DW_PROGRAMS = {
  intensiv_70: "Intensiv 70°", auto_2: "Auto 45–65°", eco_50: "Eco 50°", pre_rinse: "Vorspülen",
  night_wash: "Nachtprogramm", kurz_60: "Kurz 60°", machine_care: "Maschinenpflege", super_60: "Super 60°",
  quick_45: "Schnell 45°", mixed_load: "Gemischte Beladung", intensiv_power: "Intensiv Power",
};

class HcDishwasherCard extends HcBaseCard {
  static getStubConfig() { return {}; }
  static getConfigElement() { return document.createElement("hc-generic-card-editor"); }
  _emptyText() { return "Kein Geschirrspüler gefunden (Integration „Home Connect“)."; }

  _discover() {
    const r = this._discoverPlatform("home_connect", HC_DW_ROLES, "state");
    if (r && r.map.state) this._map = r.map;
  }

  _program(key) {
    const st = this._st(key);
    if (!st || ["unknown", "unavailable", ""].includes(st.state)) return null;
    const short = st.state.replace(/^.*_program_/, "");
    if (HC_DW_PROGRAMS[short]) return HC_DW_PROGRAMS[short];
    try { if (this._hass.formatEntityState) return this._hass.formatEntityState(st); } catch (e) { /* */ }
    return short;
  }

  _flag(key) {
    const s = this._st(key)?.state;
    return s === "present" || s === "on";
  }

  _render() {
    const state = this._st("state")?.state;
    const running = state === "run" || state === "pause";
    const delayed = state === "delayedstart";
    const progress = this._num("progress");
    const finishSt = this._st("finish");
    const finish = finishSt && !["unknown", "unavailable"].includes(finishSt.state) ? Date.parse(finishSt.state) : null;
    const remainMin = finish ? Math.max(0, Math.round((finish - Date.now()) / 60000)) : null;
    const prog = this._program(running || delayed ? "active" : "selected") || this._program("selected");
    const doorOpen = this._st("door")?.state === "open";
    const salt = this._flag("salt"), rinse = this._flag("rinse"), care = this._flag("care");
    const done = state === "finished" || this._flag("finished");
    let title, sub, level = "";
    if (state === "error" || state === "actionrequired") { title = HC_DW_STATE[state]; sub = "Bitte am Gerät nachsehen"; level = "bad"; }
    else if (running) { title = `${state === "pause" ? "Pausiert" : "Läuft"}${finish ? ` · fertig um ${this._clock(finish)}` : ""}`; sub = prog || ""; }
    else if (delayed) { title = `Startvorwahl${finish ? ` · fertig um ${this._clock(finish)}` : ""}`; sub = prog || ""; }
    else if (done) { title = "Fertig – bitte ausräumen"; sub = prog || ""; level = "ok"; }
    else if (doorOpen) { title = "Tür offen"; sub = prog ? `Ausgewählt: ${prog}` : ""; }
    else { title = HC_DW_STATE[state] || this._stateText("state"); sub = prog ? `Ausgewählt: ${prog}` : ""; }
    const hint = [salt && "Salz nachfüllen", rinse && "Klarspüler nachfüllen", care && "Maschinenpflege fällig"].filter(Boolean);
    const remainTxt = remainMin === null ? "–" : remainMin >= 60 ? `${Math.floor(remainMin / 60)}:${String(remainMin % 60).padStart(2, "0")} h` : `${remainMin} min`;
    const canStart = state === "ready" && this._on("remote_start") === true && this._map.active && this._program("selected");
    const actions = running && this._map.stop
      ? `<button class="act stop" data-action="stop">${hcIcon("stop")}Programm stoppen</button>`
      : canStart ? `<button class="act" data-action="start">${hcIcon("play")}${hcEsc(this._program("selected"))} starten</button>` : "";
    return `
      ${this._heroDw(state, running, doorOpen, done, remainTxt, progress)}
      <div class="main">
        <div class="head ${level}">${hcEsc(title)}</div>
        <div class="sub">${hcEsc(sub)}</div>
        ${running || delayed ? `
        <div class="big">
          <button class="soc click" data-more="progress" aria-label="Fortschritt"><span class="bn">${this._fmt(progress, 0)}</span><span class="bu">%</span><div class="bl">Fortschritt</div></button>
          <div class="right"><span class="bn2">${remainTxt}</span><div class="bl">verbleibend</div></div>
        </div>
        <div class="bar"><span class="fill run" style="width:${Math.max(0, Math.min(100, progress ?? 0))}%"></span></div>` : ""}
        <div class="tiles">
          ${this._tile("play", hcEsc(prog || "–"), running ? "Programm" : "Ausgewählt", "", running ? "active" : "selected")}
          ${this._tile("door", doorOpen ? "offen" : this._st("door")?.state === "locked" ? "verriegelt" : "zu", "Tür", doorOpen ? "amber" : "", "door")}
          ${this._tile("salt", salt ? "nachfüllen" : "ok", "Salz", salt ? "amber" : "green", "salt")}
          ${this._tile("drop", rinse ? "nachfüllen" : "ok", "Klarspüler", rinse ? "amber" : "green", "rinse")}
        </div>
        ${actions ? `<div class="acts">${actions}</div>` : ""}
      </div>
      ${hint.length ? `<div class="foot"><span class="warn">${hcIcon("alert")}${hcEsc(hint.join(" · "))}</span></div>` : ""}`;
  }

  _heroDw(state, running, doorOpen, done, remainTxt, progress) {
    const bubbles = running ? Array.from({ length: 7 }, (_, i) =>
      `<circle class="bub" cx="${160 + i * 13}" cy="150" r="${3 + (i % 3)}" style="animation-delay:${i * 0.35}s"/>`).join("") : "";
    const light = running || state === "delayedstart" ? `<ellipse class="infolight ${state === "delayedstart" ? "wait" : ""}" cx="200" cy="181" rx="46" ry="4"/>` : "";
    return `
      <div class="hero dw light">
        <div class="hero__top"><div class="hero__title">${hcEsc(this._config.title || this._devName("Geschirrspüler"))}</div>${this._pill(30 * 60000, state === "error")}</div>
        <svg class="scene" viewBox="0 0 400 190" role="img" aria-label="Geschirrspüler">
          <rect class="counter" x="40" y="40" width="320" height="12" rx="3"/>
          <rect class="cab" x="60" y="52" width="70" height="124"/><rect class="cab" x="270" y="52" width="70" height="124"/>
          <line class="cabline" x1="95" y1="62" x2="95" y2="100"/><line class="cabline" x1="305" y1="62" x2="305" y2="100"/>
          ${doorOpen
            ? `<rect class="tub" x="134" y="54" width="132" height="122" rx="2"/>
               <path class="rack" d="M146 84 H254 M146 120 H254 M152 74 v10 M168 74 v10 M184 74 v10 M200 74 v10 M216 74 v10 M232 74 v10 M248 74 v10"/>
               <path class="door open" d="M134 176 L266 176 L282 186 L118 186 Z"/>`
            : `<rect class="door" x="134" y="54" width="132" height="122" rx="2"/>
               <rect class="strip" x="134" y="54" width="132" height="14"/>
               <text class="disp" x="200" y="64.5">${running || state === "delayedstart" ? hcEsc(remainTxt) : done ? "fertig" : ""}</text>
               <rect class="handle" x="170" y="74" width="60" height="4" rx="2"/>
               ${running ? `<rect class="progress" x="134" y="174" width="${1.32 * Math.max(0, Math.min(100, progress ?? 0))}" height="2"/>` : ""}`}
          ${bubbles}
          ${done && !doorOpen ? `<g class="sparkle"><path d="M300 30 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/><path d="M330 56 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"/></g>` : ""}
          ${light}
          <line class="ground" x1="20" y1="177" x2="380" y2="177"/>
        </svg>
      </div>`;
  }

  _action(a) {
    if (a === "stop") this._confirmCall("Programm wirklich stoppen?", "button", "press", { entity_id: this._map.stop });
    if (a === "start") {
      const sel = this._st("selected")?.state;
      this._confirmCall(`${this._program("selected")} jetzt starten?`, "select", "select_option", { entity_id: this._map.active, option: sel });
    }
  }

  _styles() {
    return `
      .hero.dw { background: linear-gradient(180deg, #c9d3df 0%, #e4e9ef 60%, #eef1f5 100%); }
      .scene .counter { fill: #8b7a66; } .scene .cab { fill: #f4f5f7; stroke: #c6ccd5; } .scene .cabline { stroke: #aab3bf; stroke-width: 3; stroke-linecap: round; }
      .scene .door { fill: #e9ecf0; stroke: #b9c1cc; } .scene .door.open { fill: #d5dbe3; }
      .scene .strip { fill: #2b2f36; } .scene .disp { fill: #7fd0ff; font: 700 9px system-ui, sans-serif; text-anchor: middle; }
      .scene .handle { fill: #a7b0bc; } .scene .progress { fill: #2f7fe0; }
      .scene .tub { fill: #b9c3cf; } .scene .rack { stroke: #7d8896; stroke-width: 2; fill: none; }
      .scene .bub { fill: none; stroke: rgba(47,127,224,.55); stroke-width: 1.5; animation: hc-bub 2.4s ease-in infinite; }
      @keyframes hc-bub { from { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } to { transform: translateY(-80px); opacity: 0; } }
      .scene .infolight { fill: #ff5a3c; opacity: .85; filter: blur(2px); } .scene .infolight.wait { fill: #4aa3ff; }
      .scene .sparkle path { fill: #f0b429; }
      .scene .ground { stroke: rgba(80,90,105,.25); }
      .head.ok { color: var(--hc-green); } .head.bad { color: var(--hc-red); }
      .fill.run { background: var(--hc-blue); }
      .acts { display: flex; gap: 10px; margin: 4px 0 14px; }
      .act { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 999px; background: var(--hc-blue); color: #fff; font-weight: 600; }
      .act .ic { fill: #fff; width: 18px; height: 18px; } .act.stop { background: var(--hc-red); }
      @media (prefers-reduced-motion: reduce) { .scene .bub { animation: none; } }`;
  }
}

// ---------------------------------------------------------------------------
// Tesla Wall Connector (Integration tesla_wall_connector)
// ---------------------------------------------------------------------------
const HC_WB_ROLES = {
  status: [["status"], /_status$/],
  power: [["total_power_kw", "total_power"], /gesamtleistung|total_power/],
  session: [["session_energy_wh", "session_energy"], /sitzungsenergie|session_energy/],
  energy: [["energy_kWh", "energy_kwh", "energy"], /_energie$|_energy$/],
  connected: [["vehicle_connected"], /fahrzeug_verbunden|vehicle_connected/],
  contactor: [["contactor_closed"], /schutz_geschlossen|contactor/],
  ia: [["current_a_a", "phase_a_current"], /strom_der_phase_a|current_a/],
  ib: [["current_b_a", "phase_b_current"], /strom_der_phase_b|current_b/],
  ic: [["current_c_a", "phase_c_current"], /strom_der_phase_c|current_c/],
  handle: [["handle_temp_c", "handle_temperature"], /griff|handle/],
  grid_v: [["grid_v", "grid_voltage"], /netzspannung|grid_v/],
};
const HC_WB_STATE = {
  booting: "Startet", not_connected: "Kein Fahrzeug", connected: "Fahrzeug verbunden", ready: "Bereit",
  negotiating: "Verbindet", error: "Störung", charging_finished: "Laden beendet", waiting_car: "Wartet auf Fahrzeug",
  charging_reduced: "Lädt (reduziert)", charging: "Lädt",
};

class HcWallboxCard extends HcBaseCard {
  static getStubConfig() { return {}; }
  static getConfigElement() { return document.createElement("hc-wallbox-card-editor"); }
  _emptyText() { return "Keine Ladestation gefunden (Integration „Tesla Wall Connector“)."; }

  _discover() {
    const r = this._discoverPlatform("tesla_wall_connector", HC_WB_ROLES, "status");
    if (r && r.map.status) this._map = r.map;
  }

  // kWh heute und in diesem Monat aus dem Lebensdauerzähler (Tagesstatistik)
  _ensureEnergy() {
    const id = this._map.energy;
    if (!id || this._eLoading) return;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    if (this._eAt && Date.now() - this._eAt < 600000) return;
    if (this._eFail && Date.now() - this._eFail < 60000) return;
    this._eLoading = true;
    this._hass.callWS({
      type: "recorder/statistics_during_period",
      start_time: new Date(monthStart.getTime() - 86400e3).toISOString(),
      statistic_ids: [id], period: "day", types: ["state"],
    }).then((res) => {
      const rows = res[id] || [];
      const t = (r) => (typeof r.start === "number" ? r.start : Date.parse(r.start));
      const today = new Date(); today.setHours(0, 0, 0, 0);
      this._eBase = {
        month: rows.filter((r) => t(r) < monthStart.getTime()).pop()?.state ?? null,
        today: rows.filter((r) => t(r) < today.getTime()).pop()?.state ?? null,
      };
      this._eAt = Date.now(); this._eLoading = false; this._last = ""; this._paint();
    }).catch(() => { this._eLoading = false; this._eFail = Date.now(); });
  }

  _kw() {
    const st = this._st("power");
    const v = st ? parseFloat(st.state) : NaN;
    if (!Number.isFinite(v)) return null;
    return (st.attributes.unit_of_measurement || "kW") === "W" ? v / 1000 : v;
  }

  _render() {
    this._ensureEnergy();
    const status = this._st("status")?.state;
    const kw = this._kw() ?? 0;
    const charging = status === "charging" || status === "charging_reduced" || (this._on("contactor") && kw > 0.2);
    const connected = this._on("connected") === true || ["connected", "ready", "negotiating", "charging", "charging_reduced", "charging_finished", "waiting_car"].includes(status);
    const session = this._num("session");
    const total = this._num("energy");
    const today = this._eBase?.today !== null && this._eBase?.today !== undefined && total !== null ? Math.max(0, total - this._eBase.today) : null;
    const month = this._eBase?.month !== null && this._eBase?.month !== undefined && total !== null ? Math.max(0, total - this._eBase.month) : null;
    const amps = ["ia", "ib", "ic"].map((k) => this._num(k));
    const phases = amps.filter((a) => (a ?? 0) > 1).length;
    let title, sub, level = "";
    if (status === "error") { title = "Störung"; sub = "Ladestation prüfen"; level = "bad"; }
    else if (charging) { title = `Lädt · ${this._fmt(kw, 1)} kW`; sub = phases ? `${phases}-phasig · ${this._fmt(Math.max(...amps.map((a) => a ?? 0)), 1)} A` : ""; }
    else if (status === "charging_finished") { title = "Laden beendet"; sub = session !== null ? `${this._fmt(session, 1)} kWh geladen` : ""; level = "ok"; }
    else if (connected) { title = "Auto verbunden"; sub = "lädt gerade nicht"; }
    else { title = "Kein Auto angeschlossen"; sub = session !== null ? `Letzter Ladevorgang: ${this._fmt(session, 1)} kWh` : ""; }
    const phaseBars = ["L1", "L2", "L3"].map((n, i) => {
      const a = amps[i];
      return `<div class="ph"><span class="pn">${n}</span><span class="pbar"><span style="width:${Math.max(0, Math.min(100, ((a ?? 0) / 16) * 100))}%"></span></span><span class="pa">${this._fmt(a, 1)} A</span></div>`;
    }).join("");
    return `
      ${this._heroWb(status, connected, charging)}
      <div class="main">
        <div class="head ${level}">${hcEsc(title)}</div>
        <div class="sub">${hcEsc(sub)}</div>
        <div class="big">
          <button class="soc click" data-more="session" aria-label="Ladevorgang"><span class="bn">${this._fmt(session, 1)}</span><span class="bu">kWh</span><div class="bl">${charging ? "dieser Ladevorgang" : "letzter Ladevorgang"}</div></button>
          <div class="right"><span class="bn2">${this._fmt(kw, 1)} kW</span><div class="bl">Leistung</div></div>
        </div>
        <div class="phases">${phaseBars}</div>
        <div class="tiles">
          ${this._tile("bolt", today === null ? "–" : `${this._fmt(today, 1)} kWh`, "Heute", "", "energy")}
          ${this._tile("chart", month === null ? "–" : `${this._fmt(month, 0)} kWh`, "Dieser Monat", "", "energy")}
          ${this._tile("ev", total === null ? "–" : `${this._fmt(total, 0)} kWh`, "Gesamt", "", "energy")}
          ${this._tile("thermo", `${this._fmt(this._num("handle"), 0)} °C`, "Griff", "", "handle")}
        </div>
      </div>
      <div class="foot"><span>${hcIcon("ev")}${hcEsc(HC_WB_STATE[status] || this._stateText("status"))} · Netz ${this._fmt(this._num("grid_v"), 0)} V</span></div>`;
  }

  _heroWb(status, connected, charging) {
    const led = status === "error" ? "bad" : charging ? "charge" : connected ? "conn" : "idle";
    return `
      <div class="hero wb light">
        <div class="hero__top"><div class="hero__title">${hcEsc(this._config.title || this._devName("Ladestation"))}</div>${this._pill(10 * 60000, status === "error")}</div>
        <svg class="scene" viewBox="0 0 400 190" role="img" aria-label="Ladestation">
          <rect class="wall" x="0" y="0" width="120" height="177"/>
          <rect class="wbox" x="44" y="62" width="40" height="64" rx="8"/>
          <circle class="ring ${led}" cx="64" cy="84" r="9"/>
          <path class="holster" d="M52 112 h24 v8 h-24z"/>
          ${(() => {
            const photo = this._carPhoto();
            const end = photo ? "168 138" : "226 131";
            const ctrl = photo ? "128 178" : "170 178";
            const cable = connected ? `
            <path class="cable" d="M64 126 C 64 170, ${ctrl}, ${end}"/>
            <path class="flow ${charging ? "on" : ""}" d="M64 126 C 64 170, ${ctrl}, ${end}" style="--c:#3ddc84"/>` : `
            <path class="cable" d="M58 126 C 50 150, 78 150, 70 126"/>`;
            const car = photo
              ? `<g class="car photo ${connected ? "" : "away"}"><ellipse class="shadow" cx="276" cy="176" rx="122" ry="4"/>
                  <image href="${hcEsc(photo)}" x="108" y="22" width="320" height="192" preserveAspectRatio="xMidYMid meet"/>
                  ${charging ? `<path class="bolt" d="M176 98 l-7 10 h6 l-3 9 9 -12 h-6 l3 -7z"/>` : ""}</g>`
              : this._car(connected, charging);
            return photo ? car + cable : cable + car;
          })()}
          <line class="ground" x1="0" y1="177" x2="400" y2="177"/>
        </svg>
      </div>`;
  }

  // Foto des eigenen Autos: car_image (image.*-Entität, Entität mit Bild oder URL),
  // sonst automatisch das Fahrzeugbild der Integration BavarianData, falls vorhanden.
  _carPhoto() {
    const cfg = this._config.car_image;
    if (cfg === false || cfg === "none") return null;
    const fromEntity = (id) => this._hass.states[id]?.attributes?.entity_picture || null;
    if (typeof cfg === "string" && cfg) return /^(https?:)?\/|^data:/.test(cfg) ? cfg : fromEntity(cfg);
    const ent = Object.values(this._hass.entities || {}).find((e) => e.platform === "bavariandata" && e.entity_id.startsWith("image."));
    return ent ? fromEntity(ent.entity_id) : null;
  }

  // Eigene, neutrale Elektro-Limousine mit Fließheck (Seitenansicht, Front rechts)
  _car(connected, charging) {
    const wheel = (cx) => {
      const spokes = [0, 72, 144, 216, 288].map((a) =>
        `<line class="spoke" x1="${cx}" y1="159" x2="${cx}" y2="148.5" transform="rotate(${a} ${cx} 159)"/>`).join("");
      return `<circle class="tire" cx="${cx}" cy="159" r="17"/><circle class="rim" cx="${cx}" cy="159" r="11.5"/>${spokes}<circle class="hubcap" cx="${cx}" cy="159" r="3"/>`;
    };
    return `
      <g class="car ${connected ? "" : "away"}">
        <defs>
          <linearGradient id="hcCarBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#c3ccd7"/><stop offset=".5" stop-color="#8f9aa8"/><stop offset="1" stop-color="#6b7684"/>
          </linearGradient>
          <linearGradient id="hcCarGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#4a5868"/><stop offset=".55" stop-color="#2c3643"/><stop offset="1" stop-color="#3b4756"/>
          </linearGradient>
        </defs>
        <ellipse class="shadow" cx="292" cy="177" rx="112" ry="5"/>
        <circle class="well" cx="232" cy="154" r="19.5"/><circle class="well" cx="346" cy="154" r="19.5"/>
        <path class="body" d="M204 153 C197 149 196 137 202 131 L214 126 C226 122 238 113 254 105 C266 99 290 96 312 97 C326 98 338 105 350 114 C360 119 374 121 383 125 C390 129 391 141 389 150 L387 153 L366 153 A20 20 0 0 0 326 153 L252 153 A20 20 0 0 0 212 153 Z"/>
        <path class="glass" d="M242 118 C252 110 264 103 280 101 L314 100 C325 101 334 107 342 115 Z"/>
        <path class="reflect" d="M262 108 L286 102 L292 102 L268 110 Z"/>
        <line class="pillar" x1="297" y1="99" x2="297" y2="118"/>
        <path class="shoulder" d="M206 134 C260 127 330 126 386 131"/>
        <path class="cut" d="M297 118 L295 150 M342 116 L337 146 M254 120 L252 148"/>
        <rect class="handle" x="272" y="124" width="10" height="2.4" rx="1.2"/><rect class="handle" x="316" y="123" width="10" height="2.4" rx="1.2"/>
        <path class="mirror" d="M336 112 l7 -1.5 l1.5 4.5 l-7 1.5z"/>
        <path class="headlight" d="M371 123 L387 127 L386 129.5 L370 125.5 Z"/>
        <path class="taillight" d="M203 131 L217 126.5 L217 129.5 L204 134 Z"/>
        <path class="skirt" d="M252 150 L326 150 L326 153.5 L252 153.5 Z"/>
        <rect class="port ${connected ? "on" : ""}" x="222" y="127" width="9" height="6" rx="1.5"/>
        ${wheel(232)}${wheel(346)}
        ${charging ? `<path class="bolt" d="M232 104 l-7 10 h6 l-3 9 9 -12 h-6 l3 -7z"/>` : ""}
      </g>`;
  }

  _styles() {
    return `
      .hero.wb { background: linear-gradient(180deg, #d8dee6 0%, #e9edf2 70%, #c9ced6 100%); }
      .scene .wall { fill: #eef0f3; } .scene .wbox { fill: #fafbfc; stroke: #b5bcc6; stroke-width: 2; }
      .scene .ring { fill: none; stroke-width: 4; } .scene .ring.idle { stroke: #b9c0ca; } .scene .ring.conn { stroke: #3ddc84; }
      .scene .ring.charge { stroke: #3ddc84; animation: hc-pulse 1.6s ease-in-out infinite; } .scene .ring.bad { stroke: #ff5f57; }
      @keyframes hc-pulse { 50% { opacity: .35; } }
      .scene .holster { fill: #c5cbd4; }
      .scene .cable { fill: none; stroke: #3a3f48; stroke-width: 5; stroke-linecap: round; }
      .scene .car .body { fill: url(#hcCarBody); stroke: #5f6a78; stroke-width: .8; }
      .scene .car .glass { fill: url(#hcCarGlass); } .scene .car .reflect { fill: rgba(255,255,255,.18); }
      .scene .car .pillar { stroke: #7c8796; stroke-width: 4; }
      .scene .car .shoulder { fill: none; stroke: rgba(255,255,255,.45); stroke-width: 1.2; }
      .scene .car .cut { fill: none; stroke: rgba(30,40,55,.28); stroke-width: .9; }
      .scene .car .handle { fill: #5f6a78; } .scene .car .mirror { fill: #6f7a88; }
      .scene .car .headlight { fill: #eef6ff; filter: drop-shadow(0 0 2px rgba(200,230,255,.9)); }
      .scene .car .taillight { fill: #d63b3b; } .scene .car .skirt { fill: rgba(20,25,32,.35); }
      .scene .car .port { fill: #4b5563; } .scene .car .port.on { fill: #2b2f36; }
      .scene .car .tire { fill: #1d2127; } .scene .car .rim { fill: #c9cfd7; stroke: #8d96a2; stroke-width: 1.2; }
      .scene .car .spoke { stroke: #7d8693; stroke-width: 2.6; stroke-linecap: round; } .scene .car .hubcap { fill: #5b636f; }
      .scene .car .shadow { fill: rgba(0,0,0,.18); } .scene .car .well { fill: #2a2f37; }
      .scene .car.away { opacity: .3; } .scene .car .bolt { fill: #3ddc84; }
      .scene .car.photo.away { opacity: .45; filter: grayscale(.6); }
      .scene .ground { stroke: #9aa3ad; }
      .head.ok { color: var(--hc-green); } .head.bad { color: var(--hc-red); }
      .phases { display: grid; gap: 8px; margin: 8px 0 4px; }
      .ph { display: grid; grid-template-columns: 26px 1fr 64px; align-items: center; gap: 10px; font-size: 14px; }
      .pn { color: var(--hc-fg2); font-weight: 700; } .pa { text-align: right; color: var(--hc-fg2); }
      .pbar { height: 10px; border-radius: 999px; background: var(--hc-track); overflow: hidden; }
      .pbar span { display: block; height: 100%; background: var(--hc-green); border-radius: 999px; }`;
  }
}

// ---------------------------------------------------------------------------
// Drucker (Integration ipp)
// ---------------------------------------------------------------------------
const HC_INK = [
  ["black", /black|schwarz|\bk\b/, "#2b2b2b", "Schwarz"], ["cyan", /cyan/, "#00a3d9", "Cyan"],
  ["magenta", /magenta/, "#d6338a", "Magenta"], ["yellow", /yellow|gelb/, "#f2c200", "Gelb"],
];

class HcPrinterCard extends HcBaseCard {
  static getStubConfig() { return {}; }
  static getConfigElement() { return document.createElement("hc-generic-card-editor"); }
  _emptyText() { return "Kein Drucker gefunden (Integration „Internet Printing Protocol (IPP)“)."; }

  _discover() {
    const hass = this._hass;
    if (!hass?.entities) return;
    const ents = Object.values(hass.entities).filter((e) => e.platform === "ipp");
    if (!ents.length) return;
    const isMain = (e) => {
      const a = hass.states[e.entity_id]?.attributes || {};
      return e.translation_key === "printer" || (a.options && a.options.includes("printing"));
    };
    const main = this._config.device_id ? ents.find((e) => e.device_id === this._config.device_id && isMain(e)) : ents.find(isMain);
    if (!main) return;
    this._deviceId = main.device_id;
    const map = { printer: main.entity_id };
    const inks = [];
    for (const e of ents.filter((x) => x.device_id === main.device_id && x.entity_id !== main.entity_id)) {
      const st = hass.states[e.entity_id];
      if (!st || st.attributes.marker_type === undefined) {
        if (/uptime|betriebszeit/.test(e.entity_id) || e.translation_key === "uptime") map.uptime = e.entity_id;
        continue;
      }
      const name = `${e.entity_id} ${st.attributes.friendly_name || ""}`.toLowerCase();
      const def = HC_INK.find(([, re]) => re.test(name));
      const key = `ink_${inks.length}`;
      map[key] = e.entity_id;
      inks.push({ key, color: def ? def[2] : "#8a94a3", label: def ? def[3] : (st.attributes.friendly_name || "Tinte"), order: def ? HC_INK.indexOf(def) : 9 });
    }
    inks.sort((a, b) => a.order - b.order);
    this._inks = inks;
    this._map = map;
  }

  _render() {
    const st = this._st("printer");
    const state = st?.state;
    const printing = state === "printing";
    const inks = (this._inks || []).map((ink) => {
      const s = this._st(ink.key);
      const v = this._num(ink.key);
      const low = s?.attributes.marker_low_level ?? 15;
      return { ...ink, v, low, isLow: v !== null && v <= low + 5, empty: v !== null && v <= low };
    });
    const lowest = inks.filter((i) => i.v !== null).sort((a, b) => a.v - b.v)[0];
    const lows = inks.filter((i) => i.isLow);
    let title, sub = "", level = "";
    if (state === "stopped") { title = "Gestoppt"; sub = st.attributes.state_message || st.attributes.state_reason || "Drucker prüfen"; level = "bad"; }
    else if (printing) { title = "Druckt …"; sub = st.attributes.state_message || ""; }
    else if (state === "unavailable") { title = "Nicht erreichbar"; sub = "ausgeschaltet oder im Ruhezustand"; }
    else if (lows.length) { title = `${lows.map((i) => i.label).join(", ")} bald nachfüllen`; level = lows.some((i) => i.empty) ? "bad" : "warn"; sub = "Tinte wird knapp"; }
    else { title = "Bereit"; sub = st?.attributes.info || ""; }
    const rows = inks.map((i) => `
      <button class="ink click" data-more="${i.key}" aria-label="${hcEsc(i.label)}: Verlauf">
        <span class="swatch" style="background:${i.color}"></span><span class="il">${hcEsc(i.label)}</span>
        <span class="ibar"><span style="width:${Math.max(0, Math.min(100, i.v ?? 0))}%;background:${i.color}"></span><span class="lowmark" style="left:${i.low}%"></span></span>
        <span class="iv ${i.isLow ? "low" : ""}">${this._fmt(i.v, 0)} %</span></button>`).join("");
    return `
      ${this._heroPr(state, inks)}
      <div class="main">
        <div class="head ${level}">${hcEsc(title)}</div>
        <div class="sub">${hcEsc(sub)}</div>
        ${lowest ? `<div class="big"><button class="soc click" data-more="${lowest.key}" aria-label="Füllstand"><span class="bn">${this._fmt(lowest.v, 0)}</span><span class="bu">%</span><div class="bl">niedrigster Tank · ${hcEsc(lowest.label)}</div></button></div>` : ""}
        <div class="inks">${rows}</div>
      </div>
      <div class="foot"><span>${hcIcon("printer")}${hcEsc(st?.attributes.info || "Drucker")}${st?.attributes.location ? ` · ${hcEsc(st.attributes.location)}` : ""}</span></div>`;
  }

  _heroPr(state, inks) {
    const printing = state === "printing";
    const tanks = inks.slice(0, 4).map((i, n) => {
      const x = 236 + n * 15, h = 26 * Math.max(0, Math.min(100, i.v ?? 0)) / 100;
      return `<rect class="tank" x="${x}" y="104" width="11" height="30" rx="2"/><rect x="${x + 1.5}" y="${132.5 - h}" width="8" height="${h}" rx="1" fill="${i.color}"/>`;
    }).join("");
    return `
      <div class="hero pr light">
        <div class="hero__top"><div class="hero__title">${hcEsc(this._config.title || this._devName("Drucker"))}</div>${this._pill(60 * 60000, state === "stopped")}</div>
        <svg class="scene" viewBox="0 0 400 190" role="img" aria-label="Drucker">
          <rect class="table" x="70" y="140" width="270" height="9" rx="2"/><path class="legs" d="M90 149 V174 M320 149 V174"/>
          <path class="paperin" d="M150 70 L156 40 L244 40 L250 70 Z"/>
          <rect class="body" x="120" y="66" width="190" height="74" rx="12"/>
          <rect class="lid" x="120" y="66" width="190" height="16" rx="8"/>
          <rect class="slot" x="146" y="128" width="108" height="6" rx="3"/>
          ${printing ? `<g class="sheet"><rect x="152" y="132" width="96" height="30" rx="1"/><path d="M162 142 h60 M162 148 h70 M162 154 h44"/></g>` : ""}
          <rect class="panel" x="134" y="92" width="34" height="18" rx="3"/>
          <circle class="led ${state === "stopped" ? "bad" : state === "unavailable" ? "off" : "ok"}" cx="176" cy="101" r="2.6"/>
          ${tanks}
          <line class="ground" x1="20" y1="174" x2="380" y2="174"/>
        </svg>
      </div>`;
  }

  _styles() {
    return `
      .hero.pr { background: linear-gradient(180deg, #cdd6e1 0%, #e6ebf1 70%, #eef1f5 100%); }
      .scene .table { fill: #b59b7f; } .scene .legs { stroke: #9c8268; stroke-width: 5; stroke-linecap: round; } .scene .paperin { fill: #ffffff; stroke: #c9d0d9; }
      .scene .body { fill: #f7f8fa; stroke: #b4bcc7; stroke-width: 2; } .scene .lid { fill: #e3e7ec; }
      .scene .slot { fill: #3a3f48; } .scene .panel { fill: #2b2f36; }
      .scene .tank { fill: rgba(255,255,255,.7); stroke: #9aa3ad; }
      .scene .sheet rect { fill: #fff; stroke: #c9d0d9; } .scene .sheet path { stroke: #9aa3ad; stroke-width: 2; stroke-linecap: round; }
      .scene .sheet { animation: hc-print 2.4s ease-in-out infinite; }
      @keyframes hc-print { from { transform: translateY(-26px); opacity: 0; } 30% { opacity: 1; } to { transform: translateY(4px); } }
      .scene .led.ok { fill: #3ddc84; } .scene .led.bad { fill: #ff5f57; } .scene .led.off { fill: #6b7380; }
      .scene .ground { stroke: rgba(80,90,105,.25); }
      .head.warn { color: #b7791f; } .head.bad { color: var(--hc-red); }
      .inks { display: grid; gap: 4px; margin: 10px 0 12px; }
      .ink { display: grid; grid-template-columns: 14px 82px 1fr 52px; align-items: center; gap: 10px; padding: 8px 6px; border-radius: 10px; text-align: left; }
      .swatch { width: 12px; height: 12px; border-radius: 50%; } .il { font-weight: 600; }
      .ibar { position: relative; height: 12px; border-radius: 999px; background: var(--hc-track); overflow: hidden; }
      .ibar > span:first-child { display: block; height: 100%; border-radius: 999px; }
      .lowmark { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--hc-fg2); opacity: .6; }
      .iv { text-align: right; font-weight: 700; } .iv.low { color: var(--hc-red); }
      @media (prefers-reduced-motion: reduce) { .scene .sheet { animation: none; } }`;
  }
}

// ---------------------------------------------------------------------------
// FRITZ!Box (Integration fritz, „AVM FRITZ!Box Tools“)
// ---------------------------------------------------------------------------
const HC_FB_ROLES = {
  down: [["kb_s_received"], /(?<!link)_download_durchsatz$|kb_s_received/],
  up: [["kb_s_sent"], /(?<!link)_upload_durchsatz$|kb_s_sent/],
  link_down: [["link_kb_s_received"], /link_download_durchsatz|link_kb_s_received/],
  link_up: [["link_kb_s_sent"], /link_upload_durchsatz|link_kb_s_sent/],
  max_down: [["max_kb_s_received"], /maximaler_download|max_kb_s_received/],
  max_up: [["max_kb_s_sent"], /maximaler_upload|max_kb_s_sent/],
  gb_down: [["gb_received"], /gb_empfangen|gb_received/],
  gb_up: [["gb_sent"], /gb_gesendet|gb_sent/],
  online: [["is_connected"], /^binary_sensor\..*_verbindung$|is_connected/],
  ip: [["external_ip"], /externe_ip$|external_ip$/],
  since: [["connection_uptime"], /verbindungsverfugbarkeit|connection_uptime/],
  boot: [["device_uptime"], /letzter_neustart|device_uptime/],
  cpu_temp: [["cpu_temperature"], /cpu_temperatur|cpu_temperature/],
  att: [["link_attenuation_received"], /download_leistungsdampfung|attenuation_received/],
  snr: [["link_noise_margin_received"], /rauschabstand_zum_link_download|noise_margin_received/],
  update: [[], /^update\./],
};
// Datenrate in bit/s
const HC_RATE = { "bit/s": 1, "kbit/s": 1e3, "Mbit/s": 1e6, "Gbit/s": 1e9, "B/s": 8, "kB/s": 8e3, "KiB/s": 8192, "MB/s": 8e6, "MiB/s": 8388608 };

class HcFritzBoxCard extends HcBaseCard {
  static getStubConfig() { return {}; }
  static getConfigElement() { return document.createElement("hc-generic-card-editor"); }
  _emptyText() { return "Keine FRITZ!Box gefunden (Integration „AVM FRITZ!Box Tools“)."; }

  _discover() {
    const r = this._discoverPlatform("fritz", HC_FB_ROLES, "down");
    if (!r || !r.map.down) return;
    const map = r.map;
    // WLAN-Schalter des Routers (Haupt-WLAN je Band, Gast-WLAN), QR-Code des Gast-WLANs
    const wifi = [];
    for (const e of r.own) {
      const name = this._hass.states[e.entity_id]?.attributes.friendly_name || e.entity_id;
      if (e.entity_id.startsWith("switch.") && /wi_fi|wifi|wlan/i.test(`${e.entity_id} ${e.translation_key || ""}`)) {
        const key = `wifi_${wifi.length}`;
        map[key] = e.entity_id;
        wifi.push({ key, guest: /gast|guest/i.test(`${e.entity_id} ${name}`), name });
      } else if (e.entity_id.startsWith("image.")) {
        map.qr = e.entity_id;
      }
    }
    const dev = this._hass.devices?.[r.own[0]?.device_id];
    const prefix = (dev?.name_by_user || dev?.name || "").trim();
    for (const w of wifi) {
      let label = prefix && w.name.startsWith(prefix) ? w.name.slice(prefix.length).trim() : w.name;
      w.label = label.replace(/^WLAN-?/, "").trim() || (w.guest ? "Gast" : "WLAN");
    }
    wifi.sort((a, b) => a.guest - b.guest || a.label.localeCompare(b.label));
    this._wifi = wifi;
    this._map = map;
  }

  _bits(key) {
    const st = this._st(key);
    const v = st ? parseFloat(st.state) : NaN;
    if (!Number.isFinite(v)) return null;
    return v * (HC_RATE[st.attributes.unit_of_measurement] ?? 1e3);
  }

  _mbit(bits, digits) {
    if (bits === null) return "–";
    const m = bits / 1e6;
    return `${this._fmt(m, digits ?? (m < 10 ? 1 : 0))} Mbit/s`;
  }

  _dur(ms) {
    const min = Math.max(0, Math.round(ms / 60000));
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    if (h < 48) return `${h} h ${min % 60} min`;
    const d = Math.floor(h / 24);
    return `${d} Tage${h % 24 ? ` ${h % 24} h` : ""}`;
  }

  _time(key) {
    const t = Date.parse(this._st(key)?.state || "");
    return Number.isFinite(t) ? t : null;
  }

  _clients() {
    let wlan = 0, lan = 0;
    for (const e of Object.values(this._hass.entities || {})) {
      if (e.platform !== "fritz" || !e.entity_id.startsWith("device_tracker.")) continue;
      const st = this._hass.states[e.entity_id];
      if (!st || st.state !== "home") continue;
      if (/lan/i.test(st.attributes.connection_type || "") && !/wlan/i.test(st.attributes.connection_type)) lan++; else wlan++;
    }
    return { wlan, lan, all: wlan + lan };
  }

  _render() {
    this._ensureStats(["gb_down", "gb_up"]);
    const online = this._on("online");
    const down = this._bits("down"), up = this._bits("up");
    const maxDown = this._bits("max_down") ?? this._bits("link_down");
    const maxUp = this._bits("max_up") ?? this._bits("link_up");
    const upd = this._st("update");
    const since = this._time("since"), boot = this._time("boot");
    const ip = this._st("ip")?.state;
    const temp = this._num("cpu_temp");
    let title, sub, level = "ok";
    if (online === false) {
      level = "bad"; title = "Keine Internetverbindung";
      const lc = Date.parse(this._st("online").last_changed);
      sub = Number.isFinite(lc) ? `seit ${this._clock(lc)} Uhr (${this._dur(Date.now() - lc)})` : "";
    } else if (upd?.state === "on") {
      level = "warn"; title = `${upd.attributes.title || "Firmware"}-Update verfügbar`;
      sub = `${upd.attributes.installed_version || "?"} → ${upd.attributes.latest_version || "?"}`;
    } else {
      title = "Online";
      sub = [since ? `verbunden seit ${this._dur(Date.now() - since)}` : "", ip && ip !== "unavailable" ? `IP ${ip}` : ""].filter(Boolean).join(" · ");
    }
    const load = down !== null && maxDown ? Math.max(0, Math.min(100, (down / maxDown) * 100)) : 0;
    const loadCls = load >= 90 ? "bad" : load >= 70 ? "warn" : "ok";
    const gbD = this._sinceMidnight("gb_down"), gbU = this._sinceMidnight("gb_up");
    const gb = (v, key) => v === null ? `${this._fmt(this._num(key), 0)} GB` : v < 1 ? `${this._fmt(v * 1000, 0)} MB` : `${this._fmt(v, 1)} GB`;
    const cl = this._clients();
    const wifi = (this._wifi || []).map((w) => {
      const on = this._on(w.key);
      const qr = w.guest && this._map.qr;
      return `<div class="wrow">
        <span class="wic ${on ? "on" : ""}">${hcIcon("wifi")}</span>
        <span class="wl">${hcEsc(w.guest ? "Gäste-WLAN" : `WLAN ${w.label.replace(/^Haupt\s*/i, "")}`)}</span>
        ${qr ? `<button class="qrb click" data-more="qr" aria-label="QR-Code des Gäste-WLANs anzeigen">${hcIcon("qrcode")}</button>` : "<span></span>"}
        <button class="sw ${on ? "on" : ""}" data-action="wifi:${w.key}" role="switch" aria-checked="${on ? "true" : "false"}" aria-label="${hcEsc(w.label)} ${on ? "ausschalten" : "einschalten"}"><span></span></button>
      </div>`;
    }).join("");
    const att = this._num("att"), snr = this._num("snr");
    const ver = upd?.attributes.installed_version || this._hass.devices?.[this._deviceId]?.sw_version;
    return `
      ${this._heroFb(online, down, up, (this._wifi || []).filter((w) => this._on(w.key)))}
      <div class="main">
        <div class="head ${level}">${hcEsc(title)}</div>
        <div class="sub">${hcEsc(sub)}</div>
        <div class="big">
          <button class="soc click" data-more="down" aria-label="Download: Verlauf anzeigen">
            <span class="bn">${down === null ? "–" : this._fmt(down / 1e6, down < 1e7 ? 1 : 0)}</span><span class="bu">Mbit/s</span><div class="bl">${hcIcon("download", "sm blue")}Download</div></button>
          <button class="right soc click" data-more="up" aria-label="Upload: Verlauf anzeigen">
            <span class="bn2">${this._mbit(up)}</span><div class="bl">${hcIcon("upload", "sm green")}Upload</div></button>
        </div>
        <div class="bar"><span class="fill ${loadCls}" style="width:${load}%"></span></div>
        <div class="barlbl"><span>${maxDown ? `${this._fmt(load, 0)} % ausgelastet` : ""}</span><span>${maxDown ? `Anschluss ${this._fmt(maxDown / 1e6, 0)} / ${this._fmt((maxUp ?? 0) / 1e6, 0)} Mbit/s` : ""}</span></div>
        <div class="tiles">
          ${this._tile("download", gb(gbD, "gb_down"), "Heute empfangen", "", "gb_down")}
          ${this._tile("upload", gb(gbU, "gb_up"), "Heute gesendet", "", "gb_up")}
          ${this._tile("lan", `${cl.all} Geräte`, cl.all ? `${cl.wlan} WLAN · ${cl.lan} LAN` : "im Netz")}
          ${this._tile("thermo", `${this._fmt(temp, 0)} °C`, "CPU-Temperatur", temp !== null && temp >= 95 ? "amber" : "", "cpu_temp")}
        </div>
        ${wifi ? `<div class="wifi">${wifi}</div>` : ""}
      </div>
      <div class="foot">
        <span>${hcIcon("router")}${hcEsc([ver ? `${upd?.attributes.title || "Firmware"} ${ver}` : "", boot ? `Neustart vor ${this._dur(Date.now() - boot)}` : ""].filter(Boolean).join(" · "))}</span>
        ${att !== null || snr !== null ? `<span>${hcIcon("chart")}Leitung: Dämpfung ${this._fmt(att, 0)} dB · Rauschabstand ${this._fmt(snr, 0)} dB</span>` : ""}
      </div>`;
  }

  _heroFb(online, down, up, wifiOn) {
    const off = online === false;
    const dOn = !off && down !== null && down > 2e5, uOn = !off && up !== null && up > 2e5;
    const led = (x, cls) => `<circle class="led ${cls}" cx="${x}" cy="137" r="3"/>`;
    const guestOn = wifiOn.some((w) => w.guest), mainOn = wifiOn.some((w) => !w.guest);
    const waves = mainOn || guestOn ? `<g class="waves ${guestOn && !mainOn ? "guest" : ""}">
        <path d="M168 92 a 26 26 0 0 1 44 0"/><path d="M158 82 a 40 40 0 0 1 64 0"/><path d="M148 72 a 54 54 0 0 1 84 0"/></g>` : "";
    return `
      <div class="hero fb">
        <div class="hero__top"><div class="hero__title">${hcEsc(this._config.title || this._devName("Router"))}</div>${this._pill(5 * 60000, off)}</div>
        <svg class="scene" viewBox="0 0 400 190" role="img" aria-label="Router">
          ${waves}
          <rect class="body" x="110" y="112" width="160" height="40" rx="12"/>
          <rect class="top" x="110" y="112" width="160" height="10" rx="5"/>
          ${led(132, "ok")}${led(146, off ? "bad" : "ok")}${led(160, mainOn ? "ok" : "off")}${led(174, guestOn ? "ok" : "off")}
          <path class="feet" d="M130 152 v6 M250 152 v6"/>
          <path class="flow ${dOn ? "on" : ""} down" d="M334 98 C 324 118 302 126 276 126"/>
          <path class="flow ${uOn ? "on" : ""} up" d="M276 140 C 316 140 346 128 354 98"/>
          ${off ? `<path class="cut" d="M318 108 l12 12 M330 108 l-12 12"/>` : ""}
          <g class="cloudicon ${off ? "off" : ""}" transform="translate(326 60) scale(1.6)"><path d="${HC_ICONS.cloud}"/></g>
          <line class="ground" x1="20" y1="158" x2="380" y2="158"/>
        </svg>
      </div>`;
  }

  _action(a) {
    if (!a.startsWith("wifi:")) return;
    const key = a.slice(5);
    const w = (this._wifi || []).find((x) => x.key === key);
    const id = this._map[key];
    if (!w || !id) return;
    const on = this._on(key);
    if (on && !w.guest) {
      this._confirmCall(`WLAN ${w.label} ausschalten? Alle Geräte in diesem WLAN verlieren die Verbindung – auch dieses Gerät, falls es darüber verbunden ist.`, "switch", "turn_off", { entity_id: id });
      return;
    }
    this._hass.callService("switch", on ? "turn_off" : "turn_on", { entity_id: id }).catch((err) => {
      this.dispatchEvent(new CustomEvent("hass-notification", { detail: { message: err?.message || String(err) }, bubbles: true, composed: true }));
    });
  }

  _styles() {
    return `
      .hero.fb { background: linear-gradient(180deg, #3d5a80 0%, #7d97b8 55%, #cfd9e5 100%); }
      .scene .body { fill: #f4f6f9; stroke: #c3cbd6; stroke-width: 2; } .scene .top { fill: #dfe4ea; }
      .scene .feet { stroke: #8f9aa8; stroke-width: 5; stroke-linecap: round; }
      .scene .led.ok { fill: #3ddc84; filter: drop-shadow(0 0 3px #3ddc84); }
      .scene .led.bad { fill: #ff5f57; filter: drop-shadow(0 0 4px #ff5f57); animation: hc-blink 1s steps(2) infinite; }
      .scene .led.off { fill: #aab3bf; }
      @keyframes hc-blink { 50% { opacity: .25; } }
      .scene .waves path { fill: none; stroke: rgba(255,255,255,.85); stroke-width: 4; stroke-linecap: round; animation: hc-wave 2.4s ease-in-out infinite; }
      .scene .waves path:nth-child(2) { animation-delay: .3s; } .scene .waves path:nth-child(3) { animation-delay: .6s; }
      .scene .waves.guest path { stroke: rgba(255,214,120,.9); }
      @keyframes hc-wave { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
      .scene .cloudicon path { fill: #eef3f8; } .scene .cloudicon.off path { fill: #9aa6b5; }
      .scene .flow.up { --c: #3ddc84; } .scene .flow.down { --c: #8fd0ff; }
      .scene .cut { stroke: #ff5f57; stroke-width: 4; stroke-linecap: round; }
      .head.ok { color: var(--hc-green); } .head.warn { color: #b7791f; } .head.bad { color: var(--hc-red); }
      .fill.ok { background: var(--hc-blue); } .fill.warn { background: var(--hc-amber); } .fill.bad { background: var(--hc-red); }
      .big .right { text-align: right; } .big .right.soc { margin: -2px -6px -2px 0; }
      .bl { display: flex; align-items: center; gap: 6px; } .right .bl { justify-content: flex-end; }
      .ic.sm { width: 18px; height: 18px; }
      .tiles { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } .tile > div { min-width: 0; }
      .wifi { display: grid; gap: 2px; margin: 0 0 12px; }
      .wrow { display: grid; grid-template-columns: 28px 1fr 40px 52px; align-items: center; gap: 10px; padding: 8px 4px; }
      .wic .ic { fill: #9aa3ad; } .wic.on .ic { fill: var(--hc-blue); }
      .wl { font-weight: 600; }
      .qrb { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; }
      .qrb .ic { fill: var(--hc-fg2); width: 22px; height: 22px; }
      .sw { position: relative; width: 48px; height: 28px; border-radius: 999px; background: var(--hc-track); transition: background .2s; }
      .sw span { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: transform .2s; }
      .sw.on { background: var(--hc-blue); } .sw.on span { transform: translateX(20px); }
      .sw:focus-visible { outline: 2px solid var(--hc-blue); outline-offset: 2px; }
      @media (prefers-reduced-motion: reduce) { .scene .waves path, .scene .led.bad { animation: none; } }`;
  }
}

// ---------------------------------------------------------------------------
// Gemeinsame Gestaltung
// ---------------------------------------------------------------------------
const HC_STYLES = `
  :host { --hc-tile: color-mix(in srgb, var(--primary-text-color, #1c2b4a) 7%, transparent);
          --hc-track: color-mix(in srgb, var(--primary-text-color, #1c2b4a) 14%, transparent);
          --hc-fg: var(--primary-text-color, #14213d); --hc-fg2: var(--secondary-text-color, #5b6b82);
          --hc-blue: #2f7fe0; --hc-green: #2fa864; --hc-amber: #e8a317; --hc-red: #d9534f; }
  ha-card { display: block; overflow: hidden; color: var(--hc-fg); background: var(--ha-card-background, var(--card-background-color, #fff));
            border-radius: var(--ha-card-border-radius, 12px); }
  button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; padding: 0; }
  .ic { width: 24px; height: 24px; fill: currentColor; flex: none; }
  .ic.amber { fill: var(--hc-amber); } .ic.green { fill: var(--hc-green); } .ic.blue { fill: var(--hc-blue); }
  .empty { padding: 24px; color: var(--hc-fg2); }
  .hero { position: relative; }
  .hero__top { position: absolute; inset: 14px 16px auto 16px; display: flex; justify-content: space-between; align-items: center; z-index: 1; }
  .hero__title { color: #fff; font-size: 22px; font-weight: 700; text-shadow: 0 1px 3px rgba(0,0,0,.35); }
  .hero.light .hero__title { color: #1c2b4a; text-shadow: none; }
  .pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(40,45,55,.55); color: #fff; font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 999px; }
  .dot { width: 9px; height: 9px; border-radius: 50%; background: #3ddc84; } .dot.bad { background: #ff5f57; }
  .scene { display: block; width: 100%; height: auto; padding-top: 40px; }
  .scene .ground { stroke: rgba(255,255,255,.45); stroke-width: 2; }
  .scene .flow { fill: none; stroke: var(--c); stroke-width: 4; stroke-linecap: round; stroke-dasharray: 2 12; opacity: .2; }
  .scene .flow.on { opacity: 1; animation: hc-flow 1.1s linear infinite; }
  @keyframes hc-flow { to { stroke-dashoffset: -28; } }
  @media (prefers-reduced-motion: reduce) { .scene .flow.on { animation: none; stroke-dasharray: none; } }
  .main { padding: 18px 20px 6px; }
  .head { font-size: 22px; font-weight: 700; line-height: 1.25; }
  .sub { color: var(--hc-fg2); margin-top: 4px; }
  .big { display: flex; justify-content: space-between; align-items: flex-end; margin: 18px 0 12px; }
  .big .right { text-align: right; }
  .soc { text-align: left; border-radius: 12px; padding: 2px 6px; margin: -2px -6px; }
  .bn { font-size: 52px; font-weight: 800; line-height: 1; } .bu { font-size: 20px; color: var(--hc-fg2); margin-left: 3px; }
  .bn2 { font-size: 28px; font-weight: 800; } .bl { color: var(--hc-fg2); margin-top: 6px; }
  .bar { position: relative; height: 14px; background: var(--hc-track); border-radius: 999px; }
  .fill { position: absolute; inset: 0 auto 0 0; border-radius: 999px; transition: width .6s; }
  .barlbl { display: flex; justify-content: space-between; color: var(--hc-fg2); font-size: 14px; margin-top: 10px; }
  .tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 18px 0 12px; }
  .tile { display: flex; align-items: center; gap: 14px; background: var(--hc-tile); border-radius: 16px; padding: 14px 16px; text-align: left; width: 100%; box-sizing: border-box; }
  .tile .ic { fill: var(--hc-fg2); } .tile .ic.amber { fill: var(--hc-amber); } .tile .ic.green { fill: var(--hc-green); } .tile .ic.blue { fill: var(--hc-blue); }
  .tv { font-size: 18px; font-weight: 700; } .tl { color: var(--hc-fg2); font-size: 14px; }
  .click { cursor: pointer; transition: background .15s; }
  .click:hover, .click:focus-visible { background: color-mix(in srgb, var(--hc-fg) 12%, transparent); outline: none; }
  .foot { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--divider-color, #e1e6ee); padding: 14px 20px 16px; color: var(--hc-fg2); font-size: 14px; }
  .foot span { display: flex; align-items: center; gap: 10px; }
  .foot .ic { width: 18px; height: 18px; fill: var(--hc-fg2); }
  .foot .warn { color: var(--hc-red); } .foot .warn .ic { fill: var(--hc-red); }
`;

// ---------------------------------------------------------------------------
// Editoren (Titel; Wetterstation zusätzlich Entitäten-Zuordnung über YAML)
// ---------------------------------------------------------------------------
class HcSimpleEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>label{display:block;margin:10px 0 4px;font-weight:600}input{width:100%;box-sizing:border-box;padding:8px;font:inherit}
      .hint{color:var(--secondary-text-color);font-size:13px;margin-top:6px}</style>
      <label for="t">Titel</label><input id="t" value="${hcEsc(this._config.title || "")}" placeholder="Standard: Gerätename">
      <div class="hint">${this.constructor.hint}</div>`;
    this.shadowRoot.getElementById("t").addEventListener("change", (ev) => {
      const cfg = { ...this._config };
      const v = ev.target.value.trim();
      if (v) cfg.title = v; else delete cfg.title;
      this._config = cfg;
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cfg }, bubbles: true, composed: true }));
    });
  }

  set hass(hass) {
    this._hass = hass;
  }
}
class HcWeatherEditor extends HcSimpleEditor {
  static hint = "Die Entitäten werden automatisch gefunden. Andere Stationen im YAML-Editor zuordnen: entities: { temperature, humidity, wind_speed, wind_direction, rain_total, raining, sunshine, brightness, battery_low }.";
}
class HcGenericEditor extends HcSimpleEditor {
  static hint = "Das Gerät wird über seine Integration automatisch gefunden. Bei mehreren Geräten im YAML-Editor device_id angeben.";
}
class HcWallboxEditor extends HcSimpleEditor {
  static hint = "Fahrzeugbild: wird automatisch aus BavarianData übernommen. Sonst unter „Fahrzeugbild“ eine image.-Entität oder Bild-URL eintragen, „none“ für die Zeichnung.";
  setConfig(config) {
    super.setConfig(config);
    const wrap = document.createElement("div");
    wrap.innerHTML = `<label for="ci">Fahrzeugbild</label><input id="ci" value="${hcEsc(this._config.car_image || "")}" placeholder="automatisch (BavarianData)">`;
    this.shadowRoot.insertBefore(wrap, this.shadowRoot.querySelector(".hint"));
    wrap.querySelector("#ci").addEventListener("change", (ev) => {
      const cfg = { ...this._config };
      const v = ev.target.value.trim();
      if (v) cfg.car_image = v; else delete cfg.car_image;
      this._config = cfg;
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cfg }, bubbles: true, composed: true }));
    });
  }
}
class HcNasEditor extends HcSimpleEditor {
  static hint = "Die DiskStation wird über die Integration „Synology DSM“ automatisch gefunden. Bei mehreren Geräten im YAML-Editor device_id angeben.";
}

const hcDefine = (tag, cls) => { if (!customElements.get(tag)) customElements.define(tag, cls); };
hcDefine("hc-weather-station-card", HcWeatherStationCard);
hcDefine("hc-diskstation-card", HcDiskStationCard);
hcDefine("hc-weather-station-card-editor", HcWeatherEditor);
hcDefine("hc-diskstation-card-editor", HcNasEditor);
hcDefine("hc-dishwasher-card", HcDishwasherCard);
hcDefine("hc-wallbox-card", HcWallboxCard);
hcDefine("hc-printer-card", HcPrinterCard);
hcDefine("hc-fritzbox-card", HcFritzBoxCard);
hcDefine("hc-generic-card-editor", HcGenericEditor);
hcDefine("hc-wallbox-card-editor", HcWallboxEditor);
window.customCards = window.customCards || [];
for (const c of [
  { type: "hc-weather-station-card", name: "Wetterstation (ha-cards)", description: "Himmel nach Messwerten, Temperatur mit Hoch/Tief, Windrose, Regen und Sonne heute." },
  { type: "hc-diskstation-card", name: "DiskStation (ha-cards)", description: "Synology NAS mit Plattenstatus, Belegung, CPU/RAM, Netzwerk und Sicherheitsberater." },
  { type: "hc-dishwasher-card", name: "Geschirrspüler (ha-cards)", description: "Home-Connect-Geschirrspüler: Programm, Restzeit, Fortschritt, Salz/Klarspüler, Start/Stopp." },
  { type: "hc-wallbox-card", name: "Ladestation (ha-cards)", description: "Tesla Wall Connector: Ladeleistung, Phasen, Ladevorgang, kWh heute/Monat/gesamt." },
  { type: "hc-printer-card", name: "Drucker (ha-cards)", description: "IPP-Drucker: Status und Tintenfüllstände mit Warnung." },
  { type: "hc-fritzbox-card", name: "FRITZ!Box (ha-cards)", description: "Internetverbindung, Durchsatz, Auslastung, Datenmenge heute, Geräte im Netz, WLAN und Gäste-WLAN mit QR-Code." },
]) if (!window.customCards.some((x) => x.type === c.type)) window.customCards.push({ ...c, preview: true });
console.info(`%c HA-CARDS %c ${HC_VERSION} `, "background:#2f7fe0;color:#fff;border-radius:3px 0 0 3px", "background:#14213d;color:#fff;border-radius:0 3px 3px 0");
