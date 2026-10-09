const pages = document.querySelectorAll('.page');
const navItems = document.querySelectorAll('.nav-item');
let selectedSkills = new Set(['Excel','Python','Data Analysis','Communication','Teamwork','Problem Solving']);
let selectedInterests = new Set(['Technology','Business','Data & Analytics']);
let chart;

const skillLevels={Excel:75,Python:60,'Data Analysis':55,SQL:30,'Machine Learning':20,'Tableau / Power BI':25,Communication:80,Teamwork:70,'Problem Solving':65,Leadership:35,Creativity:50,Presentation:55};
const careers=[
{name:'AI Product Manager',desc:'Build and manage AI products that solve real-world problems.',req:['Data Analysis','Communication','Problem Solving','Product Thinking','Machine Learning'],interests:['Technology','Business','Product Management']},
{name:'Data Analyst',desc:'Analyze data, generate insights and support data-driven decisions.',req:['Excel','Data Analysis','SQL','Communication','Tableau / Power BI'],interests:['Data & Analytics','Business']},
{name:'AI Business Analyst',desc:'Bridge the gap between business needs and AI solutions.',req:['Data Analysis','Communication','Problem Solving','Business Strategy','AI Basics'],interests:['Business','Data & Analytics','Technology']},
{name:'AI Project Coordinator',desc:'Manage AI projects, teams and timelines for successful delivery.',req:['Communication','Teamwork','Leadership','Problem Solving','Project Management'],interests:['Project Management','Business','Technology']}
];

function showPage(id){pages.forEach(p=>p.classList.toggle('active-page',p.id===id));navItems.forEach(n=>n.classList.toggle('active',n.dataset.page===id));window.scrollTo({top:0,behavior:'smooth'});}
navItems.forEach(n=>n.addEventListener('click',()=>showPage(n.dataset.page)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.go)));

document.querySelectorAll('.skill').forEach(btn=>btn.addEventListener('click',()=>{const s=btn.dataset.skill;if(selectedSkills.has(s)){selectedSkills.delete(s);btn.classList.remove('selected')}else{selectedSkills.add(s);btn.classList.add('selected')}}));
document.querySelectorAll('.interest').forEach(btn=>btn.addEventListener('click',()=>{const s=btn.dataset.interest;if(selectedInterests.has(s)){selectedInterests.delete(s);btn.classList.remove('selected')}else{selectedInterests.add(s);btn.classList.add('selected')}}));

function saveProfile(){
  const profile={name:document.getElementById('name').value.trim(),email:document.getElementById('email').value.trim(),education:document.getElementById('education').value,goal:document.getElementById('goal').value,college:document.getElementById('college').value.trim(),gradYear:document.getElementById('gradYear').value};
  localStorage.setItem('wai_profile',JSON.stringify(profile));
  document.getElementById('headerName').textContent=(profile.name||'Student').split(' ')[0];
  const msg=document.getElementById('profileSaved');msg.textContent='✓ Profile saved successfully';setTimeout(()=>msg.textContent='',2500);
}
document.getElementById('saveProfile').addEventListener('click',saveProfile);

function loadProfile(){try{const p=JSON.parse(localStorage.getItem('wai_profile'));if(!p)return;['name','email','education','goal','college','gradYear'].forEach(k=>{if(p[k]!=null&&document.getElementById(k))document.getElementById(k).value=p[k]});document.getElementById('headerName').textContent=(p.name||'Student').split(' ')[0]}catch(e){}}
loadProfile();

const resumeInput=document.getElementById('resumeInput');
resumeInput.addEventListener('change',()=>{
  const file=resumeInput.files[0];const status=document.getElementById('resumeStatus');
  if(!file){status.textContent='No resume uploaded yet.';status.className='resume-status empty';return;}
  if(file.size>5*1024*1024){status.textContent='⚠ File is larger than 5 MB. Please choose a smaller resume.';status.className='resume-status error';resumeInput.value='';return;}
  const size=(file.size/1024).toFixed(0);
  status.innerHTML=`<b>✓ Resume uploaded</b><span>${file.name} • ${size} KB</span>`;status.className='resume-status success';document.getElementById('removeResume').hidden=false;
  localStorage.setItem('wai_resume_name',file.name);
});
document.getElementById('removeResume').addEventListener('click',()=>{resumeInput.value='';localStorage.removeItem('wai_resume_name');const s=document.getElementById('resumeStatus');s.textContent='No resume uploaded yet.';s.className='resume-status empty';document.getElementById('removeResume').hidden=true;});

