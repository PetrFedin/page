const container=document.querySelector(".profile-selector");
if(container){
 const copy=JSON.parse(document.querySelector("#profile-focus-copy").textContent);
 const result=document.querySelector("#profile-focus-result");
 const link=document.querySelector("#profile-focus-contact");
 const prefix=container.dataset.profileLang==="en"?"/en/":"/";
 container.querySelectorAll("[data-profile-focus]").forEach(button=>{
  button.addEventListener("click",()=>{
   const focus=button.dataset.profileFocus;
   if(!Object.hasOwn(copy,focus))return;
   container.querySelectorAll("[data-profile-focus]").forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
   result.textContent=copy[focus];
   link.href=prefix+"?topic=consulting&focus="+encodeURIComponent(focus)+"#contact";
  });
 });
}
