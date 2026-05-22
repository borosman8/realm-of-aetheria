// ============================================================
// Realm of Aetheria — A Pixel RPG Adventure
// Beta 0.0.2.8 — Still Under Development
// AI Integration: Xiaomi MiMo (Optional)
// https://100t.xiaomimimo.com/
// ============================================================

const TILE = 48, COLS = 20, ROWS = 14;
const W = COLS * TILE, H = ROWS * TILE;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = W; canvas.height = H;
const starsCanvas = document.getElementById('starsCanvas');
const starsCtx = starsCanvas.getContext('2d');

// ── PALETTE ──
const P = {
    bg:'#0f0f23', grass:'#1a5a2a', grass2:'#227733', grassL:'#2d8a45',
    path:'#5a4f3d', path2:'#6a5f4d', water:'#1a3a6a', water2:'#2255aa', waterL:'#3377cc',
    wall:'#4a4060', wall2:'#5a5070', wallT:'#6a6080',
    sand:'#c2a860', sand2:'#d4ba72',
    lava:'#cc3300', lava2:'#ff5500', lavaL:'#ff8833',
    roof:'#8a2020', roof2:'#aa3030', wood:'#6a4a2a', wood2:'#8a6a3a',
    or:'#ff6b00', orL:'#ff8c3a', orD:'#cc5500',
    yel:'#ffcc00', yelL:'#ffee66',
    wh:'#ffffff', bk:'#000000', gr:'#888888', grD:'#444444',
    pur:'#6a3aaa', purL:'#8855cc', cy:'#00cccc', cyL:'#44eeee',
    red:'#cc3333', green:'#33aa33', blue:'#3366cc',
    skin:'#ffcc99', skinS:'#dd9966', hair:'#553322',
    gold:'#ffd700', goldL:'#ffe44d', goldD:'#cca300',
};

// ── INPUT ──
const Keys={}, JP={};
window.addEventListener('keydown',e=>{if(!Keys[e.key])JP[e.key]=true;Keys[e.key]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();});
window.addEventListener('keyup',e=>{Keys[e.key]=false;});
function kd(k){return Keys[k]||false;}
function jp(k){const v=JP[k];JP[k]=false;return v;}
function clearJP(){for(const k in JP)JP[k]=false;}

// ── GAME STATE ──
const G = {
    state:'loading', tick:0, dt:0, lastTime:0,
    cam:{x:0,y:0}, currentMap:'village',
    transition:{active:false,alpha:0,cb:null,dir:'in'},
    gold:50, particles:[], notifications:[], screenShake:{x:0,y:0,i:0},
    dayNight:0, mimoApiKey:null, mimoEnabled:false,
    menuOpen:false, menuSel:0,
    shopOpen:false, shopSel:0, shopCat:0,
    inventoryOpen:false, invSel:0,
    settingsOpen:false, settingsSel:0,
    battleActive:false, battleSel:0,
    saveExists:false,
    mainMenuSel:0,
    settings:{ musicVol:80, sfxVol:100, aiEnabled:true, difficulty:'normal' },
};

// ── ITEMS DATABASE ──
const ItemDB = {
    // Weapons
    wooden_sword:{name:'Wooden Sword',type:'weapon',atk:5,price:30,desc:'A basic training sword.',icon:'sword',color:'#8a6a3a'},
    iron_sword:{name:'Iron Sword',type:'weapon',atk:12,price:120,desc:'Standard iron blade.',icon:'sword',color:'#aaaacc'},
    flame_blade:{name:'Flame Blade',type:'weapon',atk:22,price:350,desc:'Burns with magical fire.',icon:'sword',color:'#ff5533'},
    crystal_staff:{name:'Crystal Staff',type:'weapon',atk:18,price:280,desc:'Channels arcane energy.',icon:'staff',color:'#88aaff'},
    shadow_dagger:{name:'Shadow Dagger',type:'weapon',atk:15,price:200,desc:'Strikes from the shadows.',icon:'dagger',color:'#665588'},
    // Armor
    leather_armor:{name:'Leather Armor',type:'armor',def:4,price:50,desc:'Basic protection.',icon:'armor',color:'#8a6633'},
    chain_mail:{name:'Chain Mail',type:'armor',def:10,price:180,desc:'Linked metal rings.',icon:'armor',color:'#aaaaaa'},
    dragon_plate:{name:'Dragon Plate',type:'armor',def:20,price:500,desc:'Forged from dragon scales.',icon:'armor',color:'#cc4444'},
    mage_robe:{name:'Mage Robe',type:'armor',def:6,price:150,desc:'Enhances magic power.',icon:'armor',color:'#5555cc'},
    // Potions
    hp_potion:{name:'Health Potion',type:'potion',heal:30,price:15,desc:'Restores 30 HP.',icon:'potion',color:'#ff4444'},
    hp_potion_lg:{name:'Greater HP Potion',type:'potion',heal:80,price:40,desc:'Restores 80 HP.',icon:'potion',color:'#ff2222'},
    mp_potion:{name:'Mana Potion',type:'potion',healMp:25,price:20,desc:'Restores 25 MP.',icon:'potion',color:'#4444ff'},
    str_elixir:{name:'Strength Elixir',type:'potion',buffAtk:8,duration:3,price:60,desc:'+8 ATK for 3 turns.',icon:'potion',color:'#ffaa00'},
    def_elixir:{name:'Defense Elixir',type:'potion',buffDef:8,duration:3,price:60,desc:'+8 DEF for 3 turns.',icon:'potion',color:'#44aaff'},
    antidote:{name:'Antidote',type:'potion',curePoison:true,price:12,desc:'Cures poison.',icon:'potion',color:'#44ff44'},
    // Special
    gold_ring:{name:'Gold Ring',type:'accessory',price:100,luckBonus:5,desc:'Increases gold drops.',icon:'ring',color:P.gold},
    amulet:{name:'Aether Amulet',type:'accessory',price:250,allStats:3,desc:'+3 to all stats.',icon:'ring',color:P.purL},
    // Quest
    old_map:{name:'Old Map',type:'quest',price:0,desc:'Shows hidden areas.',icon:'scroll',color:'#ccaa77'},
    crystal_key:{name:'Crystal Key',type:'quest',price:0,desc:'Opens crystal doors.',icon:'key',color:'#88ccff'},
};

// ── SHOP CATALOG ──
const ShopCatalog = {
    weapons:['wooden_sword','iron_sword','flame_blade','crystal_staff','shadow_dagger'],
    armor:['leather_armor','chain_mail','dragon_plate','mage_robe'],
    potions:['hp_potion','hp_potion_lg','mp_potion','str_elixir','def_elixir','antidote'],
    special:['gold_ring','amulet'],
};

// ── ENEMY DATABASE ──
const EnemyDB = {
    slime:{name:'Green Slime',hp:25,maxHp:25,atk:5,def:2,goldDrop:8,exp:10,color:'#44cc44',color2:'#33aa33'},
    bat:{name:'Shadow Bat',hp:20,maxHp:20,atk:8,def:1,goldDrop:12,exp:15,color:'#775588',color2:'#554466'},
    skeleton:{name:'Skeleton Knight',hp:50,maxHp:50,atk:14,def:8,goldDrop:25,exp:30,color:'#ddddcc',color2:'#bbbbaa'},
    fire_spirit:{name:'Fire Spirit',hp:40,maxHp:40,atk:18,def:5,goldDrop:30,exp:35,color:'#ff6633',color2:'#cc4411'},
    golem:{name:'Stone Golem',hp:80,maxHp:80,atk:12,def:18,goldDrop:45,exp:50,color:'#888877',color2:'#666655'},
    dark_mage:{name:'Dark Mage',hp:55,maxHp:55,atk:22,def:8,goldDrop:50,exp:60,color:'#442266',color2:'#331155'},
    dragon:{name:'Elder Dragon',hp:150,maxHp:150,atk:30,def:20,goldDrop:200,exp:150,color:'#cc2222',color2:'#991111'},
    crystal_guardian:{name:'Crystal Guardian',hp:100,maxHp:100,atk:25,def:15,goldDrop:100,exp:100,color:'#66aaee',color2:'#4488cc'},
};

// ── PLAYER ──
const Player = {
    x:0,y:0,dir:'down',frame:0,animTimer:0,moving:false,
    hp:100,maxHp:100,mp:30,maxMp:30,
    atk:8,def:4,level:1,exp:0,expNext:50,
    equippedWeapon:null,equippedArmor:null,equippedAccessory:null,
    inventory:[], buffs:[],
    totalAtk(){
        let a=this.atk;
        if(this.equippedWeapon)a+=ItemDB[this.equippedWeapon].atk;
        for(const b of this.buffs)if(b.atk)a+=b.atk;
        if(this.equippedAccessory&&ItemDB[this.equippedAccessory].allStats)a+=ItemDB[this.equippedAccessory].allStats;
        return a;
    },
    totalDef(){
        let d=this.def;
        if(this.equippedArmor)d+=ItemDB[this.equippedArmor].def;
        for(const b of this.buffs)if(b.def)d+=b.def;
        if(this.equippedAccessory&&ItemDB[this.equippedAccessory].allStats)d+=ItemDB[this.equippedAccessory].allStats;
        return d;
    },
};

// ── BATTLE ──
const Battle = {
    enemy:null, turn:'player', log:[], animTimer:0,
    playerAnim:'idle', enemyAnim:'idle',
    turnCount:0, reward:{gold:0,exp:0,item:null},
    state:'action', // action, animating, result, victory, defeat
    selectedAction:0,
    aiCommentary:null,
};
const BATTLE_ACTIONS = ['Attack','Magic','Item','Flee'];

// ── DIALOG ──
const Dialog = {
    active:false, lines:[], cur:0, charIdx:0, charTimer:0, speed:25,
    speaker:'', type:'', waitInput:false, isAiTyping:false,
};

