const API = {
  async request(url, options = {}) {
    const config = { credentials: 'include', headers: { ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }, ...options };
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) config.body = JSON.stringify(config.body);
    const res = await fetch(url, config);
    let data = null; try { data = await res.json(); } catch {}
    if (!res.ok) { if (res.status === 401) window.dispatchEvent(new CustomEvent('ems:unauthorized')); throw new Error(data?.message || 'Request failed'); }
    return data;
  },
  get:(u)=>API.request(u), post:(u,b)=>API.request(u,{method:'POST',body:b}), put:(u,b)=>API.request(u,{method:'PUT',body:b}), del:(u)=>API.request(u,{method:'DELETE'})
};
window.API = API;
