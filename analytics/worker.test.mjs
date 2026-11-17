import assert from "node:assert/strict";
import test from "node:test";
import worker from "./worker.js";

const sqlCalls=[];
const DB={
  prepare(sql){
    return {
      bind(...params){this.params=params;return this;},
      async run(){sqlCalls.push({sql,params:this.params||[]});return {success:true};},
      async first(){return null;},
      async all(){return {results:[]};}
    };
  },
  async batch(statements){for(const s of statements)await s.run();return [];}
};
const env={DB,ADMIN_PASSWORD:"a-very-long-test-password",HASH_SECRET:"test-hash-secret-123456789abcdef",SESSION_SECRET:"test-session-secret-123456789abcdef"};
const url="https://actinguk-analytics.example.workers.dev";
function request(path,options={}){return new Request(url+path,options);}

test("readiness requires all secrets and an accessible database",async()=>{
  const ok=await worker.fetch(request("/health"),env);
  assert.equal(ok.status,200);
  assert.deepEqual(await ok.json(),{ready:true});
  const missing=await worker.fetch(request("/health"),{...env,DB:null});
  assert.deepEqual(await missing.json(),{ready:false});
});
test("dashboard and statistics never reveal private data before login",async()=>{
  const root=await worker.fetch(request("/"),env);
  assert.equal(root.status,200);
  assert.match(await root.text(),/Unlock dashboard/);
  assert.equal((await worker.fetch(request("/app.js"),env)).status,401);
  assert.equal((await worker.fetch(request("/api/stats"),env)).status,401);
  assert.match(root.headers.get("content-security-policy"),/frame-ancestors 'none'/);
});
test("beacon enforces expected origin, path and body and stores no raw IP",async()=>{
  const body=JSON.stringify({type:"pageview",path:"/news/test.html",ref:"https://www.google.com/"});
  const wrong=await worker.fetch(request("/collect",{method:"POST",headers:{Origin:"https://evil.example","Content-Type":"text/plain"},body}),env);
  assert.equal(wrong.status,403);
  const invalid=await worker.fetch(request("/collect",{method:"POST",headers:{Origin:"https://actinguk.com","Content-Type":"text/plain"},body:JSON.stringify({type:"pageview",path:"//evil"})}),env);
  assert.equal(invalid.status,400);
  const okay=await worker.fetch(request("/collect",{method:"POST",headers:{Origin:"https://actinguk.com","Content-Type":"text/plain","User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)","CF-Connecting-IP":"198.51.100.4"},body}),env);
  assert.equal(okay.status,204);
  assert.equal(await okay.text(),"");
  const stored=sqlCalls.at(-1);
  assert.match(stored.sql,/INSERT INTO au_events/);
  assert.equal(stored.params[2],"/news/test.html");
  assert.equal(stored.params[3],"www.google.com");
  assert.equal(stored.params[5],"Mobile");
  assert.ok(!JSON.stringify(stored).includes("198.51.100.4"));
});
test("login grants an expiring signed session and logout clears it",async()=>{
  const form=new URLSearchParams({password:env.ADMIN_PASSWORD});
  const reply=await worker.fetch(request("/login",{method:"POST",headers:{Origin:url,"Content-Type":"application/x-www-form-urlencoded"},body:form}),env);
  assert.equal(reply.status,303);
  const cookie=reply.headers.get("Set-Cookie");
  assert.match(cookie,/HttpOnly; Secure; SameSite=Strict/);
  const token=cookie.split(";")[0];
  const stats=await worker.fetch(request("/api/stats?days=7",{headers:{Cookie:token}}),env);
  assert.equal(stats.status,200);
  const data=await stats.json();
  assert.equal(data.days,7);
  const logout=await worker.fetch(request("/logout",{method:"POST",headers:{Origin:url,Cookie:token}}),env);
  assert.equal(logout.status,303);
  assert.match(logout.headers.get("set-cookie"),/Max-Age=0/);
});
