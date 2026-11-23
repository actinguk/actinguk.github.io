#!/usr/bin/env node
// Permanent duplicate prevention for Acting UK. No external services.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const indexFile=path.join(root,"news/editorial-index.json");
const registryFile=path.join(root,"content/story-registry.json");
const stop=new Set("the and a an of on at in by to for from with into that this its their your our new london uk actors actor theatre film stage shows show news opens opening returns first 2026 2027".split(" "));
const norm=s=>String(s||"").trim().toLowerCase();
export function canonicalSource(s){
  if(!s)return "";
  try{const u=new URL(s);return u.hostname.toLowerCase().replace(/^www\./,"")+decodeURIComponent(u.pathname).replace(/\/+$/,"").toLowerCase();}
  catch{return "";}
}
const tokens=s=>new Set(String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g," ").split(/\s+/).filter(w=>w.length>2&&!stop.has(w)));
function similarity(a,b){const A=tokens(a),B=tokens(b),u=new Set([...A,...B]);return u.size?[...A].filter(w=>B.has(w)).length/u.size:0;}
export function collision(a,b){
  if(a.url===b.url)return "same URL";
  if(norm(a.storyKey)===norm(b.storyKey))return "same story ID";
  if(norm(a.subjectKey)===norm(b.subjectKey)&&norm(a.developmentKey)===norm(b.developmentKey))return "same event and development";
  if(canonicalSource(a.source)&&canonicalSource(a.source)===canonicalSource(b.source))return "same primary source announcement";
  if(similarity(a.title,b.title)>=0.58||similarity((a.title||"")+" "+(a.description||""),(b.title||"")+" "+(b.description||""))>=0.53)return "near-identical subject and description";
  return "";
}
const mandatory=["url","date","title","description","storyKey","subjectKey","developmentKey"];
function valid(a,newRow){
  const e=[];for(const k of mandatory)if(!String(a[k]||"").trim())e.push("missing "+k);
  if(!/^\/(?:news|london-fringe-theatre)\/[a-z0-9-]+\.html$/.test(a.url||""))e.push("invalid URL");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(a.date||""))e.push("invalid date");
  for(const k of ["storyKey","subjectKey","developmentKey"])if(!/^[a-z0-9][a-z0-9:./-]*$/.test(a[k]||""))e.push("invalid "+k);
  if(newRow&&!canonicalSource(a.source))e.push("new reports require a direct real-world source URL");
  return e;
}
function record(a){return {...Object.fromEntries(["url","date","title","description","category","source","storyKey","subjectKey","developmentKey","venue"].filter(k=>a[k]!=null).map(k=>[k,a[k]])),status:"published"};}
export function validate(index,registry,opts={}){
  const errors=[], registered=registry.stories.filter(x=>x.status==="published"),retired=registry.removed||[], byUrl=new Map(registered.map(r=>[r.url,r])),seen=new Set(),proposed=[];
  for(const r of index.articles){
    if(seen.has(r.url))errors.push("Duplicate editorial URL: "+r.url);
    seen.add(r.url);
    if(retired.some(t=>t.url===r.url))errors.push("Deleted duplicate reappeared: "+r.url);
    const existing=byUrl.get(r.url);
    errors.push(...valid(r,!existing).map(x=>r.url+": "+x));
    if(existing){
      for(const k of ["date","title","description","source","storyKey","subjectKey","developmentKey"])
        if(String(existing[k]||"")!==String(r[k]||""))errors.push("Registry mismatch "+r.url+" "+k);
    }else if(opts.sync)proposed.push(r);
    else errors.push("Unregistered article "+r.url+"; run --sync before committing");
    if(!opts.preflight&&!fs.existsSync(path.join(root,r.url.slice(1))))errors.push("Missing article HTML "+r.url);
  }
  for(const r of registered)if(!seen.has(r.url))errors.push("Registered story missing from index "+r.url);
  const all=[...registered];
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const c=collision(all[i],all[j]);if(c)errors.push("Database duplicate "+all[i].url+" / "+all[j].url+": "+c);}
  for(const p of [...proposed,...(opts.candidates||[])]){
    errors.push(...valid(p,true).map(x=>(p.url||"candidate")+": "+x));
    if(retired.some(t=>t.url===p.url))errors.push("Retired duplicate URL "+p.url);
    for(const old of all){const c=collision(p,old);if(c)errors.push("DUPLICATE "+p.url+" / "+old.url+": "+c);}
    all.push(p);
  }
  return [...new Set(errors)];
}
function main(){
  const cmd=process.argv[2]||"--check";
  const index=JSON.parse(fs.readFileSync(indexFile,"utf8"));
  const registry=JSON.parse(fs.readFileSync(registryFile,"utf8"));
  const opts={sync:cmd==="--sync"};
  if(cmd==="--candidate"){
    if(!process.argv[3])throw Error("Usage: --candidate draft.json");
    const d=JSON.parse(fs.readFileSync(process.argv[3],"utf8"));
    opts.candidates=Array.isArray(d)?d:[d];opts.preflight=true;
  }else if(cmd!=="--sync"&&cmd!=="--check")throw Error("Use --check, --sync or --candidate draft.json");
  const errors=validate(index,registry,opts);
  if(errors.length){console.error(errors.join("\n"));process.exitCode=1;return;}
  if(cmd==="--sync"){
    const known=new Set(registry.stories.map(r=>r.url)), fresh=index.articles.filter(r=>!known.has(r.url)).map(record);
    registry.stories.push(...fresh);
    fs.writeFileSync(registryFile,JSON.stringify(registry,null,2)+"\n");
    console.log("Registered "+fresh.length+" new stories");
  }else console.log("Duplicate guard passed: "+registry.stories.length+" published, "+(registry.removed||[]).length+" permanently retired");
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