// ── MAPS (expanded) ──
// 0=grass,1=path,2=water,3=wall,4=tree,5=roof,6=door,7=window,8=flower,9=chest
// A=sign,B=portal,C=sand,D=lava,E=shop_door,F=enemy_zone
const M_VILLAGE = {
    width:32, height:26, name:'Aetheria Village',
    data:(() => {
        const d = [];
        for(let y=0;y<26;y++) for(let x=0;x<32;x++) {
            if(y===0||y===25||x===0||x===31) d.push(4);
            else if(y===1&&x>0&&x<31) d.push(x>14&&x<18?2:4);
            else if(y===24&&x>0&&x<31) d.push(4);
            else if(x===1||x===30) d.push(y>10&&y<14?0:4);
            // Water lake top-right
            else if(x>=24&&x<=29&&y>=2&&y<=5) d.push(2);
            else if(x>=25&&x<=28&&y===6) d.push(2);
            // Main roads
            else if(x===15&&y>=3&&y<=22) d.push(1);
            else if(x===16&&y>=3&&y<=22) d.push(1);
            else if(y===12&&x>=3&&x<=28) d.push(1);
            else if(y===13&&x>=3&&x<=28) d.push(1);
            // Houses top-left
            else if(x>=4&&x<=6&&y===4) d.push(5);
            else if(x>=4&&x<=6&&y===5) d.push(x===5?6:7);
            else if(x>=9&&x<=11&&y===4) d.push(5);
            else if(x>=9&&x<=11&&y===5) d.push(x===10?'E':7); // SHOP
            // Houses bottom-left
            else if(x>=4&&x<=6&&y===16) d.push(5);
            else if(x>=4&&x<=6&&y===17) d.push(x===5?6:7);
            else if(x>=9&&x<=11&&y===16) d.push(5);
            else if(x>=9&&x<=11&&y===17) d.push(x===10?6:7);
            // Houses top-right
            else if(x>=20&&x<=22&&y===4) d.push(5);
            else if(x>=20&&x<=22&&y===5) d.push(x===21?6:7);
            // Houses bottom-right
            else if(x>=20&&x<=22&&y===16) d.push(5);
            else if(x>=20&&x<=22&&y===17) d.push(x===21?6:7);
            else if(x>=25&&x<=27&&y===16) d.push(5);
            else if(x>=25&&x<=27&&y===17) d.push(x===26?6:7);
            // Flowers & decor
            else if((x===3&&y===3)||(x===7&&y===3)||(x===3&&y===8)||(x===12&&y===8)||(x===28&&y===8)||(x===8&&y===20)||(x===23&&y===20)||(x===18&&y===7)||(x===19&&y===19)||(x===7&&y===14)||(x===27&&y===14)) d.push(8);
            // Signs
            else if(x===14&&y===10) d.push('A');
            // Chests
            else if(x===28&&y===10) d.push(9);
            else if(x===3&&y===22) d.push(9);
            // Portal to dungeon (south)
            else if(x===15&&y===23) d.push('B');
            else if(x===16&&y===23) d.push('B');
            // Trees scattered
            else if((x===3&&y===6)||(x===7&&y===6)||(x===12&&y===3)||(x===18&&y===3)||(x===23&&y===8)||(x===28&&y===14)||(x===3&&y===14)||(x===8&&y===22)||(x===23&&y===22)||(x===13&&y===18)||(x===18&&y===18)||(x===27&&y===10)||(x===3&&y===10)) d.push(4);
            // Enemy zones (hidden)
            else if((x>=19&&x<=22&&y>=8&&y<=10)||(x>=6&&x<=8&&y>=19&&y<=21)) d.push('F');
            else d.push(0);
        }
        return d;
    })(),
    npcs:[
        {id:'elder',type:'elder',x:14,y:8,name:'Elder Aldric',
         dialog:["Welcome, adventurer, to Aetheria Village!","Dark forces have invaded the Ember Caverns below.","Collect gold, buy gear, and grow stronger.","When ready, enter the portal south of town."],
         aiPrompt:"You are Elder Aldric, a wise village leader in the fantasy world of Aetheria. Give advice about the adventure ahead. Keep responses to 2-3 sentences."},
        {id:'merchant',type:'merchant',x:10,y:7,name:'Elara the Shopkeeper',
         dialog:["Welcome to Elara's Emporium!","Press B near me to open the shop.","I have weapons, armor, and potions for sale.","Gold earned from battles can be spent here!"],
         aiPrompt:"You are Elara, a cheerful shopkeeper in Aetheria Village. You sell weapons, armor, and potions. Mention your best deals. Keep responses short and friendly."},
        {id:'engineer',type:'engineer',x:21,y:7,name:'Korrin the Smith',
         dialog:["Ho there! I forge the finest blades in Aetheria.","The Flame Blade is my masterwork — costs 350 gold.","Defeat monsters in the Ember Caverns for gold!","Stronger gear means easier battles, friend."],
         aiPrompt:"You are Korrin, a proud blacksmith. You talk about weapons and forging. Keep responses short and energetic."},
        {id:'mimo_bot',type:'mimo_bot',x:16,y:10,name:'Aether Core',
         dialog:["Greetings! I am the Aether Core, this world's AI guide.","My intelligence is powered by Xiaomi MiMo technology.","Connect a MiMo API key in Settings for enhanced AI features!","Visit 100t.xiaomimimo.com for free API tokens.","With MiMo AI, NPCs become truly intelligent!"],
         aiPrompt:"You are the Aether Core, a magical AI entity powered by Xiaomi MiMo technology. You explain MiMo AI features and encourage players to try the MiMo API. Keep responses short."},
        {id:'guard',type:'guard',x:14,y:22,name:'Captain Voss',
         dialog:["Halt! The portal leads to the Ember Caverns.","Dangerous creatures lurk within — are you prepared?","Make sure you have potions and decent gear.","I've heard a Dragon nests in the deepest chamber..."],
         aiPrompt:"You are Captain Voss, a stern but caring town guard. You warn about dangers ahead. Keep responses short and military-like."},
    ],
    tokens:[
        {x:6,y:8,collected:false,gold:10},
        {x:20,y:9,collected:false,gold:15},
        {x:12,y:15,collected:false,gold:8},
        {x:25,y:12,collected:false,gold:20},
        {x:8,y:21,collected:false,gold:12},
        {x:18,y:20,collected:false,gold:10},
        {x:26,y:3,collected:false,gold:25},
        {x:5,y:12,collected:false,gold:8},
        {x:24,y:20,collected:false,gold:15},
        {x:10,y:14,collected:false,gold:10},
    ],
    chests:[
        {x:28,y:10,opened:false,reward:'hp_potion',gold:25},
        {x:3,y:22,opened:false,reward:'leather_armor',gold:10},
    ],
    portals:[
        {x:15,y:23,target:'dungeon',sx:15,sy:2},
        {x:16,y:23,target:'dungeon',sx:16,sy:2},
    ],
    signs:[{x:14,y:10,text:"Welcome to Aetheria Village!\nShop: Talk to Elara (B key)\nDungeon: South Portal\n\nAI powered by Xiaomi MiMo\n100t.xiaomimimo.com"}],
    enemies:['slime','bat'],
    enemyRate:0.08,
    playerSpawn:{x:15,y:11},
};

const M_DUNGEON = {
    width:32, height:30, name:'Ember Caverns',
    data:(()=>{
        const d=[];
        for(let y=0;y<30;y++) for(let x=0;x<32;x++){
            if(y===0||y===29||x===0||x===31) d.push(3);
            else if(y===1||y===28||x===1||x===30) d.push(3);
            // Lava pools
            else if(x>=13&&x<=18&&y>=13&&y<=16) d.push('D');
            else if(x>=5&&x<=7&&y>=22&&y<=24) d.push('D');
            else if(x>=24&&x<=26&&y>=6&&y<=8) d.push('D');
            // Corridors
            else if(x===15&&y>=2&&y<=27) d.push(1);
            else if(x===16&&y>=2&&y<=27) d.push(1);
            else if(y===10&&x>=3&&x<=28) d.push(1);
            else if(y===20&&x>=3&&x<=28) d.push(1);
            // Rooms top-left
            else if(x>=3&&x<=8&&y>=3&&y<=8) d.push(x===3||x===8||y===3||y===8?3:0);
            // Rooms top-right
            else if(x>=22&&x<=28&&y>=3&&y<=8) d.push(x===22||x===28||y===3||y===8?3:0);
            // Boss room bottom
            else if(x>=10&&x<=21&&y>=23&&y<=27) d.push(x===10||x===21||y===23||y===27?3:0);
            // Rooms mid-left
            else if(x>=3&&x<=8&&y>=15&&y<=19) d.push(x===3||x===8||y===15||y===19?3:0);
            // Rooms mid-right
            else if(x>=22&&x<=28&&y>=15&&y<=19) d.push(x===22||x===28||y===15||y===19?3:0);
            // Doors
            else if((x===8&&y===6)||(x===22&&y===6)||(x===8&&y===17)||(x===22&&y===17)||(x===10&&y===25)||(x===21&&y===25)) d.push(1);
            // Signs
            else if(x===14&&y===3) d.push('A');
            // Chests
            else if(x===5&&y===5) d.push(9);
            else if(x===25&&y===5) d.push(9);
            else if(x===5&&y===17) d.push(9);
            else if(x===25&&y===17) d.push(9);
            else if(x===15&&y===26) d.push(9);
            // Portal back
            else if(x===15&&y===2||x===16&&y===2) d.push('B');
            // Enemy zones
            else if((x>=4&&x<=7&&y>=4&&y<=7)||(x>=23&&x<=27&&y>=4&&y<=7)||(x>=4&&x<=7&&y>=16&&y<=18)||(x>=23&&x<=27&&y>=16&&y<=18)||(x>=11&&x<=20&&y>=24&&y<=26)) d.push('F');
            else d.push(y<10?0:y<20?0:0);
        }
        return d;
    })(),
    npcs:[
        {id:'dungeon_guide',type:'mimo_bot',x:14,y:5,name:'Dungeon Core',
         dialog:["You've entered the Ember Caverns!","Enemies spawn in dark areas — be ready to fight!","The Elder Dragon awaits in the chamber below.","Collect treasures and grow stronger!"],
         aiPrompt:"You are the Dungeon Core, a magical AI guide in the Ember Caverns. Give tips about combat. Keep responses short and dramatic."},
    ],
    tokens:[
        {x:4,y:10,collected:false,gold:20},
        {x:28,y:10,collected:false,gold:20},
        {x:10,y:15,collected:false,gold:25},
        {x:20,y:15,collected:false,gold:25},
        {x:10,y:22,collected:false,gold:30},
        {x:20,y:22,collected:false,gold:30},
        {x:15,y:12,collected:false,gold:15},
        {x:3,y:20,collected:false,gold:35},
        {x:28,y:20,collected:false,gold:35},
    ],
    chests:[
        {x:5,y:5,opened:false,reward:'iron_sword',gold:30},
        {x:25,y:5,opened:false,reward:'chain_mail',gold:30},
        {x:5,y:17,opened:false,reward:'hp_potion_lg',gold:40},
        {x:25,y:17,opened:false,reward:'str_elixir',gold:40},
        {x:15,y:26,opened:false,reward:'flame_blade',gold:100},
    ],
    portals:[
        {x:15,y:2,target:'village',sx:15,sy:21},
        {x:16,y:2,target:'village',sx:16,sy:21},
    ],
    signs:[{x:14,y:3,text:"Ember Caverns\nBeware of monsters!\nBoss: Elder Dragon in the depths\n\nTip: Use potions in battle!"}],
    enemies:['skeleton','fire_spirit','golem','dark_mage','dragon','crystal_guardian'],
    enemyRate:0.12,
    playerSpawn:{x:15,y:3},
};

const Maps = { village:M_VILLAGE, dungeon:M_DUNGEON };

// ── SPRITE DRAWING ──
const SC = {};
function genSprite(name, fn) {
    if(SC[name])return SC[name];
    const c=document.createElement('canvas');c.width=48;c.height=48;
    fn(c.getContext('2d'));
    SC[name]=c; return c;
}
function genAnim(name, fn, frame) {
    const k=`${name}_${frame}`;
    if(SC[k])return SC[k];
    const c=document.createElement('canvas');c.width=48;c.height=48;
    fn(c.getContext('2d'),frame);
    SC[k]=c; return c;
}

function drawPlayer(c,frame,dir){
    const b=(frame%2===0)?0:-1;
    c.fillStyle='rgba(0,0,0,0.3)';c.fillRect(12,42,24,6);
    const lo=(frame%2===0)?2:-2;
    c.fillStyle='#443322';c.fillRect(15+lo,38+b,8,6);c.fillRect(25-lo,38+b,8,6);
    c.fillStyle='#334466';c.fillRect(15,32+b,8,8);c.fillRect(25,32+b,8,8);
    c.fillStyle='#3366aa';c.fillRect(12,18+b,24,16);
    c.fillStyle='#2255aa';c.fillRect(12,18+b,4,16);c.fillRect(32,18+b,4,16);
    c.fillStyle='#4477cc';c.fillRect(16,18+b,16,3);
    // Belt
    c.fillStyle=P.gold;c.fillRect(14,31+b,20,2);
    c.fillStyle=P.goldD;c.fillRect(22,30+b,4,4);
    // Arms
    c.fillStyle=P.skin;
    const ao=Math.sin(frame*1.5)*2;
    c.fillRect(8,20+b+ao,4,12);c.fillRect(36,20+b-ao,4,12);
    // Head
    c.fillStyle=P.skin;c.fillRect(14,4+b,20,16);
    c.fillStyle=P.skinS;c.fillRect(14,16+b,20,2);
    c.fillStyle=P.hair;c.fillRect(12,2+b,24,6);c.fillRect(12,4+b,4,8);c.fillRect(32,4+b,4,8);
    // Headband
    c.fillStyle=P.or;c.fillRect(12,6+b,24,2);
    c.fillStyle=P.yel;c.fillRect(22,5+b,4,4);
    // Eyes
    c.fillStyle='#fff';c.fillRect(18,10+b,5,4);c.fillRect(27,10+b,5,4);
    const po=dir==='left'?-1:dir==='right'?1:0;
    c.fillStyle='#222';c.fillRect(20+po,11+b,2,3);c.fillRect(29+po,11+b,2,3);
    c.fillStyle='#cc7766';c.fillRect(21,15+b,6,1);
    // Weapon glow if equipped
    if(Player.equippedWeapon){
        const wc=ItemDB[Player.equippedWeapon].color;
        c.fillStyle=wc;c.fillRect(38,16+b+ao,3,14);c.fillRect(37,14+b+ao,5,3);
    }
}

