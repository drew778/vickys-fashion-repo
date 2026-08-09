/* ============================================================
   VICKY'S FASHION — Fabric Library
   Curated suiting & shirting cloths. Weave patterns are rendered
   procedurally (see pattern.js) so the catalog and the Design
   Studio stay perfectly in sync. Swap/extend freely.
   ============================================================ */

const SUITINGS = [
  { id:"nvy-120",  name:"Midnight Navy",        collection:"Superfine 120s", weave:"solid",       palette:{base:"#1c2740"}, comp:"100% Merino Wool", weight:"260 g", mill:"Jorge Carli" },
  { id:"chr-130",  name:"Charcoal Grey",        collection:"Superfine 130s", weave:"solid",       palette:{base:"#33373d"}, comp:"100% Merino Wool", weight:"250 g", mill:"Jorge Carli" },
  { id:"blk-bar",  name:"Barathea Black",       collection:"Evening",        weave:"barathea",    palette:{base:"#141416"}, comp:"Wool / Mohair",    weight:"290 g", mill:"House Cloth" },
  { id:"mid-tux",  name:"Midnight Blue Tux",    collection:"Evening",        weave:"solid",       palette:{base:"#161a2e"}, comp:"Wool / Mohair",    weight:"290 g", mill:"House Cloth" },
  { id:"shark",    name:"Steel Sharkskin",      collection:"Business",       weave:"sharkskin",   palette:{base:"#4a5560", yarn:"#aeb7c2"}, comp:"100% Wool", weight:"270 g", mill:"Jorge Carli" },
  { id:"nail",     name:"Graphite Nailhead",    collection:"Business",       weave:"nailhead",    palette:{base:"#3c424b", yarn:"#c9cfd6"}, comp:"100% Wool", weight:"270 g", mill:"Jorge Carli" },
  { id:"bird",     name:"Slate Birdseye",       collection:"Business",       weave:"birdseye",    palette:{base:"#39506e", yarn:"#cdd6e4"}, comp:"Superfine Wool", weight:"260 g", mill:"Jorge Carli" },
  { id:"pin-nvy",  name:"Navy Pinstripe",       collection:"City",           weave:"pinstripe",   palette:{base:"#1e2942", yarn:"#c7cede"}, comp:"100% Wool", weight:"280 g", mill:"Jorge Carli" },
  { id:"chalk",    name:"Charcoal Chalkstripe", collection:"City",           weave:"chalkstripe", palette:{base:"#31353c", yarn:"#e7e9ee"}, comp:"Wool Flannel", weight:"310 g", mill:"House Cloth" },
  { id:"win-blu",  name:"Cobalt Windowpane",    collection:"Character",      weave:"windowpane",  palette:{base:"#2b3d5c", yarn:"#9fb4d6"}, comp:"Superfine Wool", weight:"270 g", mill:"Jorge Carli" },
  { id:"glen",     name:"Prince of Wales",      collection:"Character",      weave:"glen",        palette:{base:"#7d7566", yarn:"#413b31", over:"#7a5c46"}, comp:"Wool", weight:"300 g", mill:"House Cloth" },
  { id:"glen-gry", name:"Glen Check Grey",      collection:"Character",      weave:"glen",        palette:{base:"#9a9ea6", yarn:"#3c4048", over:"#5f6b86"}, comp:"Wool", weight:"300 g", mill:"House Cloth" },
  { id:"herr-gry", name:"Grey Herringbone",     collection:"Country",        weave:"herringbone", palette:{base:"#5a616b", yarn:"#c3cad3"}, comp:"Lambswool", weight:"330 g", mill:"House Cloth" },
  { id:"herr-blu", name:"Blue Herringbone",     collection:"Country",        weave:"herringbone", palette:{base:"#334a63", yarn:"#b9c8db"}, comp:"Lambswool", weight:"330 g", mill:"House Cloth" },
  { id:"herr-brn", name:"Tobacco Herringbone",  collection:"Country",        weave:"herringbone", palette:{base:"#5c4a39", yarn:"#cbb79f"}, comp:"Shetland Tweed", weight:"360 g", mill:"House Cloth" },
  { id:"flan-gry", name:"Grey Flannel",         collection:"Cold Weather",   weave:"flannel",     palette:{base:"#6b7178"}, comp:"Brushed Wool", weight:"340 g", mill:"House Cloth" },
  { id:"grn-vel",  name:"Bottle Green",         collection:"Evening",        weave:"solid",       palette:{base:"#1f3b30"}, comp:"Velvet", weight:"—", mill:"House Cloth" },
  { id:"burg",     name:"Burgundy",             collection:"Evening",        weave:"solid",       palette:{base:"#5a2230"}, comp:"Velvet", weight:"—", mill:"House Cloth" },
  { id:"camel",    name:"Camel",                collection:"Odd Jacket",     weave:"solid",       palette:{base:"#a9865c"}, comp:"Camel / Wool", weight:"320 g", mill:"House Cloth" },
  { id:"tan",      name:"Sandstone Tan",        collection:"Odd Jacket",     weave:"solid",       palette:{base:"#b39a76"}, comp:"Cotton / Wool", weight:"280 g", mill:"House Cloth" },
  { id:"olive",    name:"Olive",                collection:"Odd Jacket",     weave:"solid",       palette:{base:"#5b5a38"}, comp:"Wool / Linen", weight:"270 g", mill:"House Cloth" },
  { id:"lt-gry",   name:"Silver Grey",          collection:"Warm Weather",   weave:"solid",       palette:{base:"#9ca2aa"}, comp:"Fresco Wool", weight:"250 g", mill:"Jorge Carli" },
  { id:"pow-blu",  name:"Powder Blue",          collection:"Warm Weather",   weave:"solid",       palette:{base:"#6d88ab"}, comp:"Wool / Silk", weight:"240 g", mill:"Jorge Carli" },
  { id:"stone",    name:"Dove Grey",            collection:"Business",       weave:"solid",       palette:{base:"#7c828b"}, comp:"Superfine Wool", weight:"250 g", mill:"Jorge Carli" }
];

