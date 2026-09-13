/* Vehicle physics, oriented geometry, and collision resolution. */
(function (root) {
  'use strict';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const normalizeAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
  function pointInAABB(p,b,pad=0){return p.x>=b.x+pad&&p.x<=b.x+b.w-pad&&p.y>=b.y+pad&&p.y<=b.y+b.h-pad;}
  function polygonAxes(points){const axes=[];for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length],dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1;axes.push({x:-dy/len,y:dx/len});}return axes;}
  function project(points,axis){let min=Infinity,max=-Infinity;for(const p of points){const d=p.x*axis.x+p.y*axis.y;min=Math.min(min,d);max=Math.max(max,d);}return{min,max};}
  function polygonsOverlap(a,b){for(const axis of [...polygonAxes(a),...polygonAxes(b)]){const pa=project(a,axis),pb=project(b,axis);if(pa.max<=pb.min||pb.max<=pa.min)return false;}return true;}
  function aabbCorners(b){return[{x:b.x,y:b.y},{x:b.x+b.w,y:b.y},{x:b.x+b.w,y:b.y+b.h},{x:b.x,y:b.y+b.h}];}
  class Vehicle {
    constructor(x,y,angle=0){this.width=54;this.length=94;this.x=x;this.y=y;this.angle=angle;this.speed=0;this.maxForward=245;this.maxReverse=105;this.acceleration=178;this.brakePower=255;this.drag=56;this.turnRate=2.15;this.bumpCooldown=0;this.lastCollision=false;}
    reset(pose){this.x=pose.x;this.y=pose.y;this.angle=pose.angle;this.speed=0;this.lastCollision=false;}
    snapshot(){return{x:this.x,y:this.y,angle:this.angle,speed:this.speed};}
    restore(s){this.x=s.x;this.y=s.y;this.angle=s.angle;this.speed=s.speed;}
    cornersAt(x=this.x,y=this.y,angle=this.angle,inset=0){const hw=this.width/2-inset,hl=this.length/2-inset,c=Math.cos(angle),s=Math.sin(angle);return[[-hl,-hw],[hl,-hw],[hl,hw],[-hl,hw]].map(([lx,ly])=>({x:x+lx*c-ly*s,y:y+lx*s+ly*c}));}
    collides(obstacles){const car=this.cornersAt();for(const box of obstacles){if(polygonsOverlap(car,aabbCorners(box)))return box;}return null;}
    update(dt,input,obstacles){dt=Math.min(dt,.04);this.bumpCooldown=Math.max(0,this.bumpCooldown-dt);const previous=this.snapshot(),throttle=input.throttle||0,steer=input.steer||0;
      if(throttle>0){if(this.speed<-.5)this.speed+=this.brakePower*dt;else this.speed+=this.acceleration*dt;}
      else if(throttle<0){if(this.speed>.5)this.speed-=this.brakePower*dt;else this.speed-=this.acceleration*.72*dt;}
      else{const loss=this.drag*dt;this.speed=Math.abs(this.speed)<=loss?0:this.speed-Math.sign(this.speed)*loss;}
      this.speed=clamp(this.speed,-this.maxReverse,this.maxForward);
      if(Math.abs(this.speed)>2&&steer){const response=clamp(Math.abs(this.speed)/85,.18,1),direction=Math.sign(this.speed);this.angle=normalizeAngle(this.angle+steer*this.turnRate*response*direction*dt);}
      this.x+=Math.cos(this.angle)*this.speed*dt;this.y+=Math.sin(this.angle)*this.speed*dt;
      const hit=this.collides(obstacles);this.lastCollision=!!hit;
      if(hit){this.restore(previous);this.speed=-previous.speed*.16;if(Math.abs(this.speed)<10)this.speed=0;this.bumpCooldown=.28;}
      return hit;
    }
    parkingStatus(target){const corners=this.cornersAt(this.x,this.y,this.angle,5);const inside=corners.filter(p=>pointInAABB(p,target,1)).length;const centerInside=pointInAABB({x:this.x,y:this.y},target,0);const angleError=Math.min(Math.abs(normalizeAngle(this.angle-target.angle)),Math.abs(normalizeAngle(this.angle-target.angle-Math.PI)),Math.abs(normalizeAngle(this.angle-target.angle+Math.PI)));
      return{inside,centerInside,angleError,speed:Math.abs(this.speed),valid:inside>=3&&centerInside&&angleError<=.22&&Math.abs(this.speed)<=8};
    }
  }
  root.Vehicle=Vehicle;root.VehicleGeometry={polygonsOverlap,aabbCorners,pointInAABB,normalizeAngle,clamp};
  if(typeof module!=='undefined')module.exports={Vehicle,polygonsOverlap,aabbCorners,pointInAABB,normalizeAngle};
})(typeof globalThis!=='undefined'?globalThis:this);
