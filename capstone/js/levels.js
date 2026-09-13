/* World definitions: Generous roads and forgiving parking bays with vibrant Puerto Rican elements. */
(function (root) {
  'use strict';
  const wall = (x, y, w, h, kind = 'wall') => ({ x, y, w, h, kind });
  const target = (x, y, w, h, angle, name, hint) => ({ x, y, w, h, angle, name, hint, vehicle: 'player' });

  const LEVELS = [
    {
      id: 'san-juan',
      name: 'Viejo San Juan',
      subtitle: 'Viejo San Juan · Level 1',
      theme: 'day',
      start: { x: 960, y: 620, angle: -Math.PI / 2 },
      targets: [
        target(350, 515, 130, 80, 0, 'Calle Fortaleza', 'Pull into the wide bay by the colorful houses'),
        target(820, 340, 80, 130, Math.PI / 2, 'Plaza Colón', 'Park next to the shaded palm plaza'),
        target(460, 140, 130, 80, Math.PI, 'Castillo San Cristóbal', 'Finish your shift near the historic walls')
      ],
      obstacles: [
        // Outer boundaries
        wall(0, 0, 1280, 30, 'edge'),
        wall(0, 690, 1280, 30, 'edge'),
        wall(0, 0, 30, 720, 'edge'),
        wall(1250, 0, 30, 720, 'edge'),
        
        // Urban Buildings (Scaled to leave wide, easy-to-drive streets)
        wall(45, 45, 310, 150, 'building'),
        wall(610, 45, 230, 140, 'building'),
        wall(1030, 45, 200, 160, 'building'),
        
        wall(45, 315, 230, 135, 'building'),
        wall(490, 300, 220, 130, 'plaza'),
        wall(1005, 320, 225, 140, 'building'),
        
        wall(45, 560, 230, 115, 'building'),
        wall(540, 545, 290, 130, 'building'),
        wall(1030, 565, 200, 110, 'building'),
        
        // Scattered Parked Cars (Placed away from driving lanes)
        wall(380, 240, 40, 100, 'parked'),
        wall(890, 520, 40, 100, 'parked'),
        wall(890, 85, 40, 100, 'parked'),
        wall(295, 570, 40, 95, 'parked')
      ]
    },
    {
      id: 'coast',
      name: 'Coastal Night Shift',
      subtitle: 'Piñones · Level 2',
      theme: 'night',
      start: { x: 455, y: 625, angle: -Math.PI / 2 },
      targets: [
        target(380, 520, 130, 80, 0, 'Kiosko El Boricua', 'Park in front of the warm food kiosk'),
        target(785, 310, 80, 130, Math.PI / 2, 'Paseo de Piñones', 'Pull into the open palm spot'),
        target(980, 150, 130, 80, Math.PI, 'Mirador del Atlántico', 'Catch the ocean breeze under the moon')
      ],
      obstacles: [
        // Outer boundaries
        wall(0, 0, 1280, 30, 'edge'),
        wall(0, 690, 1280, 30, 'edge'),
        wall(0, 0, 30, 720, 'edge'),
        wall(1250, 0, 30, 720, 'edge'),
        
        // Ocean top barrier
        wall(30, 30, 1220, 95, 'oceanWall'),
        
        // Kiosks & structures
        wall(48, 255, 240, 135, 'kiosk'),
        wall(510, 260, 205, 130, 'kiosk'),
        wall(975, 260, 245, 130, 'kiosk'),
        
        wall(48, 515, 230, 155, 'kiosk'),
        wall(555, 525, 245, 145, 'kiosk'),
        wall(1005, 530, 215, 140, 'kiosk'),
        
        // Parked obstacles with plenty of room
        wall(320, 260, 40, 100, 'parked'),
        wall(905, 285, 40, 100, 'parked'),
        wall(905, 535, 40, 100, 'parked')
      ]
    }
  ];

  root.GAME_LEVELS = LEVELS;
  if (typeof module !== 'undefined') module.exports = LEVELS;
})(typeof globalThis !== 'undefined' ? globalThis : this);
