import{e as m}from"./sanitize.Cb20Sia1.js";document.addEventListener("DOMContentLoaded",()=>{const f=document.getElementById("history-container"),v=document.getElementById("history-loading"),d=document.getElementById("history-empty"),a=document.getElementById("btn-export-csv");let n=[];try{const t=localStorage.getItem("barista_flow_logs");t&&(n=JSON.parse(t))}catch{}v?.remove(),n.length===0?(d?.classList.remove("hidden"),d?.classList.add("flex")):(a&&(a.classList.remove("hidden"),a.classList.add("inline-flex")),u(n)),a&&a.addEventListener("click",()=>{b(n)});function u(t){if(!f)return;f.querySelectorAll(".log-card").forEach(e=>e.remove()),t.forEach(e=>{const l=new Date(e.date).toLocaleDateString("zh-TW",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}),c=Math.round(e.recipe.totalWater/e.recipe.coffeeWeight),i=document.createElement("div");i.className="log-card backdrop-blur-md bg-coffee-darker/60 p-6 rounded-3xl border border-coffee-sand/10 hover:shadow-lg hover:border-coffee-gold/30 hover:-translate-y-1 transition-all duration-300 relative group",i.innerHTML=`
          <button class="absolute top-4 end-4 p-2 text-coffee-sand/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 delete-btn" data-id="${e.id}" title="${window.historyDict.delete}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          
          <div class="mb-4 pe-8">
            <span class="text-[10px] text-coffee-muted mb-1 block">${l}</span>
            <h3 class="font-display font-bold text-lg text-coffee-light truncate">${m(e.recipe.beanName)||window.historyDict.unknownBean}</h3>
            <p class="text-xs text-coffee-sand/80 mt-1">${e.recipe.coffeeWeight}g ${window.historyDict.powder} | 1:${c} | ${e.recipe.totalWater}g ${window.historyDict.water}</p>
          </div>

          <div class="space-y-3 mb-4">
            <!-- Metric: Acidity -->
            <div class="flex items-center gap-3">
              <span class="text-xs text-coffee-muted w-10">${window.historyDict.acidity}</span>
              <div class="flex-1 flex gap-1">${p(e.evaluation.acidity)}</div>
            </div>
            <!-- Metric: Bitterness -->
            <div class="flex items-center gap-3">
              <span class="text-xs text-coffee-muted w-10">${window.historyDict.bitterness}</span>
              <div class="flex-1 flex gap-1">${p(e.evaluation.bitterness)}</div>
            </div>
            <!-- Metric: Body -->
            <div class="flex items-center gap-3">
              <span class="text-xs text-coffee-muted w-10">${window.historyDict.body}</span>
              <div class="flex-1 flex gap-1">${p(e.evaluation.body)}</div>
            </div>
          </div>

          ${e.evaluation.notes?`
          <div class="mt-4 pt-4 border-t border-coffee-sand/10">
            <p class="text-xs text-coffee-sand/80 italic line-clamp-2">"${m(e.evaluation.notes)}"</p>
          </div>`:""}
        `,f.appendChild(i)}),document.querySelectorAll(".delete-btn").forEach(e=>{e.addEventListener("click",r=>{const c=r.currentTarget.getAttribute("data-id");c&&h(c)})})}function p(t){let s="";for(let e=1;e<=5;e++){const r=e<=t?"bg-coffee-gold":"bg-coffee-dark";s+=`<span class="w-3 h-3 rounded-full ${r} border border-coffee-sand/10"></span>`}return s}function h(t){confirm(window.historyDict.confirm)&&(n=n.filter(s=>s.id!==t),localStorage.setItem("barista_flow_logs",JSON.stringify(n)),n.length===0?(d&&(d.classList.remove("hidden"),d.classList.add("flex")),a&&(a.classList.add("hidden"),a.classList.remove("inline-flex")),document.querySelectorAll(".log-card").forEach(s=>s.remove())):u(n))}function b(t){if(t.length===0)return;const s=["Date","Bean Name","Coffee Weight (g)","Total Water (g)","Acidity (1-5)","Bitterness (1-5)","Body (1-5)","Notes"],e=t.map(o=>[o.date,`"${o.recipe.beanName.replace(/"/g,'""')}"`,o.recipe.coffeeWeight,o.recipe.totalWater,o.evaluation.acidity,o.evaluation.bitterness,o.evaluation.body,`"${o.evaluation.notes.replace(/"/g,'""')}"`]),r=[s.join(","),...e.map(o=>o.join(","))].join(`
`),l=new Blob(["\uFEFF"+r],{type:"text/csv;charset=utf-8;"}),c=URL.createObjectURL(l),i=document.createElement("a");i.setAttribute("href",c),i.setAttribute("download",`barista-flow-logs-${new Date().toISOString().split("T")[0]}.csv`),i.style.visibility="hidden",document.body.appendChild(i),i.click(),document.body.removeChild(i)}});