const SHIRTINGS = [
  { id:"wht-pop",  name:"White Poplin",        collection:"Essential", weave:"solid",     palette:{base:"#f7f8fa"}, comp:"2-ply Cotton", weight:"120 g", mill:"House Cloth" },
  { id:"ivory-tw", name:"Ivory Twill",         collection:"Essential", weave:"twill",     palette:{base:"#f0ead9", yarn:"#e2d8bf"}, comp:"2-ply Cotton", weight:"130 g", mill:"House Cloth" },
  { id:"sky-pop",  name:"Sky Blue Poplin",     collection:"Essential", weave:"solid",     palette:{base:"#cfe0ef"}, comp:"2-ply Cotton", weight:"120 g", mill:"House Cloth" },
  { id:"blu-eoe",  name:"Blue End-on-End",     collection:"Essential", weave:"endonend",  palette:{base:"#bcd2e6", yarn:"#ffffff"}, comp:"2-ply Cotton", weight:"120 g", mill:"House Cloth" },
  { id:"pnk-eoe",  name:"Rose End-on-End",     collection:"Essential", weave:"endonend",  palette:{base:"#e8cdd0", yarn:"#ffffff"}, comp:"2-ply Cotton", weight:"120 g", mill:"House Cloth" },
  { id:"lav",      name:"Lavender",            collection:"Essential", weave:"solid",     palette:{base:"#d5cfe6"}, comp:"2-ply Cotton", weight:"120 g", mill:"House Cloth" },
  { id:"roy-ox",   name:"White Royal Oxford",  collection:"Texture",   weave:"oxford",    palette:{base:"#f4f5f7", yarn:"#dfe3e8"}, comp:"Royal Oxford", weight:"140 g", mill:"House Cloth" },
  { id:"wht-herr", name:"White Herringbone",   collection:"Texture",   weave:"herringbone", palette:{base:"#eef0f3", yarn:"#d5dae0"}, comp:"2-ply Cotton", weight:"130 g", mill:"House Cloth" },
  { id:"uni-stp",  name:"University Stripe",    collection:"Stripe",    weave:"stripe",    palette:{base:"#ffffff", yarn:"#3f6fb0", w:6}, comp:"2-ply Cotton", weight:"120 g", mill:"House Cloth" },
  { id:"ben-stp",  name:"Bengal Stripe",       collection:"Stripe",    weave:"stripe",    palette:{base:"#ffffff", yarn:"#2f5f9e", w:9}, comp:"2-ply Cotton", weight:"120 g", mill:"House Cloth" },
  { id:"fine-stp", name:"Fine Blue Stripe",    collection:"Stripe",    weave:"stripe",    palette:{base:"#ffffff", yarn:"#5a86bd", w:3}, comp:"2-ply Cotton", weight:"120 g", mill:"House Cloth" },
  { id:"ging",     name:"Blue Gingham",        collection:"Check",     weave:"gingham",   palette:{base:"#ffffff", yarn:"#5a86c4"}, comp:"2-ply Cotton", weight:"120 g", mill:"House Cloth" },
  { id:"tatt",     name:"Blue Tattersall",     collection:"Check",     weave:"tattersall",palette:{base:"#f6f1e6", yarn:"#365a9c", alt:"#b5563e"}, comp:"2-ply Cotton", weight:"120 g", mill:"House Cloth" },
  { id:"mic-chk",  name:"Graphite Micro-check", collection:"Check",    weave:"gingham",   palette:{base:"#ffffff", yarn:"#8a929c"}, comp:"2-ply Cotton", weight:"120 g", mill:"House Cloth" },
  { id:"blk-shirt",name:"Black",               collection:"Evening",   weave:"solid",     palette:{base:"#242629"}, comp:"2-ply Cotton", weight:"120 g", mill:"House Cloth" },
  { id:"chr-shirt",name:"Charcoal",            collection:"Evening",   weave:"solid",     palette:{base:"#4b4f56"}, comp:"2-ply Cotton", weight:"120 g", mill:"House Cloth" }
];

