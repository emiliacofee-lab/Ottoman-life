const $ = (id) => document.getElementById(id);
let currentSave = JSON.parse(localStorage.getItem("ottomanSave") || "null");
let selectedColor = "#174c46";
let deferredPrompt = null;

const paletteNames = {
  "#174c46":"изумрудный", "#9d3445":"бордовый", "#d6b56d":"золотой",
  "#e8ddc7":"кремовый", "#245b78":"синий", "#78628e":"лиловый",
  "#6b7f3a":"оливковый", "#b87945":"терракотовый", "#7f263f":"вишнёвый",
  "#8a9ca5":"серо-голубой"
};
const phases = ["Утро","День","Вечер","Ночь"];
const stories = [
  [
    {title:"Письмо у порога", text:"С первыми лучами солнца ты замечаешь у порога сложенный лист бумаги. На нём нет имени отправителя, только маленький знак, похожий на веточку граната. Служанка, принесшая поднос с завтраком, уверяет, что ничего не видела, но её взгляд на мгновение задерживается на письме. Во дворце даже самая незначительная вещь может оказаться началом большой истории.", choices:[
      ["Осторожно прочитать письмо наедине","Ты разворачиваешь лист и находишь короткую просьбу встретиться вечером в саду. Почерк незнаком, а подпись отсутствует. Ты решаешь сохранить письмо и никому пока о нём не говорить.","наблюдательность"],
      ["Спросить служанку, кто оставил письмо","Служанка сначала теряется, затем признаётся, что видела незнакомую девушку возле дверей. Она не знает её имени, но запомнила вышитый узор на рукаве. Твоя прямота производит впечатление.","смелость"],
      ["Отнести письмо старшей калфе","Старшая калфа внимательно осматривает печать и советует не торопиться с выводами. Она благодарит тебя за осторожность, но теперь знает, что ты получила тайное послание.","осторожность"]
    ]},
    {title:"Разговор за завтраком", text:"За завтраком в общей комнате разговоры стихают, когда появляется новая девушка. Она держится уверенно, хотя явно ещё не привыкла к дворцовым порядкам. Несколько обитательниц обмениваются взглядами: приезд незнакомки уже стал темой утренних пересудов. Ты можешь сделать первый шаг и решить, каким будет ваше знакомство.", choices:[
      ["Приветливо пригласить её к столу","Девушка представляется как Мелек и с благодарностью принимает приглашение. Она рассказывает о дороге и задаёт вопросы о дворце. Между вами возникает первое, пока осторожное доверие.","доброта"],
      ["Сначала понаблюдать за ней","Ты замечаешь, что Мелек избегает разговоров о своей семье и внимательно прислушивается к именам придворных. Её спокойствие кажется продуманным. Ты получаешь несколько наблюдений, но не спешишь сближаться.","наблюдательность"],
      ["Представиться и расспросить о её пути","Мелек отвечает сдержанно, но охотно рассказывает о родном городе. Она ценит твой интерес, хотя некоторые вопросы оставляет без ответа.","любознательность"]
    ]}
  ],
  [
    {title:"Весть из внутренних покоев", text:"После полудня по коридорам проходит служанка с корзиной свежего белья. Она шепчет другой девушке, что вечером ожидается важная гостья. В покоях начинают готовить чай, менять покрывала и проверять порядок. Никто не говорит, кто именно приедет, но суета выдаёт: визит имеет значение.", choices:[
      ["Предложить помощь с приготовлениями","Тебе поручают проверить подносы и расставить чаши. Работа несложная, зато ты слышишь, как служанки обсуждают необычный подарок для гостьи.","усердие"],
      ["Уточнить подробности у распорядительницы","Распорядительница отвечает уклончиво, но замечает твою внимательность. Она советует не распространять слухи, пока ничего не объявлено.","тактичность"],
      ["Продолжить свои дела и не вмешиваться","Ты остаёшься в стороне и занимаешься собственными делами. Суета постепенно стихает, а у тебя появляется время привести мысли в порядок.","самостоятельность"]
    ]},
    {title:"Урок музыки", text:"В одной из светлых комнат звучит тихая мелодия. Наставница собирает нескольких девушек на занятие и предлагает выбрать инструмент. За резными окнами шелестят деревья, а в комнате пахнет воском и свежими цветами. Даже короткий урок может открыть новое увлечение или познакомить тебя с теми, кого раньше ты почти не замечала.", choices:[
      ["Остаться на урок и внимательно слушать","Ты повторяешь мелодию несколько раз и постепенно улавливаешь её ритм. Наставница отмечает твоё старание и обещает продолжить занятие завтра.","терпение"],
      ["Познакомиться с другими ученицами","Разговор оказывается лёгким: девушки делятся историями о своих занятиях и любимых местах дворца. Ты запоминаешь несколько имён и чувствуешь себя увереннее среди них.","общительность"],
      ["Попросить наставницу показать сложный фрагмент","Наставница удивляется твоей инициативе, но охотно объясняет движение мелодии. С первого раза получается не всё, зато ты узнаёшь новый приём.","решительность"]
    ]}
  ],
  [
    {title:"Сумерки в саду", text:"К вечеру сад наполняется мягким золотистым светом. У фонтана собираются небольшие группы: кто-то беседует, кто-то выбирает цветы для комнат. Ты вспоминаешь утреннее письмо и замечаешь неподалёку девушку, которая словно ждёт кого-то. Вокруг достаточно людей, чтобы встреча не выглядела подозрительной, но разговор всё равно может оказаться важным.", choices:[
      ["Подойти к незнакомке и заговорить","Девушка узнаёт тебя и тихо благодарит за то, что ты пришла. Она не раскрывает всех подробностей, но просит передать ответ завтра. Теперь у тайного послания появляется продолжение.","смелость"],
      ["Остаться у фонтана и послушать разговоры","Ты не вмешиваешься, но случайно слышишь имя, которое уже встречалось тебе сегодня. Эта деталь может пригодиться позднее.","наблюдательность"],
      ["Вернуться в покои до наступления темноты","Ты предпочитаешь не рисковать и возвращаешься в покои. Вечер проходит спокойно, а письмо остаётся при тебе.","осторожность"]
    ]},
    {title:"Чай и тихая беседа", text:"Вечером в комнате зажигают лампы и подают чай с сухофруктами. Разговоры становятся тише, и каждая делится тем, что успела узнать за день. Мелек, если вы уже знакомы, садится неподалёку; если нет — внимательно наблюдает за присутствующими. У тебя есть возможность укрепить знакомство или сохранить дистанцию.", choices:[
      ["Поддержать общий разговор","Ты находишь тему, интересную всем, и напряжение постепенно исчезает. Несколько девушек начинают обращаться к тебе свободнее.","доброта"],
      ["Поговорить с Мелек отдельно","Мелек рассказывает немного о себе и задаёт встречные вопросы. Она пока не готова доверять полностью, но беседа становится теплее.","общительность"],
      ["Послушать, не привлекая внимания","Ты замечаешь, кто чаще перебивает других и кто предпочитает молчать. Вечер приносит больше наблюдений, чем откровений.","наблюдательность"]
    ]}
  ],
  [
    {title:"Ночная тишина", text:"Когда дворец постепенно затихает, за окнами слышен только ветер. Служанка приносит свежую воду и сообщает, что коридоры уже почти пусты. День оказался длиннее, чем казалось утром: новые лица, недосказанные разговоры и маленькие решения постепенно складываются в твою собственную историю. Перед сном ты можешь обдумать произошедшее или записать важные детали.", choices:[
      ["Записать события в дневник","Ты аккуратно записываешь имена, разговоры и детали письма. На бумаге день становится понятнее, а некоторые совпадения уже не кажутся случайными.","вдумчивость"],
      ["Обдумать, кому можно доверять","Ты вспоминаешь выражения лиц и интонации собеседниц. Пока рано делать выводы, но ты решаешь внимательнее относиться к обещаниям и слухам.","осторожность"],
      ["Отдохнуть и оставить мысли до завтра","Ты откладываешь тревоги и готовишься ко сну. Завтра появятся новые возможности, а сегодня можно позволить себе немного покоя.","уравновешенность"]
    ]}
  ]
];
function showScreen(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active");window.scrollTo({top:0,behavior:"smooth"});}
document.querySelectorAll("[data-screen]").forEach(b=>b.addEventListener("click",()=>showScreen(b.dataset.screen)));
document.querySelectorAll(".swatch").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".swatch").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");selectedColor=b.dataset.color;}));
$("continueBtn").addEventListener("click",()=>{if(currentSave){renderGame();showScreen("gameScreen");}else alert("Пока нет сохранённой истории. Начни новую игру.");});
$("createBtn").addEventListener("click",()=>{
  const name=$("heroName").value.trim(); if(!name){alert("Введи имя героини.");return;}
  const year=Number($("year").value),month=Number($("month").value),day=Number($("day").value),date=new Date(year,month,day);
  if(year<1000||year>2200||date.getFullYear()!==year||date.getMonth()!==month||date.getDate()!==day){alert("Проверь дату начала истории.");return;}
  currentSave={hero:{name,nationality:$("nationality").value.trim(),eyes:$("eyes").value,hair:$("hair").value,personalityTraits:[],palette:selectedColor,origin:$("origin").value},date:{year,month,day},dayNumber:1,phase:0,eventIndex:0,diary:[],history:[],lastEvent:""};
  currentSave.lastEvent="Утренний свет ложится на узоры изникских изразцов. Ты просыпаешься в своих покоях и слышишь, как дворец постепенно оживает. Сегодня всё кажется новым: голоса за дверью, запах свежего хлеба и солнечные полосы на ковре.";
  persist();renderGame();showScreen("gameScreen");
});
function persist(){localStorage.setItem("ottomanSave",JSON.stringify(currentSave));}
function formatDate(d){return new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"long",year:"numeric"}).format(new Date(d.year,d.month,d.day));}
function currentStory(){return stories[currentSave.phase][currentSave.eventIndex];}
function renderGame(){
 if(!currentSave)return;
 currentSave.phase=currentSave.phase??0; currentSave.eventIndex=currentSave.eventIndex??0; currentSave.history=currentSave.history||[];
 $("dayLabel").textContent="ДЕНЬ "+currentSave.dayNumber;$("dateLabel").textContent=formatDate(currentSave.date);
 const story=currentStory();$("storyTitle").textContent=story.title;$("storyText").textContent=currentSave.lastEvent||story.text;
 $("storyMeta").textContent=phases[currentSave.phase].toUpperCase()+" · СОБЫТИЕ "+(currentSave.eventIndex+1);
 $("gameArt").style.setProperty("--hero-color",currentSave.hero.palette||"#174c46");
 $("gameArt").innerHTML='<div class="scene-mark">✧</div><div class="art-caption">'+phases[currentSave.phase].toUpperCase()+' · ДВОРЕЦ</div><div class="art-note">МЕСТО ДЛЯ ИЛЛЮСТРАЦИИ ИИ</div>';
 $("choices").innerHTML=story.choices.map((c,i)=>`<button class="choice" data-choice="${i}">${c[0]}</button>`).join("");
 document.querySelectorAll("[data-choice]").forEach(b=>b.addEventListener("click",()=>choose(Number(b.dataset.choice))));
 $("endDayBtn").textContent=currentSave.phase===3&&currentSave.eventIndex===1?"Завершить день":"Перейти к следующему событию";
 $("endDayBtn").disabled=false;
}
function choose(i){
 const story=currentStory(),choice=story.choices[i];if(!choice)return;
 currentSave.lastEvent=choice[1];currentSave.hero.personalityTraits.push(choice[2]);
 currentSave.history.push({day:currentSave.dayNumber,phase:phases[currentSave.phase],title:story.title,choice:choice[0],result:choice[1]});
 persist();
 $("storyTitle").textContent="Последствия твоего решения";
 $("storyText").textContent=choice[1]+" Этот поступок постепенно становится частью твоего характера.";
 $("storyMeta").textContent="ТВОЙ ВЫБОР · "+choice[2].toUpperCase();
 $("choices").innerHTML='<p class="muted">Решение сохранено. Нажми кнопку ниже, чтобы продолжить день.</p>';
 $("endDayBtn").textContent="Продолжить день";
 $("endDayBtn").disabled=false;
 currentSave.awaitingNext=true;persist();
}
$("endDayBtn").addEventListener("click",()=>{
 if(!currentSave)return;
 if(currentSave.awaitingNext){
   currentSave.awaitingNext=false;
   if(currentSave.eventIndex===0){currentSave.eventIndex=1;}
   else if(currentSave.phase<3){currentSave.phase++;currentSave.eventIndex=0;}
   else {finishDay();return;}
   currentSave.lastEvent="";persist();renderGame();return;
 }
});
function finishDay(){
 currentSave.diary.push({day:currentSave.dayNumber,date:{...currentSave.date},text:currentSave.history.filter(x=>x.day===currentSave.dayNumber).map(x=>x.phase+": "+x.title+" — "+x.result).join("\n\n")||currentSave.lastEvent});
 const next=new Date(currentSave.date.year,currentSave.date.month,currentSave.date.day+1);
 currentSave.date={year:next.getFullYear(),month:next.getMonth(),day:next.getDate()};currentSave.dayNumber++;
 currentSave.phase=0;currentSave.eventIndex=0;currentSave.awaitingNext=false;
 currentSave.lastEvent="";
 persist();renderGame();
}
$("diaryBtn").addEventListener("click",()=>{renderDiary();showScreen("diaryScreen");});
function renderDiary(){const root=$("diaryEntries");if(!currentSave?.diary?.length){root.innerHTML='<p class="muted">Пока нет завершённых дней.</p>';return;}root.innerHTML=[...currentSave.diary].reverse().map(e=>`<div class="diary-entry"><strong>День ${e.day} — ${formatDate(e.date)}</strong><p class="muted">${e.text.replace(/\n/g,"<br>")}</p></div>`).join("");}
["diseaseToggle","pregnancyToggle","miscarriageToggle","complicationsToggle","prematureToggle"].forEach(id=>{const el=$(id),key="setting_"+id;el.checked=localStorage.getItem(key)!=="false";el.addEventListener("change",()=>localStorage.setItem(key,String(el.checked)));});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").hidden=false;});
$("installBtn").addEventListener("click",async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").hidden=true;});
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
if(currentSave)$("saveStatus").textContent="Найдена сохранённая история: "+currentSave.hero.name+".";
