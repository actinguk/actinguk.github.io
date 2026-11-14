#!/usr/bin/env node
// Dependency-free source-preserving formatter for Acting UK editorial HTML.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function parseArticle(source) {
  const root={tag:"#root",children:[],open:"",close:""};
  const stack=[root];
  const voidTags=new Set("area base br col embed hr img input link meta param source track wbr".split(" "));
  const token=/<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][\w:-]*(?:[^"'<>]|"[^"]*"|'[^']*')*>|[^<]+|</g;
  let m;
  while((m=token.exec(source))) {
    const raw=m[0], parent=stack[stack.length-1];
    if(/^<\//.test(raw)) {
      const tag=raw.match(/^<\/([\w:-]+)/)[1].toLowerCase();
      if(parent.tag!==tag) throw Error("Unbalanced closing tag "+tag+" after "+parent.tag);
      parent.close=raw;stack.pop();continue;
    }
    const start=raw.match(/^<([A-Za-z][\w:-]*)/);
    if(!start){parent.children.push({raw});continue;}
    const tag=start[1].toLowerCase(), node={tag,open:raw,close:"",children:[]};
    parent.children.push(node);
    if(voidTags.has(tag)||/\/>$/.test(raw)) continue;
    if(["script","style","textarea","title"].includes(tag)){
      const end=new RegExp("</"+tag+"\\s*>","ig");end.lastIndex=token.lastIndex;
      const close=end.exec(source);if(!close)throw Error("Missing closing "+tag);
      node.children.push({raw:source.slice(token.lastIndex,close.index)});
      node.close=close[0];token.lastIndex=end.lastIndex;continue;
    }
    stack.push(node);
  }
  if(stack.length!==1)throw Error("Unclosed "+stack.map(n=>n.tag).join(", "));
  return root;
}

function formatArticle(source) {
  const root=parseArticle(source);
  const block=new Set("html head body header main article footer nav div section aside figure ul ol dl table thead tbody tfoot tr blockquote form".split(" "));
  const layoutClasses=new Set("nav navlinks crumb hero meta layout content sources side section links-grid tile footer newsroom-figure article-audio article-audio-speed".split(" "));
  const isJson=n=>n.tag==="script"&&/\btype\s*=\s*["']application\/ld\+json["']/i.test(n.open);
  const original=n=>n.raw!==undefined?n.raw:n.open+n.children.map(original).join("")+n.close;
  const multiline=n=>{
    if(!n.tag||!n.children.some(c=>c.tag))return false;
    if(n.children.some(c=>c.raw!==undefined&&c.raw.trim()&&!/^<!--/.test(c.raw)))return false;
    const classes=(n.open.match(/\bclass=["']([^"']*)["']/i)||[])[1]?.split(/\s+/)||[];
    return block.has(n.tag)&&(n.children.some(c=>block.has(c.tag)||/^(h[1-6]|p|li|figcaption|meta|link|script|title)$/.test(c.tag||""))||classes.some(c=>layoutClasses.has(c)))||n.tag==="a"&&classes.includes("tile");
  };
  function render(n,depth){
    const pad="  ".repeat(depth);
    if(n.raw!==undefined)return n.raw.trim()?pad+n.raw.trim():"";
    if(isJson(n)){
      const json=JSON.stringify(JSON.parse(n.children.map(original).join("")),null,2).replace(/</g,"\\u003c");
      return pad+n.open+"\n"+json.split("\n").map(l=>pad+"  "+l).join("\n")+"\n"+pad+n.close;
    }
    if(!multiline(n))return pad+original(n);
    return pad+n.open+"\n"+n.children.map(c=>render(c,depth+1)).filter(Boolean).join("\n")+"\n"+pad+n.close;
  }
  function signature(n){
    if(n.raw!==undefined)return n.raw;
    if(isJson(n))return [n.open,JSON.parse(n.children.map(original).join("")),n.close];
    return [n.open,(multiline(n)||n.tag==="#root"?n.children.filter(c=>c.tag||c.raw.trim()):n.children).map(signature),n.close];
  }
  const result=root.children.map(n=>render(n,0)).filter(Boolean).join("\n")+"\n";
  if(JSON.stringify(signature(root))!==JSON.stringify(signature(parseArticle(result))))throw Error("Formatting changed markup, mixed text, or metadata");
  return result;
}

const args = process.argv.slice(2);
if (args.includes("--stdin")) {
  process.stdout.write(formatArticle(readFileSync(0, "utf8")));
} else {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const check = args.includes("--check");
  const sections = ["news", "london-fringe-theatre"];
  let count = 0, changed = 0;
  for (const section of sections) {
    for (const name of readdirSync(join(root, section)).sort()) {
      if (!name.endsWith(".html") || ["index.html", "automation-probe.html"].includes(name)) continue;
      const path = join(root, section, name);
      const original = readFileSync(path, "utf8");
      const formatted = formatArticle(original);
      if (formatArticle(formatted) !== formatted) throw new Error("Not idempotent: " + path);
      count++;
      if (formatted !== original) {
        changed++;
        console.log((check ? "NEEDS FORMAT " : "FORMATTED ") + section + "/" + name);
        if (!check) writeFileSync(path, formatted, "utf8");
      }
    }
  }
  console.log("Checked " + count + " editorial articles; " + changed + " formatting differences.");
  if (check && changed) process.exitCode = 1;
}
