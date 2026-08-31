import{t as e}from"./sanitize.lCZw1Owo.js";function t(e){if(!e||typeof e!=`object`||!e.recipe||!e.evaluation)return null;let t=String(e.id||``),n=new Date(e.date);if(!/^\d{1,20}$/.test(t)||Number.isNaN(n.valueOf()))return null;let r=(e,t,n,r)=>{let i=Number(e);return Number.isFinite(i)?Math.min(n,Math.max(t,i)):r},i=r(e.recipe.coffeeWeight,1,100,20),a=r(e.recipe.totalWater,1,2500,300),o=Math.round(a/i*10)/10,s=e.recommendation&&typeof e.recommendation==`object`?{title:String(e.recommendation.title||``).slice(0,120),body:String(e.recommendation.body||``).slice(0,500),variable:String(e.recommendation.variable||``).slice(0,40),suggestedRecipe:e.recommendation.suggestedRecipe&&typeof e.recommendation.suggestedRecipe==`object`?e.recommendation.suggestedRecipe:void 0}:void 0;return{id:t,date:n.toISOString(),recipe:{beanName:String(e.recipe.beanName||``).trim().slice(0,80),roastLevel:[`light`,`medium`,`dark`].includes(e.recipe.roastLevel)?e.recipe.roastLevel:`medium`,coffeeWeight:i,totalWater:a,waterRatio:r(e.recipe.waterRatio,10,25,o),waterTemp:r(e.recipe.waterTemp,80,100,92),grindSize:String(e.recipe.grindSize||``).slice(0,80)},recipeVersion:Math.max(1,Math.min(999,Math.round(Number(e.recipeVersion)||1))),parentLogId:/^\d{1,20}$/.test(String(e.parentLogId||``))?String(e.parentLogId):void 0,evaluation:{acidity:r(e.evaluation.acidity,1,5,3),bitterness:r(e.evaluation.bitterness,1,5,3),body:r(e.evaluation.body,1,5,3),overall:r(e.evaluation.overall,1,5,3),issue:String(e.evaluation.issue||`balanced`).slice(0,30),notes:String(e.evaluation.notes||``).slice(0,500)},recommendation:s}}document.addEventListener(`DOMContentLoaded`,()=>{let n=document.getElementById(`history-container`),r=document.getElementById(`history-loading`),i=document.getElementById(`history-empty`),a=document.getElementById(`btn-export-csv`),o=document.getElementById(`btn-compare`),s=document.getElementById(`btn-clear-selection`),c=document.getElementById(`compare-count`),l=document.getElementById(`compare-panel`),u=document.getElementById(`compare-content`),d=[],f=new Set;try{let e=localStorage.getItem(`barista_flow_logs`);if(e){let n=JSON.parse(e);d=Array.isArray(n)?n.map(t).filter(e=>!!e):[]}}catch(e){console.error(`Failed to parse history logs`,e)}r?.remove(),d.length===0?(i?.classList.remove(`hidden`),i?.classList.add(`flex`)):(a&&(a.classList.remove(`hidden`),a.classList.add(`inline-flex`)),o?.classList.remove(`hidden`),s?.classList.remove(`hidden`),p(d)),a&&a.addEventListener(`click`,()=>{v(d)}),o?.addEventListener(`click`,g),s?.addEventListener(`click`,()=>{f.clear(),l?.classList.add(`hidden`),h(),p(d)});function p(t){n&&(n.querySelectorAll(`.log-card`).forEach(e=>e.remove()),t.forEach(t=>{let r=new Date(t.date).toLocaleDateString(window.historyDict.locale,{month:`short`,day:`numeric`,hour:`2-digit`,minute:`2-digit`}),i=t.recipe.waterRatio||Math.round(t.recipe.totalWater/t.recipe.coffeeWeight*10)/10,a=f.has(t.id),o=document.createElement(`div`);o.className=`log-card backdrop-blur-md bg-coffee-darker/60 p-6 rounded-3xl border ${a?`border-coffee-gold ring-2 ring-coffee-gold/20`:`border-coffee-sand/10`} hover:shadow-lg hover:border-coffee-gold/30 transition-all duration-200 relative group`,o.innerHTML=`
          <button class="absolute top-4 end-4 min-h-[44px] min-w-[44px] p-2 text-coffee-sand/50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 delete-btn" data-id="${t.id}" title="${window.historyDict.delete}" aria-label="${window.historyDict.delete}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          
          <div class="mb-4 pe-8">
            <div class="mb-1 flex items-center gap-2 text-[10px] text-coffee-muted"><span>${r}</span><span class="rounded-full border border-coffee-sand/15 px-2 py-0.5">${window.historyDict.version} ${t.recipeVersion}</span></div>
            <h3 class="font-display font-bold text-lg text-coffee-light truncate">${e(t.recipe.beanName)||window.historyDict.unknownBean}</h3>
            <p class="text-xs text-coffee-sand/80 mt-1">${t.recipe.coffeeWeight}g ${window.historyDict.powder} | 1:${i} | ${t.recipe.totalWater}g ${window.historyDict.water}</p>
          </div>

          <div class="space-y-3 mb-4">
            <!-- Metric: Acidity -->
            <div class="flex items-center gap-3">
              <span class="text-xs text-coffee-muted w-10">${window.historyDict.acidity}</span>
              <div class="flex-1 flex gap-1">${m(t.evaluation.acidity)}</div>
            </div>
            <!-- Metric: Bitterness -->
            <div class="flex items-center gap-3">
              <span class="text-xs text-coffee-muted w-10">${window.historyDict.bitterness}</span>
              <div class="flex-1 flex gap-1">${m(t.evaluation.bitterness)}</div>
            </div>
            <!-- Metric: Body -->
            <div class="flex items-center gap-3">
              <span class="text-xs text-coffee-muted w-10">${window.historyDict.body}</span>
              <div class="flex-1 flex gap-1">${m(t.evaluation.body)}</div>
            </div>
            <div class="flex items-center gap-3 border-t border-coffee-sand/10 pt-3">
              <span class="text-xs font-semibold text-coffee-sand w-10">${window.historyDict.overall}</span>
              <div class="flex-1 flex gap-1">${m(t.evaluation.overall)}</div>
            </div>
          </div>

          ${t.recommendation?.title?`
          <div class="mt-4 rounded-xl border border-coffee-gold/15 bg-coffee-gold/5 p-3">
            <p class="text-[10px] font-bold uppercase tracking-wider text-coffee-gold">${window.historyDict.recommendation}</p>
            <p class="mt-1 text-xs font-semibold text-coffee-light">${e(t.recommendation.title)}</p>
          </div>`:``}

          ${t.evaluation.notes?`
          <div class="mt-4 pt-4 border-t border-coffee-sand/10">
            <p class="text-xs text-coffee-sand/80 italic line-clamp-2">"${e(t.evaluation.notes)}"</p>
          </div>`:``}

          <button type="button" class="compare-select-btn mt-5 min-h-[48px] w-full rounded-xl border ${a?`border-coffee-gold bg-coffee-gold text-coffee-dark`:`border-coffee-sand/20 bg-coffee-dark text-coffee-sand`} text-sm font-bold transition-colors" data-id="${t.id}" aria-pressed="${a}">
            ${a?window.historyDict.compareSelected:window.historyDict.compareSelect}
          </button>
        `,n.appendChild(o)}),document.querySelectorAll(`.delete-btn`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget.getAttribute(`data-id`);t&&_(t)})}),document.querySelectorAll(`.compare-select-btn`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget.dataset.id;if(t){if(f.has(t))f.delete(t);else{let e=f.values().next().value;f.size>=2&&e&&f.delete(e),f.add(t)}h(),p(d)}})}),h())}function m(e){let t=``;for(let n=1;n<=5;n++)t+=`<span class="w-3 h-3 rounded-full ${n<=e?`bg-coffee-gold`:`bg-coffee-dark`} border border-coffee-sand/10"></span>`;return t}function h(){c&&(c.textContent=`${f.size}/2`),o&&(o.disabled=f.size!==2)}function g(){let t=d.filter(e=>f.has(e.id));if(t.length!==2||!u)return;t.sort((e,t)=>new Date(e.date).valueOf()-new Date(t.date).valueOf());let[n,r]=t,i=n.recipe.waterRatio,a=r.recipe.waterRatio,o=[];n.recipe.coffeeWeight!==r.recipe.coffeeWeight&&o.push(`${window.historyDict.powder}: ${n.recipe.coffeeWeight}g → ${r.recipe.coffeeWeight}g`),i!==a&&o.push(`${window.historyDict.ratio}: 1:${i} → 1:${a}`),n.recipe.waterTemp!==r.recipe.waterTemp&&o.push(`${window.historyDict.temperature}: ${n.recipe.waterTemp}°C → ${r.recipe.waterTemp}°C`),n.recipe.totalWater!==r.recipe.totalWater&&o.push(`${window.historyDict.water}: ${n.recipe.totalWater}g → ${r.recipe.totalWater}g`),n.recipe.grindSize!==r.recipe.grindSize&&(n.recipe.grindSize||r.recipe.grindSize)&&o.push(`${e(n.recipe.grindSize||`—`)} → ${e(r.recipe.grindSize||`—`)}`);let s=[[window.historyDict.powder,`${n.recipe.coffeeWeight}g`,`${r.recipe.coffeeWeight}g`],[window.historyDict.ratio,`1:${i}`,`1:${a}`],[window.historyDict.temperature,`${n.recipe.waterTemp}°C`,`${r.recipe.waterTemp}°C`],[window.historyDict.acidity,n.evaluation.acidity,r.evaluation.acidity],[window.historyDict.bitterness,n.evaluation.bitterness,r.evaluation.bitterness],[window.historyDict.body,n.evaluation.body,r.evaluation.body],[window.historyDict.overall,n.evaluation.overall,r.evaluation.overall]],c=n.evaluation.overall>r.evaluation.overall,p=r.evaluation.overall>n.evaluation.overall;u.innerHTML=`
        <div class="grid grid-cols-2 gap-3 sm:gap-5">
          ${[n,r].map((t,n)=>`
            <article class="rounded-2xl border ${n===0?`border-blue-400/30 bg-blue-400/5`:`border-coffee-gold/30 bg-coffee-gold/5`} p-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-xs font-black ${n===0?`text-blue-300`:`text-coffee-gold`}">${n===0?`A`:`B`}</span>
                <span class="text-[10px] text-coffee-muted">${window.historyDict.version} ${t.recipeVersion}</span>
              </div>
              <h3 class="mt-2 truncate font-display text-base font-bold text-coffee-light">${e(t.recipe.beanName)||window.historyDict.unknownBean}</h3>
              <div class="mt-3 flex gap-1">${m(t.evaluation.overall)}</div>
              ${n===0&&c||n===1&&p?`<p class="mt-3 text-[10px] font-bold text-green-400">${window.historyDict.compareHigher}</p>`:``}
            </article>
          `).join(``)}
        </div>

        <div class="mt-6 overflow-hidden rounded-2xl border border-coffee-sand/10">
          <table class="w-full text-sm">
            <thead class="bg-coffee-dark text-coffee-muted"><tr><th class="p-3 text-start"></th><th class="p-3 text-center">A</th><th class="p-3 text-center">B</th></tr></thead>
            <tbody>${s.map(e=>`<tr class="border-t border-coffee-sand/10"><th class="p-3 text-start text-xs font-semibold text-coffee-sand">${e[0]}</th><td class="p-3 text-center text-coffee-light">${e[1]}</td><td class="p-3 text-center text-coffee-light">${e[2]}</td></tr>`).join(``)}</tbody>
          </table>
        </div>

        <div class="mt-6 rounded-2xl border border-coffee-sand/10 bg-coffee-dark/60 p-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-coffee-gold">${window.historyDict.compareChanges}</h3>
          ${o.length?`<ul class="mt-3 space-y-2 text-sm text-coffee-sand">${o.map(e=>`<li>• ${e}</li>`).join(``)}</ul>`:`<p class="mt-3 text-sm text-coffee-muted">${window.historyDict.compareSame}</p>`}
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          ${[n,r].map((t,n)=>`
            <div class="rounded-xl border border-coffee-sand/10 p-4">
              <p class="text-[10px] font-bold uppercase tracking-wider text-coffee-muted">${n===0?`A`:`B`} · ${window.historyDict.recommendation}</p>
              <p class="mt-1 text-sm font-semibold text-coffee-light">${e(t.recommendation?.title||`—`)}</p>
            </div>
          `).join(``)}
        </div>

        <button id="btn-rebrew-newer" type="button" class="mt-6 min-h-[52px] w-full rounded-xl bg-gradient-to-r from-coffee-gold to-coffee-sand px-5 text-sm font-bold text-coffee-dark shadow-lg shadow-coffee-gold/20">
          ${window.historyDict.compareRebrew}
        </button>
      `,document.getElementById(`btn-rebrew-newer`)?.addEventListener(`click`,()=>{let e=new Date(n.date)>new Date(r.date)?n:r;try{localStorage.setItem(`barista_flow_recipe`,JSON.stringify(e.recipe)),localStorage.setItem(`barista_flow_pending_parent`,e.id)}catch(e){console.warn(`Could not load the selected recipe:`,e)}window.location.href=window.historyDict.homeUrl}),l?.classList.remove(`hidden`),l?.scrollIntoView({behavior:`smooth`,block:`start`})}function _(e){confirm(window.historyDict.confirm)&&(d=d.filter(t=>t.id!==e),f.delete(e),l?.classList.add(`hidden`),h(),localStorage.setItem(`barista_flow_logs`,JSON.stringify(d)),d.length===0?(i&&(i.classList.remove(`hidden`),i.classList.add(`flex`)),a&&(a.classList.add(`hidden`),a.classList.remove(`inline-flex`)),o?.classList.add(`hidden`),s?.classList.add(`hidden`),document.querySelectorAll(`.log-card`).forEach(e=>e.remove())):p(d))}function v(e){if(e.length===0)return;let t=e=>{let t=String(e??``);return/^[=+\-@]/.test(t)&&(t=`'${t}`),`"${t.replace(/"/g,`""`)}"`},n=[`Date`,`Bean Name`,`Recipe Version`,`Coffee Weight (g)`,`Water Ratio`,`Water Temp (C)`,`Total Water (g)`,`Acidity (1-5)`,`Bitterness (1-5)`,`Body (1-5)`,`Overall (1-5)`,`Issue`,`Next Recommendation`,`Notes`],r=e.map(e=>[t(e.date),t(e.recipe.beanName),e.recipeVersion,e.recipe.coffeeWeight,e.recipe.waterRatio,e.recipe.waterTemp,e.recipe.totalWater,e.evaluation.acidity,e.evaluation.bitterness,e.evaluation.body,e.evaluation.overall,t(e.evaluation.issue),t(e.recommendation?.title||``),t(e.evaluation.notes)]),i=[n.join(`,`),...r.map(e=>e.join(`,`))].join(`
`),a=new Blob([`﻿`+i],{type:`text/csv;charset=utf-8;`}),o=URL.createObjectURL(a),s=document.createElement(`a`);s.setAttribute(`href`,o),s.setAttribute(`download`,`barista-flow-logs-${new Date().toISOString().split(`T`)[0]}.csv`),s.style.visibility=`hidden`,document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(o)}});