function drawNPC(c,type,frame){
    const b=Math.sin(frame*0.8)*1;
    c.fillStyle='rgba(0,0,0,0.3)';c.fillRect(12,42,24,6);
    if(type==='elder'){
        c.fillStyle='#5533aa';c.fillRect(12,18+b,24,24);
        c.fillStyle='#6644bb';c.fillRect(14,18+b,20,2);
        c.fillStyle=P.skin;c.fillRect(14,4+b,20,16);
        c.fillStyle='#cccccc';c.fillRect(16,16+b,16,8);c.fillRect(18,24+b,12,4);
        c.fillStyle='#4422aa';c.fillRect(10,0+b,28,6);c.fillRect(16,-4+b,16,6);
        c.fillStyle=P.yel;c.fillRect(22,-2+b,4,4);
        c.fillStyle='#fff';c.fillRect(18,9+b,4,3);c.fillRect(26,9+b,4,3);
        c.fillStyle='#336';c.fillRect(19,10+b,2,2);c.fillRect(27,10+b,2,2);
    } else if(type==='merchant'){
        c.fillStyle='#aa6633';c.fillRect(12,20+b,24,20);
        c.fillStyle='#cc8844';c.fillRect(14,20+b,20,3);
        c.fillStyle='#eeddcc';c.fillRect(16,25+b,16,14);
        c.fillStyle='#ffcc99';c.fillRect(14,4+b,20,16);
        c.fillStyle='#993366';c.fillRect(12,2+b,24,5);c.fillRect(20,-2+b,10,5);
        c.fillStyle='#fff';c.fillRect(18,9+b,4,3);c.fillRect(26,9+b,4,3);
        c.fillStyle='#363';c.fillRect(19,10+b,2,2);c.fillRect(27,10+b,2,2);
        c.fillStyle='#cc6677';c.fillRect(20,15+b,8,1);c.fillRect(19,14+b,1,1);c.fillRect(28,14+b,1,1);
    } else if(type==='engineer'){
        c.fillStyle='#554433';c.fillRect(12,18+b,24,22);
        c.fillStyle=P.or;c.fillRect(14,18+b,1,22);c.fillRect(33,18+b,1,22);
        c.fillStyle='#aaffaa';c.fillRect(14,4+b,20,16);
        c.fillStyle='#445566';c.fillRect(14,8+b,20,6);
        c.fillStyle=P.cyL;c.fillRect(16,9+b,6,4);c.fillRect(26,9+b,6,4);
        c.fillStyle='#44aa44';c.fillRect(14,1+b,20,5);
        c.fillRect(18,-1+b,4,4);c.fillRect(28,-2+b,4,4);
    } else if(type==='mimo_bot'){
        c.fillStyle='#ddd';c.fillRect(14,20+b,20,18);
        c.fillStyle=P.or;c.fillRect(16,22+b,16,3);c.fillRect(16,32+b,16,3);
        c.fillStyle='#111';c.fillRect(18,26+b,12,6);
        c.fillStyle=P.or;
        if(Math.floor(frame)%4<2){c.fillRect(21,27+b,2,2);c.fillRect(25,27+b,2,2);c.fillRect(22,29+b,4,2);}
        else{c.fillRect(20,27+b,8,1);c.fillRect(22,28+b,4,2);}
        c.fillStyle='#eee';c.fillRect(12,4+b,24,16);
        c.fillStyle=P.or;c.fillRect(16,8+b,6,6);c.fillRect(26,8+b,6,6);
        c.fillStyle=P.yel;c.fillRect(18,10+b,2,2);c.fillRect(28,10+b,2,2);
        c.fillStyle='#aaa';c.fillRect(23,0+b,2,6);
        c.fillStyle=P.or;c.fillRect(21,-2+b,6,3);
        c.fillStyle='#bbb';c.fillRect(8,22+b,6,10);c.fillRect(34,22+b,6,10);
        c.fillRect(16,38+b,6,6);c.fillRect(26,38+b,6,6);
    } else if(type==='guard'){
        c.fillStyle='#556677';c.fillRect(12,18+b,24,22);
        c.fillStyle='#667788';c.fillRect(14,18+b,20,3);
        c.fillStyle='#778899';c.fillRect(18,22+b,12,8);
        c.fillStyle=P.skin;c.fillRect(14,4+b,20,16);
        c.fillStyle='#556677';c.fillRect(10,0+b,28,6);c.fillRect(12,2+b,24,4);
        c.fillStyle='#fff';c.fillRect(18,9+b,4,3);c.fillRect(26,9+b,4,3);
        c.fillStyle='#333';c.fillRect(19,10+b,2,2);c.fillRect(27,10+b,2,2);
        // Spear
        c.fillStyle='#8a6a3a';c.fillRect(38,4+b,3,38);
        c.fillStyle='#aab';c.fillRect(37,2+b,5,6);
    }
}

function drawGold(c,frame){
    const gl=Math.sin(frame*0.5)*2;
    c.fillStyle=`rgba(255,215,0,${0.12+Math.sin(frame*0.3)*0.04})`;
    for(let r=16+gl;r>6;r-=3){c.beginPath();c.arc(24,24,r,0,Math.PI*2);c.fill();}
    c.fillStyle=P.gold;c.fillRect(14,10,20,28);c.fillRect(10,14,28,20);c.fillRect(12,12,24,24);
    c.fillStyle=P.goldD;c.fillRect(16,14,16,20);c.fillRect(14,16,20,16);
    c.fillStyle='#b8860b';c.fillRect(19,18,2,3);c.fillRect(21,17,6,2);c.fillRect(23,17,2,12);
    c.fillStyle=P.goldL;c.fillRect(16,14,3,3);c.fillRect(14,16,2,2);
}

function drawEnemy(c,type,frame){
    const b=Math.sin(frame*0.6)*2;
    const e=EnemyDB[type];
    c.fillStyle='rgba(0,0,0,0.3)';c.fillRect(10,42,28,6);
    if(type==='slime'){
        c.fillStyle=e.color2;c.fillRect(8,24+b,32,20-b);
        c.fillStyle=e.color;c.fillRect(10,20+b,28,20-b);c.fillRect(12,16+b,24,8);
        c.fillStyle='#fff';c.fillRect(16,22+b,5,5);c.fillRect(28,22+b,5,5);
        c.fillStyle='#222';c.fillRect(18,24+b,2,3);c.fillRect(30,24+b,2,3);
        c.fillStyle='#66ee66';c.fillRect(14,18+b,4,3);
    } else if(type==='bat'){
        c.fillStyle=e.color;c.fillRect(20,18+b,8,14);
        c.fillStyle=e.color2;
        // Wings
        const wf=Math.sin(frame*1.2)*6;
        c.fillRect(4,14+b+wf,16,8);c.fillRect(28,14+b-wf,16,8);
        c.fillRect(8,12+b+wf,12,4);c.fillRect(28,12+b-wf,12,4);
        // Face
        c.fillStyle='#ff3333';c.fillRect(21,20+b,3,3);c.fillRect(26,20+b,3,3);
        c.fillStyle=e.color;c.fillRect(18,26+b,12,4);
        c.fillStyle='#fff';c.fillRect(21,28+b,2,3);c.fillRect(27,28+b,2,3);
    } else if(type==='skeleton'){
        c.fillStyle=e.color;c.fillRect(16,8+b,16,12);
        c.fillStyle=e.color2;c.fillRect(18,10+b,12,8);
        c.fillStyle='#222';c.fillRect(19,11+b,4,3);c.fillRect(27,11+b,4,3);
        c.fillRect(21,16+b,6,2);
        c.fillStyle=e.color;c.fillRect(16,20+b,16,16);
        c.fillRect(14,22+b,4,12);c.fillRect(30,22+b,4,12);
        c.fillRect(18,36+b,6,8);c.fillRect(26,36+b,6,8);
        c.fillStyle='#aab';c.fillRect(8,14+b,6,22);c.fillRect(6,12+b,4,4);
    } else if(type==='fire_spirit'){
        c.fillStyle=`rgba(255,100,0,${0.3+Math.sin(frame*0.4)*0.1})`;
        c.beginPath();c.arc(24,24,18+b,0,Math.PI*2);c.fill();
        c.fillStyle=e.color;c.fillRect(14,12+b,20,24);c.fillRect(10,16+b,28,16);
        c.fillStyle=e.color2;c.fillRect(16,14+b,16,18);
        c.fillStyle=P.yel;c.fillRect(18,18+b,4,4);c.fillRect(26,18+b,4,4);
        c.fillStyle=P.yelL;
        for(let i=0;i<3;i++){
            const fx=14+i*8;const fy=8+Math.sin(frame*0.8+i)*4+b;
            c.fillRect(fx,fy,4,6);
        }
    } else if(type==='golem'){
        c.fillStyle=e.color2;c.fillRect(10,12+b,28,30);
        c.fillStyle=e.color;c.fillRect(12,10+b,24,28);c.fillRect(14,8+b,20,6);
        c.fillStyle=P.or;c.fillRect(18,16+b,4,4);c.fillRect(26,16+b,4,4);
        c.fillStyle=e.color2;c.fillRect(20,24+b,8,3);
        c.fillRect(6,16+b,8,18);c.fillRect(34,16+b,8,18);
        c.fillRect(14,38+b,8,8);c.fillRect(26,38+b,8,8);
    } else if(type==='dark_mage'){
        c.fillStyle=e.color;c.fillRect(12,16+b,24,26);
        c.fillStyle=e.color2;c.fillRect(14,16+b,20,3);
        c.fillStyle='#ddccff';c.fillRect(14,4+b,20,14);
        c.fillStyle=e.color;c.fillRect(10,-2+b,28,8);c.fillRect(14,-4+b,20,6);
        c.fillStyle=P.purL;c.fillRect(22,-3+b,4,4);
        c.fillStyle='#ff33ff';c.fillRect(18,9+b,3,3);c.fillRect(27,9+b,3,3);
        c.fillStyle=P.purL;c.fillRect(6,10+b,3,28);c.fillRect(4,6+b,7,6);
        c.fillStyle='#ff33ff';c.fillRect(5,4+b,5,4);
    } else if(type==='dragon'){
        c.fillStyle=e.color2;c.fillRect(6,8+b,36,30);
        c.fillStyle=e.color;c.fillRect(8,6+b,32,28);c.fillRect(12,4+b,24,8);
        c.fillStyle=P.yel;c.fillRect(16,10+b,6,6);c.fillRect(26,10+b,6,6);
        c.fillStyle='#000';c.fillRect(18,12+b,3,3);c.fillRect(28,12+b,3,3);
        c.fillStyle=e.color2;c.fillRect(14,22+b,20,4);
        c.fillStyle='#fff';for(let i=0;i<5;i++)c.fillRect(16+i*4,22+b,2,3);
        // Wings
        c.fillStyle=e.color;
        c.fillRect(0,4+b+Math.sin(frame)*3,10,20);
        c.fillRect(38,4+b-Math.sin(frame)*3,10,20);
        c.fillStyle=P.or;c.fillRect(18,34+b,12,4);
        // Horns
        c.fillStyle='#555';c.fillRect(14,2+b,4,6);c.fillRect(30,2+b,4,6);
    } else if(type==='crystal_guardian'){
        c.fillStyle=`rgba(100,170,238,${0.25+Math.sin(frame*0.3)*0.1})`;
        c.beginPath();c.arc(24,24,20,0,Math.PI*2);c.fill();
        c.fillStyle=e.color;c.fillRect(12,8+b,24,32);c.fillRect(8,12+b,32,24);
        c.fillStyle=e.color2;c.fillRect(14,10+b,20,28);
        c.fillStyle='#fff';c.fillRect(16,16+b,6,6);c.fillRect(26,16+b,6,6);
        c.fillStyle='#3366aa';c.fillRect(18,18+b,3,3);c.fillRect(28,18+b,3,3);
        c.fillStyle=P.cyL;
        c.fillRect(22,4+b,4,8);c.fillRect(20,4+b,2,4);c.fillRect(26,4+b,2,4);
    }
}

