// Each level has its own silhouette. Keep details broad enough for 39px cells;
// shared colours connect a family, but neither colour nor level digits identify it.
const p=(d,fill='none',extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const circle=(x,y,r,fill,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const rect=(x,y,w,h,fill,rx=2)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
const ellipse=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const group=(body,transform)=>`<g transform="${transform}">${body}</g>`;
const C={cream:'#fff0cf',paper:'#f5ddb2',wood:'#c49a62',darkWood:'#a9794f',gold:'#d9b768',rose:'#c77f72',pink:'#d8a0ad',green:'#7e9c70',mint:'#acc69d',blue:'#a9cece',teal:'#799d98',purple:'#b99eb6',ink:'#665c4d'};
const star=(x,y,s=1)=>group(p('M0-12 4-4 13-3 6 4 8 13 0 9-8 13-6 4-13-3-4-4Z',C.gold),`translate(${x} ${y}) scale(${s})`);
const leaf=(x,y,s=1,angle=0)=>group(p('M0 15C-20 7-14-12 0-16 14-12 20 7 0 15Z',C.green)+p('M0-10V12M-7-2 0 3 7-4'),`translate(${x} ${y}) rotate(${angle}) scale(${s})`);
const flower=(x,y,s=1)=>group(p('M0-5C-12-19-23-3-10 3-20 15-2 23 2 10 17 20 24 1 10-2 17-17 0-22 0-5Z',C.pink)+circle(1,1,5,C.gold),`translate(${x} ${y}) scale(${s})`);
const gear=(x,y,s=1)=>group(p('M-6-19H6L8-13 14-15 19-6 14-2 19 4 14 13 8 11 6 18H-6L-8 12-14 14-19 5-14 0-19-6-14-15-8-13Z',C.gold)+circle(0,0,8,C.cream),`translate(${x} ${y}) scale(${s})`);
const bottle=(fill)=>p('M24 10H40V23C40 29 51 29 51 41V49Q51 56 43 56H21Q13 56 13 49V41C13 29 24 29 24 23Z',C.blue)+p('M17 39Q32 34 47 39V49Q47 52 42 52H22Q17 52 17 49Z',fill)+rect(23,7,18,8,C.wood);
const book=(fill)=>p('M14 10H47V53H14Q9 53 9 48V16Q9 10 14 10Z',fill)+p('M16 10V47H47M16 47Q10 47 11 51M21 52H46');
const basket=()=>p('M12 31Q12 7 32 7T52 31','none','stroke-width="4"')+p('M8 30H56L49 55H15Z',C.wood)+p('M16 38H51M18 46H49M23 32 26 54M41 32 38 54');

export const ITEM_ILLUSTRATIONS={
  paper:[
    p('M19 16 42 11 47 23 40 28 45 36 33 40 28 50 14 42 19 34 12 28Z',C.cream)+p('M23 23 37 20M23 30 33 28','none','stroke="#b9ac8c"'),
    p('M15 12 44 15 50 51 12 48Z',C.cream)+p('M15 12 18 33 47 35M18 33 12 48M25 21 39 23M25 26 40 28','none','stroke="#a5a789"'),
    p('M8 20H56V50H8Z',C.paper)+p('M8 20 32 37 56 20M8 50 24 33M56 50 40 33'),
    p('M8 29 32 9 56 29V54H8Z',C.wood)+p('M16 7H46V39H16Z',C.cream)+p('M22 15H39M22 21H40M22 27H35')+p('M8 29 32 43 56 29V54H8Z',C.paper)+circle(32,44,6,C.rose),
    book(C.teal)+rect(22,19,18,16,C.cream)+p('M27 22V31L36 27Z',C.gold)+p('M36 10V19L40 16 44 19V10',C.rose),
    p('M8 19H28L33 13H55V51H8Z',C.wood)+rect(17,7,29,34,C.cream)+p('M23 15H39M23 22H39')+p('M5 29H58L53 55H9Z',C.teal)+rect(23,36,18,10,C.cream),
    p('M5 16Q18 9 32 18 46 9 59 16V53Q45 47 32 56 18 47 5 53Z',C.cream)+p('M32 18V56M11 28 24 30M11 35 24 37M40 31 53 28M40 38 53 35')+p('M27 14 32 5 37 14',C.gold)+star(47,20,.45)
  ],
  wax:[
    ellipse(21,23,8,6,C.rose,'transform="rotate(-25 21 23)"')+ellipse(43,28,7,9,C.pink,'transform="rotate(25 43 28)"')+ellipse(28,44,10,7,C.rose,'transform="rotate(15 28 44)"'),
    p('M13 24 34 13 53 24 32 37Z',C.pink)+p('M13 24V44L32 55V37Z',C.rose)+p('M32 37 53 24V44L32 55Z','#a95f54')+p('M21 20 42 31'),
    p('M9 23 46 12 55 25 18 38Z',C.rose)+p('M18 38 55 25V39L18 52 9 39V23',C.pink)+p('M18 38V52M24 22 28 41M36 18 40 37'),
    ellipse(32,49,21,7,C.gold)+p('M21 43H43L40 35H24Z',C.wood)+p('M27 35V28C27 24 20 22 21 15 22 4 42 4 43 15 44 22 37 24 37 28V35Z',C.teal),
    p('M32 8 40 13 49 13 51 22 57 30 51 38 49 48 39 50 32 56 24 51 14 49 12 39 6 31 12 23 14 14 24 13Z',C.rose)+circle(32,32,17,C.pink)+flower(32,32,.65),
    p('M16 38 12 58 26 51 32 57 38 50 52 57 47 36',C.teal)+p('M13 10H51V31Q50 46 32 52 14 46 13 31Z',C.gold)+p('M20 19H44V37H20Z',C.cream)+p('M20 19 32 29 44 19'),
    circle(32,32,24,C.teal)+circle(32,32,19,C.gold)+p('M32 11 38 27 53 32 38 37 32 53 26 37 11 32 26 27Z',C.cream)+circle(32,32,5,C.rose)+p('M10 13 6 8M54 13 58 8M9 51 5 56M55 51 59 56')
  ],
  wood:[
    p('M16 51 11 46 34 16 38 7 44 10 39 22 50 20 53 25 36 29 24 43 23 30 18 29 18 39Z',C.wood)+p('M18 46 38 19'),
    p('M12 43 43 10 51 17 20 51Z',C.wood)+p('M20 51 51 17V25L20 58 12 50V43',C.darkWood)+p('M20 43 43 19'),
    p('M8 30 36 10 56 33 28 54Z',C.wood)+p('M8 30V36L28 60V54L56 33V39L28 60',C.darkWood)+p('M16 30 39 15M22 38 45 22M29 45 50 30'),
    p('M10 23 35 14 54 24 29 34Z',C.paper)+p('M10 23V46L29 56V34Z',C.wood)+p('M29 34 54 24V46L29 56Z',C.darkWood)+rect(35,36,9,7,C.gold),
    rect(10,20,44,34,C.wood)+p('M9 20Q10 8 22 8H43Q54 8 55 20Z',C.darkWood)+p('M21 10V53M43 10V53','none','stroke="#e6c48e" stroke-width="5"')+rect(28,27,9,12,C.gold),
    p('M7 31 25 13H45L58 31Z',C.teal)+rect(13,31,39,24,C.wood)+rect(19,37,10,11,C.blue)+rect(35,36,10,19,C.darkWood)+p('M25 13V31M7 56H58M8 40 3 51M56 40 61 51'),
    p('M6 40H58L47 56H19Z',C.wood)+p('M31 7V41M30 8 10 35H30Z',C.cream)+p('M35 14 53 35H35Z',C.teal)+p('M18 46H48M27 51H40')
  ],
  metal:[
    p('M21 13H43L55 32 43 51H21L9 32Z','#b4b9ad')+circle(32,32,11,C.cream)+p('M21 13 25 21M43 13 39 21M55 32H44M43 51 39 43M21 51 25 43M9 32H20'),
    gear(32,32,1.25),
    p('M18 13 52 42 43 53 9 24Z',C.teal)+gear(18,22,.7)+gear(46,44,.6)+p('M23 26 40 40','none','stroke-width="5"'),
    rect(9,11,46,44,C.teal,7)+gear(26,29,.8)+gear(44,43,.45)+p('M14 8V4M50 8V4M14 58V61M50 58V61')+circle(26,29,3,C.ink),
    p('M11 23H45V52H11Z',C.wood)+circle(28,36,12,C.gold)+p('M28 29C39 28 37 44 26 42 18 40 20 31 27 34')+p('M45 36H56V19H48V12H60V19H56M16 23V15H39V23','none','stroke-width="3"'),
    p('M26 36H39V57H26Z',C.teal)+p('M32 29C8 19 10 5 23 9 34 12 34 21 32 29ZM32 29C47 8 60 13 54 25 48 34 39 32 32 29ZM32 29C39 53 24 59 19 46 17 37 26 32 32 29Z',C.paper)+circle(32,29,7,C.gold),
    ellipse(32,32,26,12,C.teal,'transform="rotate(-40 32 32)"')+ellipse(32,32,26,12,C.gold,'transform="rotate(40 32 32)"')+circle(32,32,14,C.blue)+p('M34 17 23 34H31L27 47 42 28H33Z',C.cream)
  ],
  herb:[
    p('M23 54H42M32 54V34')+p('M32 36C12 36 9 18 17 17 30 18 33 27 32 36Z',C.mint)+p('M32 37C32 22 45 19 50 24 51 36 42 39 32 37Z',C.green),
    leaf(32,31,1.25,35)+p('M22 47 17 55'),
    p('M24 55 21 22M31 55 34 14M38 55 48 26')+leaf(20,24,.65,-30)+leaf(36,19,.65,15)+leaf(46,32,.6,40)+p('M20 42 43 41 40 49 24 50Z',C.gold),
    p('M19 10H45L39 24C60 42 54 57 32 57S4 42 25 24Z',C.purple)+p('M23 24H41M26 25 17 36M38 25 47 34')+leaf(32,43,.55),
    bottle(C.green)+leaf(32,43,.48),
    p('M20 17H44L51 28V52H13V28Z',C.teal)+rect(24,7,16,10,C.gold)+p('M21 33H43V48H21Z',C.cream)+p('M32 34C20 45 28 49 32 46 38 49 43 43 32 34Z',C.green),
    p('M24 52V45M40 52V45M15 56H49',C.gold)+circle(32,28,24,C.blue)+p('M32 47V24M32 34 20 26M32 38 44 26')+leaf(31,18,.55)+leaf(19,25,.5,-50)+leaf(45,25,.5,50)+p('M21 48H44L40 55H25Z',C.gold)
  ],
  bloom:[
    p('M32 56V32M32 46C17 46 15 37 20 35 30 34 32 41 32 46Z',C.green)+p('M32 34C11 25 18 9 32 7 46 9 53 25 32 34Z',C.pink)+p('M32 33C25 25 26 15 32 8M32 33C39 25 38 15 32 8'),
    p('M20 55C29 42 13 6 37 9 46 9 47 16 47 20M28 15 35 20M25 26 35 31')+p('M40 17H51L55 28Q46 34 36 28Z',C.cream)+p('M29 20H40L44 31Q35 37 25 31Z',C.cream)+p('M29 33H40L44 44Q35 50 25 44Z',C.cream)+leaf(15,41,.6,-20),
    p('M12 29 32 56 52 29Z',C.paper)+p('M32 52 19 20M32 52V13M32 52 46 22')+flower(17,24,.65)+flower(32,15,.72)+flower(47,25,.65)+p('M24 43 41 42 39 49 27 50Z',C.teal),
    circle(32,31,21,C.green)+circle(32,31,13,C.cream)+flower(17,17,.55)+flower(46,19,.55)+flower(45,45,.55)+flower(17,44,.55)+p('M27 51 24 61 33 56 40 61 37 51',C.rose),
    p('M18 8H46V15H43V23Q55 34 52 49 50 56 32 56T12 49Q9 34 21 23V15H18Z',C.blue)+p('M32 51V32M31 45 23 39')+flower(33,32,.65)+p('M17 50H47',C.green)+rect(18,7,28,8,C.wood),
    basket()+flower(17,27,.6)+flower(32,22,.7)+flower(47,28,.6)+p('M21 39 31 45 42 39 39 50 31 45 24 51Z',C.pink),
    p('M12 49V29C12-2 52-2 52 29V49Z',C.blue)+p('M32 48V29M32 39 42 34')+flower(32,23,.8)+p('M9 49H55V57H9Z',C.gold)+p('M17 21Q18 12 24 10','none','stroke="#fff0cf" stroke-width="3"')
  ],
  grain:[
    ellipse(20,23,7,11,C.gold,'transform="rotate(-30 20 23)"')+ellipse(43,26,7,11,C.wood,'transform="rotate(30 43 26)"')+ellipse(29,46,11,7,C.gold)+p('M16 16 24 29M47 18 39 33M21 45 37 47'),
    p('M18 9H45L40 22Q58 36 52 53 32 60 12 53 6 36 24 22Z',C.paper)+p('M22 22H41M26 10 29 18M38 10 35 18')+ellipse(32,40,11,9,C.cream)+p('M32 34V47M26 36 32 40 38 36'),
    p('M7 48C4 32 18 21 31 23 43 13 62 28 57 45 54 57 14 58 7 48Z',C.paper)+p('M16 36Q22 28 31 31M38 32Q46 28 49 36')+ellipse(31,52,23,3,C.cream),
    p('M7 39 12 17 23 24Q32 15 42 24L53 16 58 39 48 51 37 43H27L16 51Z',C.gold)+p('M23 24 19 43M29 21 27 43M36 21 37 43M42 24 47 44'),
    basket()+ellipse(23,25,9,18,C.gold,'transform="rotate(-20 23 25)"')+ellipse(42,25,9,16,C.paper,'transform="rotate(20 42 25)"')+p('M17 15 26 19M19 24 28 28M38 15 46 12M36 24 46 20'),
    rect(11,35,42,20,C.pink)+rect(18,20,28,17,C.paper)+p('M11 38Q17 47 23 38 29 47 35 38 41 47 47 38L53 38M18 24Q25 31 32 24 39 31 46 24',C.cream)+p('M26 20V12M38 20V12')+p('M26 12C18 8 25 2 26 3 33 8 29 12 26 12ZM38 12C30 8 37 2 38 3 45 8 41 12 38 12Z',C.gold),
    p('M5 37H59L54 50H10Z',C.teal)+p('M14 50V59M50 50V59')+ellipse(21,31,13,9,C.gold)+p('M13 29 16 24M21 30 24 24')+rect(36,21,16,16,C.pink)+p('M36 21 44 12 52 21Z',C.cream)+circle(44,12,4,C.rose)+p('M30 37V24')
  ],
  tea:[
    leaf(24,31,.9,-35)+group(leaf(0,0,.75), 'translate(43 35) rotate(40)')+p('M25 47 23 54M38 47 36 54'),
    p('M15 14H39L45 49H11Z',C.paper)+p('M15 14 20 23H35L39 14M27 14V7H51V26')+rect(43,25,15,15,C.green)+p('M20 31H35M20 37H33','none','stroke="#afa381"'),
    ellipse(30,53,24,5,C.paper)+p('M45 27Q64 23 56 39L44 42',C.cream)+p('M11 23H47L43 44Q30 57 16 44Z',C.mint)+ellipse(29,23,18,5,'#c4b37d')+p('M23 15C17 10 28 9 23 4M36 15C30 10 41 9 36 4'),
    p('M44 27Q61 24 55 41L44 44',C.gold)+p('M15 17H45V49Q30 58 15 49Z',C.blue)+p('M19 29H41V47Q30 53 19 47Z','#b77b4e')+circle(44,18,11,C.gold)+circle(44,18,8,C.cream)+p('M44 10V26M36 18H52M38 12 50 24M50 12 38 24'),
    p('M16 29 5 19 9 39 17 44M46 28Q65 16 58 40L48 45',C.mint)+p('M16 25H47Q58 56 32 56T16 25Z',C.teal)+p('M19 25Q32 9 44 25Z',C.paper)+circle(32,15,4,C.gold)+leaf(32,40,.45),
    p('M9 24 35 14 56 26 30 37Z',C.paper)+p('M9 24V48L30 58V37Z',C.teal)+p('M30 37 56 26V48L30 58Z',C.mint)+p('M22 19 43 31V53M18 28V52','none','stroke="#d8a0ad" stroke-width="5"')+p('M31 18C7 10 27 1 33 14 39-3 59 10 37 18Z',C.pink),
    p('M32 9V57M23 57H42','none','stroke-width="3"')+ellipse(32,25,24,5,C.gold)+ellipse(32,49,29,5,C.gold)+rect(14,35,13,12,C.pink)+p('M14 35 20 29 27 35Z',C.cream)+p('M38 34H52L49 44H41Z',C.mint)+p('M17 14H28L25 22H20ZM39 13H48L46 22H41Z',C.paper)
  ],
  glass:[
    p('M13 19 33 10 29 31 17 43 9 31Z',C.blue)+p('M40 28 55 38 42 55 32 45Z',C.teal)+p('M17 23 23 20M40 36 45 39','none','stroke="#fff0cf" stroke-width="3"'),
    circle(32,32,23,C.blue)+circle(32,32,19,'none','stroke="#789d9b"')+p('M18 29Q20 19 30 17M39 46 46 39','none','stroke="#fff0cf" stroke-width="4"'),
    p('M39 40 54 55','none','stroke="#a9794f" stroke-width="9"')+circle(27,27,20,C.gold)+circle(27,27,15,C.blue)+p('M17 26 27 16','none','stroke="#fff0cf" stroke-width="3"'),
    p('M7 38 44 13 56 31 19 56Z',C.wood)+p('M16 32 30 49M32 22 46 39','none','stroke="#d9b768" stroke-width="6"')+ellipse(49,22,8,12,C.blue,'transform="rotate(-34 49 22)"')+p('M50 16 46 22','none','stroke="#fff0cf" stroke-width="3"'),
    p('M32 30 18 58M32 30 48 58M32 30V57','none','stroke-width="3"')+p('M8 20 45 7 53 25 16 39Z',C.gold)+p('M15 18 22 37M35 11 42 29')+ellipse(49,16,7,10,C.blue,'transform="rotate(-22 49 16)"'),
    p('M29 42V53M35 42V53M18 57H46',C.gold)+circle(32,27,22,C.blue)+ellipse(32,27,11,23,'none','transform="rotate(35 32 27)" stroke="#c49a62" stroke-width="3"')+ellipse(32,27,23,8,'none','transform="rotate(-20 32 27)" stroke="#c49a62" stroke-width="3"')+star(32,27,.6),
    rect(9,32,46,25,C.teal)+p('M7 32C7-1 57-1 57 32Z',C.blue)+p('M32 7V32M12 32H53')+p('M34 14 49 10 53 18 38 24Z',C.gold)+rect(26,39,13,18,C.ink)+rect(14,39,7,8,C.cream)+rect(44,39,7,8,C.cream)
  ],
  star:[
    p('M31 10C31 25 46 29 43 41 41 53 20 54 18 42 14 29 26 25 31 10Z',C.paper)+p('M30 32C18 43 34 53 37 41Z',C.gold)+p('M9 19V25M6 22H12M48 10V16M45 13H51'),
    p('M33 9 39 23 55 26 42 37 44 54 31 44 18 51 22 35 8 25 24 23Z',C.gold)+p('M33 9 28 29 38 32 31 44M28 29 8 25',C.cream),
    bottle('#c4abd0')+star(27,43,.55)+star(40,39,.3),
    p('M26 14V10Q32 1 38 10V14M20 17H44L49 52H15Z',C.teal)+p('M24 22H40L43 46H21Z',C.cream)+star(32,34,.65)+p('M13 53H51M18 17H46','none','stroke-width="3"'),
    p('M10 48 32 9 54 48Z',C.teal)+circle(32,31,21,C.purple)+circle(32,31,16,C.blue)+p('M19 27 30 20 43 32 29 43Z')+star(19,27,.3)+star(30,20,.3)+star(43,32,.3)+star(29,43,.3)+p('M25 54H39'),
    p('M21 7C-4 31 13 57 39 54 53 52 60 39 56 26 50 45 23 47 16 29 12 20 15 13 21 7Z',C.gold)+p('M24 55H45V59H24Z',C.teal)+star(34,24,.9)+circle(49,12,3,C.purple),
    p('M5 43Q32 61 59 43L51 57H13Z',C.teal)+star(32,29,1.65)+circle(32,31,6,C.cream)+p('M8 12 13 17M56 12 51 17M31 3V7','none','stroke-width="3"')
  ],
  thread:[
    p('M12 44C0 36 6 22 16 23 12 9 29 6 34 15 44 4 58 15 51 26 65 32 57 50 45 47 39 60 23 57 21 48 17 52 11 50 12 44Z',C.cream)+p('M20 29Q29 22 33 32M32 43Q42 46 46 37','none','stroke="#c9bda6"'),
    rect(18,9,29,8,C.wood)+rect(15,48,33,8,C.wood)+rect(21,17,23,31,C.purple)+p('M22 22 43 26 22 30 43 34 22 38 43 42','none','stroke="#f7dfda" stroke-width="2.5"')+p('M44 40Q61 51 49 59H35'),
    p('M11 16 46 10 54 48 18 55Z',C.purple)+p('M13 25 47 19M15 35 50 30M17 45 52 40M23 15 29 53M36 13 42 50','none','stroke="#ecd1d2" stroke-width="2"'),
    p('M16 8H47V21H34V55H19V21H16Z',C.pink)+p('M20 11H43M20 17H43M20 29H33M20 39H33M20 49H33','none','stroke="#f6dbb3" stroke-width="3"')+p('M20 55V60M26 55V60M32 55V60'),
    p('M22 9 4 48 28 56 32 45 37 56 60 48 42 9Q32 19 22 9Z',C.purple)+p('M17 21 32 28 47 21M11 34 27 40 32 28 38 40 53 34M27 40 24 54M38 40 41 54','none','stroke="#f0d0b6" stroke-width="3"'),
    p('M17 6V59M17 9Q48 12 54 49L17 44Z',C.cream)+p('M17 26 43 30M34 13 32 46','none','stroke="#a6b9a2" stroke-width="2"')+p('M10 59H25'),
    p('M30 5V59M7 55Q33 65 58 53L49 61H18Z',C.wood)+p('M29 8 5 42 29 46Z',C.pink)+p('M34 10Q55 17 59 45H34Z',C.teal)+p('M22 18 13 31 29 34V22Z',C.gold)+p('M34 22Q49 25 54 33H34Z',C.purple)+p('M30 7 42 5 39 13 30 15Z',C.gold)
  ],
  music:[
    p('M13 20 43 12 52 40 22 50Z',C.gold)+p('M22 50V55L52 45V40M13 20V25',C.wood)+circle(24,26,3,C.cream)+p('M31 23 42 20','none','stroke="#f7e6b9" stroke-width="3"'),
    p('M32 5V15')+p('M21 16H43V51L32 59 21 51Z',C.gold)+circle(32,22,3,C.cream)+p('M27 31V48M37 31V48','none','stroke="#f7e6b9" stroke-width="3"'),
    p('M32 4V13M18 29V49M32 29V57M46 29V46')+p('M12 28C12 5 52 5 52 28Z',C.teal)+rect(15,32,6,17,C.gold)+rect(29,35,6,22,C.gold)+rect(43,32,6,14,C.gold),
    rect(9,29,42,26,C.wood)+p('M9 29 17 14H54L51 29Z',C.paper)+p('M51 40H59V49M17 38H43M17 44H43')+p('M28 23V7L40 10V21')+ellipse(25,23,4,3,C.teal)+ellipse(37,21,4,3,C.teal),
    circle(32,32,26,'#687e7e')+circle(32,32,20,'none','stroke="#a5bfba"')+circle(32,32,14,C.blue)+p('M21 33Q25 20 36 29L43 25 42 34 35 39Q25 42 21 33Z',C.cream)+circle(27,30,1.5,C.ink),
    rect(10,42,43,15,C.wood)+p('M22 42V31Q22 20 32 19','none','stroke="#d9b768" stroke-width="5"')+p('M29 18 45 5 57 27 33 28Z',C.gold)+ellipse(49,16,7,12,C.teal,'transform="rotate(-29 49 16)"')+p('M17 49H45'),
    p('M6 44H58V56H6Z',C.wood)+p('M10 44V36H54V44Z',C.cream)+p('M16 37V44M24 37V44M32 37V44M40 37V44M48 37V44')+p('M18 30V11L30 8V26M43 29V15L55 18V32','none','stroke-width="3"')+ellipse(14,30,5,4,C.teal)+ellipse(26,26,5,4,C.teal)+ellipse(39,29,5,4,C.rose)+ellipse(51,32,5,4,C.rose)
  ]
};
