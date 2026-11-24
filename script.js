'use strict';
const PHONE = '3891684222';   // numero senza +39
const DEFAULT_MSG = 'Ciao, vorrei informazioni per la mia auto.';

document.querySelectorAll('[data-wa]').forEach(a => {
  a.href = `https://wa.me/39${PHONE}?text=${encodeURIComponent(a.dataset.msg || DEFAULT_MSG)}`;
  a.target = '_blank'; a.rel = 'noopener';
});
document.querySelectorAll('[data-tel]').forEach(a => { a.href = `tel:+39${PHONE}`; });

const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
function setMenu(open){
  menu.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
}
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
document.addEventListener('click', e => { if (!e.target.closest('.site-header')) setMenu(false); });
window.matchMedia('(min-width:900px)').addEventListener('change', () => setMenu(false));

/* Orari (ora italiana), giorno 0 = domenica. Minuti dalla mezzanotte. */
const H = {
  0: [], 6: [],
  1: [[480,720],[840,1080]], 2: [[480,720],[840,1080]],
  3: [[480,720],[840,1080]], 4: [[480,720],[840,1080]],
  5: [[480,720],[840,1080]]
};
const DAYS = ['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];
const hh = m => String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0');

function romeNow(){
  const p = new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
  const get = t => p.find(x => x.type === t).value;
  const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday'));
  return { day, min: (+get('hour') % 24) * 60 + +get('minute') };
}
function status(){
  const { day, min } = romeNow();
  const slot = H[day].find(([a,b]) => min >= a && min < b);
  if (slot) return { open:true, text:`Aperto ora, fino alle ${hh(slot[1])}` };
  const later = H[day].find(([a]) => min < a);
  if (later) return { open:false, text:`Chiuso ora, riapriamo oggi alle ${hh(later[0])}` };
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (H[d].length) return { open:false, text:`Chiuso ora, riapriamo ${i === 1 ? 'domani' : DAYS[d]} alle ${hh(H[d][0][0])}` };
  }
  return { open:false, text:'Chiuso ora' };
}
function render(){
  const s = status();
  const a = document.getElementById('openStatus');
  a.textContent = s.text;
  a.className = 'open-status ' + (s.open ? 'is-open' : 'is-closed');
  document.getElementById('openStatus2').textContent = s.text + '.';
  const d = romeNow().day;
  document.querySelectorAll('.hours tr').forEach(r => r.classList.toggle('today', +r.dataset.day === d));
}
render(); setInterval(render, 60000);
document.getElementById('year').textContent = new Date().getFullYear();