// ── TILE DRAWING ──
const TC={};
function drawTile(type,variant,frame){
    const k=`t${type}_${variant}_${Math.floor(frame/30)%4}`;
    if(TC[k])return TC[k];
    const cv=document.createElement('canvas');cv.width=48;cv.height=48;
    const c=cv.getContext('2d');
    const s=variant*17;
    if(type===0){
        c.fillStyle=variant%2===0?P.grass:P.grass2;c.fillRect(0,0,48,48);
        c.fillStyle=P.grassL;
        for(let i=0;i<4;i++){c.fillRect((s+i*13)%40+2,(s+i*7)%40+2,2,4);}
    }else if(type===1){
        c.fillStyle=P.path;c.fillRect(0,0,48,48);
        c.fillStyle=P.path2;
        for(let i=0;i<3;i++){c.fillRect((s+i*11)%36+4,(s+i*19)%36+4,6,3);}
    }else if(type===3){
        c.fillStyle=P.wall;c.fillRect(0,0,48,48);
        c.fillStyle=P.wall2;c.fillRect(0,0,48,4);c.fillRect(0,22,48,4);
        c.fillStyle=P.wallT;
        for(let r=0;r<4;r++){const o=(r%2)*24;for(let cl=0;cl<3;cl++)c.fillRect(o+cl*24,r*12,22,10);}
    }else if(type===4){
        c.fillStyle=variant%2===0?P.grass:P.grass2;c.fillRect(0,0,48,48);
        c.fillStyle='#5a3a1a';c.fillRect(19,28,10,18);c.fillStyle='#6a4a2a';c.fillRect(21,28,6,18);
        c.fillStyle='#1a5a1a';c.fillRect(4,6,40,26);c.fillRect(8,2,32,30);
        c.fillStyle='#228822';c.fillRect(8,8,32,20);c.fillRect(12,4,24,26);
        c.fillStyle='#33aa33';c.fillRect(14,10,20,14);
        c.fillStyle='#44cc44';c.fillRect(16,8,6,4);c.fillRect(28,12,4,4);
    }else if(type===5){
        c.fillStyle=P.roof;c.fillRect(0,8,48,40);c.fillStyle=P.roof2;
        for(let i=0;i<5;i++)c.fillRect(2+i*2,8+i*8,44-i*4,6);
        c.fillStyle=P.orD;c.fillRect(0,44,48,4);
    }else if(type===6||type==='E'){
        c.fillStyle=P.wall;c.fillRect(0,0,48,48);
        c.fillStyle=P.wood;c.fillRect(14,10,20,38);c.fillStyle=P.wood2;c.fillRect(16,12,16,34);
        c.fillStyle=P.yel;c.fillRect(28,28,3,3);
        c.fillStyle=P.wallT;c.fillRect(10,6,28,6);
        if(type==='E'){c.fillStyle=P.or;c.fillRect(10,2,28,4);c.fillStyle=P.yel;c.fillRect(18,2,12,4);}
    }else if(type===7){
        c.fillStyle=P.wall;c.fillRect(0,0,48,48);
        c.fillStyle=P.wood;c.fillRect(10,10,28,28);
        c.fillStyle='#446688';c.fillRect(13,13,10,10);c.fillRect(25,13,10,10);c.fillRect(13,25,10,10);c.fillRect(25,25,10,10);
        c.fillStyle='#668899';c.fillRect(14,14,4,4);c.fillRect(26,14,4,4);
    }else if(type===8){
        c.fillStyle=variant%2===0?P.grass:P.grass2;c.fillRect(0,0,48,48);
        const cols=['#ff6688','#ffaa44','#aa66ff','#66aaff'];
        c.fillStyle=cols[variant%4];c.fillRect(20,18,8,8);c.fillRect(18,20,12,4);c.fillRect(22,16,4,12);
        c.fillStyle=P.yel;c.fillRect(22,20,4,4);
        c.fillStyle='#226622';c.fillRect(23,28,2,14);
    }else if(type==='C'){
        c.fillStyle=P.sand;c.fillRect(0,0,48,48);
        c.fillStyle=P.sand2;
        for(let i=0;i<3;i++)c.fillRect((s+i*11)%38+4,(s+i*17)%38+4,8,4);
    }
    TC[k]=cv;return cv;
}

function drawLavaCanvas(sx,sy){
    ctx.fillStyle=P.lava;ctx.fillRect(sx,sy,48,48);
    ctx.fillStyle=P.lava2;
    const w=Math.sin(G.tick*0.04)*4;
    for(let i=0;i<3;i++)ctx.fillRect(sx,sy+8+i*14+Math.sin(w+i)*3,48,4);
    ctx.fillStyle=P.lavaL;
    ctx.fillRect(sx+10+Math.sin(G.tick*0.03)*5,sy+6,6,3);
    ctx.fillRect(sx+30-Math.sin(G.tick*0.04)*4,sy+24,8,3);
}

function drawWaterCanvas(sx,sy){
    ctx.fillStyle=P.water;ctx.fillRect(sx,sy,48,48);
    ctx.fillStyle=P.water2;
    const w=Math.sin(G.tick*0.04)*4;
    for(let i=0;i<4;i++)ctx.fillRect(sx,sy+10+i*12+Math.sin(w+i)*3,48,3);
    ctx.fillStyle=P.waterL;
    ctx.fillRect(sx+10+Math.sin(G.tick*0.02)*5,sy+8,8,2);
}

