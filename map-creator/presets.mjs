/** One reference reconstruction and four original point-symmetric sketches. Editable prototypes, not playtested or balance-validated. */
import {createGeometryPair,createSelfGeometry} from './geometry.mjs';
import {REFERENCE_PRESET} from './reference-layout.mjs';
export const RANKING_LABEL='Reference reconstruction and four original designs';
export const SOURCES=[];
const pair=(id,type,points,width=38)=>createGeometryPair({id,type,points,width});
const self=(id,type,halfPoints,width=38)=>createSelfGeometry({id,type,halfPoints,width});
const jungle=(id,points)=>pair(id,'jungle',points,1);
const A=[100,900],B=[900,100];
const seed=(kind,x,y,angle=315)=>({kind,team:'red',x,y,angle});
function design(id,name,description,laneCount,geometry,entities){return {id:`point-${id}`,name,designName:name,description,laneCount,pointSymmetry:true,width:1000,height:1000,provenance:'Original design',adaptationNote:'All roads, rivers and jungle polygons are generated with exact 180° partners. Boss landmarks are independent.',lanes:[],rivers:[],jungles:[],objectiveZones:[],terrain:[],geometry,entities:[...entities,{kind:'dragex',team:'neutral',x:420,y:180,angle:0},{kind:'moana',team:'neutral',x:650,y:840,angle:35}]};}
const ORIGINAL_PRESETS=[
 design('diamond','Diamond Crossroads','Three angular lanes frame four jungle pockets; two river arms cross the central road.',3,[
 ...pair('diamond-outer','lane',[A,[100,330],[250,100],B],48),
 self('diamond-middle','lane',[A,[300,700],[500,500]],48),
 ...pair('diamond-river','river',[[80,160],[300,300],[450,450]],35),
 ...jungle('diamond-grove',[[170,380],[280,240],[420,280],[370,420],[270,530]]),
 ...jungle('diamond-wood',[[230,700],[420,590],[530,690],[470,810],[270,810]])
 ],[seed('castle',100,900),seed('tower',100,480),seed('tower',300,700),seed('city',250,100),seed('gate',100,330),seed('shop',180,840),seed('camp',300,350)]),
 design('braid','Braided Marches','Three west-to-east routes braid through two shared junctions; long parallel jungle strips constrain rotations.',3,[
 ...pair('braid-outer','lane',[[100,500],[230,220],[500,300],[770,220],[900,500]],44),
 self('braid-mid','lane',[[100,500],[300,580],[500,500]],46),
 ...pair('braid-link','lane',[[230,220],[300,580]],28),
 ...pair('braid-stream','river',[[80,80],[180,160],[410,190]],30),
 ...jungle('braid-grove',[[330,360],[510,370],[680,330],[630,420],[430,460]]),
 ...jungle('braid-edge',[[160,90],[440,90],[510,140],[280,165]])
 ],[seed('castle',100,500,0),seed('tower',230,220,0),seed('tower',300,580,0),seed('city',500,300,0),seed('gate',180,660,0),seed('shop',120,560,0),seed('camp',450,400,0)]),
 design('crown','Island Crown','An octagonal ring and four spokes wrap a central island. River banks leave diagonal road crossings.',4,[
 ...pair('crown-ring','lane',[A,[120,500],[250,250],[500,120],[750,250],B],46),
 self('crown-spoke','lane',[A,[300,700],[500,500]],42),
 self('crown-cross','lane',[[250,250],[500,500]],38),
 ...pair('crown-bank','river',[[340,410],[340,340],[410,340]],32),
 ...pair('crown-bankwide','river',[[590,340],[660,340],[660,410]],32),
 ...jungle('crown-island',[[430,420],[480,390],[530,430],[500,470],[450,470]]),
 ...jungle('crown-outerwood',[[180,400],[270,300],[320,350],[260,460]])
 ],[seed('castle',100,900),seed('tower',250,250),seed('tower',300,700),seed('city',500,120),seed('gate',120,500),seed('shop',160,850),seed('camp',230,380)]),
 design('crescent','Crescent Divide','Two sweeping flank roads enclose a large central jungle. A lateral connecting road opens a contested middle passage.',2,[
 ...pair('crescent-flank','lane',[A,[70,620],[180,280],[440,100],[760,70],B],56),
 self('crescent-crossing','lane',[[70,620],[280,540],[500,500]],32),
 ...pair('crescent-river','river',[[220,720],[330,650],[430,620]],42),
 ...jungle('crescent-heart',[[250,380],[390,220],[580,230],[680,340],[590,430],[410,450]]),
 ...jungle('crescent-corner',[[90,180],[180,100],[300,80],[240,160]])
 ],[seed('castle',100,900),seed('tower',180,280),seed('city',440,100),seed('gate',70,620),seed('shop',140,850),seed('camp',410,340)]),
 design('switchback','Highland Switchbacks','Five corridors climb between narrow jungle ridges. Cross-links join the stepped outer roads and central pass.',5,[
 ...pair('switch-outer','lane',[A,[80,650],[200,650],[200,300],[350,300],[350,80],B],40),
 ...pair('switch-inner','lane',[A,[300,800],[300,580],[420,580],[420,360],[650,360],B],36),
 self('switch-center','lane',[A,[340,660],[500,500]],42),
 ...pair('switch-link','lane',[[200,650],[300,580]],24),
 ...pair('switch-river','river',[[80,450],[130,450],[130,280],[240,200]],28),
 ...jungle('switch-ridge',[[240,350],[280,350],[280,500],[350,500],[350,540],[240,590]]),
 ...jungle('switch-topridge',[[400,130],[610,130],[630,220],[480,270],[400,250]])
 ],[seed('castle',100,900),seed('tower',200,650),seed('tower',300,580),seed('tower',340,660),seed('city',350,300),seed('gate',300,800),seed('shop',160,860),seed('camp',500,200)])
];
export const ARCHIVED_DIAMOND_PRESET=ORIGINAL_PRESETS[0];
export const PRESETS=[REFERENCE_PRESET,...ORIGINAL_PRESETS.slice(1)];
export default PRESETS;