/* Finishing options for the Design Studio */
const LININGS = [
  { id:"ln-burg",  name:"Burgundy Silk", color:"#6c2233" },
  { id:"ln-roy",   name:"Royal Blue",    color:"#1f3d8a" },
  { id:"ln-emer",  name:"Emerald",       color:"#0f6146" },
  { id:"ln-gold",  name:"Antique Gold",  color:"#b08d3a" },
  { id:"ln-sil",   name:"Silver Grey",   color:"#9aa0a8" },
  { id:"ln-plum",  name:"Deep Plum",     color:"#4a2650" },
  { id:"ln-blk",   name:"Jet Black",     color:"#1b1c1f" },
  { id:"ln-teal",  name:"Peacock Teal",  color:"#116673" }
];

const PIPINGS = [
  { id:"pp-none", name:"None",       color:null },
  { id:"pp-blk",  name:"Black",      color:"#141416" },
  { id:"pp-burg", name:"Burgundy",   color:"#6c2233" },
  { id:"pp-nvy",  name:"Navy",       color:"#1c2740" },
  { id:"pp-gold", name:"Gold",       color:"#b08d3a" },
  { id:"pp-roy",  name:"Royal Blue", color:"#1f3d8a" },
  { id:"pp-wht",  name:"Ivory",      color:"#eee8da" }
];

const BUTTONS = [
  { id:"bt-horn", name:"Horn (Brown)", color:"#3f2a1c" },
  { id:"bt-blk",  name:"Black Horn",   color:"#161514" },
  { id:"bt-mop",  name:"Mother-of-Pearl", color:"#eae6dc" },
  { id:"bt-nvy",  name:"Navy",         color:"#1c2740" },
  { id:"bt-gun",  name:"Gunmetal",     color:"#6b7078" }
];

const ALL_FABRICS = SUITINGS.concat(SHIRTINGS);
function fabricById(id){ return ALL_FABRICS.find(f=>f.id===id); }
