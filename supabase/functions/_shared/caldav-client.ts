const CALDAV_BASE = "https://caldav.icloud.com";

function basicAuth(appleId: string, password: string): string {
  return "Basic " + btoa(`${appleId}:${password}`);
}

async function caldavRequest(
  url: string,
  method: string,
  body: string | null,
  appleId: string,
  password: string,
  depth: string = "0"
): Promise<{ status: number; text: string; headers: Headers; finalUrl: string }> {
  const authHeader = basicAuth(appleId, password);
  const makeHeaders = (): Record<string, string> => ({
    Authorization: authHeader,
    "Content-Type": "application/xml; charset=utf-8",
    Depth: depth,
  });

  // Handle redirects manually to preserve auth headers
  let currentUrl = url;
  let res: Response;
  let attempts = 0;

  while (attempts < 5) {
    attempts++;
    res = await fetch(currentUrl, {
      method,
      headers: makeHeaders(),
      body,
      redirect: "manual",
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("Location");
      if (!location) break;
      const redirectUrl = location.startsWith("http") ? location : new URL(location, currentUrl).toString();
      if (!isAllowedRedirect(redirectUrl)) throw new Error("Redirect to disallowed domain");
      currentUrl = redirectUrl;
      continue;
    }
    break;
  }

  const text = await res!.text();
  return { status: res!.status, text, headers: res!.headers, finalUrl: currentUrl };
}

// ─── DISCOVERY ───────────────────────────────

export async function discoverPrincipal(
  appleId: string,
  password: string
): Promise<string> {
  const body = `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:current-user-principal/>
  </d:prop>
</d:propfind>`;

  const res = await caldavRequest(CALDAV_BASE + "/", "PROPFIND", body, appleId, password, "0");
  if (res.status >= 400) throw new Error(`CalDAV auth failed (${res.status})`);

  const match = res.text.match(/current-user-principal[\s\S]*?<[^>]*href[^>]*>([^<]+)</i);
  if (!match) throw new Error("Could not discover principal URL");

  const principalHref = match[1].trim();
  // If Apple returned a full URL, use it directly; otherwise prepend the redirect base
  if (principalHref.startsWith("http")) return principalHref;
  const redirectBase = new URL(res.finalUrl).origin;
  return redirectBase + principalHref;
}

export async function discoverCalendarHome(
  principalUrl: string,
  appleId: string,
  password: string
): Promise<string> {
  const body = `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <c:calendar-home-set/>
  </d:prop>
</d:propfind>`;

  const res = await caldavRequest(principalUrl, "PROPFIND", body, appleId, password, "0");
  if (res.status >= 400) throw new Error(`CalDAV home discovery failed (${res.status})`);

  const match = res.text.match(/calendar-home-set[\s\S]*?<(?:[a-zA-Z]+:)?href[^>]*>([^<]+)/i);
  if (!match) throw new Error("Could not discover calendar home set");

  const homeHref = match[1].trim();
  if (homeHref.startsWith("http")) return homeHref;
  const base = new URL(principalUrl).origin;
  return base + homeHref;
}

export interface CalendarInfo {
  id: string;
  name: string;
  href: string;
  type: "calendar" | "reminders";
  color?: string;
}

export async function listCalendars(
  homeSetUrl: string,
  appleId: string,
  password: string
): Promise<CalendarInfo[]> {
  const body = `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:ic="http://apple.com/ns/ical/">
  <d:prop>
    <d:displayname/>
    <d:resourcetype/>
    <c:supported-calendar-component-set/>
    <ic:calendar-color/>
  </d:prop>
</d:propfind>`;

  const res = await caldavRequest(homeSetUrl, "PROPFIND", body, appleId, password, "1");
  if (res.status >= 400) throw new Error(`Calendar list failed (${res.status})`);

  const calendars: CalendarInfo[] = [];
  // Split on <response> with any namespace prefix (or none)
  const responses = res.text.split(/<(?:[a-zA-Z]+:)?response(?:\s[^>]*)?>/i).slice(1);

  for (const resp of responses) {
    // Match href with any namespace prefix
    const hrefMatch = resp.match(/<(?:[a-zA-Z]+:)?href>([^<]+)<\/(?:[a-zA-Z]+:)?href>/i);
    if (!hrefMatch) continue;

    const href = hrefMatch[1];
    // Match resourcetype containing calendar element with any prefix
    const isCalendar = /resourcetype[\s\S]*?calendar/i.test(resp);
    if (!isCalendar) continue;

    const nameMatch = resp.match(/displayname[^>]*>([\s\S]*?)<\/(?:[a-zA-Z]+:)?displayname>/i);
    const name = nameMatch ? nameMatch[1].trim() || "Untitled" : "Untitled";

    const colorMatch = resp.match(/calendar-color[^>]*>([^<]*)</i);
    const color = colorMatch ? colorMatch[1] : undefined;

    const supportsVEVENT = /VEVENT/i.test(resp);
    const supportsVTODO = /VTODO/i.test(resp);
    const hasComponentSet = /supported-calendar-component-set/i.test(resp);

    const base = new URL(homeSetUrl).origin;
    const fullHref = href.startsWith("http") ? href : base + href;

    // If no component set declared, assume reminders (Apple calendars always declare VEVENT)
    if (!hasComponentSet) {
      calendars.push({ id: href, name, href: fullHref, type: "reminders", color });
    } else if (supportsVTODO && supportsVEVENT) {
      calendars.push({ id: href, name, href: fullHref, type: "calendar", color });
      calendars.push({ id: href, name, href: fullHref, type: "reminders", color });
    } else if (supportsVTODO) {
      calendars.push({ id: href, name, href: fullHref, type: "reminders", color });
    } else if (supportsVEVENT) {
      calendars.push({ id: href, name, href: fullHref, type: "calendar", color });
    }
  }

  return calendars;
}

// ─── FETCH EVENTS ────────────────────────────

export interface CalDAVItem {
  href: string;
  etag: string;
  icalData: string;
}

export async function fetchEvents(
  calendarUrl: string,
  appleId: string,
  password: string,
  dateFrom: string,
  dateTo: string
): Promise<CalDAVItem[]> {
  const body = `<?xml version="1.0" encoding="utf-8"?>
<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:getetag/>
    <c:calendar-data/>
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        <c:time-range start="${dateFrom}T000000Z" end="${dateTo}T235959Z"/>
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`;

  const res = await caldavRequest(calendarUrl, "REPORT", body, appleId, password, "1");
  if (res.status >= 400) throw new Error(`Fetch events failed (${res.status})`);

  return parseMultigetResponse(res.text, calendarUrl);
}

export async function fetchTodos(
  reminderListUrl: string,
  appleId: string,
  password: string
): Promise<CalDAVItem[]> {
  const body = `<?xml version="1.0" encoding="utf-8"?>
<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:getetag/>
    <c:calendar-data/>
  </d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VTODO"/>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`;

  const res = await caldavRequest(reminderListUrl, "REPORT", body, appleId, password, "1");
  if (res.status >= 400) throw new Error(`Fetch todos failed (${res.status})`);

  return parseMultigetResponse(res.text, reminderListUrl);
}

function parseMultigetResponse(xml: string, baseUrl: string): CalDAVItem[] {
  const items: CalDAVItem[] = [];
  const responses = xml.split(/<(?:[a-zA-Z]+:)?response(?:\s[^>]*)?>/i).slice(1);
  const origin = new URL(baseUrl).origin;

  for (const resp of responses) {
    const hrefMatch = resp.match(/<(?:[a-zA-Z]+:)?href>([^<]+)<\/(?:[a-zA-Z]+:)?href>/i);
    const etagMatch = resp.match(/getetag[^>]*>"?([^"<]+)"?<\//i);
    const dataMatch = resp.match(/calendar-data[^>]*>([\s\S]*?)<\/(?:[a-zA-Z]+:)?calendar-data>/i);

    if (hrefMatch && etagMatch && dataMatch) {
      const href = hrefMatch[1].startsWith("http") ? hrefMatch[1] : origin + hrefMatch[1];
      items.push({
        href,
        etag: etagMatch[1],
        icalData: dataMatch[1].trim(),
      });
    }
  }

  return items;
}

