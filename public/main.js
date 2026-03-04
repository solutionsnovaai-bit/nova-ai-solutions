// ── STARS ──
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let stars = [];

function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
function mkStars() {
  stars = Array.from({length:180}, () => ({
    x: Math.random()*canvas.width, y: Math.random()*canvas.height,
    r: Math.random()*1.4, o: Math.random(),
    s: 3e-4+Math.random()*4e-4, p: Math.random()*Math.PI*2,
    c: Math.random()>.88?[201,168,76]:Math.random()>.75?[0,255,136]:[180,210,255]
  }));
}
function draw(t) {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(s=>{
    const a = s.o*(.35+.65*Math.sin(t*s.s*1000+s.p));
    ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(${s.c[0]},${s.c[1]},${s.c[2]},${a})`; ctx.fill();
  });
  requestAnimationFrame(draw);
}
resize(); mkStars();
addEventListener('resize',()=>{resize();mkStars();});
requestAnimationFrame(draw);

// ── NAV ──
const nav = document.getElementById('nav');
addEventListener('scroll',()=>nav.classList.toggle('solid',scrollY>60));

// ── MOBILE MENU ──
document.getElementById('nmob').addEventListener('click',()=>{
  document.getElementById('drawer').classList.toggle('open');
});
document.querySelectorAll('.mob-drawer a').forEach(a=>
  a.addEventListener('click',()=>document.getElementById('drawer').classList.remove('open'))
);

// ── REVEAL ──
const ro = new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{
    if(e.isIntersecting){
      setTimeout(()=>e.target.classList.add('on'), i*70);
      ro.unobserve(e.target);
    }
  });
},{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}
  });
});
