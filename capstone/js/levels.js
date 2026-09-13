/* World definitions. Coordinates use a fixed 1280 × 720 design space. */
(function (root) {
  'use strict';
  const wall=(x,y,w,h,kind='wall')=>({x,y,w,h,kind});
  const target=(x,y,w,h,angle,name,hint)=>({x,y,w,h,angle,name,hint,vehicle:'player'});
  const LEVELS=[
    {
      id:'san-juan', name:'Viejo San Juan', subtitle:'Viejo San Juan · Day Shift', theme:'day',
      start:{x:960,y:620,angle:-Math.PI/2},
      targets:[
        target(362,523,118,64,0,'Calle Fortaleza','Pull in beside the pastel façades'),
        target(832,351,64,118,Math.PI/2,'Plaza Colón','Line up by the shaded plaza'),
        target(478,145,118,64,Math.PI,'La Perla overlook','Finish near the old city wall')
      ],
      obstacles:[
        wall(0,0,1280,36,'edge'),wall(0,684,1280,36,'edge'),wall(0,0,34,720,'edge'),wall(1246,0,34,720,'edge'),
        wall(45,45,330,165,'building'),wall(595,45,260,150,'building'),wall(1010,45,225,178,'building'),
        wall(45,302,250,150,'building'),wall(470,285,255,142,'plaza'),wall(985,310,250,155,'building'),
        wall(45,545,250,128,'building'),wall(520,530,330,143,'building'),wall(1010,550,225,123,'building'),
        wall(386,235,42,115,'parked'),wall(875,510,45,112,'parked'),wall(880,75,45,112,'parked'),wall(304,560,45,105,'parked'),
        wall(950,45,18,178,'wall'),wall(950,310,18,155,'wall')
      ]
    },
    {
      id:'coast', name:'Coastal Night Shift', subtitle:'Piñones · Coastal Night Shift', theme:'night',
      start:{x:455,y:625,angle:-Math.PI/2},
      targets:[
        target(390,526,118,64,0,'Kiosko del Mar','Park by the glowing food kiosks'),
        target(792,320,64,118,Math.PI/2,'Paseo de las Palmas','Ease into the palm-lined bay'),
        target(1000,150,118,64,Math.PI,'Mirador Atlántico','Catch the moonlight by the ocean')
      ],
      obstacles:[
        wall(0,0,1280,34,'edge'),wall(0,686,1280,34,'edge'),wall(0,0,34,720,'edge'),wall(1246,0,34,720,'edge'),
        wall(34,34,1212,105,'oceanWall'),
        wall(48,245,260,150,'kiosk'),wall(490,250,225,145,'kiosk'),wall(955,250,270,145,'kiosk'),
        wall(48,500,250,170,'kiosk'),wall(535,510,270,160,'kiosk'),wall(985,515,240,155,'kiosk'),
        wall(330,250,45,112,'parked'),wall(895,275,45,112,'parked'),wall(895,520,45,112,'parked'),wall(335,555,45,105,'parked'),
        wall(738,450,132,20,'wall'),wall(925,450,300,20,'wall')
      ]
    }
  ];
  root.GAME_LEVELS=LEVELS;
  if(typeof module!=='undefined')module.exports=LEVELS;
})(typeof globalThis!=='undefined'?globalThis:this);
