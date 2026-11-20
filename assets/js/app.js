(() => {
  "use strict";
  const LAB_ROUTES = ["simulateurs","prerequis","decouvrir-ia","creer-outil","developper-app","verification-securite","prompts","codes-secrets","glossaire"];
  let labSubnavOpen = false;
  function syncLabSubnav(){const sub=document.getElementById("labSubnav");if(sub)sub.classList.toggle("open",labSubnavOpen);}
  const STORAGE_KEY = "atelierIA.progress.v1";
  const ARTICLE_3D_ICONS = {
    "quest-ce-que-lia":"🤖","histoire-de-lia":"⏳","les-concepts-cles":"🧩","glossaire":"📖",
    "les-connecteurs-en-ia":"🔗","les-artefacts-en-ia":"🎨","les-skills-en-ia":"🛠️",
    "ia-generative":"✨","machine-learning":"📊","deep-learning":"🧠","computer-vision":"👁️",
    "ia-conversationnelle":"💬","ia-predictive":"🔮","agents-ia":"🤝","ia-multimodale":"🎭",
    "opportunites-et-limites":"⚖️","ethique-ia":"🧭","reglementation-ia-act":"📜",
    "droit-du-travail-maroc":"🇲🇦","droits-auteurs-ia":"©️","impact-emploi":"💼",
    "impacts-societaux":"🌍","impacts-environnementaux":"🌱","ia-et-eco-conception":"♻️",
    "ia-et-souverainete-etats-geopolitique-et-autonomie-strategique":"🛡️",
    "le-travail-fantome-de-lia-les-petites-mains-derriere-la-machine":"🧵"
  };
  const defaults = () => ({completed:[], quizBest:0, quizLast:null, quizAnswers:{}, notes:{}, favorites:[], theme:"orange", learnerName:"Apprenant", lastRoute:"accueil", simulatorRuns:0, customPrompts:[]});
  const queryTheme = (()=>{try{const q=new URLSearchParams(location.search).get("theme");if(!q)return null;if(q==="default")return null;if(q==="light")return "orange";if(q==="dark")return "night";return ["default","orange","night","blue","smartdoc"].includes(q)?q:null;}catch(e){return null;}})();
  let state = loadState();
  if(queryTheme)state.theme=queryTheme;
  let currentRoute = (location.hash.replace("#","")||"accueil");if(currentRoute==="parcours"||currentRoute==="quiz")currentRoute="accueil";
  let activeCourse = null, activeLesson = null, quizSubmitted = false;
  let courseFilter = "Tous", promptFilter = "Tous", promptsTab = "presentation", codesActiveId = null, codesQuery = "", glossaryQuery = "", glossaryActive = null, pxFormat = "Fiche pratique", pxRole = "Formateur en santé", pxContext = "Professionnels de santé débutants", pxTask = "Créer un support de sensibilisation sur la prévention des infections", pxConstraints = "Langage simple, sources officielles à vérifier, aucune donnée personnelle"; let practiceExercises = [];
  let discoverStep = 0,
    prereqGroup = "required", prereqActive = null, prereqQuery = "", prereqOpenGroups = {required:false,app:false,api:false,optional:false};
  let m2Step = 0;
  let m3Step = 0;
  let m2pStep = 0;
  let vyStep = 0;
  let ciChapter = null;
  let tiChapter = null;
  let eiChapter = null;
  let oiCategory = null;
  let oiQuery = "";
  let wikiQuery = "";
  const app = document.getElementById("app");
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modalContent");
  const toastEl = document.getElementById("toast");
  function loadState(){ try { const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null"); if(!parsed||typeof parsed!=="object")return defaults(); const merged={...defaults(),...parsed}; if(merged.theme==="light")merged.theme="orange"; if(merged.theme==="dark")merged.theme="night"; return merged; } catch(e){ return defaults(); } }
  function applyTheme(theme){state.theme=theme;const root=document.documentElement;const allowed=["orange","night","blue","smartdoc"];if(allowed.includes(theme))root.setAttribute("data-theme",theme);else root.removeAttribute("data-theme");document.body.classList.remove("dark");saveState();}
  function saveState(){ try { localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); } catch(e){ toast("Impossible de sauvegarder : stockage du navigateur indisponible."); } }
  function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function toast(message){toastEl.textContent=message;toastEl.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(()=>toastEl.classList.remove("show"),2600);}
  function completedCount(){return state.completed.length;}
  function totalLessons(){return window.COURSES.reduce((n,c)=>n+c.lessons.length,0);}
  function progress(){return Math.round(completedCount()/totalLessons()*100);}
  function courseProgress(c){return Math.round(c.lessons.filter(l=>state.completed.includes(l.id)).length/c.lessons.length*100);}
  function findCourse(id){return window.COURSES.find(c=>c.id===id);}
  function allPrompts(){return [...window.PROMPTS,...(Array.isArray(state.customPrompts)?state.customPrompts:[])].filter(p=>!p.hidden);}
  function findLesson(id){for(const c of window.COURSES){const l=c.lessons.find(x=>x.id===id);if(l)return {course:c,lesson:l};}return null;}
  function setRoute(route){currentRoute=route;location.hash=route;render();}
  function header(title){document.getElementById("breadcrumb").innerHTML=title==="Accueil"?"Accueil":`<a href="#decouvrir-ia" class="bc-motto" title="Découvrir l’IA">Comprendre l’IA autrement.</a> <span>/</span> <span class="bc-title">${esc(title)}</span>`;document.querySelectorAll("[data-route]").forEach(a=>a.classList.toggle("active",a.dataset.route===currentRoute&&!a.dataset.anchor));const labParent=document.querySelector(".nav-parent");if(labParent)labParent.classList.toggle("parent-active",LAB_ROUTES.includes(currentRoute));syncLabSubnav();document.getElementById("sidebar").classList.remove("open");}
  function pageTitle(eyebrow,title,subtitle){return `<div class="eyebrow">${eyebrow}</div><h1 class="page-title">${title}</h1><p class="subheading">${subtitle}</p>`;}
  function stat(icon,label,value,note){return `<div class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-note">${note}</div></div>`;}
  function courseCard(c){const pct=courseProgress(c);return `<article class="course-card"><div class="course-top"><div class="course-icon">${c.icon}</div><span class="level">${c.level}</span></div><h3>${esc(c.title)}</h3><p>${esc(c.description)}</p><div class="course-meta"><span>${c.lessons.length} séquences</span><span>${c.duration}</span></div><div class="progress-track" aria-label="Progression ${pct}%"><div class="progress-fill" style="width:${pct}%"></div></div><div class="card-footer"><span class="muted" style="font-size:10px">${pct}% terminé</span><button class="btn btn-ghost btn-small" data-course="${c.id}">${pct===100?"Revoir":"Continuer"} →</button></div></article>`;}
  function heroBlock(){const next=window.COURSES.flatMap(c=>c.lessons.map(l=>({course:c,lesson:l}))).find(x=>!state.completed.includes(x.lesson.id));return `<section class="hero"><div><div class="eyebrow">VOTRE PARCOURS COMMENCE ICI</div><h1>Comprendre l’IA autrement.<br>Expérimenter. Progresser.</h1><p>Une formation pratique, progressive et autonome pour découvrir l’intelligence artificielle, tester des mécanismes et développer de bons réflexes.</p></div><div class="hero-side"><div class="hero-art" aria-hidden="true"><div class="ai3d"><div class="ai3d-float"><div class="ai3d-cube"><div class="ai3d-face ai3d-front">IA</div><div class="ai3d-face ai3d-back">IA</div><div class="ai3d-face ai3d-right"></div><div class="ai3d-face ai3d-left"></div><div class="ai3d-face ai3d-top"></div><div class="ai3d-face ai3d-bottom"></div></div></div></div></div><div class="hero-author"><strong>JAMAL HAMDI</strong><span>Ingénierie Systèmes, Réseaux et Cybersécurité</span></div></div></section>`;}
  function accueil(){header("Accueil");return `<section class="accueil-page">${heroBlock()}</section><div class="homeclock" id="homeclock"><div class="hc-reloj"><svg viewBox="0 0 128 128" id="hcSvg" aria-label="Horloge"><circle cx="64" cy="64" r="60" fill="#fff" stroke="#dcd8cc"/><g id="hcTicks"></g><line id="hcMin" x1="64" y1="64" x2="64" y2="18" stroke="#0e7568" stroke-width="3" stroke-linecap="round"/><line id="hcHor" x1="64" y1="64" x2="64" y2="38" stroke="#333a35" stroke-width="4.5" stroke-linecap="round"/><circle cx="64" cy="64" r="4" fill="#0e7568"/></svg></div><div class="hc-body"><div class="hc-dig" id="hcDig">--:--</div><div class="hc-ampm"><button type="button" id="hcAm" aria-pressed="false">a.&nbsp;m.</button><button type="button" id="hcPm" aria-pressed="false">p.&nbsp;m.</button></div><div class="hc-cap">heure locale</div><div class="hc-date" id="hcDate"></div></div></div>`;}
  function parcours(){header("Parcours & ateliers");const levels=["Tous","Débutant","Intermédiaire","Avancé"];const courses=window.COURSES.filter(c=>courseFilter==="Tous"||c.level===courseFilter);return `${pageTitle("APPRENDRE EN PRATIQUANT","Parcours & ateliers","Choisissez un parcours, progressez séquence par séquence et marquez chaque activité terminée.")}<div class="filters">${levels.map(l=>`<button class="filter-btn ${courseFilter===l?"active":""}" data-level="${l}">${l}</button>`).join("")}<div class="course-grid">${courses.map(courseCard).join("")}<div class="section-head"><div><h2>Vue détaillée du parcours</h2><p>Ouvrez une séquence pour lire la leçon et réaliser l’activité proposée.</p></div></div><div class="path-list">${courses.map((c,i)=>`<div class="path-item"><div class="path-number">${i+1}</div><div><h3>${esc(c.title)} <span class="level">${c.level}</span></h3><p>${c.lessons.map(l=>esc(l.title)).join(" · ")}</p><div class="progress-track" style="margin-top:10px;max-width:430px"><div class="progress-fill" style="width:${courseProgress(c)}%"></div></div></div><button class="btn btn-secondary btn-small" data-course="${c.id}">Voir les ateliers →</button></div>`).join("")}</div>`;}
  function prerequis(){
    header("Prérequis");
    const tools=[
      {name:"ChatGPT",util:"Utiliser un assistant d’IA conversationnel",links:[{label:"ChatGPT (Desktop)",href:"https://chatgpt.com/fr-FR/download/"},{label:"ChatGPT (Navigateur)",href:"https://chatgpt.com/"}],variant:"btn-ghost",mandatory:true},
      {name:"Ollama",util:"Exécuter des modèles d’IA localement",site:"https://ollama.com",mandatory:false},
      {name:"LM Studio",util:"Télécharger et utiliser des modèles d’IA avec une interface graphique",site:"https://lmstudio.ai",mandatory:false},
      {name:"OpenCode",util:"Développer avec un assistant d’IA dans le terminal",links:[{label:"OpenCode",href:"https://opencode.ai/fr/download"},{label:"OpenRouter",href:"https://openrouter.ai/"}],variant:"btn-ghost",mandatory:true},
      {name:"Node.js",util:"Exécuter des outils et scripts JavaScript",site:"https://nodejs.org/fr",mandatory:true},
      {name:"XAMPP",util:"Serveur local Apache + PHP + MySQL pour développer et tester des applications web",site:"https://www.apachefriends.org/fr/index.html",mandatory:false,app:true},
      {name:"Notepad++",util:"Éditer du code et des fichiers texte",site:"https://notepad-plus-plus.org/downloads/",mandatory:false,app:true},
      {name:"Visual Studio Code",util:"Modifier et développer des projets",site:"https://code.visualstudio.com",mandatory:false},
      {name:"Git",util:"Gérer les versions des projets",site:"https://git-scm.com",mandatory:false},
      {name:"Python",util:"Exécuter certains scripts et outils d’IA",site:"https://python.org",mandatory:false},
      {name:"Pipette",util:"Identifier et copier les couleurs d’une page web",links:[{label:"Pipette (Webstore)",href:"https://chromewebstore.google.com/detail/color-picker-hex-eyedropp/hagjjmpgfabjpcoklghamlpdamjljoeh"}],mandatory:false,app:true},
      {name:"GitHub Desktop",util:"Gérer des projets Git avec une interface graphique",site:"https://desktop.github.com",mandatory:false},
      {name:"Kimi navigateur",util:"Utiliser l’assistant IA Kimi directement dans le navigateur",links:[{label:"Kimi (Site officiel)",href:"https://www.kimi.ai/"}],mandatory:false},
      {name:"Kimi desktop",util:"Installer l’application Kimi sur votre ordinateur",links:[{label:"Kimi Desktop (téléchargement)",href:"https://www.kimi.ai/products/download"}],mandatory:false},
      {name:"Z.ai",util:"Créer et gérer une clé API pour connecter un modèle d’IA à vos outils",links:[{label:"Z.ai — Gestion des clés API",href:"https://z.ai/manage-apikey/apikey-list"}],mandatory:false,api:true},
      {name:"OpenRouter",util:"Accéder à plusieurs modèles d’IA via une API unifiée",links:[{label:"OpenRouter — Site officiel",href:"https://openrouter.ai/"}],mandatory:false,api:true},
      {name:"Skills",util:"Découvrir et réutiliser des compétences et méthodes pour les agents IA",links:[{label:"Skills.sh — Bibliothèque de skills",href:"https://www.skills.sh/"}],mandatory:false,group:"skills"},
      {name:"MCP (Model Context Protocol)",util:"Connecter un agent IA à des outils, services et systèmes externes",links:[{label:"MCP Servers — Catalogue",href:"https://mcpservers.org/fr/"}],mandatory:false,group:"mcp"},
      {name:"WhatFont",util:"Identifier la police de caractères utilisée sur une page web",links:[{label:"WhatFont (Webstore)",href:"https://chromewebstore.google.com/detail/whatfont/jabopobgcpjmedljpbcaablpmlmfcogm?hl=fr&utm_source=ext_sidebar"}],mandatory:false,app:true}
    ];
    tools.forEach((t,i)=>t.num=i+1);
    const TOOL_ICOS={1:"assets/img/t1.ico",2:"assets/img/t2.png",3:"assets/img/t3.ico",4:"assets/img/t4.svg",5:"assets/img/t5.png",6:"assets/img/t6.ico",7:"assets/img/t7.ico",8:"assets/img/t8.ico",9:"assets/img/t9.svg",10:"assets/img/t10.ico",11:"assets/img/pipette.png",12:"assets/img/t12.svg",13:"assets/img/t13.png",14:"assets/img/t13.png",19:"assets/img/whatfont.png"};
    const toolIco=(t,cls)=>{const brand=t.name==="Z.ai"?"Z":t.name==="OpenRouter"?"OR":t.name==="Skills"?"S":t.name.startsWith("MCP")?"MCP":null;return TOOL_ICOS[t.num]?`<img class="tool-ico ${cls}" src="${TOOL_ICOS[t.num]}" alt="">`:brand?`<span class="tool-ico ${cls} api-brand-icon" aria-label="${esc(t.name)}">${brand}</span>`:`<span class="tool-ico ${cls}" aria-hidden="true">${t.api?"✦":"•"}</span>`;};
    const groups={required:{label:"Outils obligatoires pour commencer",icon:"☁"},app:{label:"APP / Extensions",icon:"⊞"},api:{label:"API_Kesys",icon:"⌘"},skills:{label:"Skills",icon:"✦"},mcp:{label:"MCP (Model Context Protocol)",icon:"⤢"},optional:{label:"Outils optionnels (facultatifs)",icon:"▤"}};
    const groupOf=t=>t.group||(t.mandatory?"required":t.app?"app":t.api?"api":"optional");
    const groupTools={};tools.forEach(t=>{const g=groupOf(t);(groupTools[g]=groupTools[g]||[]).push(t);});
    const searchText=t=>`${t.name} ${t.util}`.toLowerCase();
    const badge=t=>t.mandatory?`<span class="badge required">Obligatoire</span>`:`<span class="badge optional">Optionnel</span>`;
    const navItem=t=>{const g=groupOf(t);return `<li data-prereq-search="${esc(searchText(t))}" data-group-item="${g}" style="${prereqOpenGroups[g]?"":"display:none"}"><a href="#" data-prereq-open="${t.num}" data-prereq-group="${g}" class="${prereqActive===t.num?"active":""}"><span class="gnum">${String(t.num).padStart(2,"0")}</span><span class="gterm">${toolIco(t,"tool-ico-nav")}${esc(t.name)}</span></a></li>`;};
    const detail=t=>`<button type="button" class="guide-back" data-prereq-back>← Retour au catalogue</button><h2>${toolIco(t,"tool-ico-detail")}<span>${esc(t.name)}</span> ${badge(t)}</h2><p>${esc(t.util)}</p><div class="guide-actions">${(t.links||[{label:"Télécharger / Site officiel",href:t.site}]).map(l=>`<a class="btn btn-primary btn-small" href="${l.href}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")}</div><div class="galert info"><span>ⓘ</span><span>Tenez les outils à jour et téléchargez-les uniquement depuis les sites officiels.</span></div>`;
        const catalog=()=>{const list=groupTools[prereqGroup]||[];const cards=list.map(t=>`<article class="glossary-card" data-prereq-open="${t.num}" data-term-search="${esc(searchText(t))}"><span class="code-num">${String(t.num).padStart(2,"0")}</span><h3>${toolIco(t,"tool-ico-card")}<span>${esc(t.name)}</span> ${badge(t)}</h3><p>${esc(t.util)}</p><span class="code-more">Voir les liens →</span></article>`).join("");return `<h2>${groups[prereqGroup].label}</h2><p>Cliquez sur un outil du sommaire ou sur une carte pour afficher ses liens de téléchargement.</p><div class="glossary-cards">${cards}</div><div class="guide-empty" id="prerequisEmpty" hidden>Aucun outil ne correspond à votre recherche.</div>`;};
    const content=prereqActive!==null&&prereqActive>=1&&prereqActive<=tools.length?detail(tools[prereqActive-1]):catalog();
    const nav=Object.keys(groups).map(g=>{const open=prereqOpenGroups[g];return `<li class="nav-all group-head ${open?"open":""}" data-prereq-search=""><a href="#" data-prereq-group="${g}" class="${prereqGroup===g&&prereqActive===null?"active":""}"><span class="guide-icon">${groups[g].icon}</span> ${groups[g].label} <span class="gnum">${(groupTools[g]||[]).length}</span><span class="gchev">▾</span></a></li>${(groupTools[g]||[]).map(navItem).join("")}`;}).join("");
    return `<section class="prerequis-page"><h1 class="page-title">Prérequis</h1><p class="subheading">Outils d’IA pour ordinateur : sélectionnez les outils nécessaires pour suivre les parcours et utiliser les fonctionnalités proposées.</p><div class="sim-page"><div class="guide-wrap" id="prerequisGuide"><aside class="guide-sidebar"><h3><span class="guide-icon">✦</span> Sommaire</h3><input type="text" class="guide-search" id="prerequisSearch" placeholder="Rechercher un outil..." value="${esc(prereqQuery)}" aria-label="Rechercher un outil"><ul class="guide-nav" id="prerequisNav">${nav}</ul><div class="guide-empty" id="prerequisNavEmpty" hidden>Aucun outil.</div></aside><div class="guide-content" id="prerequisContent">${content}</div></div></div></section>`;
  }
    function codesSearchText(c){return `${c.code} ${c.fr} ${c.ar} ${c.longFr}`.toLowerCase();}
  function codeCard(c){return `<article class="code-card" data-code-open="${c.id}" data-code-search="${esc(codesSearchText(c))}"><div class="code-card-top"><span class="code-num">${String(c.id).padStart(2,"0")}</span><code>${esc(c.code)}</code></div><p>${esc(c.fr)}</p><span class="ar-mini" dir="rtl" lang="ar">${esc(c.ar)}</span><span class="code-more">Voir l’explication →</span></article>`;}
  function codeCatalog(codes){return `<h2><span>✦</span> Tous les codes secrets</h2><p>Cliquez sur un code pour afficher son explication détaillée et un exemple d’utilisation.</p><div class="galert info"><span>ⓘ</span><span>Astuce : utilisez la recherche du sommaire pour filtrer par mot-clé, en français ou en arabe.</span></div><div class="codes-grid">${codes.map(codeCard).join("")}</div><div class="guide-empty" id="codesEmpty" hidden>Aucun code ne correspond à votre recherche.</div>`;}
  function codeDetail(c){return `<button type="button" class="guide-back" data-code-back>← Retour au catalogue</button><h2><span class="code-num">${String(c.id).padStart(2,"0")}</span> <code class="guide-code">${esc(c.code)}</code></h2><p class="code-tagline">${esc(c.fr)}</p><div class="gstep"><h4>Exemple d’utilisation</h4><div class="code-example"><span>›</span><span><strong>${esc(c.code)}</strong> ${esc(c.example)}</span></div></div><h3>Explication</h3><p>${esc(c.longFr)}</p><h3 class="guide-ar-title" dir="rtl" lang="ar">الشرح بالعربية</h3><p class="guide-ar" dir="rtl" lang="ar">${esc(c.longAr)}</p><div class="guide-actions"><button type="button" class="btn btn-primary btn-small" data-code-copy="${esc(c.code)}">Copier ${esc(c.code)}</button><button type="button" class="btn btn-secondary btn-small" data-code-back>← Catalogue</button></div>`;}
  function codesSecrets(){header("Codes Secrets");const all=window.SECRET_CODES||[];const active=all.find(c=>c.id===codesActiveId)||null;const nav=all.map(c=>`<li data-code-search="${esc(codesSearchText(c))}"><a href="#" data-code-nav="${c.id}" class="${active&&active.id===c.id?"active":""}"><span class="gnum">${String(c.id).padStart(2,"0")}</span><span class="gterm">${esc(c.code)}</span></a></li>`).join("");return `<section class="codes-secrets-page">${pageTitle("GUIDE D’UTILISATION","Codes Secrets ChatGPT",`${all.length} commandes prêtes à l’emploi, expliquées en français et en arabe.`)}<div class="sim-page"><div class="guide-wrap" id="codesGuide"><aside class="guide-sidebar"><h3><span class="guide-icon">✦</span> Sommaire</h3><input type="text" class="guide-search" id="codesSearch" placeholder="Rechercher dans le guide..." value="${esc(codesQuery)}" aria-label="Rechercher dans le guide"><ul class="guide-nav" id="codesNav"><li class="nav-all" data-code-search=""><a href="#" data-code-nav="all" class="${active?"":"active"}">◫ Tous les codes <span class="gnum">${all.length}</span></a></li>${nav}</ul><div class="guide-empty" id="codesNavEmpty" hidden>Aucun résultat.</div></aside><div class="guide-content" id="codesContent">${active?codeDetail(active):codeCatalog(all)}</div></div></div></section>`;}
  function ciReadingTime(words){return Math.max(1,Math.round((words||0)/180));}
  function wikiSection(cfg){
    header(cfg.menuTitle);
    const chapters=(cfg.data()||{}).chapters||[];
    const active=cfg.getChapter()?chapters.find(c=>c.slug===cfg.getChapter())||null:null;
    const q=wikiQuery;
    const nav=`<li class="nav-all" data-article-search=""><a href="#" data-nav="${cfg.hash}:all" class="${active?"":"active"}">◫ Tous les articles <span class="gnum">${chapters.length}</span></a></li>`+chapters.map(c=>`<li data-article-search="${esc(c.title.toLowerCase())}"><a href="#" data-nav="${cfg.hash}:${c.slug}" class="${active&&active.slug===c.slug?"active":""}"><span class="gnum">${String(c.num).padStart(2,"0")}</span><span class="gterm">${esc(c.title)}</span></a></li>`).join("");
    let content;
    if(!active){
      const cards=chapters.map(c=>{
        const icon=cfg.icons3d&&ARTICLE_3D_ICONS[c.slug]?`<span class="article-3d-icon" aria-hidden="true">${ARTICLE_3D_ICONS[c.slug]}</span>`:"";
        return `<article class="glossary-card${cfg.icons3d?" article-card-3d":""}" data-nav="${cfg.hash}:${c.slug}" data-term-search="${esc((c.title+" "+c.tagline).toLowerCase())}">${icon?`<div class="article-card-head">${icon}<div class="article-card-head-text"><span class="code-num">${String(c.num).padStart(2,"0")}</span><h3>${esc(c.title)}</h3></div></div>`:`<span class="code-num">${String(c.num).padStart(2,"0")}</span><h3>${esc(c.title)}</h3>`}<p>${esc(c.tagline)} · ≈ ${ciReadingTime(c.words)} min de lecture</p><span class="code-more">Lire l’article →</span></article>`;
      }).join("");
      content=`<h2>Tous les articles</h2><p>Cliquez sur un article du sommaire ou sur une carte pour lire l’article.</p><div class="glossary-cards">${cards}</div><div class="guide-empty" id="wikiEmpty" hidden>Aucun article ne correspond à votre recherche.</div>`;
    }else{
      const idx=chapters.findIndex(c=>c.slug===active.slug);
      const prev=idx>0?chapters[idx-1]:null, next=idx<chapters.length-1?chapters[idx+1]:null;
      content=`<button type="button" class="guide-back" data-nav="${cfg.hash}:all">← Retour au catalogue</button><h2><span class="code-num">${String(active.num).padStart(2,"0")}</span><span>${esc(active.docTitle)}</span></h2><p class="ci-meta">≈ ${ciReadingTime(active.words)} min de lecture</p><article class="ci-article">${active.html}</article><div class="ci-pager">${prev?`<button type="button" class="btn btn-secondary" data-nav="${cfg.hash}:${prev.slug}">← ${esc(prev.title)}</button>`:"<span></span>"}${next?`<button type="button" class="btn btn-primary" data-nav="${cfg.hash}:${next.slug}">${esc(next.title)} →</button>`:`<button type="button" class="btn btn-secondary" data-nav="${cfg.hash}:all">Terminer · Tous les articles</button>`}</div>`;
    }
    return `<section class="prerequis-page wiki-page"><h1 class="page-title wiki-page-title">${esc(cfg.menuTitle)}</h1><p class="subheading">${esc((cfg.data()||{}).subtitle||"")}</p><div class="sim-page"><div class="guide-wrap" id="wikiGuide"><aside class="guide-sidebar"><h3><span class="guide-icon">✦</span> Sommaire</h3><input type="text" class="guide-search" id="wikiSearch" placeholder="Rechercher un article..." value="${esc(q)}" aria-label="Rechercher un article"><ul class="guide-nav" id="wikiNav">${nav}</ul><div class="guide-empty" id="wikiNavEmpty" hidden>Aucun article.</div></aside><div class="guide-content" id="wikiContent">${content}</div></div></div></section>`;
  }
  function comprendreIA(){return wikiSection({menuTitle:"Comprendre l’IA",eyebrow:"COMPRENDRE L’IA",hash:"comprendre-ia",data:()=>window.COMPRENDRE_IA,getChapter:()=>ciChapter,icons3d:true,intro:"Les bases de l’intelligence artificielle en 7 articles : définition, histoire, concepts clés, glossaire, connecteurs, artéfacts et Skills. Chaque article est intégré à l’application, consultable hors connexion, avec des liens croisés d’un article à l’autre."});}
  function typesIA(){return wikiSection({menuTitle:"Types d’IA",eyebrow:"TYPES D’IA",hash:"types-ia",data:()=>window.TYPES_IA,getChapter:()=>tiChapter,icons3d:true,intro:"Les grandes familles d’intelligence artificielle en 8 articles : IA générative, Machine Learning, Deep Learning, Computer Vision, IA conversationnelle, IA prédictive, Agents IA et IA multimodale. Chaque article est intégré à l’application, consultable hors connexion, avec des liens croisés d’un article à l’autre."});}
  function enjeuxImpacts(){return wikiSection({menuTitle:"Enjeux et impacts",eyebrow:"ENJEUX ET IMPACTS",hash:"enjeux-impacts",data:()=>window.ENJEUX_IMPACTS,getChapter:()=>eiChapter,icons3d:true,intro:"Éthique, société, emploi, environnement et cadre juridique : 11 articles intégrés à l’application, consultables hors connexion, avec des liens croisés d’un article à l’autre."});}
  function outilsIA(){
    header("Outils IA");
    const data=window.OUTILS_IA||{subtitle:"",categories:[]};
    const cats=data.categories||[];
    const active=oiCategory?cats.find(c=>c.slug===oiCategory)||null:null;
    const q=oiQuery;
    const searchText=c=>((c.title||"")+" "+(c.tagline||"")).toLowerCase();
    const total=cats.reduce((n,c)=>n+(Number(c.count)||0),0);
    const nav=`<li class="nav-all" data-oi-search=""><a href="#" data-oi-nav="all" class="${active?"":"active"}">◫ Toutes les catégories <span class="gnum">${cats.length}</span></a></li>`+cats.map(c=>`<li data-oi-search="${esc(searchText(c))}"><a href="#" data-oi-nav="${esc(c.slug)}" class="${active&&active.slug===c.slug?"active":""}"><span class="gnum">${esc(c.num)}</span><span class="gterm">${esc(c.title)}</span><span class="gnum">${Number(c.count)||0}</span></a></li>`).join("");
    let content;
    if(!active){
      const cards=cats.map(c=>`<article class="glossary-card oi-card article-card-3d" data-oi-nav="${esc(c.slug)}" data-term-search="${esc(searchText(c))}"><div class="oi-card-banner" style="background:${esc(c.color||"#dce9ee")}"><span class="article-3d-icon oi-card-icon" aria-hidden="true">${esc(c.icon||"🧰")}</span><span class="oi-count">${Number(c.count)||0} outils</span><h3>${esc(c.title)}</h3></div><p>${esc(c.tagline)}</p><span class="code-more">Voir la catégorie →</span></article>`).join("");
      content=`<h2>Toutes les catégories</h2><p>${cats.length} familles d’usage · ${total} outils recensés dans la source. Cliquez sur une catégorie du sommaire ou sur une carte pour afficher son aperçu.</p><div class="glossary-cards oi-grid">${cards}</div><div class="guide-empty" id="oiEmpty" hidden>Aucune catégorie ne correspond à votre recherche.</div>`;
    }else{
      const idx=cats.findIndex(c=>c.slug===active.slug);
      const prev=idx>0?cats[idx-1]:null,next=idx<cats.length-1?cats[idx+1]:null;
      const tools=active.tools||[];
      const toolCards=tools.map(t=>{
        const flags=[t.free?"<span class=\"badge free\">Gratuit</span>":"",t.os?"<span class=\"badge optional\">Open source</span>":"",t.eu?"<span class=\"badge optional\">🇪🇺 Europe</span>":""].filter(Boolean).join("");
        const links=t.siteUrl?`<a class="btn btn-primary btn-small" href="${esc(t.siteUrl)}" target="_blank" rel="noopener">Site officiel ↗</a>`:"";
        return `<article class="glossary-card oi-tool-card" data-term-search="${esc((t.name+" "+t.desc+" "+t.meta).toLowerCase())}"><div class="oi-tool-top"><span class="code-num">${esc(t.num)}</span><h3>${esc(t.name)}</h3>${flags}</div><p>${esc(t.desc)}</p><p class="oi-tool-meta">${esc(t.meta)}</p>${links?`<div class="guide-actions">${links}</div>`:""}</article>`;
      }).join("");
      content=`<button type="button" class="guide-back" data-oi-nav="all">← Retour aux catégories</button><h2><span class="code-num">${esc(active.num)}</span> <span class="article-3d-icon oi-detail-icon" aria-hidden="true">${esc(active.icon||"🧰")}</span> <span>${esc(active.title)}</span></h2><p class="code-tagline">${esc(active.sourceTitle||active.tagline)}</p><p>${tools.length} outils · ${esc(active.tagline)} · Données importées localement depuis wiikiiaii.com.</p><div class="glossary-cards oi-tools">${toolCards}</div><div class="guide-empty" id="oiToolsEmpty" hidden>Aucun outil ne correspond à votre recherche.</div><div class="ci-pager">${prev?`<button type="button" class="btn btn-secondary" data-oi-nav="${esc(prev.slug)}">← ${esc(prev.title)}</button>`:"<span></span>"}${next?`<button type="button" class="btn btn-primary" data-oi-nav="${esc(next.slug)}">${esc(next.title)} →</button>`:`<button type="button" class="btn btn-secondary" data-oi-nav="all">Terminer · Toutes les catégories</button>`}</div>`;
    }
    return `<section class="prerequis-page wiki-page outils-ia-page">${pageTitle("OUTILS IA","Outils IA",esc(data.subtitle||""))}<div class="sim-page"><div class="guide-wrap" id="oiGuide"><aside class="guide-sidebar"><h3><span class="guide-icon">✦</span> Sommaire</h3><input type="text" class="guide-search" id="oiSearch" placeholder="Rechercher un outil ou une catégorie..." value="${esc(q)}" aria-label="Rechercher un outil ou une catégorie"><ul class="guide-nav" id="oiNav">${nav}</ul><div class="guide-empty" id="oiNavEmpty" hidden>Aucune catégorie.</div></aside><div class="guide-content" id="oiContent">${content}</div></div></div></section>`;
  }
  function parametres(){header("Paramètres");const themes=[{id:"default",name:"Vert clair",desc:"Domaine de la santé",sw:"default"},{id:"orange",name:"Orange",desc:"Style Auto-ÉcoleA",sw:"orange"},{id:"blue",name:"Bleu",desc:"Style professionnel",sw:"blue"},{id:"night",name:"Mode nuit",desc:"Interface sombre",sw:"night"},{id:"smartdoc",name:"SmartDoc",desc:"Tableau de bord clinique",sw:"smartdoc"}];const opts=themes.map(t=>`<button type="button" class="theme-opt ${state.theme===t.id?"active":""}" data-set-theme="${t.id}"><span class="theme-swatch sw-${t.sw}"><i></i><i></i><i></i></span><span class="theme-name"><i class="theme-check">✓</i> ${t.name}</span><span class="theme-desc">${t.desc}</span></button>`).join("");return `<section class="parametres-page">
    <div class="section-head"><div><h2 class="serif-title">Paramètres de l'application</h2><p class="muted">Gérez l'apparence de l'application.</p></div></div>
    <div class="panel panel-themes">
      <div class="panel-head"><h3>Apparence & Thème</h3></div>
      <p class="muted" style="font-size:11px;margin-bottom:10px">Choisissez le thème. Le choix est enregistré sur cet appareil.</p>
      <div class="theme-grid">${opts}</div>
    </div>
    <div class="panel contact-panel">
      <div class="contact-grid">
        <div class="contact-main">
          <h3 class="contact-title"><svg class="ci ci-title" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1a10 10 0 0 0-10 10v9a3 3 0 0 0 3 3h2a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H4.2A8 8 0 0 1 20 11.4V19a1 1 0 0 0 1 1 3 3 0 0 0 0-1V11A10 10 0 0 0 12 1zM7 13v8H5a1 1 0 0 1-1-1v-7h3zm12 8h-2v-8h3v7a1 1 0 0 1-1 1z"/><path d="M12 3a8 8 0 0 1 8 8v8a3 3 0 0 1-3 3h-2v-2h2a1 1 0 0 0 1-1v-8a6 6 0 1 0-12 0v8a1 1 0 0 0 1 1h2v2h-2a3 3 0 0 1-3-3v-8a8 8 0 0 1 8-8z"/></svg> Contacter le développeur</h3>
          <p class="contact-lead">Besoin d’un accompagnement pour votre projet ou d’une application sur mesure, conçue pour répondre à vos besoins spécifiques ?</p>
          <p class="contact-lead">Vous souhaitez ajouter de nouvelles fonctionnalités, personnaliser votre application ou développer une solution entièrement sur mesure ?</p>
          <p class="contact-lead contact-lead-strong">N’hésitez pas à contacter <strong>M. Jamal</strong>, qui vous accompagnera à chaque étape de votre projet et vous proposera des solutions adaptées à vos besoins.</p>
          <div class="contact-facts"><span class="contact-fact contact-fact-vs">Réponse &lt; 24 h</span><span class="contact-fact">Lun – Sam · 9h – 18h</span></div>
          <div class="contact-actions">
            <a class="btn btn-primary btn-small" href="tel:+212661617067"><svg class="ci" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg> Appeler</a>
            <a class="btn btn-primary btn-small" href="https://wa.me/212661617067 target="_blank" rel="noopener"><svg class="ci" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.7 15L2 22l5.2-1.3A10 10 0 1 0 12 2zm5.4 13.7c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .2-3.4-.9-2.9-1.4-4.7-4.4-4.9-4.6-.1-.2-1.1-1.5-1.1-2.9 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.9.8 2 .1.1.1.3 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1c.2-.2.4-.2.6-.1l2 1c.3.1.5.2.5.3 0 .2 0 .8-.2 1.4z"/></svg> WhatsApp</a>
            <a class="btn btn-primary btn-small" href="mailto:onepro182@gmail.com"><svg class="ci" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm8 7L4.5 6.2 4 6v1.1l8 5.9 8-5.9V6l-.5.2L12 11z"/></svg> Email</a>
          </div>
        </div>
        <aside class="contact-qr"><em>Scanner pour contacter le développeur</em><img src="assets/img/cb.png" alt="Code CB — scanner pour contacter le développeur"></aside>
      </div>
    </div>
    </div>
  </section>`;}
  function courseView(courseId){const c=findCourse(courseId);if(!c){setRoute("accueil");return;}activeCourse=c.id;activeLesson=c.lessons.find(l=>!state.completed.includes(l.id))?.id||c.lessons[0].id;lessonView(activeLesson);}
  function lessonView(lessonId){const found=findLesson(lessonId);if(!found){setRoute("accueil");return;}activeCourse=found.course.id;activeLesson=found.lesson.id;const c=found.course,l=found.lesson,done=state.completed.includes(l.id),idx=c.lessons.findIndex(x=>x.id===l.id);header("À la une");app.innerHTML=`<div class="lesson-layout"><aside class="panel lesson-sidebar"><div class="eyebrow">${c.level}</div><h3>${esc(c.title)}</h3><p class="muted" style="font-size:11px">${courseProgress(c)}% du parcours terminé</p><div class="progress-track" style="margin:13px 0 20px"><div class="progress-fill" style="width:${courseProgress(c)}%"></div></div><div class="lesson-nav">${c.lessons.map((x,i)=>`<button class="${x.id===l.id?"active":""}" data-lesson="${x.id}">${state.completed.includes(x.id)?"✓":"○"} ${i+1}. ${esc(x.title)}</button>`).join("")}</div><button class="btn btn-secondary btn-small" style="margin-top:18px" data-goto="accueil">← Retour à l’accueil</button></aside><article class="panel lesson-content"><div class="eyebrow">${esc(l.type)} · ${l.duration}</div><h1>${esc(l.title)}</h1><p class="lesson-lead">${esc(l.content)}</p><div class="callout"><strong>Point essentiel</strong><p>${esc(l.takeaway)}</p></div><h2>Objectifs d’apprentissage</h2><ul>${c.objectives.map(o=>`<li>${esc(o)}</li>`).join("")}</ul><div class="activity-box"><h3>À vous de pratiquer</h3><p>${esc(l.activity)}</p>${l.type==="Simulateur"?`<button class="btn btn-primary btn-small" data-goto="simulateurs">Ouvrir les Laboratoire →</button>`:`<label for="note-${l.id}" style="display:block;font-size:11px;font-weight:700;margin:12px 0 6px">Mes notes (facultatif)</label><textarea class="field" id="note-${l.id}" rows="3" placeholder="Écrivez vos observations...">${esc(state.notes[l.id]||"")}</textarea><button class="btn btn-secondary btn-small" style="margin-top:8px" id="saveNote" data-note="${l.id}">Enregistrer mes notes</button>`}</div><div class="lesson-actions">${idx>0?`<button class="btn btn-secondary" data-lesson="${c.lessons[idx-1].id}">← Précédent</button>`:""}${done?`<span class="badge done">Séquence terminée ✓</span>`:`<button class="btn btn-primary" id="completeLesson" data-id="${l.id}">Marquer comme terminée</button>`}${idx<c.lessons.length-1?`<button class="btn btn-secondary" data-lesson="${c.lessons[idx+1].id}">Suivant →</button>`:`<button class="btn btn-secondary" data-goto="accueil">Retour à l’accueil</button>`}</div></article></div>`;}
  function quizPage(){header("Quiz & évaluations");quizSubmitted=false;return `${pageTitle("VÉRIFIER LES ACQUIS","Quiz général","Répondez aux 8 questions. Le résultat et les explications s’affichent après validation.")}<form id="quizForm">${window.QUIZ.map((q,i)=>`<section class="quiz-question"><h3><span class="tag">Question ${i+1} / ${window.QUIZ.length}</span><br><br>${esc(q.question)}</h3><div class="option-list">${q.options.map((o,j)=>`<label class="quiz-option"><input type="radio" name="${q.id}" value="${j}" ${state.quizAnswers[q.id]===j?"checked":""}><span>${esc(o)}</span></label>`).join("")}</div></section>`).join("")}<button class="btn btn-primary" type="submit">Corriger mon quiz →</button></form><div id="quizResult"></div><div class="callout"><strong>Conseil</strong><p>Un quiz mesure quelques connaissances à un instant donné. Reprenez les explications et les ateliers plutôt que de viser uniquement un score.</p></div>`;}
  function Laboratoire(){header("Laboratoire interactif");return `${pageTitle("LABORATOIRE INTERACTIF","Laboratoire interactif"," ")}<div class="sim-page">
    <section class="panel" style="margin-bottom:16px">
      <div class="panel-head"><h3>Présentation</h3></div>
      <p>L'objectif est de créer un atelier pédagogique interactif accompagné d'une véritable application web fonctionnelle, pour apprendre aux Utilisateurs à utiliser l'intelligence artificielle dans la prévention, l'information en santé et la création d'outils numériques destinés aux professionnels de santé.</p>
     </section>
    <div class="section-head"><div><h2 class="serif-title">1. Objectifs pédagogiques</h2><p class="muted">À la fin de l'atelier, les Utilisateurs seront capables de :</p></div></div>
    <section class="panel" style="margin-bottom:16px">
      <ul class="objectives-list"><li>Comprendre ce que l'IA peut faire et ce qu'elle ne peut pas faire en santé.</li><li>Rédiger des prompts précis pour produire des contenus de prévention.</li><li>Vérifier les informations générées et repérer les erreurs potentielles.</li><li>Concevoir une petite application web interactive avec l'aide de l'IA.</li><li>Créer des fiches éducatives en français et en arabe.</li><li>Respecter la confidentialité des données et les limites de l'utilisation médicale de l'IA.</li></ul>
    </section>
    <div class="section-head"><div><h2 class="serif-title">2. Programme pratique de l'atelier</h2><p class="muted">Durée indicative : 4 à 5 heures, réalisables en une journée ou en plusieurs séances.</p></div></div>
    <div class="course-grid">
      <article class="glossary-card" id="lab-decouvrir"><span class="code-num">01</span><h3>Module 1 — Découvrir l'IA</h3><p>Comprendre les modèles d'IA, leurs usages en santé, leurs limites et les erreurs possibles.</p><a href="#decouvrir-ia" class="code-more">Ouvrir le module →</a></article>
      <article class="glossary-card" id="lab-creer-outil"><span class="code-num">02</span><h3>Créer un outil éducatif en santé</h3><p>Générer et vérifier une fiche de prévention, puis préparer ses versions française et arabe.</p><a href="#creer-outil" class="code-more">Ouvrir le module →</a></article>
      <article class="glossary-card" id="lab-verification"><span class="code-num">03</span><h3>Vérification et sécurité</h3><p>Tester l'application, repérer les informations douteuses, éviter les données personnelles et vérifier l'affichage arabe RTL.</p><a href="#verification-securite" class="code-more">Ouvrir le module →</a></article>
    </div>
    <div class="section-head"><div><h2 class="serif-title">3. Application web : IA Santé Lab</h2><p class="muted">Le cahier des charges fonctionnel est défini. La création du fichier HTML téléchargeable n'a toutefois pas abouti : la fonctionnalité Python utilisée pour produire des fichiers est temporairement indisponible. Elle pourrait redevenir disponible dans environ 2 heures, sans garantie.</p></div></div>
    <section class="panel" style="margin-bottom:16px">
      <div class="panel-head"><h3>Fonctionnalités prévues</h3></div>
      <ul class="objectives-list"><li><strong>Tableau de bord pédagogique</strong> — Modules, progression des Utilisateurs et résultats aux quiz.</li><li><strong>Interface bilingue</strong> — Français et arabe, avec prise en charge du sens d'écriture RTL.</li><li><strong>Laboratoire de prompts</strong> — Créer, copier et télécharger des instructions pour des exercices de santé.</li><li><strong>Générateur de fiches éducatives</strong> — Supports de prévention bilingues, avec zones de vérification et de validation professionnelle.</li><li><strong>Projets et évaluations</strong> — Quiz corrigé, checklist de développement et sauvegarde locale de la progression.</li></ul>
    </section>
    <div class="section-head"><div><h2 class="serif-title">4. Comment les Utilisateurs utiliseront l'application</h2></div></div>
    <section class="panel" style="margin-bottom:16px">
      <ol class="objectives-list"><li>Ouvrir l'application dans un navigateur.</li><li>Suivre le module de découverte de l'IA.</li><li>Réaliser une expérience avec le laboratoire de prompts.</li><li>Créer une fiche de prévention en français et en arabe.</li><li>Développer progressivement un projet web.</li><li>Passer le quiz et vérifier les acquis.</li></ol>
      <div class="callout"><strong>Important</strong><p>Le générateur pédagogique doit produire des supports à vérifier, et non des diagnostics ou des prescriptions. Une véritable génération de contenu par un modèle d'IA nécessitera une intégration spécifique ; elle n'est pas garantie par une interface HTML seule.</p></div>
      <div class="warning-note">Le livrable restant à produire est le fichier laboratoire_interactif_IA_sante.html, autonome et utilisable localement. Aucun fichier téléchargeable n'a été créé lors de cette tentative.</div>
    </section></div>`;}
  function verifState(){let s;try{s=JSON.parse(localStorage.getItem("verifChecklist")||"[]")}catch(e){s=[]}const arr=Array.isArray(s)?s.slice(0,8):[];while(arr.length<8)arr.push(false);return arr;}
  function verificationPage(){header("Vérification et sécurité");
    const VERIF_CARDS=[
      {icon:"🧪",t:"01",h:"Tests de l’application",p:"Vérifier chaque page, bouton, lien et formulaire : tout doit fonctionner sans erreur, en ligne comme hors ligne (fichier local)."},
      {icon:"🚩",t:"02",h:"Contrôle de l’information santé",p:"Repérer les signes douteux : source manquante, promesse de guérison, urgence inventée, chiffre invérifiable, conseil contraire aux recommandations officielles."},
      {icon:"🔒",t:"03",h:"Protection des données personnelles",p:"Ne saisir aucune donnée réelle de patient (nom, téléphone, e-mail, dossier médical). Utiliser uniquement des exemples fictifs conservés localement."},
      {icon:"🌐",t:"04",h:"Vérification bilingue et RTL",p:"Comparer les versions française et arabe : cohérence du sens, sens de lecture RTL (dir=\"rtl\"), police lisible, ponctuation et accents corrects."},
      {icon:"✅",t:"05",h:"Checklist de validation",p:"Suivre la liste interactive ci-dessous, cocher chaque contrôle validé et garder une trace locale de la vérification."},
      {icon:"⚖️",t:"06",h:"Limites du prototype",p:"L’application est une démonstration pédagogique : ce n’est ni un dispositif médical ni un modèle d’IA réel. Aucun diagnostic ni prescription."}
    ];
    const VERIF_ITEMS=[
      "L’information provient d’une source officielle identifiable (OMS, ministère de la Santé, autre source vérifiée).",
      "Le message ne promet pas de guérison, de traitement rapide ou de résultat garanti.",
      "Les chiffres, dates et pourcentages cités sont exacts et vérifiables.",
      "Aucune donnée personnelle réelle n’est saisie : les exemples utilisent des données fictives.",
      "Le contenu français et la version arabe sont cohérents ; rien n’est perdu dans la traduction.",
      "L’affichage arabe est correct : sens de lecture RTL, police lisible, ponctuation respectée.",
      "Tous les boutons, liens et formulaires de l’application fonctionnent comme prévu.",
      "La mention « démonstration pédagogique — pas un modèle d’IA réel » est visible sur le prototype."
    ];
    const vs=verifState();const done=vs.filter(x=>x).length;const pct=Math.round(done/VERIF_ITEMS.length*100);
    const cards=VERIF_CARDS.map(c=>`<article class="glossary-card"><span class="code-num">${c.t}</span><h3><span class="verif-ico">${c.icon}</span> ${c.h}</h3><p>${c.p}</p></article>`).join("");
    const list=vs.map((ok,i)=>`<label class="verif-item${ok?" done":""}"><input type="checkbox" data-verif="${i}" ${ok?"checked":""}><span>${esc(VERIF_ITEMS[i])}</span></label>`).join("");
    const secs=[];
    secs.push({title:"1. Présentation et objectifs",html:`<section class="panel" style="margin-bottom:16px">
      <div class="panel-head"><h3>Présentation</h3></div>
      <p>Dernière étape de l’atelier : l’application n’est utile que si elle est fiable. Cette page réunit les fonctionnalités de vérification prévues par le projet — tests des fonctionnalités, contrôle de l’information santé, protection des données, cohérence bilingue et checklist de validation.</p>
    </section>
    <section class="panel">
      <div class="panel-head"><h3>Objectifs pédagogiques</h3></div>
      <p class="muted" style="font-size:12px">À la fin de cette étape, les Utilisateurs seront capables de :</p>
      <ul class="objectives-list"><li>Tester systématiquement une application locale et signaler ce qui ne fonctionne pas.</li><li>Repérer les informations douteuses ou dangereuses dans un contenu santé.</li><li>Appliquer les règles de protection des données personnelles.</li><li>Vérifier la cohérence bilingue et l’affichage arabe RTL.</li><li>Valider un prototype à l’aide d’une checklist interactive.</li></ul>
    </section>`});
    secs.push({title:"2. Fonctionnalités de vérification",html:`<p class="muted" style="font-size:13px;margin-bottom:14px">Fonctionnalités prévues par le projet, regroupées sous l’onglet Vérification et sécurité.</p>
      <div class="course-grid">${cards}</div>`});
    secs.push({title:"3. Checklist de validation interactive",html:`<section class="panel" style="margin-bottom:16px">
      <div class="v-prog-row"><span class="muted" id="vOut">${done} / ${VERIF_ITEMS.length} contrôles validés</span><div class="progress-track" style="flex:1;max-width:420px"><div class="progress-fill" id="vTrack" style="width:${pct}%"></div></div></div>
      <div class="verif-list">${list}</div>
      <div class="guide-actions" style="margin-top:16px"><button type="button" class="btn btn-secondary btn-small" id="vReset">↺ Réinitialiser la checklist</button></div>
    </section>
    <div class="galert info"><span>ⓘ</span><span>Aucune donnée médicale réelle ne doit jamais être saisie dans ce prototype : conservez uniquement des exemples fictifs, enregistrés localement.</span></div>`});
    const i=Math.max(0,Math.min(vyStep,secs.length-1)),s=secs[i];
    const prevBtn=i>0?`<button class="btn btn-secondary" id="vyPrev">← Précédent</button>`:`<span></span>`;
    const nextBtn=i<secs.length-1?`<button class="btn btn-primary" id="vyNext">Suivant →</button>`:`<span></span>`;
    const nav=`<div class="lesson-actions">${prevBtn}<span class="muted">${i+1} / ${secs.length}</span>${nextBtn}</div>`;
    return `${pageTitle("DERNIÈRE ÉTAPE","Vérification et sécurité","Contrôler la qualité, la sécurité et la fiabilité de l’application pédagogique avant tout partage.")}<div class="sim-page">
    <div class="section-head"><div><h2 class="serif-title">${esc(s.title)}</h2></div></div>
    ${s.html}
    ${nav}</div>`;}
  function creerOutil(){header("Créer un outil en santé");
    const secs=[];
    secs.push({title:"1. Présentation de l’atelier",html:`<section class="panel" style="margin-bottom:16px">
      <div style="float:right;margin:0 0 14px 18px"><img class="m3img" src="IMG/Module%203.jfif" alt="Illustration" title="Survolez pour agrandir" style="width:300px;max-width:100%;height:auto;border:1px solid var(--line);border-radius:10px;background:#fff;padding:6px;box-shadow:var(--shadow)"></div>
      <p>L’objectif est de concevoir une application web de dossier médical professionnel (DMP) permettant à un établissement de santé de structurer et de consulter les informations médicales des patients, de gérer les consultations et de préparer des comptes rendus.</p>
      <p>Contrairement au carnet de santé personnel, cette application est conçue pour un usage professionnel, avec des rôles utilisateurs, des droits d’accès et des exigences renforcées de confidentialité, de traçabilité et de sécurité.</p>
      <div class="callout" style="clear:both"><strong>Important</strong><p>La première version sera un prototype pédagogique fonctionnant avec des données fictives. Elle ne devra pas être utilisée pour prendre en charge de vrais patients avant une validation technique, clinique, juridique et sécuritaire adaptée.</p></div>
    </section>`});
    secs.push({title:"2. Fonctionnalités à développer",html:`<table class="m3tbl">
      <thead><tr><th>Module</th><th>Fonctionnalités principales</th></tr></thead>
      <tbody><tr><td>Tableau de bord</td><td>Vue d’ensemble des consultations et rendez-vous</td></tr><tr><td>Patients</td><td>Création, recherche, consultation et modification des fiches</td></tr><tr><td>Dossier médical</td><td>Antécédents, allergies déclarées, traitements consignés et examens</td></tr><tr><td>Consultations</td><td>Motif, observations, compte rendu et statut de validation</td></tr><tr><td>Rendez-vous</td><td>Planification, modification et annulation</td></tr><tr><td>Utilisateurs</td><td>Gestion des rôles et des autorisations</td></tr><tr><td>Traçabilité</td><td>Historique des accès et des modifications</td></tr><tr><td>Documents</td><td>Impression et export contrôlé des comptes rendus</td></tr></tbody></table>`});
    const m3Prompt=`# Projet : Dossier médical professionnel

Agis comme un développeur full-stack senior spécialisé dans les applications web de santé et la sécurité informatique.

## Objectif

Créer une application web de gestion d'un dossier médical professionnel, destinée à un usage pédagogique et fonctionnant initialement avec des données fictives.

## Technologies

- Frontend (interface utilisateur) : HTML5, CSS3 et JavaScript — interface visible par l'utilisateur.
- Backend (interface d'administration) : Apache + PHP — traitement des formulaires, authentification, administration.
- Base de données : MySQL — stockage des utilisateurs, données patients, rendez-vous, factures, produits, commandes, etc.

## Fonctionnalités

1. Tableau de bord professionnel.
2. Gestion des fiches patients.
3. Historique médical structuré.
4. Gestion des consultations et comptes rendus.
5. Gestion des rendez-vous.
6. Gestion des utilisateurs et des rôles.
7. Traçabilité des accès et modifications.
8. Impression et export contrôlé des documents.

## Exigences de sécurité

- Utiliser uniquement des données fictives en développement.
- Appliquer les autorisations côté serveur.
- Protéger les sessions et les mots de passe.
- Valider les entrées et prévenir les injections et les attaques XSS.
- Protéger les communications et les données stockées.
- Prévoir des sauvegardes et des tests de restauration.
- Ne jamais transmettre des dossiers médicaux à une IA externe.
- Ne pas intégrer de diagnostic ou de prescription automatisée.
- Documenter les risques et les limites du prototype.

## Livrables

Fournir le code source complet, le schéma de base de données, les instructions d'installation, les données de démonstration, les tests automatisés et une documentation technique.

Commencer par une version minimale fonctionnelle et développer les modules progressivement. Distinguer les tests prévus des tests réellement exécutés.

Ne pas présenter le prototype comme un système médical prêt pour la production. Toute utilisation réelle devra faire l'objet de validations techniques, cliniques, juridiques et sécuritaires adaptées.`;
    secs.push({title:"3. Atelier — Prompt de développement",html:`<p>Le prompt suivant peut être utilisé dans un assistant de programmation pour générer la première version du projet.</p>
      <section class="panel"><div style="display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;margin-bottom:10px"><button type="button" class="btn btn-secondary btn-small" id="m3CopyBtn" title="Copie le prompt, puis lance automatiquement ChatGPT Desktop avec le prompt pré-rempli dans la conversation">⧉ Copier le prompt</button><a class="btn btn-secondary btn-small" href="https://chatgpt.com/" target="_blank" rel="noopener">Ouvrir ChatGPT dans un nouvel onglet ↗</a><a class="btn btn-secondary btn-small" id="m3DeskBtn" href="codex://threads/new" title="Lance l’application ChatGPT Desktop installée sur ce PC avec le prompt pré-rempli dans une nouvelle conversation">Ouvrir ChatGPT Desktop ↗</a>
</div>
      <div class="m3lp">${(function(rawLines){const ics={"Objectif":"🎯","Technologies":"🛠️","Fonctionnalités":"⚙️","Exigences de sécurité":"🛡️","Livrables":"📦"};const out=[];let cur=null;for(const l of rawLines){const h1=l.match(/^# (.+)$/);const h2=l.match(/^## (.+)$/);if(h1||h2){const t=h1?h1[1]:h2[1];cur={t,ic:h1?"🏥":(ics[t.trim()]||"▪"),ls:[]};out.push(cur);}else if(cur)cur.ls.push(l);}return out.map((s,si)=>{const body=s.ls.filter(x=>x.trim()).map(x=>esc(x)).join("\n");return `<div class="lp-sec"><button type="button" class="lp-t" data-lp-sec="${si}"><span class="lp-chev">▸</span><span class="lp-ico">${s.ic}</span> ${esc(s.t)}</button><button type="button" class="btn btn-ghost btn-small" style="position:absolute;right:8px;top:50%;transform:translateY(-50%)" data-copy-m3="${si}" title="Copier cette partie">⧉ Copier</button><div class="lp-body" data-lp-body="${si}" hidden>${body}</div></div>`;}).join("");})(m3Prompt.split("\n"))}</div>
      <div id="m3PromptRaw" hidden>${esc(m3Prompt)}</div></section>`});
    secs.push({title:"4. Évaluation du projet",html:`<section class="panel" style="margin-bottom:16px">
      <p>Le projet est considéré comme pédagogiquement abouti lorsque le participant dispose d’un prototype permettant de :</p>
      <ul class="objectives-list"><li>Gérer des patients <strong>fictifs</strong> (créer, consulter, modifier une fiche).</li><li>Enregistrer des <strong>consultations</strong> (motif, observations, compte rendu).</li><li>Planifier des <strong>rendez-vous</strong> (création, modification, annulation).</li><li>Démontrer des <strong>contrôles d’accès documentés</strong> (rôles élèves/utilisateurs, droits et traçabilité).</li></ul>
    </section>
    <section class="panel">
      <div class="panel-head"><h3>Livrable final du module</h3></div>
      <p>Un <strong>prototype web de dossier médical professionnel</strong>, accompagné de :</p>
      <ul class="objectives-list"><li>Son <strong>code source</strong> complet.</li><li>Une <strong>documentation technique</strong> (architecture, schéma de la base, guide d’installation).</li><li>Un <strong>jeu de tests</strong> (vérification des fonctionnalités et des contrôles).</li><li>Une <strong>checklist de sécurité</strong> (données fictives, autorisations, sauvegardes).</li></ul>
    </section>`});
    const i=Math.max(0,Math.min(m3Step,secs.length-1)),s=secs[i];
    const prevBtn=i>0?`<button class="btn btn-secondary" id="coPrev">← Précédent</button>`:`<span></span>`;
    const nextBtn=i<secs.length-1?`<button class="btn btn-primary" id="coNext">Suivant →</button>`:`<span></span>`;
    const nav=`<div class="lesson-actions">${prevBtn}<span class="muted">${i+1} / ${secs.length}</span>${nextBtn}</div>`;
    return `${pageTitle("ATELIER PRATIQUE","Créer un outil en santé","* Générer une application web de dossier médical professionnel.")}<div class="sim-page">
    <div class="section-head"><div><h2 class="serif-title">${esc(s.title)}</h2></div></div>
    ${s.html}
    ${nav}</div>`;}
  function decouvrirIA(){header("Découvrir l'IA");const secs=[];
    secs.push({title:"A. Qu'est-ce que l'intelligence artificielle ?",html:`<section class="panel" style="margin-bottom:16px">
      <p>L'intelligence artificielle (IA) regroupe un ensemble de techniques informatiques qui permettent à des systèmes de réaliser certaines tâches habituellement associées à l'intelligence humaine, comme analyser des données, reconnaître des images, comprendre ou générer du texte, identifier des tendances et aider à la prise de décision.</p>
      <p>L'IA s'appuie notamment sur des algorithmes et des modèles entraînés à partir de données. Selon leur conception, ces systèmes peuvent assister les professionnels dans la recherche d'informations, l'automatisation de tâches répétitives et la résolution de problèmes.</p>
    </section>`});
    secs.push({title:"B. Découvrir l'intelligence artificielle dans les métiers de la santé",html:`<section class="panel" style="margin-bottom:16px">
      <p>Ce module vise à découvrir les principales applications de l'intelligence artificielle dans les métiers de la santé, à comprendre ses possibilités et ses limites, et à apprendre à l'utiliser de manière responsable dans un contexte professionnel.</p>
      <p>Les participants découvriront des exemples concrets d'utilisation de l'IA, notamment pour :</p>
      <ul class="objectives-list"><li><strong>L'information et la documentation :</strong> résumer des documents, organiser des informations et préparer des supports pédagogiques.</li><li><strong>L'aide aux professionnels :</strong> structurer des comptes rendus, préparer des questions pour une consultation et faciliter certaines tâches administratives.</li><li><strong>La prévention et l'éducation à la santé :</strong> créer des supports de sensibilisation et adapter les contenus aux publics concernés.</li><li><strong>L'analyse des données :</strong> repérer des tendances et faciliter l'interprétation de données, dans le respect des compétences professionnelles et des règles applicables.</li></ul>
    </section>`});
    secs.push({title:"C. Identifier les limites et les risques de l'IA",html:`<section class="panel" style="margin-bottom:16px">
      <p>L'intelligence artificielle peut produire des informations inexactes, incomplètes ou trompeuses. Elle peut également reproduire des biais présents dans ses données d'entraînement.</p>
      <p>Son utilisation en santé nécessite donc une vigilance particulière concernant :</p>
      <ul class="objectives-list"><li>La vérification des informations auprès de sources fiables.</li><li>La confidentialité des données personnelles et médicales.</li><li>La sécurité des outils et des informations utilisées.</li><li>Les biais, les erreurs et les limites des modèles.</li><li>La responsabilité du professionnel dans toute décision relevant de ses compétences.</li></ul>
      <div class="callout"><strong>Principe essentiel</strong><p>L'IA est un outil d'assistance. Elle ne remplace ni le jugement clinique, ni l'expertise des professionnels de santé, ni la relation humaine avec le patient.</p></div>
    </section>`});
    secs.push({title:"D. Objectifs pédagogiques",html:`<section class="panel" style="margin-bottom:16px">
      <p>À la fin de ce module, vous serez capable de :</p>
      <ul class="objectives-list"><li>Expliquer simplement ce qu'est l'intelligence artificielle.</li><li>Distinguer l'IA générative des autres formes d'IA.</li><li>Identifier des usages utiles dans votre pratique professionnelle.</li><li>Reconnaître les erreurs, les biais et les risques liés à l'IA.</li><li>Rédiger et tester un premier prompt adapté à une situation de santé.</li><li>Protéger les données personnelles et médicales des patients.</li></ul>
    </section>`});
    const i=Math.max(0,Math.min(discoverStep,secs.length-1)),s=secs[i];
    const prevBtn=i>0?`<button class="btn btn-secondary" id="discPrev">← Précédent</button>`:`<span></span>`;
    const nextBtn=i<secs.length-1?`<button class="btn btn-secondary" id="discNext">Suivant →</button>`:`<span></span>`;
    const nav=`<div class="lesson-actions">${prevBtn}<span class="muted">${i+1} / ${secs.length}</span>${nextBtn}</div>`;
    return `${pageTitle("MODULE 1","Module 1 — Comprendre l'intelligence artificielle","")}<div class="sim-page">
    <div class="section-head"><div><h2 class="serif-title">${esc(s.title)}</h2></div></div>
    ${s.html}
    ${nav}</div>`;}
  const CORPUS=[{title:"Protection des données",text:"Ne partagez pas de mots de passe, clés API, données personnelles ou informations clients avec un service non approuvé. Anonymisez les données et vérifiez les règles de conservation."},{title:"Évaluation d’un modèle",text:"Séparez les données d’entraînement et de test. Analysez les faux positifs et faux négatifs et choisissez des métriques adaptées au risque métier."},{title:"Prompt efficace",text:"Précisez l’objectif, le contexte, les contraintes et le format attendu. Demandez au système de signaler l’incertitude et vérifiez les faits importants."},{title:"Fonctionnement du RAG",text:"Un système RAG récupère des passages dans un corpus documentaire puis les transmet à un modèle génératif. La qualité dépend de la récupération et de la génération."},{title:"Sécurité des agents",text:"Traitez les documents externes comme des données non fiables. Limitez les permissions, séparez les instructions de confiance et exigez une validation humaine pour les actions sensibles."},{title:"Réseaux de neurones",text:"Un neurone combine des entrées pondérées, ajoute un biais et applie une fonction d’activation. L’entraînement ajuste les paramètres pour réduire une fonction de perte."}];
  function buildPx(){const fmtMap={"Fiche pratique":"Fiche pratique avec titres et listes","Tableau comparatif":"Tableau comparatif","Plan de formation":"Plan de formation","Présentation":"Présentation"};return `Rôle : ${pxRole}.\nContexte : ${pxContext}.\nTâche : ${pxTask}.\nFormat attendu : ${fmtMap[pxFormat]||pxFormat}.\nContraintes : ${pxConstraints}.\n\nVérifie la cohérence de la réponse, signale les incertitudes et n'invente ni faits ni références.`;}
  function promptsPage(){header("Bibliothèque de prompts");const prompts=allPrompts();const categories=["Tous",...new Set(prompts.map(p=>p.category))];const ps=prompts.filter(p=>(promptFilter==="Tous"||p.category===promptFilter));const tabs=`<div class="prompt-tabs"><button class="prompt-tab ${promptsTab==="presentation"?"active":""}" data-prompts-tab="presentation">Présentation</button><button class="prompt-tab ${promptsTab==="pratique"?"active":""}" data-prompts-tab="pratique">Pratique</button><button class="prompt-tab ${promptsTab==="bibliotheque"?"active":""}" data-prompts-tab="bibliotheque">Bibliothèque de prompts</button></div>`;const biblio=`<div class="filters" style="justify-content:space-between"><div class="filter-group">${categories.map(c=>`<button class="filter-btn ${promptFilter===c?"active":""}" data-prompt-filter="${esc(c)}">${esc(c)}</button>`).join("")}</div><button class="btn btn-primary" id="newPromptBtn">Nouveau</button></div><div class="prompt-grid">${ps.map((p,i)=>`<article class="prompt-card"><div style="display:flex;justify-content:space-between;gap:8px"><span class="tag">${esc(p.category)}</span><button class="btn btn-secondary btn-small" data-favorite="${esc(p.title)}">${state.favorites.includes(p.title)?"★ Favori":"☆ Favoris"}</button></div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="prompt-text" data-px-text="b${i}" hidden>${esc(p.prompt)}</div><div class="prompt-actions"><button class="btn btn-primary btn-small icon-btn" data-copy-prompt="${esc(p.title)}" title="Copier le modèle" aria-label="Copier le modèle"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button><button type="button" class="btn btn-secondary btn-small icon-btn" data-toggle-prompt-text="b${i}" title="Afficher le prompt" aria-label="Afficher le prompt"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button><button class="btn btn-secondary btn-small" data-edit-prompt="${esc(p.id||p.title)}" title="Modifier" aria-label="Modifier"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg></button><button class="btn btn-secondary btn-small" data-delete-prompt="${esc(p.id||p.title)}" title="Supprimer" aria-label="Supprimer"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button></div></article>`).join("")}</div>`;const presSecs=[];presSecs.push(`<div class="section-head"><div><h2 class="serif-title">1. Présentation du module</h2></div></div>
    <section class="panel" style="margin-bottom:16px"><p>Le laboratoire de prompts est un atelier pratique qui permet aux professionnels de santé d'apprendre à communiquer efficacement avec une intelligence artificielle. Les participants vont concevoir, tester, améliorer et évaluer des instructions (prompts) adaptées à des situations professionnelles concrètes.</p><p>L'objectif n'est pas seulement d'obtenir une réponse de l'IA, mais de savoir formuler une demande précise, contrôler la qualité du résultat et respecter les règles de confidentialité et de sécurité propres au domaine de la santé.</p></section>`);presSecs.push(`<div class="section-head"><div><h2 class="serif-title">2. Objectifs pédagogiques</h2></div></div>
    <section class="panel" style="margin-bottom:16px"><p>À la fin de ce module, le participant sera capable de :</p><ul class="objectives-list"><li>Comprendre la structure d'un prompt efficace.</li><li>Définir le rôle, le contexte, la tâche, le format et les contraintes d'une demande.</li><li>Utiliser l'IA pour créer des supports pédagogiques, des documents administratifs et des contenus de prévention.</li><li>Améliorer un prompt en fonction de la qualité de la première réponse.</li><li>Détecter les informations douteuses ou non vérifiées.</li><li>Utiliser des données fictives et protéger les informations médicales confidentielles.</li></ul></section>`);presSecs.push(`<div class="section-head"><div><h2 class="serif-title">3. La méthode pour rédiger un prompt efficace</h2><p class="muted">La méthode RCTFC — une structure simple à appliquer à vos demandes professionnelles.</p></div></div>
    <div class="rctfc-grid">
      <div class="rctfc-card"><div class="rctfc-row"><span class="rctfc-letter">R</span><h3>Rôle :</h3><p>Quel rôle l'IA doit-elle adopter ?</p></div><span class="rctfc-ex">Exemple : Tu es un formateur en éducation à la santé.</span></div>
      <div class="rctfc-card"><div class="rctfc-row"><span class="rctfc-letter">C</span><h3>Contexte :</h3><p>Quelle est la situation et quel est le public ?</p></div><span class="rctfc-ex">Exemple : Le support est destiné à des patients adultes.</span></div>
      <div class="rctfc-card"><div class="rctfc-row"><span class="rctfc-letter">T</span><h3>Tâche :</h3><p>Que doit-elle réaliser précisément ?</p></div><span class="rctfc-ex">Exemple : Prépare un contenu sur l'hygiène des mains.</span></div>
      <div class="rctfc-card"><div class="rctfc-row"><span class="rctfc-letter">F</span><h3>Format :</h3><p>Comment présenter le résultat ?</p></div><span class="rctfc-ex">Exemple : Présente un titre, 5 conseils et un résumé.</span></div>
      <div class="rctfc-card"><div class="rctfc-row"><span class="rctfc-letter">C</span><h3>Contraintes :</h3><p>Quelles limites et précautions respecter ?</p></div><span class="rctfc-ex">Exemple : Utilise un langage simple et signale les points à vérifier.</span></div>
    </div>`);
    const mi=Math.max(0,Math.min(m2Step,presSecs.length-1));
    const m2prev=mi>0?`<button class="btn btn-secondary" id="m2Prev">← Précédent</button>`:`<span></span>`;
    const m2next=mi<presSecs.length-1?`<button class="btn btn-secondary" id="m2Next">Suivant →</button>`:`<span></span>`;
    const presentation=`${presSecs[mi]}<div class="lesson-actions">${m2prev}<span class="muted">${mi+1} / ${presSecs.length}</span>${m2next}</div>`;
    practiceExercises.length=0;practiceExercises.push({t:"Créer une fiche de prévention",cat:"Prévention",lvl:"Débutant",prompt:"Agis comme un rédacteur en éducation à la santé. Crée une fiche de prévention sur l'hygiène des mains destinée au grand public. Présente les situations où le lavage est important, les étapes essentielles et les erreurs fréquentes. Utilise un langage simple, des titres courts et une conclusion mémorisable. Appuie les recommandations sur des sources sanitaires officielles identifiables et signale les éléments à vérifier. N'inclus aucune donnée personnelle."},{t:"Préparer un cours pour les soignants",cat:"Formation",lvl:"Débutant",prompt:"Agis comme un formateur en éducation à la santé. Prépare un plan de cours sur l'hygiène des mains destiné à des soignants débutants. Structure le contenu en objectifs, séquences et points clés, et propose une durée indicative. Utilise un vocabulaire professionnel simple et ajoute un court quiz de vérification. Signale les éléments à valider et n'inclus aucune donnée personnelle."},{t:"Résumer un document scientifique",cat:"Documentation",lvl:"Intermédiaire",prompt:"Agis comme un assistant documentaire en santé. Résume le document fourni en distinguant l'objectif, la méthode, les résultats principaux et les limites. Utilise des puces courtes et un langage neutre. Ne t'appuie que sur les informations présentes dans le texte et signale ce qui n'est pas précisé. Ne conserve aucune donnée personnelle."},{t:"Expliquer un sujet médical simplement",cat:"Communication",lvl:"Intermédiaire",prompt:"Agis comme un rédacteur en éducation à la santé. Explique un sujet médical à un public non expert en langage clair. Présente une introduction courte, une analogie, trois points essentiels et une conclusion rassurante. Évite le jargon ou explique-le, et indique les points qui méritent l'avis d'un professionnel."},{t:"Structurer un compte rendu fictif",cat:"Administration",lvl:"Débutant",prompt:"Agis comme un assistant administratif en santé. Structure un compte rendu à partir d'une situation fictive. Organise le texte en contexte, observations, actions réalisées et suites à donner. Utilise un style neutre et professionnel, avec des phrases courtes. N'inclus aucune identité ni donnée réelle."},{t:"Vérifier une réponse générée par l'IA",cat:"Esprit critique",lvl:"Avancé",prompt:"Agis comme un relecteur critique. Analyse la réponse fournie et repère les affirmations douteuses, non étayées ou contradictoires. Propose pour chacune une vérification auprès d'une source officielle. Classe les points par niveau d'incertitude et rappelle de ne pas se substituer à l'expertise professionnelle."});
    const pracSecs=[];pracSecs.push(`<div class="section-head"><div><h2 class="serif-title">4. Bibliothèque de prompts prêts à tester</h2><p class="muted">Sélectionnez un exemple pour afficher son prompt et le copier dans votre outil d'IA.</p></div></div>
    <section class="panel" style="margin-bottom:16px"><div class="panel-head"><h3>Prompts professionnels</h3><span class="tag">6 exercices</span></div>
    <div class="prompt-grid">${practiceExercises.map((e,i)=>`<article class="prompt-card"><div style="display:flex;justify-content:space-between;gap:8px"><span class="tag">${esc(e.cat)} · ${esc(e.lvl)}</span><span class="code-num">${i+1}</span></div><h3>${esc(e.t)}</h3><div class="prompt-text" data-px-text="${i}" hidden>${esc(e.prompt)}</div><div class="prompt-actions"><button class="btn btn-primary btn-small icon-btn" data-copy-practice="${i}" title="Copier le prompt" aria-label="Copier le prompt"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button><button class="btn btn-secondary btn-small icon-btn" data-toggle-prompt-text="${i}" title="Afficher le prompt" aria-label="Afficher le prompt"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button></div></article>`).join("")}</div></section>`);pracSecs.push(`<div class="section-head"><div><h2 class="serif-title">5. Atelier interactif — Construisez votre propre prompt</h2><p class="muted">Complétez les champs suivants pour générer une consigne adaptée à votre activité. Utilisez uniquement des situations fictives ou des informations autorisées.</p></div></div>
    <section class="panel" style="margin-bottom:16px">
      <div class="px-layout">
        <div class="px-fields">
          <label class="field-label">1. Rôle de l'IA</label><input class="field" id="pxRole" placeholder="Ex. Formateur en santé" value="${esc(pxRole)}">
          <label class="field-label">2. Contexte et public cible</label><input class="field" id="pxContext" placeholder="Ex. Professionnels de santé débutants" value="${esc(pxContext)}">
          <label class="field-label">3. Tâche à réaliser</label><input class="field" id="pxTask" value="${esc(pxTask)}">
          <label class="field-label">4. Format attendu</label><div class="filter-group" style="margin-bottom:10px">${["Fiche pratique","Tableau comparatif","Plan de formation","Présentation"].map(f=>`<button class="filter-btn ${pxFormat===f?"active":""}" data-px-format="${f}">${f}</button>`).join("")}</div>
          <label class="field-label">5. Contraintes et précautions</label><input class="field" id="pxConstraints" value="${esc(pxConstraints)}">
        </div>
        <div class="generated-prompt"><strong>Votre prompt généré</strong><div class="prompt-text" id="pxOutput">${esc(buildPx())}</div><div class="prompt-actions" style="margin-top:12px"><button class="btn btn-primary btn-small" id="pxCopy">Copier mon prompt</button><a class="btn btn-secondary btn-small" id="pxTest" href="https://chatgpt.com/" target="_blank" rel="noopener">Tester ce prompt avec ChatGPT</a></div></div>
      </div>
    </section>`);pracSecs.push(`<div class="section-head"><div><h2 class="serif-title">6. Comparer et améliorer les résultats</h2><p class="muted">Un bon prompt se construit souvent en plusieurs étapes.</p></div></div>
    <div class="steps-grid">
      <div class="step-card"><span class="step-num">1</span><h3>Étape 1 — Tester</h3><p>Soumettez votre demande initiale et observez la réponse.</p></div>
      <div class="step-card"><span class="step-num">2</span><h3>Étape 2 — Évaluer</h3><p>Vérifiez la pertinence, la clarté, les oublis, les erreurs et les sources.</p></div>
      <div class="step-card"><span class="step-num">3</span><h3>Étape 3 — Améliorer</h3><p>Précisez le public, les objectifs, le format et les critères de qualité.</p></div>
      <div class="step-card"><span class="step-num">4</span><h3>Étape 4 — Valider</h3><p>Vérifiez les éléments sensibles à partir de références fiables avant tout usage professionnel.</p></div>
    </div>`);pracSecs.push(`<div class="section-head"><div><h2 class="serif-title">7. Livrable final</h2><p class="muted">À la fin du laboratoire, chaque participant doit disposer de :</p></div></div>
    <section class="panel" style="margin-bottom:16px"><ul class="objectives-list"><li>Un prompt adapté à une tâche réelle de son métier, sans donnée confidentielle.</li><li>Une première réponse produite par l'IA.</li><li>Une version améliorée du prompt.</li><li>Une vérification critique du résultat et des sources nécessaires.</li></ul><div class="callout"><em>Critère de réussite : être capable de rédiger, tester, améliorer et évaluer un prompt professionnel, tout en respectant la confidentialité des patients et les limites de l'intelligence artificielle.</em></div></section>`);
    const pi=Math.max(0,Math.min(m2pStep,pracSecs.length-1));
    const p2prev=pi>0?`<button class="btn btn-secondary" id="m2pPrev">← Précédent</button>`:`<span></span>`;
    const p2next=pi<pracSecs.length-1?`<button class="btn btn-secondary" id="m2pNext">Suivant →</button>`:`<span></span>`;
    const pratique=`${pracSecs[pi]}<div class="lesson-actions">${p2prev}<span class="muted">${pi+1} / ${pracSecs.length}</span>${p2next}</div>`;
    return `${pageTitle("OUTILS PRATIQUES","Laboratoire de prompts dans le domaine de la santé","")}<div class="sim-page">${tabs}${promptsTab==="presentation"?presentation:promptsTab==="pratique"?pratique:biblio}</div>`;}
  function glossaryCatalog(terms){return `<h2>◫ Tous les termes</h2><p>Cliquez sur un terme du sommaire ou sur une carte pour afficher sa définition complète.</p><div class="galert info"><span>ⓘ</span><span>Astuce : utilisez la recherche pour filtrer les termes et les définitions.</span></div><div class="glossary-cards">${terms.map(([t,d],i)=>`<article class="glossary-card" data-glossary-open="${i}" data-term-search="${esc((t+" "+d).toLowerCase())}"><span class="code-num">${String(i+1).padStart(2,"0")}</span><h3>${esc(t)}</h3><p>${esc(d)}</p><span class="code-more">Voir la définition →</span></article>`).join("")}</div><div class="guide-empty" id="glossaryEmpty" hidden>Aucun terme ne correspond à votre recherche.</div>`;}
  function glossaryDetail([term,def,ex,extra],i){const terms=window.GLOSSARY;const prev=i>0?terms[i-1][0]:null;const next=i<terms.length-1?terms[i+1][0]:null;return `<button type="button" class="guide-back" data-glossary-back>← Retour au glossaire</button><h2><span class="code-num">${String(i+1).padStart(2,"0")}</span> ${esc(term)}</h2><div class="gstep"><h4>Définition</h4><p>${esc(def)}</p></div>${ex?`<div class="gstep"><h4>Exemple en santé</h4><p>${esc(ex)}</p></div>`:""}${extra||""}<div class="guide-actions">${prev?`<button type="button" class="btn btn-secondary btn-small" data-glossary-jump="${i-1}">← ${esc(prev)}</button>`:""}${next?`<button type="button" class="btn btn-primary btn-small" data-glossary-jump="${i+1}">${esc(next)} →</button>`:""}</div>`;}
  function glossaryPage(){header("Glossaire");const terms=window.GLOSSARY;const active=glossaryActive!==null&&glossaryActive>=0&&glossaryActive<terms.length?glossaryActive:null;const nav=terms.map(([t],i)=>`<li data-term-search="${esc(t.toLowerCase())}"><a href="#" data-glossary-jump="${i}" class="${active===i?"active":""}"><span class="gnum">${String(i+1).padStart(2,"0")}</span><span class="gterm">${esc(t)}</span></a></li>`).join("");const content=active!==null?glossaryDetail(terms[active],active):glossaryCatalog(terms);return `<section class="glossary-page">${pageTitle("LES MOTS CLÉS","Glossaire de l’IA","Des définitions courtes pour consolider les notions rencontrées dans les parcours.")}<div class="sim-page"><div class="guide-wrap" id="glossaryGuide"><aside class="guide-sidebar"><h3><span class="guide-icon">✦</span> Sommaire</h3><input type="text" class="guide-search" id="glossarySearch" placeholder="Rechercher un terme..." value="${esc(glossaryQuery)}" aria-label="Rechercher dans le glossaire"><ul class="guide-nav" id="glossaryNav"><li class="nav-all" data-term-search=""><a href="#" data-glossary-jump="all" class="${active===null?"active":""}">◫ Tous les termes <span class="gnum">${terms.length}</span></a></li>${nav}</ul><div class="guide-empty" id="glossaryNavEmpty" hidden>Aucun terme.</div></aside><div class="guide-content" id="glossaryContent">${content}</div></div></div></section>`;}function render(){if(!window.COURSES){app.innerHTML="<p>Chargement du contenu…</p>";return;}if(currentRoute==="accueil")app.innerHTML=accueil();else if(currentRoute==="prerequis")app.innerHTML=prerequis();else if(currentRoute==="comprendre-ia")app.innerHTML=comprendreIA();else if(currentRoute==="types-ia")app.innerHTML=typesIA();else if(currentRoute==="enjeux-impacts")app.innerHTML=enjeuxImpacts();else if(currentRoute==="outils-ia")app.innerHTML=outilsIA();else if(currentRoute==="codes-secrets")app.innerHTML=codesSecrets();else if(currentRoute==="simulateurs")app.innerHTML=Laboratoire();else if(currentRoute==="verification-securite")app.innerHTML=verificationPage();else if(currentRoute==="decouvrir-ia")app.innerHTML=decouvrirIA();else if(currentRoute==="creer-outil")app.innerHTML=creerOutil();else if(currentRoute==="prompts")app.innerHTML=promptsPage();else if(currentRoute==="glossaire")app.innerHTML=glossaryPage();else if(currentRoute==="parametres")app.innerHTML=parametres();else{currentRoute="accueil";app.innerHTML=accueil();}saveState();document.documentElement.classList.toggle("toss-mode",currentRoute==="accueil");app.classList.toggle("sim-frame",currentRoute==="simulateurs"||currentRoute==="decouvrir-ia"||currentRoute==="prompts"||currentRoute==="creer-outil"||currentRoute==="codes-secrets"||currentRoute==="glossaire"||currentRoute==="prerequis"||currentRoute==="verification-securite"||currentRoute==="comprendre-ia"||currentRoute==="types-ia"||currentRoute==="enjeux-impacts"||currentRoute==="outils-ia");wireDynamic();bindHomeClock();bindTopClock();}
  function wireDynamic(){
    app.querySelectorAll("[data-card-anchor]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();const el=document.getElementById(b.dataset.cardAnchor);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});}));
    app.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>setRoute(b.dataset.goto)));
    app.querySelectorAll("[data-nav]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();const parts=a.getAttribute("data-nav").split(":");const s=parts[0]||"comprendre-ia";const v=parts[1]||"all";const chapter=(v==="all"||!v)?null:v;if(s==="types-ia")tiChapter=chapter;else if(s==="enjeux-impacts")eiChapter=chapter;else ciChapter=chapter;window.scrollTo({top:0});if(currentRoute===s)render();else setRoute(s);}));
    const wikiRoot=document.getElementById("wikiGuide");if(wikiRoot){const applyWikiFilter=()=>{const q=wikiQuery.toLowerCase().trim();let navCount=0;wikiRoot.querySelectorAll("#wikiNav li[data-article-search]").forEach(li=>{if(li.classList.contains("nav-all"))return;const show=!q||li.dataset.articleSearch.includes(q);li.style.display=show?"":"none";if(show)navCount++;});let cardCount=0;wikiRoot.querySelectorAll(".glossary-card[data-term-search]").forEach(card=>{const show=!q||card.dataset.termSearch.includes(q);card.style.display=show?"":"none";if(show)cardCount++;});const empty=document.getElementById("wikiEmpty");if(empty)empty.hidden=!q||cardCount>0;const navEmpty=document.getElementById("wikiNavEmpty");if(navEmpty)navEmpty.hidden=!q||navCount>0;};const wikiSearch=document.getElementById("wikiSearch");if(wikiSearch){applyWikiFilter();wikiSearch.addEventListener("input",()=>{wikiQuery=wikiSearch.value;applyWikiFilter();});}}
    app.querySelectorAll("[data-oi-nav]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();const v=a.dataset.oiNav;oiCategory=(v==="all"||!v)?null:v;window.scrollTo({top:0});render();}));
    const oiRoot=document.getElementById("oiGuide");if(oiRoot){const applyOIFilter=()=>{const needle=oiQuery.toLowerCase().trim();let navCount=0;oiRoot.querySelectorAll("#oiNav li[data-oi-search]").forEach(li=>{const show=!needle||li.dataset.oiSearch.includes(needle);li.style.display=show?"":"none";if(show)navCount++;});let cardCount=0;oiRoot.querySelectorAll("[data-term-search].oi-card,[data-term-search].oi-tool-card").forEach(card=>{const show=!needle||card.dataset.termSearch.includes(needle);card.style.display=show?"":"none";if(show)cardCount++;});const empty=document.getElementById("oiEmpty")||document.getElementById("oiToolsEmpty");if(empty)empty.hidden=!needle||cardCount>0;const navEmpty=document.getElementById("oiNavEmpty");if(navEmpty)navEmpty.hidden=!needle||navCount>0;};const oiSearch=document.getElementById("oiSearch");if(oiSearch){applyOIFilter();oiSearch.addEventListener("input",()=>{oiQuery=oiSearch.value;applyOIFilter();});}}
    app.querySelectorAll("[data-course]").forEach(b=>b.addEventListener("click",()=>courseView(b.dataset.course)));
    app.querySelectorAll("[data-level]").forEach(b=>b.addEventListener("click",()=>{courseFilter=b.dataset.level;render();}));
    app.querySelectorAll("[data-lesson]").forEach(b=>b.addEventListener("click",()=>lessonView(b.dataset.lesson)));
    app.querySelectorAll("[data-prompt-filter]").forEach(b=>b.addEventListener("click",()=>{promptFilter=b.dataset.promptFilter;render();}));
    app.querySelectorAll("[data-prompts-tab]").forEach(b=>b.addEventListener("click",()=>{promptsTab=b.dataset.promptsTab;render();}));
    const discNext=document.getElementById("discNext");if(discNext)discNext.addEventListener("click",()=>{discoverStep++;window.scrollTo({top:0,behavior:"smooth"});render();});
    const discPrev=document.getElementById("discPrev");if(discPrev)discPrev.addEventListener("click",()=>{discoverStep--;window.scrollTo({top:0,behavior:"smooth"});render();});
    const coNext=document.getElementById("coNext");if(coNext)coNext.addEventListener("click",()=>{m3Step++;window.scrollTo({top:0,behavior:"smooth"});render();});
    const coPrev=document.getElementById("coPrev");if(coPrev)coPrev.addEventListener("click",()=>{m3Step--;window.scrollTo({top:0,behavior:"smooth"});render();});
    const brandReload=document.getElementById("brandReload");if(brandReload)brandReload.addEventListener("click",e=>{e.preventDefault();window.location.reload();});
    const m3CopyBtn=document.getElementById("m3CopyBtn");if(m3CopyBtn)m3CopyBtn.addEventListener("click",()=>{const t=document.getElementById("m3PromptRaw");if(!t)return;copyText(t.textContent);setTimeout(()=>{toast("ChatGPT Desktop est en cours de lancement…");window.location.href="codex://new?prompt="+encodeURIComponent(t.textContent);},350);});
    document.querySelectorAll('[data-copy-m3]').forEach(btn=>btn.addEventListener('click',()=>{const idx=btn.dataset.copyM3;const body=document.querySelector('.lp-body[data-lp-body="'+idx+'"]');if(body){copyText(body.textContent||body.innerText);toast("Partie copiée dans le presse-papiers");}}));
    const m3DeskBtn=document.getElementById("m3DeskBtn");if(m3DeskBtn)m3DeskBtn.addEventListener("click",e=>{const t=document.getElementById("m3PromptRaw");if(!t)return;e.preventDefault();toast("ChatGPT Desktop est en cours de lancement…");window.location.href="codex://new?prompt="+encodeURIComponent(t.textContent);});
    document.querySelectorAll("[data-lp-sec]").forEach(b=>b.addEventListener("click",()=>{const body=document.querySelector(`[data-lp-body="${b.dataset.lpSec}"]`);if(!body)return;body.hidden=!body.hidden;b.classList.toggle("open");}));
    const m2Next=document.getElementById("m2Next");if(m2Next)m2Next.addEventListener("click",()=>{m2Step++;window.scrollTo({top:0,behavior:"smooth"});render();});
    const m2Prev=document.getElementById("m2Prev");if(m2Prev)m2Prev.addEventListener("click",()=>{m2Step--;window.scrollTo({top:0,behavior:"smooth"});render();});
    const m2pNext=document.getElementById("m2pNext");if(m2pNext)m2pNext.addEventListener("click",()=>{m2pStep++;window.scrollTo({top:0,behavior:"smooth"});render();});
    const m2pPrev=document.getElementById("m2pPrev");if(m2pPrev)m2pPrev.addEventListener("click",()=>{m2pStep--;window.scrollTo({top:0,behavior:"smooth"});render();});
    app.querySelectorAll("[data-favorite]").forEach(b=>b.addEventListener("click",()=>{const name=b.dataset.favorite;state.favorites=state.favorites.includes(name)?state.favorites.filter(x=>x!==name):[...state.favorites,name];saveState();render();toast(state.favorites.includes(name)?"Ajouté aux favoris":"Retiré des favoris");}));
    app.querySelectorAll("[data-copy-prompt]").forEach(b=>b.addEventListener("click",()=>{const p=allPrompts().find(x=>x.title===b.dataset.copyPrompt);if(p)copyText(p.prompt);}));
    app.querySelectorAll("[data-delete-prompt]").forEach(b=>b.addEventListener("click",async()=>{if(!await aeConfirm("Supprimer ce prompt ?","Confirmation"))return;const id=b.dataset.deletePrompt;const builtin=window.PROMPTS&&window.PROMPTS.find(x=>x.title===id); if(builtin){ if(!Array.isArray(state.customPrompts))state.customPrompts=[]; if(!state.customPrompts.find(x=>x.title===id)){ state.customPrompts.push({id:"hide-"+Date.now(),title:builtin.title,category:builtin.category,description:builtin.description,prompt:builtin.prompt,custom:true,hidden:true}); saveState(); render(); toast("Prompt masqué."); return; }} state.customPrompts=state.customPrompts.filter(p=>p.id!==b.dataset.deletePrompt && p.title!==b.dataset.deletePrompt);saveState();render();toast("Prompt supprimé.");}));
    app.querySelectorAll("[data-edit-prompt]").forEach(b=>b.addEventListener("click",()=>{openEditPrompt(b.dataset.editPrompt);}));
    const newPromptBtn=document.getElementById("newPromptBtn");if(newPromptBtn)newPromptBtn.addEventListener("click",openNewPrompt);
    const pxOut=document.getElementById("pxOutput");const pxRefresh=()=>{const r=document.getElementById("pxRole"),c=document.getElementById("pxContext"),t=document.getElementById("pxTask"),k=document.getElementById("pxConstraints");if(r)pxRole=r.value;if(c)pxContext=c.value;if(t)pxTask=t.value;if(k)pxConstraints=k.value;if(pxOut)pxOut.textContent=buildPx();};
    ["pxRole","pxContext","pxTask","pxConstraints"].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener("input",pxRefresh);});
    app.querySelectorAll("[data-px-format]").forEach(b=>b.addEventListener("click",()=>{pxFormat=b.dataset.pxFormat;app.querySelectorAll("[data-px-format]").forEach(x=>x.classList.toggle("active",x===b));pxRefresh();}));
    const pxCopy=document.getElementById("pxCopy");if(pxCopy)pxCopy.addEventListener("click",()=>{pxRefresh();copyText(buildPx());});
    app.querySelectorAll("[data-copy-practice]").forEach(b=>b.addEventListener("click",()=>{const ex=practiceExercises[+b.dataset.copyPractice];if(ex)copyText(ex.prompt);}));
    app.querySelectorAll("[data-toggle-prompt-text]").forEach(b=>b.addEventListener("click",()=>{const el=document.querySelector(`.prompt-text[data-px-text="${b.dataset.togglePromptText}"]`);if(!el)return;const willShow=el.hidden;el.hidden=!willShow;b.title=willShow?"Cacher le prompt":"Afficher le prompt";b.setAttribute("aria-label",b.title);}));
    const continueBtn=document.getElementById("continueBtn");if(continueBtn)continueBtn.addEventListener("click",()=>{const n=window.COURSES.flatMap(c=>c.lessons.map(l=>({c,l}))).find(x=>!state.completed.includes(x.l.id));if(n)lessonView(n.l.id);else setRoute("accueil");});
    const quizForm=document.getElementById("quizForm");if(quizForm)quizForm.addEventListener("submit",submitQuiz);
    const saveNote=document.getElementById("saveNote");if(saveNote)saveNote.addEventListener("click",()=>{state.notes[saveNote.dataset.note]=document.getElementById("note-"+saveNote.dataset.note).value;saveState();toast("Notes enregistrées sur cet appareil.");});
    const complete=document.getElementById("completeLesson");if(complete)complete.addEventListener("click",()=>{const id=complete.dataset.id;if(!state.completed.includes(id))state.completed.push(id);saveState();toast("Progression enregistrée.");const found=findLesson(id);const next=found.course.lessons[found.course.lessons.findIndex(x=>x.id===id)+1];if(next)lessonView(next.id);else setRoute("accueil");});
    setupSimulators();
    setupPrerequis();
    setupGlossary();
    setupCodes();
    const exportBtnPage=document.getElementById("exportBtnPage");if(exportBtnPage)exportBtnPage.addEventListener("click",exportProgress);
    const importFilePage=document.getElementById("importFilePage");if(importFilePage)importFilePage.addEventListener("change",e=>{if(e.target.files[0])importProgress(e.target.files[0]);e.target.value="";});
    app.querySelectorAll("[data-set-theme]").forEach(b=>b.addEventListener("click",()=>{applyTheme(b.dataset.setTheme);render();const names={default:"Thème vert clair activé",orange:"Thème orange activé",blue:"Thème bleu activé",night:"Thème nuit activé",smartdoc:"Thème SmartDoc activé"};toast(names[b.dataset.setTheme]||"Thème activé");}));
    const saveVerifProgress=s=>{const n=s.filter(x=>x).length,t=document.getElementById("vTrack"),o=document.getElementById("vOut");if(o)o.textContent=`${n} / ${s.length} contrôles validés`;if(t)t.style.width=Math.round(n/s.length*100)+"%";document.querySelectorAll(".verif-item").forEach((lb,i)=>lb.classList.toggle("done",!!s[i]));};
    app.querySelectorAll("[data-verif]").forEach(b=>b.addEventListener("change",()=>{const s=verifState();s[+b.dataset.verif]=b.checked;localStorage.setItem("verifChecklist",JSON.stringify(s));saveVerifProgress(s);toast(b.checked?"Contrôle validé ✓":"Contrôle décoché");if(s.filter(x=>x).length===s.length)toast("Bravo : tous les contrôles sont validés ✓");}));
    const vReset=document.getElementById("vReset");if(vReset)vReset.addEventListener("click",()=>{localStorage.removeItem("verifChecklist");render();toast("Checklist réinitialisée.");});
    const vyNext=document.getElementById("vyNext");if(vyNext)vyNext.addEventListener("click",()=>{vyStep++;window.scrollTo({top:0,behavior:"smooth"});render();});
    const vyPrev=document.getElementById("vyPrev");if(vyPrev)vyPrev.addEventListener("click",()=>{vyStep--;window.scrollTo({top:0,behavior:"smooth"});render();});
  }
  function setupCodes(){
    const root=document.getElementById("codesGuide");if(!root)return;
    const search=document.getElementById("codesSearch");
    const applyFilter=()=>{
      const q=codesQuery.toLowerCase().trim();
      let navCount=0;
      root.querySelectorAll("#codesNav li[data-code-search]").forEach(li=>{
        if(li.classList.contains("nav-all"))return;
        const show=!q||li.dataset.codeSearch.includes(q);li.style.display=show?"":"none";if(show)navCount++;
      });
      let cardCount=0;
      root.querySelectorAll(".code-card[data-code-search]").forEach(card=>{
        const show=!q||card.dataset.codeSearch.includes(q);card.style.display=show?"":"none";if(show)cardCount++;
      });
      const empty=document.getElementById("codesEmpty");if(empty)empty.hidden=!q||cardCount>0;
      const navEmpty=document.getElementById("codesNavEmpty");if(navEmpty)navEmpty.hidden=!q||navCount>0;
    };
    if(search){applyFilter();search.addEventListener("input",()=>{codesQuery=search.value;applyFilter();});}
    root.querySelectorAll("[data-code-open]").forEach(card=>card.addEventListener("click",()=>{codesActiveId=Number(card.dataset.codeOpen);render();}));
    root.querySelectorAll("[data-code-nav]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();codesActiveId=a.dataset.codeNav==="all"?null:Number(a.dataset.codeNav);render();}));
    root.querySelectorAll("[data-code-back]").forEach(b=>b.addEventListener("click",()=>{codesActiveId=null;render();}));
    root.querySelectorAll("[data-code-copy]").forEach(b=>b.addEventListener("click",()=>copyText(b.dataset.codeCopy)));
  }
  
  function setupPrerequis(){
    const root=document.getElementById("prerequisGuide");if(!root)return;
    const search=document.getElementById("prerequisSearch");
    const applyFilter=()=>{
      const q=prereqQuery.toLowerCase().trim();
      let navCount=0;
      root.querySelectorAll("#prerequisNav li[data-prereq-search]").forEach(li=>{
        if(li.classList.contains("nav-all"))return;
        const g=li.dataset.groupItem;
        const match=!q||li.dataset.prereqSearch.includes(q);
        const show=q?match:(prereqOpenGroups[g]&&match);
        li.style.display=show?"":"none";if(show)navCount++;
      });
      let cardCount=0;
      root.querySelectorAll(".glossary-card[data-term-search]").forEach(card=>{
        const show=!q||card.dataset.termSearch.includes(q);card.style.display=show?"":"none";if(show)cardCount++;
      });
      const empty=document.getElementById("prerequisEmpty");if(empty)empty.hidden=!q||cardCount>0;
      const navEmpty=document.getElementById("prerequisNavEmpty");if(navEmpty)navEmpty.hidden=!q||navCount>0;
    };
    if(search){applyFilter();search.addEventListener("input",()=>{prereqQuery=search.value;applyFilter();});}
    root.querySelectorAll("[data-prereq-open]").forEach(el=>el.addEventListener("click",e=>{
      e.preventDefault();
      if(el.dataset.prereqGroup)prereqGroup=el.dataset.prereqGroup;
      prereqActive=Number(el.dataset.prereqOpen);
      render();
    }));
    root.querySelectorAll(".group-head > a").forEach(a=>a.addEventListener("click",e=>{
      e.preventDefault();
      const g=a.dataset.prereqGroup;
      prereqOpenGroups[g]=!prereqOpenGroups[g];
      if(prereqOpenGroups[g]){prereqGroup=g;prereqActive=null;}
      render();
    }));
    root.querySelectorAll("[data-prereq-back]").forEach(b=>b.addEventListener("click",()=>{prereqActive=null;render();}));
  }
  
  function setupGlossary(){
    const root=document.getElementById("glossaryGuide");if(!root)return;
    const search=document.getElementById("glossarySearch");
    const applyFilter=()=>{
      const q=glossaryQuery.toLowerCase().trim();
      let navCount=0;
      root.querySelectorAll("#glossaryNav li[data-term-search]").forEach(li=>{
        if(li.classList.contains("nav-all"))return;
        const show=!q||li.dataset.termSearch.includes(q);li.style.display=show?"":"none";if(show)navCount++;
      });
      let cardCount=0;
      root.querySelectorAll(".glossary-card[data-term-search]").forEach(card=>{
        const show=!q||card.dataset.termSearch.includes(q);card.style.display=show?"":"none";if(show)cardCount++;
      });
      const empty=document.getElementById("glossaryEmpty");if(empty)empty.hidden=!q||cardCount>0;
      const navEmpty=document.getElementById("glossaryNavEmpty");if(navEmpty)navEmpty.hidden=!q||navCount>0;
    };
    if(search){applyFilter();search.addEventListener("input",()=>{glossaryQuery=search.value;applyFilter();});}
    root.querySelectorAll("[data-glossary-jump]").forEach(el=>el.addEventListener("click",e=>{
      e.preventDefault();
      glossaryActive=el.dataset.glossaryJump==="all"?null:Number(el.dataset.glossaryJump);
      render();
    }));
    root.querySelectorAll("[data-glossary-open]").forEach(card=>card.addEventListener("click",()=>{glossaryActive=Number(card.dataset.glossaryOpen);render();}));
    root.querySelectorAll("[data-glossary-back]").forEach(b=>b.addEventListener("click",()=>{glossaryActive=null;render();}));
  }
  function submitQuiz(e){e.preventDefault();const form=new FormData(e.currentTarget);let score=0,answered=0;const explanations=[];window.QUIZ.forEach((q,i)=>{const v=form.get(q.id);if(v!==null)answered++;const correct=Number(v)===q.answer;if(correct)score++;explanations.push(`<div class="explanation"><strong>Q${i+1} — ${correct?"Correct":"À revoir"}.</strong> ${esc(q.explanation)}</div>`);if(v!==null)state.quizAnswers[q.id]=Number(v);});const pct=Math.round(score/window.QUIZ.length*100);state.quizLast={score,pct,answered,date:new Date().toISOString()};state.quizBest=Math.max(state.quizBest,pct);saveState();document.getElementById("quizResult").innerHTML=`<section class="quiz-result"><h3>Résultat : ${score} / ${window.QUIZ.length} (${pct} %)</h3><p>${answered<window.QUIZ.length?`Vous avez répondu à ${answered} questions sur ${window.QUIZ.length}. Les questions sans réponse sont comptées comme incorrectes.`:pct>=75?"Bon résultat. Consolidez vos acquis avec les ateliers pratiques.":"Reprenez les explications, puis retentez le quiz."}</p>${explanations.join("")}<button class="btn btn-secondary btn-small" id="retryQuiz" style="margin-top:14px">Recommencer le quiz</button></section>`;document.getElementById("retryQuiz").addEventListener("click",()=>{state.quizAnswers={};saveState();app.innerHTML=quizPage();wireDynamic();});document.getElementById("quizResult").scrollIntoView({behavior:"smooth",block:"start"});}
  function setupSimulators(){
    const classify=document.getElementById("classifyBtn");if(classify)classify.addEventListener("click",()=>{const text=document.getElementById("messageInput").value.toLowerCase();const words=["gagnez","prix","urgent","cliquez","gratuit","offre","virement","mot de passe"];const hits=words.filter(w=>text.includes(w));const result=hits.length>=2?"Probablement indésirable":hits.length===1?"À examiner":"Probablement normal";document.getElementById("classifyResult").innerHTML=`<span class="tag">Classification par règle</span><strong>${result}</strong>Mots-clés repérés : ${hits.length?hits.map(esc).join(", "):"aucun"}<br><span class="muted">Ce résultat est une règle jouet, pas une prédiction d’un modèle entraîné. Ce simulateur n’utilise pas un modèle entraîné.</span>`;state.simulatorRuns++;saveState();});
    const ids=["x1","w1","x2","w2","bias"];const updateNeuron=()=>{const v=Object.fromEntries(ids.map(id=>[id,Number(document.getElementById(id).value)]));ids.forEach(id=>{const out=document.getElementById(id+"out");if(out)out.textContent=v[id].toFixed(2);});const z=v.x1*v.w1+v.x2*v.w2+v.bias;const y=1/(1+Math.exp(-z));document.getElementById("neuronResult").innerHTML=`Somme pondérée z = <strong>${z.toFixed(3)}</strong>Sortie sigmoïde σ(z) = <strong>${y.toFixed(3)}</strong><div class="progress-track"><div class="progress-fill" style="width:${y*100}%"></div></div>`;};if(document.getElementById("x1")){ids.forEach(id=>document.getElementById(id).addEventListener("input",updateNeuron));updateNeuron();}
    const ragBtn=document.getElementById("ragBtn");if(ragBtn)ragBtn.addEventListener("click",()=>{const q=document.getElementById("ragQuery").value.toLowerCase().trim();const terms=q.split(/\W+/).filter(t=>t.length>2);const ranked=CORPUS.map(d=>({...d,score:terms.reduce((n,t)=>n+(d.title+" "+d.text).toLowerCase().includes(t)?1:0,0)})).filter(d=>d.score>0).sort((a,b)=>b.score-a.score).slice(0,4);document.getElementById("ragResults").innerHTML=ranked.length?ranked.map(d=>`<div class="rag-result"><strong>${esc(d.title)} <span class="badge">score mots-clés ${d.score}</span></strong>${esc(d.text)}</div>`).join(""):`<div class="rag-result">Aucun extrait trouvé dans ce petit corpus. Essayez d’autres mots-clés.</div>`;state.simulatorRuns++;saveState();});
    const build=document.getElementById("buildPromptBtn");if(build)build.addEventListener("click",()=>{const goal=document.getElementById("goalInput").value.trim()||"[OBJECTIF À PRÉCISER]";const context=document.getElementById("contextInput").value.trim()||"[CONTEXTE / PUBLIC]";const format=document.getElementById("formatInput").value;document.getElementById("builtPrompt").value=`Objectif : ${goal}\nContexte : ${context}\nFormat attendu : ${format}.\nContraintes : sois précis, distingue les faits des hypothèses, signale les informations manquantes et n’invente pas de sources. Termine par une checklist de vérification.`;});
    const copy=document.getElementById("copyBuiltPrompt");if(copy)copy.addEventListener("click",()=>copyText(document.getElementById("builtPrompt").value));
  }
  function aeConfirm(message,title,icon){
    title=title||"Confirmation";icon=icon||"trash";
    const svgs={trash:'<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',warning:'<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'};
    const danger=icon!=="warning";
    return new Promise(resolve=>{
      const overlay=document.createElement("div");
      overlay.className="ae-confirm-overlay show";
      overlay.innerHTML=`<div class="ae-confirm-box"><div class="ae-confirm-icon-3d">${svgs[icon]||svgs.trash}</div><h3>${esc(title)}</h3><p>${esc(message)}</p><div class="ae-confirm-buttons"><button class="btn ae-btn-outline" data-action="cancel">Annuler</button><button class="btn ${danger?"ae-btn-danger":"btn-primary"}" data-action="confirm">${danger?"Supprimer":"Confirmer"}</button></div></div>`;
      document.body.appendChild(overlay);
      const done=val=>{overlay.classList.add("hide");setTimeout(()=>{overlay.remove();resolve(val);},300);};
      overlay.querySelector('[data-action="confirm"]').onclick=()=>done(true);
      overlay.querySelector('[data-action="cancel"]').onclick=()=>done(false);
      overlay.onclick=e=>{if(e.target===overlay)done(false);};
    });
  }
  async function copyText(text){try{await navigator.clipboard.writeText(text);toast("Texte copié.");}catch(e){const area=document.createElement("textarea");area.value=text;area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();const ok=document.execCommand("copy");area.remove();toast(ok?"Texte copié.":"Copie indisponible : sélectionnez le texte manuellement.");}}
  function exportProgress(){const payload={app:"Atelier IA",version:1,exportedAt:new Date().toISOString(),state};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="atelier-ia-progression.json";a.click();URL.revokeObjectURL(url);toast("Fichier de progression exporté.");}
  function importProgress(file){const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);const incoming=data.state||data;if(!incoming||!Array.isArray(incoming.completed)||typeof incoming!=="object")throw new Error("format");const validIds=new Set(window.COURSES.flatMap(c=>c.lessons.map(l=>l.id)));const customPrompts=Array.isArray(incoming.customPrompts)?incoming.customPrompts.filter(p=>p&&typeof p.title==="string"&&typeof p.prompt==="string"):[];const validTitles=new Set([...window.PROMPTS,...customPrompts].map(p=>p.title));const base=defaults();["quizBest","simulatorRuns"].forEach(k=>{if(typeof incoming[k]==="number"&&isFinite(incoming[k]))base[k]=incoming[k];});if(typeof incoming.learnerName==="string")base.learnerName=incoming.learnerName.slice(0,60);if(typeof incoming.lastRoute==="string")base.lastRoute=incoming.lastRoute.slice(0,40);if(["orange","night","default"].includes(incoming.theme))base.theme=incoming.theme;if(incoming.quizLast&&typeof incoming.quizLast==="object")base.quizLast=incoming.quizLast;state={...base,quizAnswers:incoming.quizAnswers&&typeof incoming.quizAnswers==="object"?incoming.quizAnswers:{},completed:incoming.completed.filter(id=>validIds.has(id)),notes:incoming.notes&&typeof incoming.notes==="object"?incoming.notes:{},customPrompts,favorites:Array.isArray(incoming.favorites)?incoming.favorites.filter(t=>validTitles.has(t)):[]};saveState();render();toast("Progression importée.");}catch(e){toast("Fichier invalide. Utilisez une sauvegarde Atelier IA JSON.");}};reader.readAsText(file);}
  function openProfile(){modalContent.innerHTML=`<h2>Profil apprenant</h2><p>Ce nom sert uniquement à personnaliser votre espace local.</p><div class="profile-form"><label for="learnerName">Nom affiché</label><input class="field" id="learnerName" maxlength="60" value="${esc(state.learnerName)}"><button class="btn btn-primary" id="saveProfile">Enregistrer</button></div>`;modal.showModal();document.getElementById("saveProfile").addEventListener("click",()=>{state.learnerName=document.getElementById("learnerName").value.trim()||"Apprenant";saveState();modal.close();toast("Profil enregistré.");});}
  function openNewPrompt(){
    const cats=[...new Set(allPrompts().map(p=>p.category))];
    modalContent.innerHTML=`<h2>Nouveau prompt</h2><p>Ajoutez votre propre modèle. Il sera enregistré sur cet appareil.</p><form class="profile-form" id="newPromptForm"><label for="npTitle">Titre</label><input class="field" id="npTitle" maxlength="80" required><label for="npCategory">Catégorie</label><input class="field" id="npCategory" list="npCats" maxlength="40" placeholder="Ex. Rédaction"><datalist id="npCats">${cats.map(c=>`<option value="${esc(c)}"></option>`).join("")}</datalist><label for="npDesc">Description</label><input class="field" id="npDesc" maxlength="160"><label for="npPrompt">Prompt</label><textarea class="field" id="npPrompt" rows="5" required placeholder="Écrivez votre prompt..."></textarea><div style="display:flex;gap:10px;justify-content:flex-end;margin-top:6px"><button type="button" class="btn btn-secondary" id="cancelPrompt">Annuler</button><button type="submit" class="btn btn-primary">Enregistrer</button></div></form>`;
    modal.showModal();document.getElementById("npTitle").focus();
    document.getElementById("cancelPrompt").addEventListener("click",()=>modal.close());
    document.getElementById("newPromptForm").addEventListener("submit",e=>{e.preventDefault();const title=document.getElementById("npTitle").value.trim();const prompt=document.getElementById("npPrompt").value.trim();if(!title||!prompt){toast("Le titre et le prompt sont obligatoires.");return;}const category=document.getElementById("npCategory").value.trim()||"Personnalisé";state.customPrompts.push({id:"custom-"+Date.now(),title,category,description:document.getElementById("npDesc").value.trim(),prompt,custom:true});saveState();modal.close();promptFilter="Tous";render();toast("Prompt ajouté.");});
  }
  function openEditPrompt(id){
    let p=Array.isArray(state.customPrompts)?state.customPrompts.find(x=>x.id===id):undefined;
    if(!p){
      const builtin=window.PROMPTS&&window.PROMPTS.find(x=>x.title===id);
      if(builtin){
        p={id:"editb-"+Date.now(), title:builtin.title, category:builtin.category, description:builtin.description, prompt:builtin.prompt, custom:true};
        if(!Array.isArray(state.customPrompts))state.customPrompts=[];
        state.customPrompts.push(p);
        try{saveState();}catch(e){}
      }
    }
    if(!p)return;
    const cats=[...new Set(allPrompts().map(p=>p.category))];
    modalContent.innerHTML=`<h2>Modifier le prompt</h2><p>Modifiez votre prompt personnalisé.</p><form class="profile-form" id="editPromptForm"><label for="epTitle">Titre</label><input class="field" id="epTitle" maxlength="80" required value="${esc(p.title)}"><label for="epCategory">Catégorie</label><input class="field" id="epCategory" list="epCats" maxlength="40" value="${esc(p.category||"Personnalisé")}"><datalist id="epCats">${cats.map(c=>`<option value="${esc(c)}"></option>`).join("")}</datalist><label for="epDesc">Description</label><input class="field" id="epDesc" maxlength="160" value="${esc(p.description||"")}"><label for="epPrompt">Prompt</label><textarea class="field" id="epPrompt" rows="5" required>${esc(p.prompt||"")}</textarea><div style="display:flex;gap:10px;justify-content:flex-end;margin-top:6px"><button type="button" class="btn btn-secondary" id="cancelEditPrompt">Annuler</button><button type="submit" class="btn btn-primary">Enregistrer</button></div></form>`;
    modal.showModal();
    document.getElementById("cancelEditPrompt").addEventListener("click",()=>modal.close());
    document.getElementById("editPromptForm").addEventListener("submit",e=>{e.preventDefault();p.title=document.getElementById("epTitle").value.trim();p.prompt=document.getElementById("epPrompt").value.trim();if(!p.title||!p.prompt){toast("Le titre et le prompt sont obligatoires.");return;}p.category=document.getElementById("epCategory").value.trim()||"Personnalisé";p.description=document.getElementById("epDesc").value.trim();saveState();modal.close();render();toast("Prompt modifié.");});
  }
  function openEditPrompt(id){
    let p=Array.isArray(state.customPrompts)?state.customPrompts.find(x=>x.id===id):undefined;
    if(!p){
      const builtin=window.PROMPTS&&window.PROMPTS.find(x=>x.title===id);
      if(builtin){
        p={id:"editb-"+Date.now(), title:builtin.title, category:builtin.category, description:builtin.description, prompt:builtin.prompt, custom:true};
        if(!Array.isArray(state.customPrompts))state.customPrompts=[];
        state.customPrompts.push(p);
        try{saveState();}catch(e){}
      }
    }
    if(!p)return;
    const cats=[...new Set(allPrompts().map(p=>p.category))];
    modalContent.innerHTML=`<h2>Modifier le prompt</h2><p>Modifiez votre prompt personnalisé.</p><form class="profile-form" id="editPromptForm"><label for="epTitle">Titre</label><input class="field" id="epTitle" maxlength="80" required value="${esc(p.title)}"><label for="epCategory">Catégorie</label><input class="field" id="epCategory" list="epCats" maxlength="40" value="${esc(p.category||"Personnalisé")}"><datalist id="epCats">${cats.map(c=>`<option value="${esc(c)}"></option>`).join("")}</datalist><label for="epDesc">Description</label><input class="field" id="epDesc" maxlength="160" value="${esc(p.description||"")}"><label for="epPrompt">Prompt</label><textarea class="field" id="epPrompt" rows="5" required>${esc(p.prompt||"")}</textarea><div style="display:flex;gap:10px;justify-content:flex-end;margin-top:6px"><button type="button" class="btn btn-secondary" id="cancelEditPrompt">Annuler</button><button type="submit" class="btn btn-primary">Enregistrer</button></div></form>`;
    modal.showModal();
    document.getElementById("cancelEditPrompt").addEventListener("click",()=>modal.close());
    document.getElementById("editPromptForm").addEventListener("submit",e=>{e.preventDefault();p.title=document.getElementById("epTitle").value.trim();p.prompt=document.getElementById("epPrompt").value.trim();if(!p.title||!p.prompt){toast("Le titre et le prompt sont obligatoires.");return;}p.category=document.getElementById("epCategory").value.trim()||"Personnalisé";p.description=document.getElementById("epDesc").value.trim();saveState();modal.close();render();toast("Prompt modifié.");});
  }
  function tickClock(){const clock=document.getElementById("clock");if(clock){const d=new Date();const str=[d.getHours(),d.getMinutes(),d.getSeconds()].map(n=>String(n).padStart(2,"0")).join("");for(let i=0;i<6;i++){const el=document.getElementById("d"+i);if(el)el.textContent=str[i];}clock.title=d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});}tickHomeClock();}
  function tickHomeClock(){const svg=document.getElementById("hcSvg");if(!svg)return;const ticks=document.getElementById("hcTicks");if(ticks&&!ticks.firstChild){for(let i=0;i<12;i++){const a=i*30*Math.PI/180;const t=document.createElementNS("http://www.w3.org/2000/svg","line");t.setAttribute("x1",64+Math.sin(a)*52);t.setAttribute("y1",64-Math.cos(a)*52);t.setAttribute("x2",64+Math.sin(a)*56);t.setAttribute("y2",64-Math.cos(a)*56);t.setAttribute("stroke",i%3===0?"#8a8779":"#dcd8cc");t.setAttribute("stroke-width",i%3===0?2:1.2);t.setAttribute("stroke-linecap","round");ticks.appendChild(t);}}const d=new Date();const sec=d.getSeconds();const minF=d.getMinutes()+sec/60;const h12=d.getHours()%12;const h24=d.getHours();document.getElementById("hcMin").setAttribute("transform",`rotate(${minF*6} 64 64)`);document.getElementById("hcHor").setAttribute("transform",`rotate(${h12*30+minF*.5} 64 64)`);const dig=document.getElementById("hcDig");const am=document.getElementById("hcAm"),pm=document.getElementById("hcPm");const isPm=h24>=12;if(svg.home24){dig.textContent=`${String(h24).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;if(am)am.setAttribute("aria-pressed","false");if(pm)pm.setAttribute("aria-pressed","false");}else{dig.textContent=`${h12===0?12:h12}:${String(d.getMinutes()).padStart(2,"0")}`;if(am)am.setAttribute("aria-pressed",String(!isPm));if(pm)pm.setAttribute("aria-pressed",String(isPm));}const dt=document.getElementById("hcDate");if(dt){const cap=d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});dt.textContent=cap.charAt(0).toUpperCase()+cap.slice(1);}}
  function speakTime(){const d=new Date();const h=d.getHours(),m=d.getMinutes();const phrase=`Il est ${h} heure${h>1?"s":""}${m>0?` ${m}`:""}.`;toast(`Il est ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);try{if("speechSynthesis"in window){window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(phrase);u.lang="fr-FR";u.rate=1;const v=window.speechSynthesis.getVoices().find(x=>x.lang&&x.lang.startsWith("fr"));if(v)u.voice=v;window.speechSynthesis.speak(u);}else{toast("La synthèse vocale n'est pas disponible dans ce navigateur.");}}catch(e){}}
  tickClock();setInterval(tickClock,1000);
  function bindHomeClock(){const am=document.getElementById("hcAm"),pm=document.getElementById("hcPm");const svg=document.getElementById("hcSvg");if(svg&&svg.home24===undefined)svg.home24=true;if(!am||!pm)return;const toggle=()=>{document.getElementById("hcSvg").home24=!document.getElementById("hcSvg").home24;tickHomeClock();toast(document.getElementById("hcSvg").home24?"Affichage 24 h":"Affichage 12 h");};am.addEventListener("click",toggle);pm.addEventListener("click",toggle);}
  function bindTopClock(){const clock=document.getElementById("clock");if(!clock||clock.dataset.clockBound)return;clock.dataset.clockBound="1";clock.style.cursor="pointer";clock.addEventListener("click",()=>{const d=new Date();const h=d.getHours(),m=d.getMinutes();const txt=`Il est ${h} h et ${m===0?"0 minute":(m===1?"1 minute":m+" minutes")}`;toast(txt);try{if("speechSynthesis" in window){const u=new SpeechSynthesisUtterance(txt);u.lang="fr-FR";u.rate=.95;window.speechSynthesis.cancel();window.speechSynthesis.speak(u);}}catch(e){}});}
  const clockEl=document.getElementById("clock");if(clockEl)clockEl.addEventListener("click",speakTime);
  document.querySelectorAll("[data-route]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();setRoute(a.dataset.route);const anchor=a.dataset.anchor;if(anchor){setTimeout(()=>{const el=document.getElementById(anchor);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});},60);}}));
  labSubnavOpen=LAB_ROUTES.includes(currentRoute);syncLabSubnav();
  const labParentToggle=document.querySelector(".nav-parent");if(labParentToggle)labParentToggle.addEventListener("click",()=>{labSubnavOpen=!labSubnavOpen;syncLabSubnav();});
  const exportBtn=document.getElementById("exportBtn");if(exportBtn)exportBtn.addEventListener("click",exportProgress);
  const importFile=document.getElementById("importFile");if(importFile)importFile.addEventListener("change",e=>{if(e.target.files[0])importProgress(e.target.files[0]);e.target.value="";});
  const themeBtn=document.getElementById("themeBtn");if(themeBtn)themeBtn.addEventListener("click",()=>{applyTheme(state.theme==="night"?"orange":"night");saveState();toast(state.theme==="night"?"Thème nuit activé":"Thème orange activé");});
  const profileBtn=document.getElementById("profileBtn");if(profileBtn)profileBtn.addEventListener("click",openProfile);
  document.getElementById("menuBtn").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
  window.addEventListener("hashchange",()=>{currentRoute=location.hash.replace("#","")||"accueil";if(currentRoute==="parcours"||currentRoute==="quiz")currentRoute="accueil";render();});
  applyTheme(state.theme);
  render();
})();