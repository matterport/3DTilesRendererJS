import{g as W,at as ee,i as P,O as N,C as U,b as $,V as _,au as q,aj as te,ak as I,l as re,av as k,y as D,k as ae,W as se,S as ie,a as ne,A as oe,D as le}from"./three.module-D7KO9fW1.js";/* empty css               */import{g as ce}from"./lil-gui.module.min-Vka56b52.js";import{S as ue}from"./stats.module--VATS4Kh.js";import{P as me,T as de}from"./TilesRenderer-BtlQzkDd.js";import{a as he,T as pe}from"./EPSGTilesPlugin-BgyJeQMn.js";import{a as ge,C as fe}from"./CesiumIonAuthPlugin-C7yiOUq4.js";import{G as ve}from"./GlobeControls-BtrJAIFV.js";import{T as ye}from"./TilesFadePlugin-Ds3aen5r.js";import"./I3DMLoader-BqzkgmWd.js";import"./readMagicBytes-B3HEinov.js";import"./GLTFLoader-CtPRlX4X.js";import"./Ellipsoid-CsJ1QeYU.js";import"./B3DMLoader-DI0Nnorf.js";import"./PNTSLoader-37LQDqUT.js";import"./CMPTLoader-CjPO0L4d.js";import"./EllipsoidRegion-b1k67aVx.js";import"./TiledImageSource-D6gNwUjU.js";import"./EnvironmentControls-BoG6cGNa.js";const we=new N,Te=new U;class xe{constructor(e){this.renderer=e,this.renderTarget=null,this.range=[0,0,1,1],this.quad=new W(new ee,new Ce)}setRenderTarget(e,t){this.renderTarget=e,this.range=[...t]}draw(e,t,r=null,a=16777215,s=1){const{range:i,renderer:n,quad:u,renderTarget:l}=this,c=u.material;c.map=e,c.opacity=s,c.color.set(a),r!==null?(c.minCart.set(t[0],t[1]),c.maxCart.set(t[2],t[3]),c.isMercator=r.isMercator):(c.minCart.set(0,0),c.maxCart.set(1,1),c.isMercator=!1),c.minRange.x=P.mapLinear(t[0],i[0],i[2],-1,1),c.minRange.y=P.mapLinear(t[1],i[1],i[3],-1,1),c.maxRange.x=P.mapLinear(t[2],i[0],i[2],-1,1),c.maxRange.y=P.mapLinear(t[3],i[1],i[3],-1,1);const m=n.getRenderTarget(),p=n.autoClear;n.autoClear=!1,n.setRenderTarget(l),n.render(u,we),n.setRenderTarget(m),n.autoClear=p,c.map=null}clear(e,t=1){const{renderer:r,renderTarget:a}=this,s=r.getRenderTarget(),i=r.getClearColor(Te),n=r.getClearAlpha();r.setClearColor(e,t),r.setRenderTarget(a),r.clear(),r.setRenderTarget(s),r.setClearColor(i,n)}dispose(){this.quad.material.dispose(),this.quad.geometry.dispose()}}class Ce extends ${get color(){return this.uniforms.color.value}get opacity(){var e;return(e=this.uniforms)==null?void 0:e.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get minRange(){return this.uniforms.minRange.value}get maxRange(){return this.uniforms.maxRange.value}set isMercator(e){this.uniforms.isMercator.value=e?1:0}get isMercator(){return this.uniforms.isMercator.value===1}get minCart(){return this.uniforms.minCart.value}get maxCart(){return this.uniforms.maxCart.value}get map(){return this.uniforms.map.value}set map(e){this.uniforms.map.value=e}constructor(){super({depthWrite:!1,depthTest:!1,transparent:!0,side:q,uniforms:{color:{value:new U},map:{value:null},minRange:{value:new _},maxRange:{value:new _},minCart:{value:new _},maxCart:{value:new _},isMercator:{value:0},opacity:{value:1}},vertexShader:`

				uniform vec2 minRange;
				uniform vec2 maxRange;
				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = vec4( mix( minRange, maxRange, uv ), 0, 1 );

				}

			`,fragmentShader:`

				uniform vec3 color;
				uniform float opacity;
				uniform sampler2D map;
				varying vec2 vUv;

				uniform int isMercator;
				uniform vec2 minRange;
				uniform vec2 maxRange;

				uniform vec2 minCart;
				uniform vec2 maxCart;

				#define PI ${Math.PI.toFixed(10)}

				// convert the cartographic value to the [ 0, 1 ] range using mercator
				vec2 cartToProjMercator( vec2 cart ) {

					float mercatorN = log( tan( ( PI / 4.0 ) + ( cart.y / 2.0 ) ) );
					vec2 result;
					result.x = ( cart.x + PI ) / ( 2.0 * PI );
					result.y = ( 1.0 / 2.0 ) + ( 1.0 * mercatorN / ( 2.0 * PI ) );
					return result;

				}

				void main() {

					vec2 uv = vUv;
					if ( isMercator == 1 ) {

						// take the point on the image and find the mercator point to sample
						vec2 minProj = cartToProjMercator( minCart );
						vec2 maxProj = cartToProjMercator( maxCart );
						vec2 proj = cartToProjMercator( mix( minCart, maxCart, uv ) );

						float range = maxProj.y - minProj.y;
						float offset = proj.y - minProj.y;
						uv.y = offset / range;

					}

					// sample the texture
					gl_FragColor = texture( map, uv );
					gl_FragColor.rgb *= color;
					gl_FragColor.a *= opacity;

				}

			`})}}const Re=new N;class Me{constructor(e){this.renderer=e,this.renderTarget=null,this.quad=new W(new te,new Pe)}setRenderTarget(e){this.renderTarget=e}setUVs(e,t,r){const{geometry:a}=this.quad;this.quad.frustumCulled=!1,a.dispose(),a.setAttribute("fromUv",j(e)),a.setAttribute("toUv",j(t)),a.setIndex(r)}draw(e){const{renderer:t,quad:r,renderTarget:a}=this,s=r.material;s.map=e;const i=t.getRenderTarget(),n=t.autoClear;t.autoClear=!1,t.setRenderTarget(a),t.render(r,Re),t.setRenderTarget(i),t.autoClear=n,s.map=null}dispose(){this.quad.material.dispose(),this.quad.geometry.dispose()}}class Pe extends ${get map(){return this.uniforms.map.value}set map(e){this.uniforms.map.value=e}constructor(){super({depthWrite:!1,depthTest:!1,transparent:!0,side:q,uniforms:{map:{value:null}},vertexShader:`

				attribute vec2 fromUv;
				attribute vec2 toUv;
				varying vec2 vUv;

				void main() {

					vUv = fromUv;
					gl_Position = vec4( mix( vec2( - 1 ), vec2( 1 ), toUv ), 0, 1 );

				}

			`,fragmentShader:`

				uniform sampler2D map;
				varying vec2 vUv;
				void main() {

					gl_FragColor = texture( map, vUv );

				}

			`})}}function j(o){return o instanceof I?o.clone():o instanceof Float32Array?new I(o,2,!1):Array.isArray(o)?new I(new Float32Array(o),2,!1):new I(o,2,!0)}function H(o,e,t,r){let[a,s,i,n]=o;s+=1e-7,a+=1e-7,n-=1e-7,i-=1e-7;const u=Math.max(Math.min(e,t.maxLevel),t.minLevel),[l,c,m,p]=t.getTilesInRange(a,s,i,n,u);for(let g=l;g<=m;g++)for(let h=c;h<=p;h++)t.getTileExists(g,h,u)&&r(g,h,u)}function _e(o,e,t){const r=new re,a={};o.computeBoundingBox(),o.boundingBox.getCenter(r).applyMatrix4(e),t.getPositionToCartographic(r,a);const s=a.lat,i=a.lon;let n=1/0,u=1/0,l=-1/0,c=-1/0;const m=[],p=o.getAttribute("position");for(let f=0;f<p.count;f++)r.fromBufferAttribute(p,f).applyMatrix4(e),t.getPositionToCartographic(r,a),Math.abs(Math.abs(a.lat)-Math.PI/2)<1e-5&&(a.lon=i),Math.abs(i-a.lon)>Math.PI&&(a.lon+=Math.sign(i-a.lon)*Math.PI*2),Math.abs(s-a.lat)>Math.PI&&(a.lat+=Math.sign(s-a.lat)*Math.PI*2),m.push(a.lon,a.lat),n=Math.min(n,a.lat),l=Math.max(l,a.lat),u=Math.min(u,a.lon),c=Math.max(c,a.lon);const g=c-u,h=l-n;for(let f=0;f<m.length;f+=2)m[f+0]-=u,m[f+0]/=g,m[f+1]-=n,m[f+1]/=h;return{uv:new Float32Array(m),range:[u,n,c,l]}}const A=new ae;async function R(o,e,t,r){if(Array.isArray(t)){await Promise.all(t.map(n=>R(o,e,n,r)));return}await t.whenReady();const a=[],{imageSource:s,tiling:i}=t;H(o,e,i,(n,u,l)=>{r?s.release(n,u,l):a.push(s.lock(n,u,l))}),await Promise.all(a)}class Ie{constructor(e={}){const{overlays:t=[],resolution:r=256,renderer:a=null}=e;this.name="IMAGE_OVERLAY_PLUGIN",this.priority=100,this.renderer=a,this.resolution=r,this.overlays=t,this.overlayOrder=new WeakMap,this.needsUpdate=!1,this.processQueue=null,this.tiles=null,this.tileComposer=null,this.uvRemapper=null,this.scratchTarget=null,this.tileMeshInfo=new Map,window.PLUGIN=this}init(e){const t=new me;t.priorityCallback=(...l)=>e.downloadQueue.priorityCallback(...l);const r=new xe(this.renderer),a=new Me(this.renderer),s=new k(this.resolution,this.resolution,{depthBuffer:!1,stencilBuffer:!1,generateMipmaps:!1,colorSpace:D});this.tiles=e,this.processQueue=t,this.tileComposer=r,this.uvRemapper=a,this.scratchTarget=s;const{overlays:i,overlayOrder:n}=this;this.overlays=[],i.forEach((l,c)=>{n.has(l)&&(c=n.overlay),this.addOverlay(l,c)}),e.forEachLoadedModel((l,c)=>{t.add(c,async m=>{await this._initTileState(l,m),await this._initOverlays(l,m,!0),this._redrawTileTextures(m)})});let u=0;this._onUpdateAfter=async()=>{if(this.needsUpdate){const{overlays:l,overlayOrder:c}=this;l.sort((g,h)=>c.get(g)-c.get(h)),this.needsUpdate=!1,u++;const m=u,p=l.map(g=>g.whenReady());await Promise.all(p),m===u&&e.forEachLoadedModel((g,h)=>{this._redrawTileTextures(h)})}},this._onTileDownloadStart=({tile:l})=>{this._initOverlaysFromTileRegion(l)},e.addEventListener("update-after",this._onUpdateAfter),e.addEventListener("tile-download-start",this._onTileDownloadStart)}disposeTile(e){const{processQueue:t,overlays:r,tileMeshInfo:a}=this;if(this._resetTileOverlay(e),t.remove(e),a.has(e)){const s=a.get(e);a.delete(e),s.forEach(({range:i,level:n,target:u})=>{u.dispose(),R(i,n,r,!0)})}if(e.boundingVolume.region){const s=e.__depthFromRenderedParent-1,i=e.boundingVolume.region;R(i,s,r,!0)}}processTileModel(e,t){return this.processQueue.add(t,async r=>{await this._initTileState(e,r),await this._initOverlays(e,r,!1),this._redrawTileTextures(r)})}getAttributions(e){this.overlays.forEach(t=>{t.opacity>0&&t.getAttributions(e)})}dispose(){this.tileComposer.dispose(),this.uvRemapper.dispose(),this.scratchTarget.dispose(),[...this.overlays].forEach(t=>{this.deleteOverlay(t)}),this.tiles.forEachLoadedModel((t,r)=>{this._resetTileOverlay(r),this.disposeTile(r)}),this.tiles.removeEventListener("update-after",this._onUpdateAfter)}addOverlay(e,t=null){const{tiles:r,overlays:a,overlayOrder:s}=this;e.imageSource.fetchOptions=r.fetchOptions,e.init(),t===null&&(t=a.length),s.set(e,t),a.push(e);const i=[];r.forEachLoadedModel((n,u)=>{i.push(this._initOverlays(n,u,!0,e))}),this.needsUpdate=!1,Promise.all(i).then(()=>{this.needsUpdate=!0})}setOverlayOrder(e,t){this.overlays.indexOf(e)!==-1&&(this.overlayOrder.set(e,t),this.needsUpdate=!0)}deleteOverlay(e){const t=this.overlays.indexOf(e);t!==-1&&(e.dispose(),this.overlayOrder.delete(e),this.overlays.splice(t,1),this.needsUpdate=!0)}async _initTileState(e,t){const{tiles:r,tileMeshInfo:a,resolution:s}=this,{ellipsoid:i,group:n}=r,u=[];e.updateMatrixWorld(),e.traverse(m=>{m.isMesh&&u.push(m)});const l=t.__depthFromRenderedParent-1,c=new Map;await Promise.all(u.map(async m=>{const{material:p,geometry:g}=m,{map:h}=p;A.copy(m.matrixWorld),e.parent&&A.premultiply(n.matrixWorldInverse);const{range:f,uv:M}=_e(g,A,i);c.set(m,{range:f,level:l,uv:M,map:h,target:new k(s,s,{depthBuffer:!1,stencilBuffer:!1,generateMipmaps:!1,colorSpace:D})})})),a.set(t,c)}async _initOverlays(e,t,r,a=this.overlays){if(Array.isArray(a)){await Promise.all(a.map(i=>this._initOverlays(e,t,r,i)));return}const s=[];s.push(this._initOverlayFromScene(a,e,t)),r&&s.push(this._initOverlaysFromTileRegion(t)),await Promise.all(s)}async _initOverlaysFromTileRegion(e){if(e.boundingVolume.region){const t=e.__depthFromRenderedParent-1,r=e.boundingVolume.region;await R(r,t,this.overlays,!1)}}async _initOverlayFromScene(e,t,r){const{tileMeshInfo:a}=this,s=a.get(r),i=[];t.traverse(n=>{if(s.has(n)){const{range:u,level:l}=s.get(n);i.push(R(u,l,e,!1))}}),await Promise.all(i)}_resetTileOverlay(e){const{tileMeshInfo:t}=this;t.has(e)&&t.get(e).forEach(({map:a},s)=>{s.material.map=a})}_redrawTileTextures(e){const{tileComposer:t,tileMeshInfo:r,scratchTarget:a,uvRemapper:s,overlays:i}=this;if(!r.has(e)||(this._resetTileOverlay(e),i.length===0))return;r.get(e).forEach((u,l)=>{const{map:c,level:m,range:p,uv:g,target:h}=u,{material:f,geometry:M}=l;t.setRenderTarget(a,p),t.clear(16777215,0);let E=0;i.forEach(T=>{H(p,m,T.tiling,(B,F,G)=>{const J=T.tiling.getTileBounds(B,F,G),K=T.imageSource.get(B,F,G);E++,t.draw(K,J,T.projection,T.color,T.opacity)})}),E!==0?(t.setRenderTarget(h,p),c?(t.draw(c,p),c.dispose()):t.clear(16777215),s.setRenderTarget(h),s.setUVs(g,M.getAttribute("uv"),M.index),s.draw(a.texture),f.map=h.texture):h.dispose()})}}class Q{get tiling(){return this.imageSource.tiling}get projection(){return this.tiling.projection}constructor(e={}){const{opacity:t=1,color:r=16777215}=e;this.imageSource=null,this.opacity=t,this.color=new U(r)}whenReady(){}getAttributions(e){}dispose(){this.imageSource.dispose()}}class be extends Q{constructor(e={}){super(e),this.imageSource=new he(e),this.url=e.url}init(){this._whenReady=this.imageSource.init(this.url)}whenReady(){return this._whenReady}}class Y extends Q{constructor(e={}){super(e);const{apiToken:t,authRefreshToken:r,assetId:a}=e;this.assetId=a,this.auth=new ge({apiToken:t,authRefreshToken:r}),this.imageSource=new pe(e),this.auth.authURL=`https://api.cesium.com/v1/assets/${a}/endpoint`,this.imageSource.fetchData=(...s)=>this.auth.fetch(...s),this._attributions=[]}init(){this._whenReady=this.auth.refreshToken().then(e=>(this._attributions=e.attributions.map(t=>({value:t.html,type:"html",collapsible:t.collapsible})),this.imageSource.init(e.url)))}whenReady(){return this._whenReady}getAttributions(e){e.push(...this._attributions)}}let O,x,y,d,v,S,C,L,b;const w={enableCacheDisplay:!1,enableRendererStats:!1,mapBase:!1,errorTarget:2,layerOpacity:1,reload:z};Oe();Z();function z(){d&&(x.remove(d.group),d.dispose(),d=null),S=new Y({opacity:w.layerOpacity,assetId:"3827",apiToken:""}),d=new de,d.registerPlugin(new fe({apiToken:"",assetId:"1",autoRefreshToken:!0})),d.registerPlugin(new ye),d.registerPlugin(new Ie({renderer:y,overlays:[S]})),X(),d.group.rotation.x=-Math.PI/2,x.add(d.group),d.setResolutionFromRenderer(v,y),d.setCamera(v),O.setTilesRenderer(d)}function Oe(){y=new se({antialias:!0}),y.setClearColor(1383455),document.body.appendChild(y.domElement),x=new ie,v=new ne(60,window.innerWidth/window.innerHeight,1,16e7),v.position.set(48e5,257e4,1472e4),v.lookAt(0,0,0);const o=new oe(16777215,.25),e=new le(16777215,3);e.position.set(1,1,1),v.add(o,e,e.target),x.add(v),O=new ve(x,v,y.domElement,null),O.enableDamping=!0,z(),V(),window.addEventListener("resize",V,!1);const t=new ce;t.width=300,t.add(w,"enableCacheDisplay"),t.add(w,"enableRendererStats"),t.add(w,"mapBase").onChange(X),t.add(w,"errorTarget",1,30,1),t.add(w,"layerOpacity",0,1).onChange(r=>{S.opacity=r,d.getPluginByName("IMAGE_OVERLAY_PLUGIN").needsUpdate=!0}),t.add(w,"reload"),L=document.createElement("div"),document.getElementById("info").appendChild(L),b=new ue,b.showPanel(0),document.body.appendChild(b.dom)}function X(){const o=d.getPluginByName("IMAGE_OVERLAY_PLUGIN");C&&o.deleteOverlay(C),w.mapBase?C=new be({url:"https://tile.openstreetmap.org/{z}/{x}/{y}.png"}):C=new Y({assetId:"3954",apiToken:""}),o.addOverlay(C,-1)}function V(){const o=window.innerWidth/window.innerHeight;v.aspect=o,v.updateProjectionMatrix(),y.setSize(window.innerWidth,window.innerHeight),y.setPixelRatio(window.devicePixelRatio)}function Z(){requestAnimationFrame(Z),d&&(O.update(),d.setResolutionFromRenderer(v,y),d.setCamera(v),v.updateMatrixWorld(),d.errorTarget=w.errorTarget,d.update(),y.render(x,v),b.update(),Le())}function Le(){var e,t;let o="";if(w.enableCacheDisplay){const r=d.lruCache,a=r.cachedBytes/r.maxBytesSize;o+=`Downloading: ${d.stats.downloading} Parsing: ${d.stats.parsing} Visible: ${d.visibleTiles.size}<br/>`,o+=`Cache: ${(100*a).toFixed(2)}% ~${(r.cachedBytes/1e3/1e3).toFixed(2)}mb<br/>`}if(w.enableRendererStats){const r=y.info.memory,a=y.info.render,s=y.info.programs.length;o+=`Geometries: ${r.geometries} Textures: ${r.textures} Programs: ${s} Draw Calls: ${a.calls}`;const i=d.getPluginByName("BATCHED_TILES_PLUGIN"),n=d.getPluginByName("FADE_TILES_PLUGIN");if(i){let u=0;(e=i.batchedMesh)==null||e._instanceInfo.forEach(l=>{l.visible&&l.active&&u++}),(t=n.batchedMesh)==null||t._instanceInfo.forEach(l=>{l.visible&&l.active&&u++}),o+=", Batched: "+u}}L.innerHTML!==o&&(L.innerHTML=o)}
