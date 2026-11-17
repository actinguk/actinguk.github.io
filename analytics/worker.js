import { DASHBOARD, LOGIN, STYLES, CLIENT } from "./dashboard.js";

// Acting UK analytics: no third-party tracker, persistent visitor ID or advertising.
const ALLOWED = new Set(["https://actinguk.com","https://www.actinguk.com","https://actinguk.github.io"]);
const MAX_CSV = 200000;
const DAY_MS = 86400000;
const SESSION_MS = 12 * 60 * 60 * 1000;
const encoder = new TextEncoder();

function respond(body, status = 200, type = "text/html; charset=utf-8", extras = {}) {
  return new Response(status === 204 || status === 304 ? null : body, {status, headers: {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; style-src 'self'; script-src 'self'; connect-src 'self'",
    ...extras
  }});
}
function json(data, status = 200) { return respond(JSON.stringify(data), status, "application/json; charset=utf-8"); }
function code(s) { return String(s || "").slice(0, 180); }
function toBase64(bytes) {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64(str) {
  const normalized = str.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")), c => c.charCodeAt(0));
}
async function hmac(secret, value) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), {name:"HMAC", hash:"SHA-256"}, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}
function equal(a, b) {
  const aa = encoder.encode(a), bb = encoder.encode(b);
  let diff = aa.length ^ bb.length;
  for (let i=0; i<Math.max(aa.length,bb.length); i++) diff |= (aa[i] || 0) ^ (bb[i] || 0);
  return diff === 0;
}
async function visitorKey(request, env, day) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const agent = request.headers.get("User-Agent") || "unknown";
  return toBase64(await hmac(env.HASH_SECRET, "v1:" + day + ":" + ip + ":" + agent));
}
async function session(request, env) {
  const match = (request.headers.get("Cookie") || "").match(/(?:^|;\s*)au_session=([^;]+)/);
  if (!match) return false;
  const parts = match[1].split(".");
  if (parts.length !== 2) return false;
  try {
    const msg = new TextDecoder().decode(fromBase64(parts[0]));
    const value = JSON.parse(msg);
    if (value.role !== "owner" || !Number.isFinite(value.exp) || value.exp < Date.now() || value.exp > Date.now() + SESSION_MS) return false;
    const expected = toBase64(await hmac(env.SESSION_SECRET, parts[0]));
    return equal(expected, parts[1]);
  } catch { return false; }
}
async function makeSession(env) {
  const body = toBase64(encoder.encode(JSON.stringify({role:"owner", exp:Date.now() + SESSION_MS, nonce:crypto.randomUUID()})));
  return body + "." + toBase64(await hmac(env.SESSION_SECRET, body));
}
function device(agent) {
  if (/iPad|Tablet|Silk|Kindle/i.test(agent)) return "Tablet";
  if (/Mobile|Android|iPhone|iPod/i.test(agent)) return "Mobile";
  return "Desktop";
}
function referer(value) {
  try {
    const u = new URL(value);
    if (!["http:","https:"].includes(u.protocol)) return "Direct / unknown";
    if (["actinguk.com","www.actinguk.com","actinguk.github.io"].includes(u.hostname)) return "Internal";
    return u.hostname.slice(0, 80);
  } catch { return "Direct / unknown"; }
}
async function collect(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (!ALLOWED.has(origin)) return respond("", 403, "text/plain");
  if (Number(request.headers.get("Content-Length") || 0) > 2048) return respond("", 413, "text/plain");
  let payload;
  try {
    const body = await request.text();
    if (body.length > 2048) return respond("", 413, "text/plain");
    payload = JSON.parse(body);
  } catch { return respond("", 400, "text/plain"); }
  const type = payload.type;
  const path = payload.path;
  if (!["pageview","audio_play","headshot_click","site_search"].includes(type)) return respond("", 400, "text/plain");
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//") || path.length > 240 || /[\r\n<>]/.test(path)) return respond("", 400, "text/plain");
  if (path.startsWith("/statistics/")) return respond("", 204, "text/plain", {"Access-Control-Allow-Origin":origin,"Vary":"Origin"});
  let detail = "";
  if (type === "site_search") {
    detail = String(payload.detail || "").trim().toLowerCase().replace(/\s+/g," ");
    // Ignore personal identifiers, numbers and long free-form text.
    if (!/^[\p{L}\s'-]{3,48}$/u.test(detail) || /@/.test(detail)) return respond("",204,"text/plain");
  }
  const now = new Date();
  const day = now.toISOString().slice(0,10);
  const key = await visitorKey(request, env, day); // Daily rotating hash; no IP or UA is saved.
  const country = code(request.cf?.country || "Unknown").slice(0,2);
  const ua = request.headers.get("User-Agent") || "";
  await env.DB.prepare(
    "INSERT INTO au_events (day, kind, path, referrer, country, device, daily_visitor, detail) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(day, type, path, referer(payload.ref), country, device(ua), key, detail).run();
  return respond("", 204, "text/plain", {"Access-Control-Allow-Origin":origin,"Vary":"Origin"});
}
async function login(request, env) {
  if (request.headers.get("Origin") !== new URL(request.url).origin) return respond("Forbidden",403,"text/plain");
  if (Number(request.headers.get("Content-Length") || 0) > 2048) return respond("Too large",413,"text/plain");
  const form = await request.formData();
  const proposed = String(form.get("password") || "");
  if (proposed.length > 512) return respond("Invalid request",400,"text/plain");
  const token = await visitorKey(request,env,"admin-login"); // Not exposed; only short-lived attempt counters.
  const now = Date.now();
  const row = await env.DB.prepare("SELECT failures, window_start, blocked_until FROM au_login_attempts WHERE key = ?").bind(token).first();
  if (row && Number(row.blocked_until) > now) return respond("Too many attempts. Try again later.",429,"text/plain",{"Retry-After":"900"});
  if (!equal(proposed, env.ADMIN_PASSWORD)) {
    const failures = row && (now-Number(row.window_start)) < 900000 ? Number(row.failures)+1 : 1;
    await env.DB.prepare("INSERT INTO au_login_attempts (key,failures,window_start,blocked_until) VALUES (?,?,?,?) ON CONFLICT(key) DO UPDATE SET failures=excluded.failures,window_start=excluded.window_start,blocked_until=excluded.blocked_until")
      .bind(token, failures, failures===1?now:Number(row.window_start), failures>=7?now+900000:0).run();
    return respond("Incorrect password",401,"text/plain");
  }
  await env.DB.prepare("DELETE FROM au_login_attempts WHERE key=?").bind(token).run();
  const cookie = await makeSession(env);
  return respond("",303,"text/plain",{"Location":"/","Set-Cookie":"au_session="+cookie+"; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=43200"});
}
async function stats(env, days) {
  const start = new Date(Date.now() - (days-1)*DAY_MS).toISOString().slice(0,10);
  const bind = (sql) => env.DB.prepare(sql).bind(start).all().then(r=>r.results);
  const [overview, daily, pages, referrers, countries, devices, actions, searches, terms] = await Promise.all([
    bind("SELECT COUNT(*) AS views, COUNT(DISTINCT daily_visitor) AS visitor_days FROM au_events WHERE day>=? AND kind='pageview'"),
    bind("SELECT day AS label,COUNT(*) AS value FROM au_events WHERE day>=? AND kind='pageview' GROUP BY day ORDER BY day"),
    bind("SELECT path AS label,COUNT(*) AS value FROM au_events WHERE day>=? AND kind='pageview' GROUP BY path ORDER BY value DESC LIMIT 30"),
    bind("SELECT referrer AS label,COUNT(*) AS value FROM au_events WHERE day>=? AND kind='pageview' GROUP BY referrer ORDER BY value DESC LIMIT 15"),
    bind("SELECT country AS label,COUNT(*) AS value FROM au_events WHERE day>=? AND kind='pageview' GROUP BY country ORDER BY value DESC LIMIT 15"),
    bind("SELECT device AS label,COUNT(*) AS value FROM au_events WHERE day>=? AND kind='pageview' GROUP BY device ORDER BY value DESC"),
    bind("SELECT kind AS label,COUNT(*) AS value FROM au_events WHERE day>=? AND kind!='pageview' GROUP BY kind ORDER BY value DESC"),
    bind("SELECT detail AS label,COUNT(*) AS value FROM au_events WHERE day>=? AND kind='site_search' AND detail!='' GROUP BY detail ORDER BY value DESC LIMIT 20"),
    env.DB.prepare("SELECT query AS label, clicks, impressions, ctr, position FROM au_search_queries ORDER BY clicks DESC, impressions DESC LIMIT 30").all().then(r=>r.results)
  ]);
  return {days, since:start, overview:overview[0] || {views:0,visitor_days:0}, daily, pages, referrers, countries, devices, actions, searches, terms};
}
function parseCSV(text) {
  const rows = [];
  let field="", row=[], quote=false;
  text = text.replace(/^\uFEFF/,"");
  for (let i=0;i<text.length;i++) {
    const ch=text[i];
    if (ch === '"') { if (quote && text[i+1]==='"') {field+='"';i++;} else quote=!quote; }
    else if (ch === "," && !quote) {row.push(field);field="";}
    else if ((ch==="\n" || ch==="\r") && !quote) {if(ch==="\r"&&text[i+1]==="\n")i++;row.push(field); if(row.some(x=>x.trim())) rows.push(row);row=[];field="";}
    else field+=ch;
  }
  if (quote) throw new Error("Unclosed quote in CSV");
  row.push(field);if(row.some(x=>x.trim()))rows.push(row);
  return rows;
}
async function importCSV(request, env) {
  if (request.headers.get("Origin") !== new URL(request.url).origin) return json({error:"Invalid origin"},403);
  if (Number(request.headers.get("Content-Length") || 0) > MAX_CSV) return json({error:"CSV too large"},413);
  const csv=await request.text();
  if(csv.length>MAX_CSV) return json({error:"CSV too large"},413);
  try {
    const rows=parseCSV(csv);
    const heads=(rows.shift()||[]).map(x=>x.trim().toLowerCase());
    const q=heads.findIndex(x=>["top queries","query","queries"].includes(x));
    const c=heads.indexOf("clicks"),i=heads.indexOf("impressions"),t=heads.indexOf("ctr"),p=heads.indexOf("position");
    if([q,c,i].some(n=>n<0)) return json({error:"Expected Search Console Queries CSV with Top queries, Clicks and Impressions columns"},400);
    const stmts=[env.DB.prepare("DELETE FROM au_search_queries")];
    let total=0;
    for(const row of rows.slice(0,500)) {
      const query=(row[q]||"").trim().slice(0,180);
      const clicks=Number(row[c]),impressions=Number(row[i]);
      const ctr=t<0?0:parseFloat(String(row[t]||"0").replace("%",""))/100;
      const position=p<0?0:Number(row[p]);
      if(!query || !Number.isFinite(clicks) || !Number.isFinite(impressions) || clicks<0 || impressions<0)continue;
      stmts.push(env.DB.prepare("INSERT OR REPLACE INTO au_search_queries (query,clicks,impressions,ctr,position,updated_at) VALUES (?,?,?,?,?,datetime('now'))")
        .bind(query,Math.round(clicks),Math.round(impressions),Number.isFinite(ctr)?ctr:0,Number.isFinite(position)?position:0));
      total++;
    }
    if(!total)return json({error:"No valid search query rows"},400);
    await env.DB.batch(stmts);
    return json({imported:total});
  } catch(e) {return json({error:"Unable to read CSV: "+e.message},400);}
}
export default {
  async fetch(request,env) {
    const pathname=new URL(request.url).pathname;
    if(pathname==="/health")return json({ready:!!(env.DB&&env.ADMIN_PASSWORD&&env.SESSION_SECRET&&env.HASH_SECRET)});
    if(!env.DB || !env.ADMIN_PASSWORD || !env.SESSION_SECRET || !env.HASH_SECRET) return respond("Analytics not configured",503,"text/plain");
    try {
      if(pathname==="/collect" && request.method==="POST")return await collect(request,env);
      if(pathname==="/login" && request.method==="POST")return await login(request,env);
      if(pathname==="/logout" && request.method==="POST") {
        if (request.headers.get("Origin") !== new URL(request.url).origin) return respond("Forbidden",403,"text/plain");
        return respond("",303,"text/plain",{"Location":"/","Set-Cookie":"au_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"});
      }
      if(pathname==="/app.css" && request.method==="GET")return respond(STYLES,200,"text/css; charset=utf-8");
      const authorised=await session(request,env);
      if(pathname==="/" && request.method==="GET")return respond(authorised?DASHBOARD:LOGIN);
      if(!authorised)return respond("Unauthorised",401,"text/plain");
      if(pathname==="/app.js" && request.method==="GET")return respond(CLIENT,200,"text/javascript; charset=utf-8");
      if(pathname==="/api/stats" && request.method==="GET") {
        const days=Number(new URL(request.url).searchParams.get("days")||30);
        return json(await stats(env,[7,30,90].includes(days)?days:30));
      }
      if(pathname==="/api/import" && request.method==="POST")return await importCSV(request,env);
      return respond("Not found",404,"text/plain");
    }catch(e){ console.error("Analytics request failed",e.message);return respond("Service unavailable",503,"text/plain"); }
  },
  async scheduled(_event,env,ctx) {
    ctx.waitUntil(Promise.all([
      env.DB.prepare("DELETE FROM au_events WHERE day < date('now','-90 days')").run(),
      env.DB.prepare("DELETE FROM au_login_attempts WHERE window_start < ?").bind(Date.now()-2*DAY_MS).run()
    ]));
  }
};
