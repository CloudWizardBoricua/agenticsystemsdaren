'use strict';
const assert=require('assert');const fs=require('fs');const path=require('path');
const root=path.resolve(__dirname,'..');
const {Vehicle,polygonsOverlap,aabbCorners}=require('../js/vehicle.js');
const levels=require('../js/levels.js');
function test(name,fn){try{fn();console.log('✓',name);}catch(e){console.error('✗',name);throw e;}}
test('contains two levels with three ordered targets each',()=>{assert.equal(levels.length,2);levels.forEach(l=>{assert.equal(l.targets.length,3);assert.ok(l.targets.every(t=>t.vehicle==='player'));assert.ok(l.obstacles.length>8);});assert.equal(levels[0].name,'Viejo San Juan');assert.equal(levels[1].name,'Coastal Night Shift');});
test('SAT distinguishes overlap and separation',()=>{const car=[{x:0,y:0},{x:10,y:0},{x:10,y:5},{x:0,y:5}];assert.ok(polygonsOverlap(car,aabbCorners({x:8,y:2,w:10,h:10})));assert.ok(!polygonsOverlap(car,aabbCorners({x:11,y:0,w:2,h:2})));});
test('forward acceleration and natural drag work',()=>{const v=new Vehicle(100,100,0);v.update(.1,{throttle:1,steer:0},[]);assert.ok(v.speed>0);const moving=v.speed;v.update(.1,{throttle:0,steer:0},[]);assert.ok(v.speed<moving);});
test('steering reverses while backing',()=>{const f=new Vehicle(0,0,0);f.speed=50;f.update(.1,{throttle:0,steer:1},[]);const r=new Vehicle(0,0,0);r.speed=-50;r.update(.1,{throttle:0,steer:1},[]);assert.ok(f.angle>0);assert.ok(r.angle<0);});
test('collision rolls position back and damps velocity',()=>{const v=new Vehicle(50,50,0);v.speed=100;const before=v.x;const hit=v.update(.2,{throttle:0,steer:0},[{x:70,y:0,w:50,h:100}]);assert.ok(hit);assert.equal(v.x,before);assert.ok(Math.abs(v.speed)<20);});
test('parking requires fit, alignment, and near-zero speed',()=>{const v=new Vehicle(100,100,0);v.width=40;v.length=70;const t={x:55,y:70,w:90,h:60,angle:0};assert.ok(v.parkingStatus(t).valid);v.speed=20;assert.ok(!v.parkingStatus(t).valid);v.speed=0;v.angle=.5;assert.ok(!v.parkingStatus(t).valid);});
test('all required static files exist and HTML references them',()=>{const files=['index.html','styles.css','js/input.js','js/levels.js','js/vehicle.js','js/audio.js','js/game.js'];const html=fs.readFileSync(path.join(root,'index.html'),'utf8');files.forEach(f=>{assert.ok(fs.existsSync(path.join(root,f)),f+' missing');if(f!=='index.html')assert.ok(html.includes(f),f+' not referenced');});assert.ok(!/https?:\/\//.test(html),'external URL found');});
console.log('\nAll smoke tests passed.');
