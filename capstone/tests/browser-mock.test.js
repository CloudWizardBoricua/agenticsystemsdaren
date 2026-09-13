'use strict';
// Package-free browser bootstrap smoke test: verifies every DOM lookup and the first render.
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
class ClassList{constructor(){this.s=new Set();}toggle(n,v){v===undefined?(this.s.has(n)?this.s.delete(n):this.s.add(n)):(v?this.s.add(n):this.s.delete(n));}add(n){this.s.add(n)}remove(n){this.s.delete(n)}}
const ctx=new Proxy({}, {get(o,k){if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop(){}});if(k==='measureText')return()=>({width:10});if(!(k in o))o[k]=()=>{};return o[k]},set(o,k,v){o[k]=v;return true}});
function element(id=''){return{id,textContent:'',dataset:{},classList:new ClassList(),style:{},width:1280,height:720,setAttribute(){},addEventListener(){},querySelectorAll(){return[]},getBoundingClientRect(){return{width:1280,height:720}},getContext(){return ctx}};}
const ids=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
const elements=Object.fromEntries(ids.map(id=>[id,element(id)]));
const document={hidden:false,getElementById:id=>elements[id]||null,addEventListener(){}};
const window={addEventListener(){},devicePixelRatio:1};window.window=window;
const sandbox={console,document,window,globalThis:null,performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,Math};sandbox.globalThis=sandbox;window.requestAnimationFrame=sandbox.requestAnimationFrame;
vm.createContext(sandbox);
for(const file of ['js/input.js','js/levels.js','js/vehicle.js','js/audio.js','js/game.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox,{filename:file});
if(!elements.gameCanvas)throw new Error('canvas missing');
console.log('✓ browser scripts bootstrapped and rendered one frame with all DOM references present');