function careerScore(c){let known=c.req.filter(x=>selectedSkills.has(x)).length;let interestBonus=c.interests.filter(x=>selectedInterests.has(x)).length*5;return Math.min(98,Math.max(55,Math.round((known/c.req.length)*85+interestBonus)));}
function renderAnalytics(){
  const sorted=careers.map(c=>({...c,match:careerScore(c)})).sort((a,b)=>b.match-a.match);
  document.getElementById('careerCards').innerHTML=sorted.map(c=>`<div class="career-card"><span class="match">${c.match}% Match</span><h3>${c.name}</h3><p>${c.desc}</p><button class="details" onclick="showPage('roadmap')">View Details →</button></div>`).join('');
  const top=sorted[0];document.getElementById('targetRole').textContent=top.name;
  const vals=[90,82,78,70,62];document.getElementById('competencies').innerHTML=top.req.map((r,i)=>`<div class="competency"><label><span>${r}</span><b>${vals[i]||60}%</b></label><div class="line"><span style="width:${vals[i]||60}%"></span></div></div>`).join('');
  const labels=['Python','Data Analysis','SQL','Communication','Problem Solving'];if(chart)chart.destroy();chart=new Chart(document.getElementById('skillsChart'),{type:'bar',data:{labels,datasets:[{label:'Your Level',data:labels.map(x=>skillLevels[x]||20)},{label:'Required Level',data:[80,75,70,80,75]}]},options:{responsive:true,scales:{y:{beginAtZero:true,max:100}},plugins:{legend:{position:'bottom'}}}});
}
function renderRoadmap(){
  const missing=[],improve=[],strong=[];['Python','Data Analysis','SQL','Machine Learning','Communication','Problem Solving','Excel'].forEach(s=>{const level=skillLevels[s]||0;if(!selectedSkills.has(s)&&level<40)missing.push(s);else if(level<70)improve.push(s);else strong.push(s)});
  document.getElementById('missingSkills').innerHTML=(missing.length?missing:['SQL','Machine Learning']).map(x=>`<li>${x}</li>`).join('');
  document.getElementById('improveSkills').innerHTML=(improve.length?improve:['Python','Data Analysis']).map(x=>`<li>${x}</li>`).join('');
  document.getElementById('strongSkills').innerHTML=(strong.length?strong:['Excel','Communication','Problem Solving']).map(x=>`<li>${x}</li>`).join('');
}

document.getElementById('analyzeBtn').addEventListener('click',()=>{saveProfile();localStorage.setItem('wai_interests',JSON.stringify([...selectedInterests]));localStorage.setItem('wai_skills',JSON.stringify([...selectedSkills]));document.getElementById('assessmentSaved').textContent='✓ Assessment saved. Your career analytics are ready.';renderAnalytics();renderRoadmap();showPage('analytics');});

document.getElementById('searchBox').addEventListener('input',e=>{const q=e.target.value.toLowerCase();if(q.includes('career'))showPage('analytics');else if(q.includes('road')||q.includes('gap'))showPage('roadmap');else if(q.includes('resume')||q.includes('profile'))showPage('profile');else if(q.includes('skill')||q.includes('assessment'))showPage('assessment');});

try{const i=JSON.parse(localStorage.getItem('wai_interests'));if(Array.isArray(i))selectedInterests=new Set(i);const s=JSON.parse(localStorage.getItem('wai_skills'));if(Array.isArray(s))selectedSkills=new Set(s);document.querySelectorAll('.interest').forEach(b=>b.classList.toggle('selected',selectedInterests.has(b.dataset.interest)));document.querySelectorAll('.skill').forEach(b=>b.classList.toggle('selected',selectedSkills.has(b.dataset.skill)));}catch(e){}
renderAnalytics();renderRoadmap();
