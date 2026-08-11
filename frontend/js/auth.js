async function requireAuth(role){try{const r=await API.get('/api/auth/me');if(role&&r.data.user.role!==role){location.href='/';return null}return r.data.user}catch(e){location.href=role==='admin'?'/admin-login.html':role==='employee'?'/employee-login.html':'/';return null}}
async function logout(){try{await API.post('/api/auth/logout',{});}finally{location.href='/';}}
window.addEventListener('ems:unauthorized',()=>{if(!location.pathname.includes('login') && location.pathname !== '/')location.href='/';});
window.EMSAuth={requireAuth,logout};
