// Drops a descriptor file in a built page and prints what stands: the canvas, the refusal, rate mode, the timing tab, the errors.
//   node old_file.mjs <frontend dir> <folder of the files> <name>...
import { createRequire } from "node:module"; import { readFileSync } from "node:fs"; import { join, resolve } from "node:path"; import { spawn } from "node:child_process";
const [,, feArg, dirArg, ...names] = process.argv; const fe=resolve(feArg), dir=resolve(dirArg); const { chromium }=createRequire(join(fe,"package.json"))("@playwright/test");
const server=spawn("npx",["vite","preview","--port","4334","--strictPort"],{cwd:fe,stdio:"ignore"}); const base="http://localhost:4334/";
for(;;){try{if((await fetch(base)).ok)break;}catch{} await new Promise(r=>setTimeout(r,100));}
const b=await chromium.launch();
for(const n of names){const p=await (await b.newContext({viewport:{width:1600,height:1000}})).newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message)); await p.goto(base);
 await p.evaluate(({t,n})=>{const d=new DataTransfer();d.items.add(new File([t],n+".json"));window.dispatchEvent(new DragEvent("drop",{dataTransfer:d,bubbles:true,cancelable:true}));},{t:readFileSync(join(dir,n+".json"),"utf8"),n}); await p.waitForTimeout(1500);
 console.log(n,"canvas",await p.locator("svg.canvas[data-ready]").count(),"outcome",await p.locator("pre.outcome").allTextContents());
 await p.keyboard.press("r"); await p.waitForTimeout(400); console.log(" mode",await p.locator("svg.canvas").getAttribute("data-mode").catch(()=>"-"),"legend",await p.locator("div.legend").allTextContents());
 await p.locator('button.tab[data-tab="timing"]').click().catch(()=>{}); await p.waitForTimeout(400); console.log(" tab",JSON.stringify((await p.locator("section.drawer .tab-body").innerText().catch(()=>"-")).slice(0,200))); console.log(" errors",errs);}
await b.close(); server.kill();
