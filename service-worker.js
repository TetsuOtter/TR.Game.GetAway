if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let r=Promise.resolve();return i[e]||(r=new Promise((async r=>{if("document"in self){const i=document.createElement("script");i.src=e,document.head.appendChild(i),i.onload=r}else importScripts(e),r()}))),r.then((()=>{if(!i[e])throw new Error(`Module ${e} didn’t register its module`);return i[e]}))},r=(r,i)=>{Promise.all(r.map(e)).then((e=>i(1===e.length?e[0]:e)))},i={require:Promise.resolve(r)};self.define=(r,o,s)=>{i[r]||(i[r]=Promise.resolve().then((()=>{let i={};const c={uri:location.origin+r.slice(1)};return Promise.all(o.map((r=>{switch(r){case"exports":return i;case"module":return c;default:return e(r)}}))).then((e=>{const r=s(...e);return i.default||(i.default=r),i}))})))}}define("./service-worker.js",["./workbox-543be79b"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"img/bg.jpg",revision:"76204aa0984e0406b24c656f1178ab5c"},{url:"img/floor.jpg",revision:"810aab1ff6548486b933dea8e265aff2"},{url:"main.html",revision:"a3901da07ee72dbca8b203e37d0f8593"},{url:"main.js",revision:"93bf0b1705fbec14005dc547dd3af57d"},{url:"main.js.LICENSE.txt",revision:"654ae0929d440554a3f74a1c43ed3390"},{url:"obj/gun.mtl",revision:"01797ba875f8378c06787221b0c1a79e"},{url:"obj/gun.obj",revision:"01bfb6bb862841a63cbbc0adc0c43c52"},{url:"obj/hovercraft.mtl",revision:"b4fe2dc98c0cd62f4ff368beb8d45876"},{url:"obj/hovercraft.obj",revision:"c18039f03c087289f7270cef487e96b0"},{url:"obj/ufo.mtl",revision:"46cb1b785514ef8445dded250f7136f0"},{url:"obj/ufo.obj",revision:"7583370573985dee540cf2732520f854"},{url:"style.css",revision:"200994aec8b250f591fec3f7fc706ea6"}],{})}));