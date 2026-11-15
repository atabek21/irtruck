(function(){var C=window.IR||{},S=null,M={},L={},busy=0;
try{S=JSON.parse(localStorage.getItem("irs"))}catch(e){}
function sv(o){S=o;try{localStorage.setItem("irs",JSON.stringify(o))}catch(e){}}
function tok(j){return{a:j.access_token,r:j.refresh_token,e:Date.now()+(j.expires_in-60)*1000}}
function auth(b,g){return fetch(C.url+"/auth/v1/token?grant_type="+g,{method:"POST",headers:{apikey:C.key,"Content-Type":"application/json"},body:JSON.stringify(b)}).then(function(r){return r.json().then(function(j){if(!r.ok||!j.access_token)throw j;return j})})}
function fresh(){if(S&&S.e>Date.now())return Promise.resolve();if(S&&S.r)return auth({refresh_token:S.r},"refresh_token").then(function(j){sv(tok(j))});return Promise.reject()}
function form(){return new Promise(function(ok){var d=document.createElement("div");d.style.cssText="position:fixed;inset:0;background:#15171a;color:#fff;display:flex;align-items:center;justify-content:center;z-index:99;font:16px system-ui";d.innerHTML='<div style="width:280px"><h2>IR-TRUCK</h2><input id="le" placeholder="Email" style="width:100%;padding:10px;margin:4px 0;font-size:16px"><input id="lp" type="password" placeholder="Пароль" style="width:100%;padding:10px;margin:4px 0;font-size:16px"><button id="lb" style="width:100%;padding:10px;font-size:16px">Войти</button><p id="lm" style="color:#f88"></p></div>';document.body.appendChild(d);d.querySelector("#lb").onclick=function(){auth({email:d.querySelector("#le").value.trim(),password:d.querySelector("#lp").value},"password").then(function(j){sv(tok(j));d.remove();ok()}).catch(function(){d.querySelector("#lm").textContent="Неверный email или пароль"})}})}
function api(m,q,b,x){return fresh().then(function(){var h={apikey:C.key,Authorization:"Bearer "+S.a,"Content-Type":"application/json"};if(x)h.Prefer=x;return fetch(C.url+"/rest/v1/docs"+q,{method:m,headers:h,body:b?JSON.stringify(b):undefined})}).then(function(r){if(!r.ok)throw r;return m=="GET"?r.json():null})}
function sj(o){return JSON.stringify(o,Object.keys(o).sort())}
function sig(o){return Object.keys(o||{}).sort().map(function(k){return k+o[k]}).join("|")}
function snapOf(c){var o=M[c]||{};return{docs:Object.keys(o).sort().map(function(i){return{id:i,exists:true,data:function(){return JSON.parse(o[i])}}})}}
function fire(c){(L[c]||[]).forEach(function(f){setTimeout(function(){f(snapOf(c))},0)})}
function load(){return api("GET","?select=coll,id,data").then(function(rows){var N={};rows.forEach(function(r){(N[r.coll]=N[r.coll]||{})[r.id]=sj(r.data)});Object.keys(N).concat(Object.keys(M)).forEach(function(c){if(sig(N[c])!=sig(M[c])){M[c]=N[c]||{};fire(c)}})})}
function wr(c,i,j,del){busy++;var p=del?api("DELETE","?coll=eq."+encodeURIComponent(c)+"&id=eq."+encodeURIComponent(i)):api("POST","?on_conflict=coll,id",{coll:c,id:i,data:JSON.parse(j)},"resolution=merge-duplicates");return p.then(function(){busy--},function(e){busy--;throw e})}
var db={collection:function(c){return{get:function(){return Promise.resolve(snapOf(c))},onSnapshot:function(f){(L[c]=L[c]||[]).push(f);setTimeout(function(){f(snapOf(c))},0)}}},
doc:function(p){var a=p.split("/"),c=a[0],i=a.slice(1).join("/");return{
get:function(){var v=(M[c]||{})[i];return Promise.resolve({id:i,exists:v!=null,data:function(){return v==null?undefined:JSON.parse(v)}})},
set:function(d){var j=sj(d);(M[c]=M[c]||{})[i]=j;fire(c);return wr(c,i,j)},
"delete":function(){if(M[c])delete M[c][i];fire(c);return wr(c,i,0,1)}}}};
var dl={save:function(q){var b=q.data instanceof Blob?q.data:new Blob([q.data]),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=q.filename;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);return Promise.resolve()}};
window.claude={use:function(n){if(n=="downloads")return Promise.resolve(dl);if(n=="db"&&C.url&&C.key)return fresh().catch(form).then(load).then(function(){setInterval(function(){if(!busy)load().catch(function(){})},5000);return db});return Promise.resolve(null)}};})();
