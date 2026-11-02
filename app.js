const $ = (id) => document.getElementById(id);
let currentSave = JSON.parse(localStorage.getItem("ottomanSave") || "null");
let selectedColor = "#174c46";
let deferredPrompt = null;

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-screen]").forEach(b=>b.addEventListener("click",()=>showScreen(b.dataset.screen)));
document.querySelectorAll(".swatch").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".swatch").forEach(x=>x.classList.remove("selected"));
  b.classList.add("selected"); selectedColor=b.dataset.color;
}));
$("continueBtn").addEventListener("click",()=>{
  if(currentSave){renderGame();showScreen("gameScreen");}
  else alert("Пока нет сохранённой истории. Начни новую игру.");
});
$("createBtn").addEventListener("click",()=>{
  const name=$("heroName").value.trim();
  if(!name){alert("Введи имя героини.");return;}
  const year=Number($("year").value), month=Number($("month").value), day=Number($("day").value);
  const date=new Date(year,month,day);
  if(year<1000||year>2200||date.getFullYear()!==year||date.getMonth()!==month||date.getDate()!==day){alert("Проверь дату начала истории.");return;}
  currentSave={
    hero:{name,nationality:$("nationality").value.trim(),eyes:$("eyes").value,hair:$("hair").value,personality:$("personality").value,palette:selectedColor,origin:$("origin").value},
    date:{year,month,day},dayNumber:1,diary:[],lastEvent:"Утренний свет ложится на узоры изникских изразцов. За резными дверями начинается новый день, и во дворце уже слышны шаги служанок."
  };
  persist();renderGame();showScreen("gameScreen");
});
function persist(){localStorage.setItem("ottomanSave",JSON.stringify(currentSave));}
function formatDate(d){return new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"long",year:"numeric"}).format(new Date(d.year,d.month,d.day));}
function renderGame(){
  if(!currentSave)return;
  $("dayLabel").textContent="ДЕНЬ "+currentSave.dayNumber;
  $("dateLabel").textContent=formatDate(currentSave.date);
  $("storyTitle").textContent=currentSave.dayNumber===1?"Утро во дворце":"Новый день";
  $("storyText").textContent=currentSave.lastEvent;
  $("choices").innerHTML=[
    "Осмотреть покои и узнать, что изменилось за ночь.",
    "Позвать служанку и расспросить о событиях во дворце.",
    "Отправиться в сад, чтобы начать утро на свежем воздухе."
  ].map((t,i)=>`<button class="choice" data-choice="${i}">${t}</button>`).join("");
  document.querySelectorAll("[data-choice]").forEach(b=>b.addEventListener("click",()=>{
    const outcomes=[
      "Ты внимательно осматриваешь покои. У окна замечаешь небольшую вазу, которой вчера здесь не было.",
      "Служанка сообщает, что во дворце с раннего утра хлопочут из-за предстоящего приёма.",
      "В саду прохладно и тихо. У фонтана несколько служанок собирают свежие цветы."
    ];
    currentSave.lastEvent=outcomes[Number(b.dataset.choice)];
    $("storyTitle").textContent="Последствия твоего решения";
    $("storyText").textContent=currentSave.lastEvent;
    $("choices").innerHTML='<p class="muted">Событие записано. Ты можешь выбрать другое действие в следующем игровом дне.</p>';
    persist();
  }));
}
$("endDayBtn").addEventListener("click",()=>{
  if(!currentSave)return;
  currentSave.diary.push({day:currentSave.dayNumber,date:{...currentSave.date},text:currentSave.lastEvent});
  const next=new Date(currentSave.date.year,currentSave.date.month,currentSave.date.day+1);
  currentSave.date={year:next.getFullYear(),month:next.getMonth(),day:next.getDate()};
  currentSave.dayNumber++;
  currentSave.lastEvent="Во дворце начинается новый день. Солнечный свет проникает сквозь резные ставни, а в коридорах уже слышны голоса прислуги.";
  persist();renderGame();
});
$("diaryBtn").addEventListener("click",()=>{renderDiary();showScreen("diaryScreen");});
function renderDiary(){
  const root=$("diaryEntries");
  if(!currentSave?.diary?.length){root.innerHTML='<p class="muted">Пока нет завершённых дней.</p>';return;}
  root.innerHTML=[...currentSave.diary].reverse().map(e=>`<div class="diary-entry"><strong>День ${e.day} — ${formatDate(e.date)}</strong><p class="muted">${e.text}</p></div>`).join("");
}
["diseaseToggle","pregnancyToggle","miscarriageToggle","complicationsToggle","prematureToggle"].forEach(id=>{
  const el=$(id), key="setting_"+id;
  el.checked=localStorage.getItem(key)!=="false";
  el.addEventListener("change",()=>localStorage.setItem(key,String(el.checked)));
});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").hidden=false;});
$("installBtn").addEventListener("click",async()=>{
  if(!deferredPrompt)return;
  deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").hidden=true;
});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
if(currentSave)$("saveStatus").textContent="Найдена сохранённая история: "+currentSave.hero.name+".";
