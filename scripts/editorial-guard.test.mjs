import test from "node:test";
import assert from "node:assert/strict";
import {canonicalSource,collision} from "./editorial-guard.mjs";
const prior={url:"/news/first.html",title:"Equity opens ballot on Pact agreement",description:"Screen performers vote on a three year agreement",source:"https://www.equity.org.uk/news/2026/ai-pact-agreement",storyKey:"equity-pact-ballot-2026",subjectKey:"agreement:equity-pact-2026",developmentKey:"ballot"};
test("new headline and slug do not bypass original source",()=>assert.match(collision({...prior,url:"/news/second.html",title:"The union and its new deal",storyKey:"renamed"},prior),/primary source/));
test("same event blocked despite different source",()=>assert.match(collision({...prior,url:"/news/second.html",source:"https://reporter.example/second",storyKey:"renamed"},prior),/same event/));
test("genuine ballot result with its own announcement is distinct",()=>assert.equal(collision({...prior,url:"/news/result.html",source:"https://www.equity.org.uk/news/2026/ballot-results",storyKey:"equity-pact-result-2026",developmentKey:"result",title:"Equity publishes ratification outcome",description:"Members have confirmed the result of the vote"},prior),""));
test("tracking parameters do not change source identity",()=>assert.equal(canonicalSource("https://example.org/story?utm_source=a"),canonicalSource("https://www.example.org/story/")));