function drawPortalCanvas(sx,sy){
    const pu=Math.sin(G.tick*0.05)*0.3+0.7;
    ctx.fillStyle=`rgba(106,58,170,${pu*0.4})`;ctx.fillRect(sx+4,sy+4,40,40);
    ctx.strokeStyle=P.pur;ctx.lineWidth=3;ctx.beginPath();ctx.arc(sx+24,sy+24,18,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=`rgba(136,85,204,${pu*0.6})`;ctx.beginPath();ctx.arc(sx+24,sy+24,13,0,Math.PI*2);ctx.fill();
    for(let i=0;i<6;i++){
        const a=(G.tick*0.04)+(i*Math.PI/3);const r=9+Math.sin(G.tick*0.06+i)*3;
        ctx.fillStyle=i%2===0?P.purL:P.cyL;
        ctx.fillRect(sx+24+Math.cos(a)*r-1,sy+24+Math.sin(a)*r-1,3,3);
    }
    ctx.fillStyle=`rgba(255,255,255,${pu})`;ctx.fillRect(sx+22,sy+22,4,4);
}

function drawSignCanvas(sx,sy){
    const c=ctx;
    c.fillStyle='#6a4a2a';c.fillRect(sx+21,sy+24,6,22);
    c.fillStyle='#8a6a3a';c.fillRect(sx+6,sy+6,36,20);
    c.fillStyle='#9a7a4a';c.fillRect(sx+8,sy+8,32,16);
    c.fillStyle='#443322';c.fillRect(sx+12,sy+12,24,2);c.fillRect(sx+12,sy+16,18,2);c.fillRect(sx+12,sy+20,22,2);
}

function drawChestCanvas(sx,sy,opened){
    const c=ctx;
    c.fillStyle='#664422';c.fillRect(sx+8,sy+20,32,22);
    c.fillStyle='#885533';c.fillRect(sx+10,sy+22,28,18);
    if(!opened){
        c.fillStyle='#775533';c.fillRect(sx+6,sy+14,36,10);
        c.fillStyle='#886644';c.fillRect(sx+8,sy+16,32,6);
        c.fillStyle=P.yel;c.fillRect(sx+21,sy+18,6,8);
        c.fillStyle=P.orD;c.fillRect(sx+23,sy+20,2,4);
    }else{
        c.fillStyle='#775533';c.fillRect(sx+6,sy+6,36,10);
        c.fillStyle='rgba(255,204,0,0.4)';c.fillRect(sx+12,sy+22,24,12);
    }
}

// ── PIXEL TEXT ──
function pxText(text,x,y,color,size=8){
    ctx.fillStyle=color;ctx.font=`${size}px "Press Start 2P",monospace`;
    ctx.fillText(text,Math.floor(x),Math.floor(y));
}

// ── PARTICLES ──
function spawnP(x,y,color,vx,vy,life,size=2){
    G.particles.push({x,y,color,vx,vy,life,maxLife:life,size});
}
function spawnGoldFX(x,y){
    for(let i=0;i<10;i++){
        const a=(Math.PI*2/10)*i;
        spawnP(x+24,y+24,Math.random()>0.5?P.gold:P.yel,Math.cos(a)*(1+Math.random()*2),Math.sin(a)*(1+Math.random()*2),35+Math.random()*15,2+Math.random()*2);
    }
}

// ── NOTIFICATIONS ──
function notify(text,color=P.wh,dur=180){G.notifications.push({text,color,dur,maxDur:dur});}

// ── MAP HELPERS ──
function getMap(){return Maps[G.currentMap];}
function getTile(d,w,x,y,h){if(x<0||y<0||x>=w||y>=h)return 3;return d[y*w+x];}
function isSolid(t){return t===2||t===3||t===4||t===5||t===7||t==='D';}
function checkCol(x,y){
    const m=getMap();
    const pts=[{x:x+10,y:y+26},{x:x+38,y:y+26},{x:x+10,y:y+44},{x:x+38,y:y+44}];
    for(const p of pts){
        const tx=Math.floor(p.x/TILE),ty=Math.floor(p.y/TILE);
        if(isSolid(getTile(m.data,m.width,tx,ty,m.height)))return true;
    }
    return false;
}

// ── SAVE / LOAD ──
function saveGame(){
    const data={
        player:{x:Player.x,y:Player.y,hp:Player.hp,mp:Player.mp,maxHp:Player.maxHp,maxMp:Player.maxMp,
                atk:Player.atk,def:Player.def,level:Player.level,exp:Player.exp,expNext:Player.expNext,
                equippedWeapon:Player.equippedWeapon,equippedArmor:Player.equippedArmor,
                equippedAccessory:Player.equippedAccessory,inventory:[...Player.inventory]},
        game:{gold:G.gold,currentMap:G.currentMap,mimoApiKey:G.mimoApiKey,settings:{...G.settings}},
        maps:{},
    };
    for(const [name,map] of Object.entries(Maps)){
        data.maps[name]={
            tokens:map.tokens.map(t=>({...t})),
            chests:map.chests.map(c=>({...c})),
        };
    }
    localStorage.setItem('aetheria_save',JSON.stringify(data));
    notify('Game Saved!',P.green);
}

function loadGame(){
    const raw=localStorage.getItem('aetheria_save');
    if(!raw)return false;
    try{
        const data=JSON.parse(raw);
        Object.assign(Player,data.player);
        G.gold=data.game.gold;G.currentMap=data.game.currentMap;
        if(data.game.mimoApiKey){G.mimoApiKey=data.game.mimoApiKey;G.mimoEnabled=true;}
        if(data.game.settings)Object.assign(G.settings,data.game.settings);
        for(const [name,saved] of Object.entries(data.maps)){
            if(Maps[name]){
                Maps[name].tokens=saved.tokens;
                Maps[name].chests=saved.chests;
            }
        }
        G.cam.x=Player.x-W/2;G.cam.y=Player.y-H/2;
        return true;
    }catch(e){return false;}
}

function hasSave(){return !!localStorage.getItem('aetheria_save');}

function newGame(){
    Player.x=0;Player.y=0;Player.hp=100;Player.maxHp=100;Player.mp=30;Player.maxMp=30;
    Player.atk=8;Player.def=4;Player.level=1;Player.exp=0;Player.expNext=50;
    Player.equippedWeapon=null;Player.equippedArmor=null;Player.equippedAccessory=null;
    Player.inventory=['hp_potion','hp_potion'];Player.buffs=[];Player.dir='down';Player.frame=0;
    G.gold=50;G.currentMap='village';G.particles=[];G.notifications=[];
    // Reset maps
    for(const map of Object.values(Maps)){
        for(const t of map.tokens)t.collected=false;
        for(const c of map.chests)c.opened=false;
    }
    const m=getMap();
    Player.x=m.playerSpawn.x*TILE;Player.y=m.playerSpawn.y*TILE;
    G.cam.x=Player.x-W/2;G.cam.y=Player.y-H/2;
}

// ── MIMO API ──
async function callMiMo(prompt,sys){
    if(!G.mimoEnabled||!G.mimoApiKey)return null;
    try{
        const r=await fetch('https://api.xiaomimimo.com/v1/chat/completions',{
            method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${G.mimoApiKey}`},
            body:JSON.stringify({model:'mimo-v2.5',messages:[{role:'system',content:sys},{role:'user',content:prompt}],max_tokens:150,temperature:0.8}),
        });
        if(!r.ok)throw new Error();
        const d=await r.json();return d.choices[0].message.content;
    }catch(e){return null;}
}

// ── BATTLE SYSTEM ──
function startBattle(enemyType){
    const template=EnemyDB[enemyType];
    Battle.enemy={...template,type:enemyType};
    Battle.turn='player';Battle.log=[`A wild ${template.name} appears!`];
    Battle.state='action';Battle.selectedAction=0;Battle.turnCount=0;
    Battle.playerAnim='idle';Battle.enemyAnim='idle';
    Battle.reward={gold:template.goldDrop+Math.floor(Math.random()*10),exp:template.exp,item:null};
    G.battleActive=true;G.state='battle';
    // AI commentary
    if(G.mimoEnabled){
        callMiMo(`Player (Lv${Player.level}, ${Player.hp}HP) encounters ${template.name} (${template.hp}HP). Give a brief exciting battle commentary.`,
            "You are a dramatic RPG battle narrator. Keep responses to 1 sentence."
        ).then(r=>{if(r)Battle.aiCommentary=r;});
    }
}

function battleAction(action){
    if(Battle.state!=='action'||Battle.turn!=='player')return;
    if(action==='Attack'){
        const dmg=Math.max(1,Player.totalAtk()-Battle.enemy.def+Math.floor(Math.random()*4));
        Battle.enemy.hp=Math.max(0,Battle.enemy.hp-dmg);
        Battle.log.push(`You dealt ${dmg} damage!`);
        Battle.playerAnim='attack';
        G.screenShake.i=4;
        setTimeout(()=>{Battle.playerAnim='idle';},300);
        if(Battle.enemy.hp<=0){endBattle(true);return;}
        setTimeout(()=>enemyTurn(),600);
    }else if(action==='Magic'){
        if(Player.mp<10){Battle.log.push("Not enough MP!");return;}
        Player.mp-=10;
        const dmg=Math.max(1,Player.totalAtk()*1.5-Battle.enemy.def/2+Math.floor(Math.random()*6));
        Battle.enemy.hp=Math.max(0,Battle.enemy.hp-Math.floor(dmg));
        Battle.log.push(`Magic blast for ${Math.floor(dmg)} damage! (-10 MP)`);
        Battle.playerAnim='magic';
        G.screenShake.i=6;
        for(let i=0;i<8;i++)spawnP(W/2+200+Math.random()*80,H/2-50+Math.random()*100,P.cyL,(Math.random()-0.5)*3,(Math.random()-0.5)*3,30,3);
        setTimeout(()=>{Battle.playerAnim='idle';},400);
        if(Battle.enemy.hp<=0){endBattle(true);return;}
        setTimeout(()=>enemyTurn(),700);
    }else if(action==='Item'){
        const potions=Player.inventory.filter(id=>ItemDB[id]&&ItemDB[id].type==='potion');
        if(potions.length===0){Battle.log.push("No potions available!");return;}
        const pid=potions[0];const item=ItemDB[pid];
        Player.inventory.splice(Player.inventory.indexOf(pid),1);
        if(item.heal){Player.hp=Math.min(Player.maxHp,Player.hp+item.heal);Battle.log.push(`Used ${item.name}! +${item.heal} HP`);}
        else if(item.healMp){Player.mp=Math.min(Player.maxMp,Player.mp+item.healMp);Battle.log.push(`Used ${item.name}! +${item.healMp} MP`);}
        else if(item.buffAtk){Player.buffs.push({atk:item.buffAtk,turns:item.duration});Battle.log.push(`Used ${item.name}! +${item.buffAtk} ATK`);}
        else if(item.buffDef){Player.buffs.push({def:item.buffDef,turns:item.duration});Battle.log.push(`Used ${item.name}! +${item.buffDef} DEF`);}
        setTimeout(()=>enemyTurn(),500);
    }else if(action==='Flee'){
        if(Math.random()<0.5){
            Battle.log.push("You fled successfully!");
            setTimeout(()=>{G.battleActive=false;G.state='playing';},800);
            return;
        }else{
            Battle.log.push("Couldn't escape!");
            setTimeout(()=>enemyTurn(),500);
        }
    }
    Battle.turn='enemy';
}

function enemyTurn(){
    if(!Battle.enemy||Battle.enemy.hp<=0)return;
    const dmg=Math.max(1,Battle.enemy.atk-Player.totalDef()+Math.floor(Math.random()*3));
    Player.hp=Math.max(0,Player.hp-dmg);
    Battle.log.push(`${Battle.enemy.name} dealt ${dmg} damage!`);
    Battle.enemyAnim='attack';
    G.screenShake.i=3;
    setTimeout(()=>{Battle.enemyAnim='idle';},300);
    if(Player.hp<=0){endBattle(false);return;}
    // Tick buffs
    for(let i=Player.buffs.length-1;i>=0;i--){
        Player.buffs[i].turns--;
        if(Player.buffs[i].turns<=0)Player.buffs.splice(i,1);
    }
    Battle.turn='player';Battle.state='action';Battle.turnCount++;
}

function endBattle(won){
    if(won){
        Battle.state='victory';
        Battle.log.push(`${Battle.enemy.name} defeated!`);
        G.gold+=Battle.reward.gold;
        Player.exp+=Battle.reward.exp;
        Battle.log.push(`+${Battle.reward.gold} Gold, +${Battle.reward.exp} EXP`);
        // Level up check
        while(Player.exp>=Player.expNext){
            Player.exp-=Player.expNext;
            Player.level++;Player.maxHp+=12;Player.maxMp+=5;Player.atk+=2;Player.def+=1;
            Player.hp=Player.maxHp;Player.mp=Player.maxMp;
            Player.expNext=Math.floor(Player.expNext*1.4);
            Battle.log.push(`LEVEL UP! Now Lv${Player.level}!`);
            notify(`Level Up! Now Level ${Player.level}!`,P.yel);
        }
        // Random item drop
        if(Math.random()<0.25){
            const drops=['hp_potion','mp_potion','antidote','hp_potion_lg'];
            const drop=drops[Math.floor(Math.random()*drops.length)];
            Player.inventory.push(drop);
            Battle.log.push(`Found: ${ItemDB[drop].name}!`);
        }
        setTimeout(()=>{G.battleActive=false;G.state='playing';},2000);
    }else{
        Battle.state='defeat';
        Battle.log.push("You were defeated...");
        setTimeout(()=>{
            G.battleActive=false;G.state='playing';
            Player.hp=Math.floor(Player.maxHp*0.3);Player.mp=Math.floor(Player.maxMp*0.3);
            const lost=Math.floor(G.gold*0.2);G.gold-=lost;
            const m=Maps.village;
            G.currentMap='village';Player.x=m.playerSpawn.x*TILE;Player.y=m.playerSpawn.y*TILE;
            notify(`Defeated! Lost ${lost} gold. Returned to village.`,P.red);
        },2500);
    }
}

// ── DIALOG ──
function startDialog(npc){
    Dialog.active=true;Dialog.speaker=npc.name;Dialog.type=npc.type;
    Dialog.cur=0;Dialog.charIdx=0;Dialog.charTimer=0;Dialog.waitInput=false;
    if(G.mimoEnabled&&npc.aiPrompt){
        Dialog.lines=[npc.dialog[0],"...thinking with MiMo AI..."];Dialog.isAiTyping=true;
        G.state='dialog';
        callMiMo(`Player (Lv${Player.level}, ${G.gold} gold) approached you. Greet them.`,npc.aiPrompt).then(r=>{
            Dialog.lines=r?[r]:[...npc.dialog];Dialog.cur=0;Dialog.charIdx=0;Dialog.isAiTyping=false;
        });
    }else{Dialog.lines=[...npc.dialog];G.state='dialog';}
}

function startSignDialog(sign){
    Dialog.active=true;Dialog.speaker='Sign';Dialog.type='sign';
    Dialog.lines=sign.text.split('\n');Dialog.cur=0;Dialog.charIdx=0;Dialog.charTimer=0;Dialog.waitInput=false;
    G.state='dialog';
}

// ── CAMERA ──
function updateCamera(){
    const m=getMap();
    const tx=Player.x-W/2+24,ty=Player.y-H/2+24;
    G.cam.x+=(tx-G.cam.x)*0.1;G.cam.y+=(ty-G.cam.y)*0.1;
    G.cam.x=Math.max(0,Math.min(m.width*TILE-W,G.cam.x));
    G.cam.y=Math.max(0,Math.min(m.height*TILE-H,G.cam.y));
}

// ── UPDATE FUNCTIONS ──
function updatePlayer(){
    if(G.state!=='playing')return;
    let dx=0,dy=0;
    if(kd('ArrowLeft')||kd('a')||kd('A')){dx=-1;Player.dir='left';}
    if(kd('ArrowRight')||kd('d')||kd('D')){dx=1;Player.dir='right';}
    if(kd('ArrowUp')||kd('w')||kd('W')){dy=-1;Player.dir='up';}
    if(kd('ArrowDown')||kd('s')||kd('S')){dy=1;Player.dir='down';}
    if(dx&&dy){dx*=0.707;dy*=0.707;}
    Player.moving=dx!==0||dy!==0;
    const nx=Player.x+dx*2.8,ny=Player.y+dy*2.8;
    if(!checkCol(nx,Player.y))Player.x=nx;
    if(!checkCol(Player.x,ny))Player.y=ny;
    if(Player.moving){Player.animTimer+=16;if(Player.animTimer>=140){Player.animTimer=0;Player.frame=(Player.frame+1)%4;}}
    else Player.frame=0;
    // Footsteps
    if(Player.moving&&G.tick%12===0)spawnP(Player.x+20+Math.random()*8,Player.y+44,'rgba(150,150,150,0.4)',(Math.random()-0.5)*0.5,-0.3,15,2);
    // Enemy encounter check
    const m=getMap();
    const ptx=Math.floor((Player.x+24)/TILE),pty=Math.floor((Player.y+24)/TILE);
    const tile=getTile(m.data,m.width,ptx,pty,m.height);
    if(tile==='F'&&Player.moving&&Math.random()<(m.enemyRate||0.05)){
        const enemies=m.enemies||['slime'];
        startBattle(enemies[Math.floor(Math.random()*enemies.length)]);
    }
}

function updateInteraction(){
    if(G.state!=='playing')return;
    const m=getMap();const px=Math.floor((Player.x+24)/TILE),py=Math.floor((Player.y+24)/TILE);
    if(jp('e')||jp('E')||jp(' ')){
        for(const npc of m.npcs){if(Math.abs(npc.x-px)+Math.abs(npc.y-py)<=2){startDialog(npc);return;}}
        if(m.signs)for(const s of m.signs){if(Math.abs(s.x-px)+Math.abs(s.y-py)<=2){startSignDialog(s);return;}}
        for(const ch of m.chests){
            if(Math.abs(ch.x-px)+Math.abs(ch.y-py)<=2&&!ch.opened){
                ch.opened=true;G.gold+=ch.gold;
                if(ch.reward)Player.inventory.push(ch.reward);
                spawnGoldFX(ch.x*TILE,ch.y*TILE);
                G.screenShake.i=5;
                notify(`Found: ${ch.reward?ItemDB[ch.reward].name:'treasure'}! +${ch.gold} Gold`,P.gold);return;
            }
        }
        if(m.portals)for(const p of m.portals){
            if(Math.abs(p.x-px)+Math.abs(p.y-py)<=1){
                G.transition.active=true;G.transition.alpha=0;G.transition.dir='out';
                G.transition.cb=()=>{
                    G.currentMap=p.target;Player.x=p.sx*TILE;Player.y=p.sy*TILE;
                    G.cam.x=Player.x-W/2;G.cam.y=Player.y-H/2;
                    notify(`Entered: ${Maps[p.target].name}`,P.purL);
                };return;
            }
        }
    }
    // Auto-collect gold
    for(const t of m.tokens){
        if(t.collected)continue;
        const dist=Math.hypot((t.x*TILE+24)-(Player.x+24),(t.y*TILE+24)-(Player.y+24));
        if(dist<36){t.collected=true;G.gold+=t.gold;spawnGoldFX(t.x*TILE,t.y*TILE);G.screenShake.i=3;notify(`+${t.gold} Gold! (Total: ${G.gold})`,P.gold);}
    }
    // Shop open (near merchant)
    if(jp('b')||jp('B')){
        for(const npc of m.npcs){
            if(npc.type==='merchant'&&Math.abs(npc.x-px)+Math.abs(npc.y-py)<=3){
                G.shopOpen=true;G.state='shop';G.shopSel=0;G.shopCat=0;return;
            }
        }
        // Near shop door
        const tile=getTile(m.data,m.width,px,py,m.height);
        if(tile==='E'||getTile(m.data,m.width,px,py-1,m.height)==='E'||getTile(m.data,m.width,px,py+1,m.height)==='E'){
            G.shopOpen=true;G.state='shop';G.shopSel=0;G.shopCat=0;return;
        }
    }
}

function updateDialog(){
    if(G.state!=='dialog'||Dialog.isAiTyping)return;
    const line=Dialog.lines[Dialog.cur]||'';
    if(!Dialog.waitInput){Dialog.charTimer+=16;if(Dialog.charTimer>=Dialog.speed){Dialog.charTimer=0;Dialog.charIdx++;if(Dialog.charIdx>=line.length)Dialog.waitInput=true;}}
    if(jp('e')||jp('E')||jp(' ')||jp('Enter')){
        if(!Dialog.waitInput){Dialog.charIdx=line.length;Dialog.waitInput=true;}
        else{Dialog.cur++;Dialog.charIdx=0;Dialog.charTimer=0;Dialog.waitInput=false;
            if(Dialog.cur>=Dialog.lines.length){Dialog.active=false;G.state='playing';}}
    }
}

function updateShop(){
    if(G.state!=='shop')return;
    const cats=Object.keys(ShopCatalog);
    const items=ShopCatalog[cats[G.shopCat]];
    if(jp('ArrowLeft')||jp('a')||jp('A')){G.shopCat=(G.shopCat-1+cats.length)%cats.length;G.shopSel=0;}
    if(jp('ArrowRight')||jp('d')||jp('D')){G.shopCat=(G.shopCat+1)%cats.length;G.shopSel=0;}
    if(jp('ArrowUp')||jp('w')||jp('W'))G.shopSel=Math.max(0,G.shopSel-1);
    if(jp('ArrowDown')||jp('s')||jp('S'))G.shopSel=Math.min(items.length-1,G.shopSel+1);
    if(jp('e')||jp('E')||jp(' ')||jp('Enter')){
        const itemId=items[G.shopSel];const item=ItemDB[itemId];
        if(G.gold>=item.price){
            G.gold-=item.price;Player.inventory.push(itemId);
            notify(`Bought ${item.name}! (-${item.price}G)`,P.green);
        }else notify('Not enough gold!',P.red);
    }
    if(jp('Escape')||jp('b')||jp('B')){G.shopOpen=false;G.state='playing';}
}

function updateInventory(){
    if(G.state!=='inventory')return;
    if(jp('ArrowUp')||jp('w')||jp('W'))G.invSel=Math.max(0,G.invSel-1);
    if(jp('ArrowDown')||jp('s')||jp('S'))G.invSel=Math.min(Player.inventory.length-1,G.invSel+1);
    if(jp('e')||jp('E')||jp(' ')||jp('Enter')){
        if(Player.inventory.length===0)return;
        const id=Player.inventory[G.invSel];const item=ItemDB[id];
        if(item.type==='weapon'){Player.equippedWeapon=id;notify(`Equipped: ${item.name}`,P.or);}
        else if(item.type==='armor'){Player.equippedArmor=id;notify(`Equipped: ${item.name}`,P.blue);}
        else if(item.type==='accessory'){Player.equippedAccessory=id;notify(`Equipped: ${item.name}`,P.purL);}
        else if(item.type==='potion'&&!G.battleActive){
            Player.inventory.splice(G.invSel,1);
            if(item.heal){Player.hp=Math.min(Player.maxHp,Player.hp+item.heal);notify(`Used ${item.name}! +${item.heal} HP`,P.green);}
            else if(item.healMp){Player.mp=Math.min(Player.maxMp,Player.mp+item.healMp);notify(`Used ${item.name}! +${item.healMp} MP`,P.blue);}
            if(G.invSel>=Player.inventory.length)G.invSel=Math.max(0,Player.inventory.length-1);
        }
    }
    if(jp('Escape')||jp('i')||jp('I')){G.inventoryOpen=false;G.state='playing';}
}

function updateBattle(){
    if(G.state!=='battle')return;
    if(Battle.state==='action'&&Battle.turn==='player'){
        if(jp('ArrowUp')||jp('w')||jp('W'))Battle.selectedAction=(Battle.selectedAction-1+4)%4;
        if(jp('ArrowDown')||jp('s')||jp('S'))Battle.selectedAction=(Battle.selectedAction+1)%4;
        if(jp('1'))battleAction('Attack');
        if(jp('2'))battleAction('Magic');
        if(jp('3'))battleAction('Item');
        if(jp('4'))battleAction('Flee');
        if(jp('e')||jp('E')||jp(' ')||jp('Enter'))battleAction(BATTLE_ACTIONS[Battle.selectedAction]);
    }
}

function updateSettings(){
    if(G.state!=='settings')return;
    const opts=['AI Enhancement','Difficulty','Back'];
    if(jp('ArrowUp')||jp('w')||jp('W'))G.settingsSel=(G.settingsSel-1+opts.length)%opts.length;
    if(jp('ArrowDown')||jp('s')||jp('S'))G.settingsSel=(G.settingsSel+1)%opts.length;
    if(jp('e')||jp('E')||jp(' ')||jp('Enter')){
        if(G.settingsSel===0)document.getElementById('apiKeyModal').classList.add('active');
        else if(G.settingsSel===1){
            const diffs=['easy','normal','hard'];const ci=diffs.indexOf(G.settings.difficulty);
            G.settings.difficulty=diffs[(ci+1)%3];
            notify(`Difficulty: ${G.settings.difficulty.toUpperCase()}`,P.or);
        }
        else if(G.settingsSel===2){G.settingsOpen=false;G.state=G.menuOpen?'menu':'playing';}
    }
    if(jp('Escape')){G.settingsOpen=false;G.state=G.menuOpen?'menu':'playing';}
}

function handleKeys(){
    if(G.state==='mainmenu'||G.state==='loading')return;
    if(jp('Escape')){
        if(G.settingsOpen){G.settingsOpen=false;G.state='playing';}
        else if(G.shopOpen){G.shopOpen=false;G.state='playing';}
        else if(G.inventoryOpen){G.inventoryOpen=false;G.state='playing';}
        else if(G.battleActive){}
        else if(Dialog.active){Dialog.active=false;G.state='playing';}
        else if(G.menuOpen){G.menuOpen=false;G.state='playing';}
        else{G.menuOpen=true;G.state='menu';G.menuSel=0;}
    }
    if(G.state==='playing'){
        if(jp('i')||jp('I')){G.inventoryOpen=true;G.state='inventory';G.invSel=0;}
        if(jp('p')||jp('P'))document.getElementById('apiKeyModal').classList.add('active');
    }
    if(G.state==='menu'){
        const items=['Resume','Save Game','Settings','MiMo API','Quit to Title'];
        if(jp('ArrowUp')||jp('w')||jp('W'))G.menuSel=(G.menuSel-1+items.length)%items.length;
        if(jp('ArrowDown')||jp('s')||jp('S'))G.menuSel=(G.menuSel+1)%items.length;
        if(jp('e')||jp('E')||jp(' ')||jp('Enter')){
            if(G.menuSel===0){G.menuOpen=false;G.state='playing';}
            else if(G.menuSel===1){saveGame();G.menuOpen=false;G.state='playing';}
            else if(G.menuSel===2){G.settingsOpen=true;G.state='settings';G.settingsSel=0;}
            else if(G.menuSel===3)document.getElementById('apiKeyModal').classList.add('active');
            else if(G.menuSel===4){G.menuOpen=false;G.state='mainmenu';G.mainMenuSel=0;}
        }
    }
}

// ── RENDERING ──
function renderMap(){
    const m=getMap();
    const sc=Math.max(0,Math.floor(G.cam.x/TILE));const sr=Math.max(0,Math.floor(G.cam.y/TILE));
    const ec=Math.min(m.width,sc+COLS+2);const er=Math.min(m.height,sr+ROWS+2);
    for(let y=sr;y<er;y++)for(let x=sc;x<ec;x++){
        const t=getTile(m.data,m.width,x,y,m.height);
        const sx=x*TILE-G.cam.x+G.screenShake.x;const sy=y*TILE-G.cam.y+G.screenShake.y;
        const v=(x*7+y*13)%4;
        if(typeof t==='string'){
            ctx.drawImage(drawTile(0,v,G.tick),sx,sy);
            if(t==='A')drawSignCanvas(sx,sy);
            else if(t==='B')drawPortalCanvas(sx,sy);
            else if(t==='D')drawLavaCanvas(sx,sy);
            else if(t==='E')ctx.drawImage(drawTile('E',v,G.tick),sx,sy);
            else if(t==='F'){} // invisible enemy zone
        }else if(t===9){
            ctx.drawImage(drawTile(0,v,G.tick),sx,sy);
            const ch=m.chests.find(c=>c.x===x&&c.y===y);
            drawChestCanvas(sx,sy,ch?.opened);
        }else if(t===2)drawWaterCanvas(sx,sy);
        else ctx.drawImage(drawTile(t,v,G.tick),sx,sy);
    }
}

function renderGold(){
    const m=getMap();
    for(const t of m.tokens){
        if(t.collected)continue;
        const sx=t.x*TILE-G.cam.x+G.screenShake.x;const sy=t.y*TILE-G.cam.y+G.screenShake.y;
        const fy=Math.sin(G.tick*0.06+t.x)*4;
        const gl=18+Math.sin(G.tick*0.04)*3;
        ctx.fillStyle='rgba(255,215,0,0.12)';ctx.beginPath();ctx.arc(sx+24,sy+24+fy,gl,0,Math.PI*2);ctx.fill();
        ctx.drawImage(genAnim('gold',drawGold,G.tick*0.06),sx,sy+fy);
    }
}

function renderNPCs(){
    const m=getMap();
    for(const npc of m.npcs){
        const sx=npc.x*TILE-G.cam.x+G.screenShake.x;const sy=npc.y*TILE-G.cam.y+G.screenShake.y;
        ctx.drawImage(genAnim(`npc_${npc.type}`,(c,f)=>drawNPC(c,npc.type,f),G.tick*0.03),sx,sy);
        const nw=npc.name.length*5+8;
        ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(sx+24-nw/2,sy-10,nw,10);
        pxText(npc.name,sx+24-nw/2+4,sy-3,P.wh,6);
        if(G.mimoEnabled){ctx.fillStyle=P.or;ctx.fillRect(sx+24+nw/2,sy-10,14,10);pxText('AI',sx+24+nw/2+1,sy-3,P.wh,5);}
        const px=Math.floor((Player.x+24)/TILE),py=Math.floor((Player.y+24)/TILE);
        if(Math.abs(npc.x-px)+Math.abs(npc.y-py)<=2){
            const bounce=Math.sin(G.tick*0.1)*3;
            pxText('[E] Talk',sx+8,sy-18+bounce,P.yel,6);
        }
    }
}

function renderPlayerSprite(){
    const sx=Player.x-G.cam.x+G.screenShake.x;const sy=Player.y-G.cam.y+G.screenShake.y;
    ctx.drawImage(genAnim(`pl_${Player.dir}`,(c,f)=>drawPlayer(c,f,Player.dir),Player.frame),sx,sy);
}

function renderParticles(){
    for(const p of G.particles){
        ctx.globalAlpha=p.life/p.maxLife;ctx.fillStyle=p.color;
        ctx.fillRect(p.x-G.cam.x+G.screenShake.x,p.y-G.cam.y+G.screenShake.y,p.size,p.size);
    }
    ctx.globalAlpha=1;
}

function renderHUD(){
    // Gold (top right)
    ctx.fillStyle='rgba(10,10,30,0.85)';ctx.fillRect(W-220,8,212,55);
    ctx.strokeStyle=P.gold;ctx.lineWidth=1;ctx.strokeRect(W-220,8,212,55);
    ctx.fillStyle=P.gold;ctx.fillRect(W-210,16,14,14);ctx.fillStyle=P.goldD;ctx.fillRect(W-207,19,8,2);ctx.fillRect(W-205,19,2,6);
    pxText(`${G.gold} G`,W-190,28,P.gold,10);
    // HP bar
    ctx.fillStyle='rgba(255,50,50,0.2)';ctx.fillRect(W-210,38,195,8);
    ctx.fillStyle=P.red;ctx.fillRect(W-210,38,195*(Player.hp/Player.maxHp),8);
    pxText(`HP ${Player.hp}/${Player.maxHp}`,W-210,54,P.wh,6);
    // MP bar
    ctx.fillStyle='rgba(50,50,255,0.2)';ctx.fillRect(W-100,38,85,8);
    ctx.fillStyle=P.blue;ctx.fillRect(W-100,38,85*(Player.mp/Player.maxMp),8);
    pxText(`MP ${Player.mp}/${Player.maxMp}`,W-100,54,P.cyL,6);
    // Level + map (top left)
    const mn=getMap().name;const mnw=mn.length*7+60;
    ctx.fillStyle='rgba(10,10,30,0.85)';ctx.fillRect(8,8,mnw,40);
    ctx.strokeStyle=P.pur;ctx.strokeRect(8,8,mnw,40);
    pxText(mn,18,26,P.purL,8);
    pxText(`Lv${Player.level}  EXP ${Player.exp}/${Player.expNext}`,18,42,P.gr,6);
    // MiMo status
    if(G.mimoEnabled){
        ctx.fillStyle='rgba(0,180,0,0.2)';ctx.fillRect(W/2-55,8,110,18);
        ctx.strokeStyle=P.green;ctx.strokeRect(W/2-55,8,110,18);
        pxText('MiMo AI: ON',W/2-45,20,P.green,6);
    }
    // Equipment display
    if(Player.equippedWeapon||Player.equippedArmor){
        ctx.fillStyle='rgba(10,10,30,0.7)';ctx.fillRect(8,54,180,16);
        let eqText='';
        if(Player.equippedWeapon)eqText+=`ATK:${Player.totalAtk()} `;
        if(Player.equippedArmor)eqText+=`DEF:${Player.totalDef()}`;
        pxText(eqText,14,66,P.gr,6);
    }
    // Beta watermark
    pxText('Beta 0.0.2.8',W-130,H-10,'rgba(255,107,0,0.2)',7);
    pxText('AI by Xiaomi MiMo',8,H-10,'rgba(255,107,0,0.15)',6);
}

function renderDialog(){
    if(!Dialog.active)return;
    const by=H-150;
    ctx.fillStyle='rgba(10,10,30,0.92)';ctx.fillRect(20,by,W-40,130);
    ctx.strokeStyle=P.or;ctx.lineWidth=2;ctx.strokeRect(20,by,W-40,130);
    ctx.fillStyle=P.or;ctx.fillRect(36,by-8,Dialog.speaker.length*9+16,18);
    pxText(Dialog.speaker,44,by+5,P.wh,8);
    if(G.mimoEnabled&&Dialog.type!=='sign'){
        const bx=36+Dialog.speaker.length*9+24;
        ctx.fillStyle=P.purL;ctx.fillRect(bx,by-6,32,14);pxText('AI',bx+10,by+4,P.wh,7);
    }
    if(Dialog.isAiTyping){
        const dots='.'.repeat(Math.floor(G.tick/20)%4);
        pxText(`MiMo is thinking${dots}`,44,by+35,P.cy,8);
    }else{
        const line=Dialog.lines[Dialog.cur]||'';
        const dt=line.substring(0,Dialog.charIdx);
        const words=dt.split(' ');let cl='';let ly=0;
        for(const w of words){
            const tl=cl+(cl?' ':'')+w;
            if(tl.length*7>W-100){pxText(cl,44,by+35+ly*16,P.wh,8);cl=w;ly++;}
            else cl=tl;
        }
        pxText(cl,44,by+35+ly*16,P.wh,8);
    }
    if(Dialog.waitInput&&Math.sin(G.tick*0.1)>0)pxText('▼ Press E',W-160,by+108,P.gr,6);
    pxText(`${Dialog.cur+1}/${Dialog.lines.length}`,W-80,by+10,P.grD,6);
}

function renderShop(){
    if(!G.shopOpen)return;
    ctx.fillStyle='rgba(10,10,30,0.95)';ctx.fillRect(60,40,W-120,H-80);
    ctx.strokeStyle=P.or;ctx.lineWidth=2;ctx.strokeRect(60,40,W-120,H-80);
    pxText("ELARA'S EMPORIUM",W/2-90,72,P.or,10);
    pxText(`Gold: ${G.gold}`,W-220,72,P.gold,8);
    // Categories
    const cats=Object.keys(ShopCatalog);
    for(let i=0;i<cats.length;i++){
        const sel=G.shopCat===i;
        const cx=100+i*120;
        ctx.fillStyle=sel?'rgba(255,107,0,0.3)':'rgba(255,107,0,0.05)';
        ctx.fillRect(cx,88,110,20);
        if(sel){ctx.strokeStyle=P.or;ctx.strokeRect(cx,88,110,20);}
        pxText(cats[i].toUpperCase(),cx+6,102,sel?P.or:P.gr,7);
    }
    // Items list
    const items=ShopCatalog[cats[G.shopCat]];
    for(let i=0;i<items.length;i++){
        const itemId=items[i];const item=ItemDB[itemId];
        const iy=120+i*36;const sel=G.shopSel===i;
        ctx.fillStyle=sel?'rgba(255,107,0,0.15)':'transparent';
        ctx.fillRect(80,iy,W-180,32);
        if(sel){ctx.strokeStyle=P.or;ctx.lineWidth=1;ctx.strokeRect(80,iy,W-180,32);}
        // Icon
        ctx.fillStyle=item.color;ctx.fillRect(90,iy+6,16,16);
        pxText(item.name,116,iy+16,sel?P.wh:P.gr,7);
        pxText(`${item.price}G`,W-240,iy+16,G.gold>=item.price?P.gold:P.red,7);
        if(sel){
            pxText(item.desc,116,iy+28,P.grD,5);
            if(item.atk)pxText(`ATK +${item.atk}`,W-340,iy+16,P.or,6);
            if(item.def)pxText(`DEF +${item.def}`,W-340,iy+16,P.blue,6);
        }
    }
    pxText('[E] Buy  [←→] Category  [ESC/B] Close',100,H-60,P.grD,6);
    // MiMo branding
    pxText('100t.xiaomimimo.com',W-280,H-60,'rgba(255,107,0,0.3)',5);
}

function renderInventory(){
    if(!G.inventoryOpen)return;
    ctx.fillStyle='rgba(10,10,30,0.95)';ctx.fillRect(60,40,W-120,H-80);
    ctx.strokeStyle=P.or;ctx.lineWidth=2;ctx.strokeRect(60,40,W-120,H-80);
    pxText('INVENTORY',W/2-50,72,P.or,10);
    // Equipped
    pxText('Equipped:',90,96,P.gr,6);
    pxText(`Weapon: ${Player.equippedWeapon?ItemDB[Player.equippedWeapon].name:'None'}`,90,112,Player.equippedWeapon?P.or:P.grD,6);
    pxText(`Armor:  ${Player.equippedArmor?ItemDB[Player.equippedArmor].name:'None'}`,90,126,Player.equippedArmor?P.blue:P.grD,6);
    pxText(`Access: ${Player.equippedAccessory?ItemDB[Player.equippedAccessory].name:'None'}`,90,140,Player.equippedAccessory?P.purL:P.grD,6);
    ctx.strokeStyle=P.grD;ctx.beginPath();ctx.moveTo(80,150);ctx.lineTo(W-80,150);ctx.stroke();
    if(Player.inventory.length===0){pxText('Empty — buy items at the shop!',120,200,P.gr,7);}
    else{
        const startIdx=Math.max(0,G.invSel-8);
        for(let i=startIdx;i<Math.min(Player.inventory.length,startIdx+10);i++){
            const id=Player.inventory[i];const item=ItemDB[id];
            const iy=160+(i-startIdx)*28;const sel=G.invSel===i;
            ctx.fillStyle=sel?'rgba(255,107,0,0.15)':'transparent';ctx.fillRect(80,iy,W-180,24);
            if(sel){ctx.strokeStyle=P.or;ctx.lineWidth=1;ctx.strokeRect(80,iy,W-180,24);}
            ctx.fillStyle=item.color;ctx.fillRect(90,iy+4,12,12);
            pxText(item.name,110,iy+14,sel?P.wh:P.gr,7);
            pxText(item.type.toUpperCase(),W-240,iy+14,P.grD,5);
            if(sel)pxText(item.desc,110,iy+24,P.grD,5);
        }
    }
    pxText('[E] Use/Equip  [ESC/I] Close',100,H-60,P.grD,6);
}

function renderBattle(){
    if(!G.battleActive)return;
    // Battle background
    ctx.fillStyle='#0a0a2a';ctx.fillRect(0,0,W,H);
    // Background pattern
    for(let i=0;i<10;i++){
        ctx.fillStyle=`rgba(255,107,0,${0.02+Math.sin(G.tick*0.02+i)*0.01})`;
        ctx.fillRect(0,i*H/10,W,H/10);
    }
    // Ground
    ctx.fillStyle='#2a2040';ctx.fillRect(0,H*0.55,W,H*0.45);
    ctx.fillStyle='#352a50';ctx.fillRect(0,H*0.55,W,4);
    // Enemy
    const ex=W*0.65,ey=H*0.15;
    const eShake=Battle.enemyAnim==='attack'?Math.sin(G.tick*0.8)*8:0;
    const eHurt=Battle.playerAnim==='attack'?Math.sin(G.tick*2)*3:0;
    // Enemy sprite (scaled 2x)
    ctx.save();ctx.translate(ex+eShake+eHurt,ey);ctx.scale(2.5,2.5);
    const ec=document.createElement('canvas');ec.width=48;ec.height=48;
    drawEnemy(ec.getContext('2d'),Battle.enemy.type,G.tick*0.05);
    ctx.drawImage(ec,0,0);ctx.restore();
    // Enemy HP bar
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(ex,ey-30,120,18);
    ctx.strokeStyle=P.red;ctx.strokeRect(ex,ey-30,120,18);
    ctx.fillStyle=P.red;ctx.fillRect(ex+2,ey-28,116*(Battle.enemy.hp/Battle.enemy.maxHp),14);
    pxText(`${Battle.enemy.name}`,ex,ey-42,P.wh,7);
    pxText(`HP ${Battle.enemy.hp}/${Battle.enemy.maxHp}`,ex+4,ey-20,P.wh,6);
    // Player display
    const px=120,py=H*0.45;
    const pShake=Battle.playerAnim==='attack'?10:Battle.enemyAnim==='attack'?Math.sin(G.tick*2)*3:0;
    ctx.save();ctx.translate(px+pShake,py);ctx.scale(2,2);
    const pc=document.createElement('canvas');pc.width=48;pc.height=48;
    drawPlayer(pc.getContext('2d'),Player.frame,'right');
    ctx.drawImage(pc,0,0);ctx.restore();
    // Player stats
    ctx.fillStyle='rgba(10,10,30,0.85)';ctx.fillRect(20,H-170,280,150);
    ctx.strokeStyle=P.or;ctx.lineWidth=2;ctx.strokeRect(20,H-170,280,150);
    pxText(`Lv${Player.level} Adventurer`,30,H-152,P.or,8);
    // HP
    ctx.fillStyle='rgba(255,50,50,0.3)';ctx.fillRect(30,H-138,250,10);
    ctx.fillStyle=P.red;ctx.fillRect(30,H-138,250*(Player.hp/Player.maxHp),10);
    pxText(`HP ${Player.hp}/${Player.maxHp}`,30,H-120,P.wh,6);
    // MP
    ctx.fillStyle='rgba(50,50,255,0.3)';ctx.fillRect(30,H-112,250,8);
    ctx.fillStyle=P.blue;ctx.fillRect(30,H-112,250*(Player.mp/Player.maxMp),8);
    pxText(`MP ${Player.mp}/${Player.maxMp}`,30,H-98,P.cyL,6);
    pxText(`ATK:${Player.totalAtk()} DEF:${Player.totalDef()}`,30,H-84,P.gr,6);
    // Actions
    ctx.fillStyle='rgba(10,10,30,0.85)';ctx.fillRect(320,H-170,320,90);
    ctx.strokeStyle=P.or;ctx.lineWidth=2;ctx.strokeRect(320,H-170,320,90);
    pxText('ACTIONS',330,H-152,P.or,8);
    for(let i=0;i<4;i++){
        const sel=Battle.selectedAction===i&&Battle.state==='action'&&Battle.turn==='player';
        const ax=330+(i%2)*150,ay=H-138+(Math.floor(i/2))*25;
        if(sel){ctx.fillStyle='rgba(255,107,0,0.2)';ctx.fillRect(ax-4,ay-10,140,20);}
        pxText(`${i+1}.${BATTLE_ACTIONS[i]}`,ax,ay,sel?P.yel:P.gr,8);
    }
    // Battle log
    ctx.fillStyle='rgba(10,10,30,0.85)';ctx.fillRect(320,H-72,320,52);
    ctx.strokeStyle=P.grD;ctx.strokeRect(320,H-72,320,52);
    const logStart=Math.max(0,Battle.log.length-3);
    for(let i=logStart;i<Battle.log.length;i++){
        pxText(Battle.log[i],330,H-60+(i-logStart)*14,P.wh,6);
    }
    // AI commentary
    if(Battle.aiCommentary){
        ctx.fillStyle='rgba(106,58,170,0.2)';ctx.fillRect(20,10,W-40,24);
        pxText(Battle.aiCommentary.substring(0,80),30,26,P.purL,6);
    }
    // Victory/Defeat overlay
    if(Battle.state==='victory'){
        ctx.fillStyle='rgba(0,50,0,0.5)';ctx.fillRect(0,0,W,H);
        pxText('VICTORY!',W/2-60,H/2-40,P.yel,16);
        pxText(`+${Battle.reward.gold} Gold  +${Battle.reward.exp} EXP`,W/2-120,H/2,P.gold,8);
    }else if(Battle.state==='defeat'){
        ctx.fillStyle='rgba(50,0,0,0.5)';ctx.fillRect(0,0,W,H);
        pxText('DEFEAT',W/2-50,H/2-20,P.red,16);
        pxText('Returning to village...',W/2-90,H/2+20,P.gr,7);
    }
}

function renderMenu(){
    if(!G.menuOpen)return;
    ctx.fillStyle='rgba(10,10,30,0.95)';ctx.fillRect(0,0,W,H);
    pxText('Realm of Aetheria',W/2-110,80,P.or,14);
    pxText('PAUSED',W/2-30,110,P.gr,8);
    const items=['Resume','Save Game','Settings','MiMo API','Quit to Title'];
    for(let i=0;i<items.length;i++){
        const sel=G.menuSel===i;const iy=170+i*40;
        if(sel){ctx.fillStyle='rgba(255,107,0,0.2)';ctx.fillRect(W/2-100,iy-10,200,30);ctx.strokeStyle=P.or;ctx.strokeRect(W/2-100,iy-10,200,30);}
        pxText((sel?'> ':' ')+items[i],W/2-80,iy+8,sel?P.or:P.gr,8);
    }
    pxText('Beta 0.0.2.8 — Still Under Development',W/2-155,H-60,P.grD,6);
    pxText('AI powered by Xiaomi MiMo | 100t.xiaomimimo.com',W/2-200,H-40,P.grD,6);
}

function renderSettings(){
    if(!G.settingsOpen)return;
    ctx.fillStyle='rgba(10,10,30,0.95)';ctx.fillRect(100,80,W-200,H-160);
    ctx.strokeStyle=P.or;ctx.lineWidth=2;ctx.strokeRect(100,80,W-200,H-160);
    pxText('SETTINGS',W/2-45,115,P.or,10);
    const opts=[
        {label:'MiMo AI Enhancement',val:G.mimoEnabled?'CONNECTED':'NOT CONNECTED',col:G.mimoEnabled?P.green:P.grD},
        {label:'Difficulty',val:G.settings.difficulty.toUpperCase(),col:P.or},
        {label:'Back',val:'',col:P.gr},
    ];
    for(let i=0;i<opts.length;i++){
        const sel=G.settingsSel===i;const iy=150+i*45;
        if(sel){ctx.fillStyle='rgba(255,107,0,0.15)';ctx.fillRect(120,iy-8,W-240,35);ctx.strokeStyle=P.or;ctx.strokeRect(120,iy-8,W-240,35);}
        pxText(opts[i].label,140,iy+12,sel?P.wh:P.gr,8);
        if(opts[i].val)pxText(opts[i].val,W-360,iy+12,opts[i].col,7);
    }
    pxText('Get free API tokens: 100t.xiaomimimo.com',140,H-120,P.orD,6);
    pxText('[E] Select  [ESC] Back',140,H-100,P.grD,6);
}

function renderNotifications(){
    let oy=75;
    for(const n of G.notifications){
        const a=Math.min(1,n.dur/30);ctx.globalAlpha=a;
        const bw=n.text.length*7+20;
        ctx.fillStyle='rgba(10,10,30,0.85)';ctx.fillRect(W/2-bw/2,oy-8,bw,22);
        ctx.strokeStyle=n.color;ctx.lineWidth=1;ctx.strokeRect(W/2-bw/2,oy-8,bw,22);
        pxText(n.text,W/2-bw/2+10,oy+6,n.color,7);
        ctx.globalAlpha=1;oy+=28;
    }
}

function renderMainMenu(){
    ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);
    // Grid background
    ctx.strokeStyle='rgba(255,107,0,0.04)';ctx.lineWidth=1;
    for(let x=0;x<W;x+=48){const o=Math.sin(G.tick*0.01+x*0.02)*5;ctx.beginPath();ctx.moveTo(x+o,0);ctx.lineTo(x+o,H);ctx.stroke();}
    for(let y=0;y<H;y+=48){const o=Math.sin(G.tick*0.01+y*0.02)*5;ctx.beginPath();ctx.moveTo(0,y+o);ctx.lineTo(W,y+o);ctx.stroke();}
    // Floating particles
    for(let i=0;i<25;i++){
        const px=(G.tick*0.3+i*140)%W;const py=H/2+Math.sin(G.tick*0.02+i*0.5)*200;
        ctx.fillStyle=`rgba(255,107,0,${0.2+Math.sin(G.tick*0.03+i)*0.15})`;ctx.fillRect(px,py,3,3);
    }
    // Title
    const ly=100+Math.sin(G.tick*0.03)*5;
    ctx.fillStyle='rgba(255,107,0,0.1)';ctx.beginPath();ctx.arc(W/2,ly+10,90,0,Math.PI*2);ctx.fill();
    pxText('Realm of',W/2-60,ly-15,P.orL,10);
    pxText('Aetheria',W/2-70,ly+15,P.or,16);
    pxText('A Pixel RPG Adventure',W/2-100,ly+45,P.gr,7);
    // Menu items
    const has=hasSave();
    const items=has?['Continue','New Game','Settings']:['New Game','Settings'];
    for(let i=0;i<items.length;i++){
        const sel=G.mainMenuSel===i;const iy=300+i*45;
        if(sel){ctx.fillStyle='rgba(255,107,0,0.2)';ctx.fillRect(W/2-100,iy-10,200,32);ctx.strokeStyle=P.or;ctx.strokeRect(W/2-100,iy-10,200,32);}
        pxText((sel?'> ':' ')+items[i],W/2-75,iy+10,sel?P.yel:P.gr,10);
    }
    // Characters
    const bot=genAnim('mm_bot',(c,f)=>drawNPC(c,'mimo_bot',f),G.tick*0.03);
    ctx.drawImage(bot,100,320+Math.sin(G.tick*0.04)*5);
    const elder=genAnim('mm_eld',(c,f)=>drawNPC(c,'elder',f),G.tick*0.03);
    ctx.drawImage(elder,W-150,320+Math.sin(G.tick*0.04+1)*5);
    // Gold coin
    const gc=genAnim('mm_g',drawGold,G.tick*0.06);
    ctx.drawImage(gc,W/2-24,200+Math.sin(G.tick*0.05)*8);
    // Footer
    ctx.fillStyle='rgba(255,107,0,0.12)';ctx.fillRect(0,H-55,W,55);
    pxText('Beta 0.0.2.8 — Still Under Development',W/2-155,H-38,P.orD,7);
    pxText('AI powered by Xiaomi MiMo  |  100t.xiaomimimo.com',W/2-205,H-18,P.grD,6);
    // Features
    const feats=['Pixel Art 48x48 World','Shop, Items & Equipment','Battle System with Enemies','AI NPC Dialogs (MiMo API)','Save & Continue','Multiple Realms'];
    for(let i=0;i<feats.length;i++){
        const col=i<3?0:1;const row=i%3;
        pxText('◆ '+feats[i],col===0?60:W/2+20,480+row*16,'rgba(255,107,0,0.4)',5);
    }
}

function updateMainMenu(){
    const has=hasSave();
    const items=has?['Continue','New Game','Settings']:['New Game','Settings'];
    if(jp('ArrowUp')||jp('w')||jp('W'))G.mainMenuSel=(G.mainMenuSel-1+items.length)%items.length;
    if(jp('ArrowDown')||jp('s')||jp('S'))G.mainMenuSel=(G.mainMenuSel+1)%items.length;
    if(jp('Enter')||jp(' ')||jp('e')||jp('E')){
        const sel=items[G.mainMenuSel];
        if(sel==='New Game'){
            newGame();
            G.transition.active=true;G.transition.alpha=1;G.transition.dir='in';
            G.state='playing';
            notify('Welcome to Aetheria! Explore and collect gold!',P.or);
        }else if(sel==='Continue'){
            if(loadGame()){
                G.transition.active=true;G.transition.alpha=1;G.transition.dir='in';
                G.state='playing';
                notify('Game loaded! Welcome back!',P.green);
            }else notify('No save data found!',P.red);
        }else if(sel==='Settings'){
            G.settingsOpen=true;G.state='settings';G.settingsSel=0;
        }
    }
    if(jp('p')||jp('P'))document.getElementById('apiKeyModal').classList.add('active');
}

// ── UPDATES ──
function updateParticles(){for(let i=G.particles.length-1;i>=0;i--){const p=G.particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.03;p.life--;if(p.life<=0)G.particles.splice(i,1);}}
function updateTransition(){
    if(!G.transition.active)return;
    if(G.transition.dir==='out'){G.transition.alpha+=0.03;if(G.transition.alpha>=1){G.transition.alpha=1;if(G.transition.cb)G.transition.cb();G.transition.cb=null;G.transition.dir='in';}}
    else{G.transition.alpha-=0.03;if(G.transition.alpha<=0){G.transition.alpha=0;G.transition.active=false;}}
}
function updateNotifs(){for(let i=G.notifications.length-1;i>=0;i--){G.notifications[i].dur--;if(G.notifications[i].dur<=0)G.notifications.splice(i,1);}}
function updateShake(){if(G.screenShake.i>0){G.screenShake.x=(Math.random()-0.5)*G.screenShake.i;G.screenShake.y=(Math.random()-0.5)*G.screenShake.i;G.screenShake.i*=0.9;if(G.screenShake.i<0.1)G.screenShake.i=0;}else{G.screenShake.x=0;G.screenShake.y=0;}}

// ── STARS ──
const stars=[];for(let i=0;i<150;i++)stars.push({x:Math.random()*1920,y:Math.random()*1080,s:Math.random()*2+0.5,sp:Math.random()*0.3+0.05,tw:Math.random()*Math.PI*2});
function renderStars(){
    starsCtx.clearRect(0,0,starsCanvas.width,starsCanvas.height);
    for(const s of stars){
        s.tw+=0.02;const a=0.3+Math.sin(s.tw)*0.3;
        starsCtx.fillStyle=`rgba(255,${180+Math.random()*75},${100+Math.random()*50},${a})`;
        starsCtx.fillRect(s.x,s.y,s.s,s.s);
        s.y+=s.sp;if(s.y>starsCanvas.height){s.y=0;s.x=Math.random()*starsCanvas.width;}
    }
}

// ── MAIN LOOP ──
function loop(time){
    G.dt=time-G.lastTime;G.lastTime=time;G.tick++;
    renderStars();
    ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);
    if(G.state==='mainmenu'){
        updateMainMenu();renderMainMenu();
        if(G.settingsOpen){updateSettings();renderSettings();}
    }else if(G.state==='battle'){
        updateBattle();renderBattle();renderParticles();
    }else{
        handleKeys();updatePlayer();updateInteraction();updateDialog();updateShop();updateInventory();updateSettings();
        updateParticles();updateTransition();updateNotifs();updateShake();updateCamera();
        renderMap();renderGold();renderNPCs();renderPlayerSprite();renderParticles();renderHUD();
        renderDialog();renderShop();renderInventory();renderMenu();renderSettings();renderNotifications();
        if(G.transition.active){ctx.fillStyle=`rgba(10,10,30,${G.transition.alpha})`;ctx.fillRect(0,0,W,H);}
    }
    clearJP();requestAnimationFrame(loop);
}

// ── API MODAL ──
window.closeApiModal=function(save){
    const m=document.getElementById('apiKeyModal');
    if(save){
        const k=document.getElementById('apiKeyInput').value.trim();
        if(k){G.mimoApiKey=k;G.mimoEnabled=true;notify('MiMo AI Connected! NPCs now use AI.',P.green);}
    }else notify('Running without MiMo AI.',P.gr);
    m.classList.remove('active');
};

// ── LOADING ──
function simLoad(){
    const bar=document.getElementById('loadingBar');const text=document.getElementById('loadingText');
    const steps=[{p:15,t:'Loading Aetheria engine...'},{p:30,t:'Generating world...'},{p:45,t:'Spawning NPCs...'},{p:55,t:'Stocking shop...'},{p:70,t:'Preparing battles...'},{p:85,t:'Calibrating MiMo AI...'},{p:100,t:'Ready!'}];
    let i=0;
    const iv=setInterval(()=>{
        if(i>=steps.length){clearInterval(iv);setTimeout(()=>{
            document.getElementById('loadingScreen').classList.add('hidden');
            document.getElementById('gameWrapper').style.display='flex';
            G.state='mainmenu';G.mainMenuSel=0;
            requestAnimationFrame(loop);
        },500);return;}
        bar.style.width=steps[i].p+'%';text.textContent=steps[i].t;i++;
    },350);
}

window.addEventListener('load',()=>{starsCanvas.width=innerWidth;starsCanvas.height=innerHeight;simLoad();});
window.addEventListener('resize',()=>{starsCanvas.width=innerWidth;starsCanvas.height=innerHeight;});