// ─── WRITE OPERATIONS ────────────────────────

export async function putEvent(
  href: string,
  icalData: string,
  appleId: string,
  password: string,
  etag?: string
): Promise<{ etag: string }> {
  const authHeader = basicAuth(appleId, password);
  const makeHeaders = (): Record<string, string> => {
    const h: Record<string, string> = {
      Authorization: authHeader,
      "Content-Type": "text/calendar; charset=utf-8",
    };
    if (etag) h["If-Match"] = `"${etag}"`;
    else h["If-None-Match"] = "*";
    return h;
  };

  // Handle redirects manually to preserve auth headers
  let currentUrl = href;
  let res: Response;
  let attempts = 0;
  while (attempts < 5) {
    attempts++;
    res = await fetch(currentUrl, { method: "PUT", headers: makeHeaders(), body: icalData, redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("Location");
      if (!location) break;
      const redirectUrl = location.startsWith("http") ? location : new URL(location, currentUrl).toString();
      if (!isAllowedRedirect(redirectUrl)) throw new Error("Redirect to disallowed domain");
      currentUrl = redirectUrl;
      continue;
    }
    break;
  }

  if (res!.status >= 400) {
    const text = await res!.text();
    throw new Error(`PUT failed (${res!.status}): ${text.slice(0, 200)}`);
  }

  const newEtag = res!.headers.get("ETag")?.replace(/"/g, "") || "";
  return { etag: newEtag };
}

export async function deleteResource(
  href: string,
  appleId: string,
  password: string,
  etag?: string
): Promise<void> {
  const authHeader = basicAuth(appleId, password);
  const makeHeaders = (): Record<string, string> => {
    const h: Record<string, string> = { Authorization: authHeader };
    if (etag) h["If-Match"] = `"${etag}"`;
    return h;
  };

  // Handle redirects manually to preserve auth headers
  let currentUrl = href;
  let res: Response;
  let attempts = 0;
  while (attempts < 5) {
    attempts++;
    res = await fetch(currentUrl, { method: "DELETE", headers: makeHeaders(), redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("Location");
      if (!location) break;
      const redirectUrl = location.startsWith("http") ? location : new URL(location, currentUrl).toString();
      if (!isAllowedRedirect(redirectUrl)) throw new Error("Redirect to disallowed domain");
      currentUrl = redirectUrl;
      continue;
    }
    break;
  }

  if (res!.status >= 400 && res!.status !== 404) {
    throw new Error(`DELETE failed (${res!.status})`);
  }
}

// ─── ICAL PARSING ────────────────────────────

export interface ParsedEvent {
  uid: string;
  summary: string;
  dtstart: string;
  dtend: string;
  description?: string;
}

export function parseVEvent(ical: string): ParsedEvent | null {
  const vevent = ical.match(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/);
  if (!vevent) return null;

  const block = vevent[1];
  return {
    uid: extractProp(block, "UID") || "",
    summary: extractProp(block, "SUMMARY") || "",
    dtstart: extractProp(block, "DTSTART") || "",
    dtend: extractProp(block, "DTEND") || "",
    description: extractProp(block, "DESCRIPTION"),
  };
}

export interface ParsedTodo {
  uid: string;
  summary: string;
  due?: string;
  completed?: string;
  priority?: number;
  description?: string;
  status?: string;
}

export function parseVTodo(ical: string): ParsedTodo | null {
  const vtodo = ical.match(/BEGIN:VTODO([\s\S]*?)END:VTODO/);
  if (!vtodo) return null;

  const block = vtodo[1];
  const priorityStr = extractProp(block, "PRIORITY");
  return {
    uid: extractProp(block, "UID") || "",
    summary: extractProp(block, "SUMMARY") || "",
    due: extractProp(block, "DUE"),
    completed: extractProp(block, "COMPLETED"),
    priority: priorityStr ? parseInt(priorityStr) : undefined,
    description: extractProp(block, "DESCRIPTION"),
    status: extractProp(block, "STATUS"),
  };
}

function extractProp(block: string, prop: string): string | undefined {
  // Handle properties with parameters like DTSTART;VALUE=DATE:20260321
  const regex = new RegExp(`^${prop}[;:]([^\\r\\n]+)`, "mi");
  const match = block.match(regex);
  if (!match) return undefined;
  // If it has parameters (;), extract value after last colon
  const val = match[1];
  const colonIdx = val.indexOf(":");
  if (match[0].charAt(prop.length) === ";") {
    return colonIdx >= 0 ? val.slice(colonIdx + 1) : val;
  }
  return val;
}

// ─── ICAL HELPERS ───────────────────────────

/** Strip CRLF sequences to prevent iCal property injection */
function icalSafe(str: string): string {
  return str.replace(/[\r\n]+/g, " ");
}

/** Validate that a redirect target is on an Apple CalDAV domain */
function isAllowedRedirect(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.endsWith(".icloud.com") || host.endsWith(".apple.com");
  } catch {
    return false;
  }
}

// ─── ICAL BUILDING ──────────────────────────

export function buildVEvent(data: {
  uid: string;
  summary: string;
  dtstart: string; // YYYYMMDDTHHMMSS
  dtend: string;
  description?: string;
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OSVitae//EN",
    "BEGIN:VEVENT",
    `UID:${data.uid}`,
    `DTSTART:${data.dtstart}`,
    `DTEND:${data.dtend}`,
    `SUMMARY:${icalSafe(data.summary)}`,
  ];
  if (data.description) lines.push(`DESCRIPTION:${icalSafe(data.description)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export function buildVTodo(data: {
  uid: string;
  summary: string;
  due?: string;
  priority?: number;
  description?: string;
  completed?: boolean;
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OSVitae//EN",
    "BEGIN:VTODO",
    `UID:${data.uid}`,
    `SUMMARY:${icalSafe(data.summary)}`,
    `STATUS:${data.completed ? "COMPLETED" : "NEEDS-ACTION"}`,
  ];
  if (data.due) lines.push(`DUE:${data.due}`);
  if (data.priority !== undefined) lines.push(`PRIORITY:${data.priority}`);
  if (data.description) lines.push(`DESCRIPTION:${icalSafe(data.description)}`);
  if (data.completed) lines.push(`COMPLETED:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`);
  lines.push("END:VTODO", "END:VCALENDAR");
  return lines.join("\r\n");
}

// ─── CONVERSION HELPERS ─────────────────────

/** Convert decimal hour (e.g. 13.5) + date to iCal datetime (20260321T133000) */
export function hourToIcalDT(date: string, decimalHour: number): string {
  const h = Math.floor(decimalHour);
  const m = Math.round((decimalHour - h) * 60);
  const dateClean = date.replace(/-/g, "");
  return `${dateClean}T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
}

/** Convert iCal datetime (20260321T133000) to { date: "2026-03-21", hour: 13.5 } */
export function icalDTToHour(dt: string): { date: string; hour: number } {
  // Strip any trailing Z or timezone
  const clean = dt.replace(/Z$/, "").replace(/;.*/, "");
  const datePart = clean.slice(0, 8);
  const date = `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`;

  if (clean.length >= 13) {
    const h = parseInt(clean.slice(9, 11));
    const m = parseInt(clean.slice(11, 13));
    return { date, hour: h + m / 60 };
  }

  return { date, hour: 0 };
}

/** Map iCal priority (1-9) to OSVitae priority */
export function icalPriorityToApp(p?: number): "high" | "medium" | "low" {
  if (!p || p === 0) return "medium";
  if (p <= 4) return "high";
  if (p === 5) return "medium";
  return "low";
}

/** Map OSVitae priority to iCal priority */
export function appPriorityToIcal(p: string): number {
  if (p === "high") return 1;
  if (p === "medium") return 5;
  return 9;
}
