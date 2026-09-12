const $ = s => document.querySelector(s);
const fields = {brand:$("#brandInput"), email:$("#emailInput"), product:$("#productInput")};
const nav=$("#pageNav"), title=$("#pageTitle"), kind=$("#pageKind"), preview=$("#preview"), codebox=$("#sourceBox"), copyBtn=$("#copyBtn"), msg=$("#message"), toast=$("#toast");
let pages={}, current="";

function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
function val(){return {brand:fields.brand.value.trim(),email:fields.email.value.trim(),product:fields.product.value.trim()};}
function fill(text){const v=val();return text.replaceAll("{{BRAND}}",v.brand||"[BRAND]").replaceAll("{{EMAIL}}",v.email||"[SUPPORTMAIL]").replaceAll("{{PRODUCT}}",v.product||"[PRODUKT]");}
function inline(s){let x=esc(s);x=x.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");x=x.replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');return x;}
function toHtml(md){const lines=md.replace(/\r/g,"").split("\n");let out="",list=false;const close=()=>{if(list){out+="</ul>";list=false;}};for(const line of lines){const t=line.trim();if(!t){close();continue;}const h=t.match(/^(#{1,4})\s+(.+)$/);if(h){close();out+=`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`;continue;}if(t.startsWith("- ")||t.startsWith("• ")){if(!list){out+="<ul>";list=true;}out+=`<li>${inline(t.slice(2))}</li>`;continue;}close();out+=`<p>${inline(t)}</p>`;}close();return out;}
function plain(md){return md.replace(/\*\*/g,"").replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,"$1: $2").replace(/^#{1,4}\s+/gm,"").trim();}
function save(){localStorage.setItem("store_builder_v3",JSON.stringify(val()));render();}
function load(){try{const v=JSON.parse(localStorage.getItem("store_builder_v3")||"{}");fields.brand.value=v.brand||"";fields.email.value=v.email||"";fields.product.value=v.product||"";}catch{}}
function showToast(t){toast.textContent=t;toast.classList.add("show");clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove("show"),1500);}

function staleIssues(content){
  const issues=[];
  if(/kundservice\.ryggro@gmail\.com/i.test(content)) issues.push("Gammal supportmail hittades.");
  if(/\b(?:5|6)[–-]10 arbetsdagar\b/i.test(content)) issues.push("Gammal leveranstid hittades.");
  if(/inklusive\s+25\s*%\s*moms/i.test(content)) issues.push("Gammal momstext hittades.");
  if(/EU-kommissionens plattform för medling i tvister/i.test(content)) issues.push("Gammal EU-tvistlänk hittades.");
  return issues;
}

function warning(content){
  const v=val(),issues=[];
  if(!v.brand||!v.email||!v.product)issues.push("Fyll i Brand, Supportmail och Produkt.");
  issues.push(...staleIssues(content));
  if(issues.length){msg.className="message show";msg.textContent=issues.join(" ");}
  else{msg.className="message good";msg.textContent="✓ Klar att kopiera";}
}
function renderNav(){nav.innerHTML="";Object.keys(pages).forEach(name=>{const b=document.createElement("button");b.type="button";b.className="tab"+(name===current?" active":"");b.textContent=name;b.onclick=()=>{current=name;renderNav();render();};nav.appendChild(b);});}
function render(){const item=pages[current];if(!item)return;const content=fill(item.content);title.textContent=current;warning(content);if(item.kind==="html-source"){kind.textContent="SHOPIFY · HTML";preview.style.display="none";codebox.style.display="block";codebox.value=content;copyBtn.textContent="Kopiera HTML";}else{kind.textContent="SHOPIFY-SIDA";preview.style.display="block";codebox.style.display="none";preview.innerHTML=toHtml(content);copyBtn.textContent="Kopiera";}}
async function copyFallback(text){
  const t=document.createElement("textarea");
  t.value=text;
  t.setAttribute("readonly","");
  t.style.position="fixed";
  t.style.left="-9999px";
  t.style.top="0";
  document.body.appendChild(t);
  t.focus();
  t.select();
  t.setSelectionRange(0,t.value.length);
  let ok=false;
  try{ok=document.execCommand("copy");}catch{}
  t.remove();
  if(!ok)throw new Error("Kopiering misslyckades");
}
async function copy(){
  const v=val();
  if(!v.brand||!v.email||!v.product){showToast("Fyll i de tre fälten först");return;}
  const item=pages[current],content=fill(item.content),stale=staleIssues(content);
  if(stale.length){showToast(stale[0]);return;}
  const text=item.kind==="html-source"?content:plain(content);
  try{
    if(item.kind==="html-source"){
      if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(content);else await copyFallback(content);
    }else{
      const h=toHtml(content),p=plain(content);
      if(window.ClipboardItem&&navigator.clipboard?.write){
        await navigator.clipboard.write([new ClipboardItem({"text/html":new Blob([h],{type:"text/html"}),"text/plain":new Blob([p],{type:"text/plain"})})]);
      }else if(navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(p);
      }else{
        await copyFallback(p);
      }
    }
    showToast("Kopierat ✓");
  }catch{
    try{await copyFallback(text);showToast("Kopierat ✓");}
    catch{showToast("Kunde inte kopiera – markera texten och tryck Ctrl+C");}
  }
}
Object.values(fields).forEach(x=>x.addEventListener("input",save));copyBtn.addEventListener("click",copy);
(async()=>{const r=await fetch("pages-manifest.json",{cache:"no-store"});const manifest=await r.json();for(const item of manifest){const f=await fetch(item.file,{cache:"no-store"});pages[item.name]={kind:item.kind,content:await f.text()};}current=Object.keys(pages)[0];load();renderNav();render();})().catch(()=>{msg.className="message show";msg.textContent="Kunde inte starta. Kör appen via Python-servern.";});
