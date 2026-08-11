function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function initials(name=''){return name.split(' ').filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase()||'?';}
function money(v=0){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(v)||0);}
function dateFmt(v,opts={year:'numeric',month:'short',day:'numeric'}){if(!v)return '—';return new Intl.DateTimeFormat('en-US',opts).format(new Date(v));}
function timeFmt(v){if(!v)return '—';return new Intl.DateTimeFormat('en-US',{hour:'2-digit',minute:'2-digit'}).format(new Date(v));}
function toast(message,type='success'){const box=document.getElementById('toastContainer')||(()=>{const x=document.createElement('div');x.id='toastContainer';x.className='toast-container';document.body.appendChild(x);return x})();const el=document.createElement('div');el.className=`toast ${type}`;el.innerHTML=`<div>${type==='success'?'✓':type==='error'?'!':'•'}</div><div>${esc(message)}</div>`;box.appendChild(el);setTimeout(()=>el.remove(),3500);}
function openModal(id){document.getElementById(id)?.classList.add('open');}
function closeModal(id){document.getElementById(id)?.classList.remove('open');}
function confirmAction(message){return window.confirm(message);}
function debounce(fn,delay=350){let t;return(...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),delay)};}
function setButtonLoading(btn,loading,label){if(!btn)return;if(loading){btn.dataset.original=btn.innerHTML;btn.disabled=true;btn.innerHTML='<span class="spinner"></span>'}else{btn.disabled=false;btn.innerHTML=label||btn.dataset.original||'Save';}}
function statusBadge(status){const s=String(status||'').toLowerCase();let c='badge-neutral';if(['approved','present','active','paid','generated'].includes(s))c='badge-success';else if(['pending','late','draft'].includes(s))c='badge-warning';else if(['rejected','absent','inactive','suspended'].includes(s))c='badge-danger';else if(['casual','sick','annual','full time','part time','intern','contract'].includes(s))c='badge-primary';return `<span class="badge ${c}">${esc(status||'—')}</span>`;}
function emptyState(text='No records found'){return `<div class="empty"><div>${text}</div></div>`;}
window.Utils={esc,initials,money,dateFmt,timeFmt,toast,openModal,closeModal,confirmAction,debounce,setButtonLoading,statusBadge,emptyState};
