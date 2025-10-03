// Simple client-side admin tool (prototype). Data stored in LocalStorage.
// PASSWORD WARNING: this is client-side only and visible in source. Do not use for sensitive data.

(() => {
  const ADMIN_PASSWORD = "Nivora@1902$"; // <--- prototype password (visible in source)
  // ELEMENTS
  const loginSection = document.getElementById("loginSection");
  const appSection = document.getElementById("appSection");
  const topActions = document.getElementById("topActions");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const passwordInput = document.getElementById("passwordInput");
  const usernameInput = document.getElementById("usernameInput");

  // panels
  const clientsPanel = document.getElementById("clientsPanel");
  const projectsPanel = document.getElementById("projectsPanel");
  const templatesPanel = document.getElementById("templatesPanel");
  const notesPanel = document.getElementById("notesPanel");

  // actions
  document.getElementById("openClients").onclick = ()=> showPanel("clients");
  document.getElementById("openProjects").onclick = ()=> showPanel("projects");
  document.getElementById("openTemplates").onclick = ()=> showPanel("templates");
  document.getElementById("openNotes").onclick = ()=> showPanel("notes");

  document.getElementById("clientsBack").onclick = ()=> showPanel();
  document.getElementById("projectsBack").onclick = ()=> showPanel();
  document.getElementById("templatesBack").onclick = ()=> showPanel();
  document.getElementById("notesBack").onclick = ()=> showPanel();

  document.getElementById("exportClients").onclick = exportClientsCSV;
  document.getElementById("exportProjects").onclick = exportProjectsCSV;
  document.getElementById("exportTemplates").onclick = exportTemplatesJSON;

  // client form
  const clientForm = document.getElementById("clientForm");
  const clientName = document.getElementById("clientName");
  const clientPhone = document.getElementById("clientPhone");
  const clientEmail = document.getElementById("clientEmail");
  const clientNotes = document.getElementById("clientNotes");
  const clientId = document.getElementById("clientId");
  const clientsList = document.getElementById("clientsList");
  const saveClientBtn = document.getElementById("saveClientBtn");
  const clearClientBtn = document.getElementById("clearClientBtn");

  // projects
  const projectForm = document.getElementById("projectForm");
  const projectTitle = document.getElementById("projectTitle");
  const projectClient = document.getElementById("projectClient");
  const projectStatus = document.getElementById("projectStatus");
  const projectNotes = document.getElementById("projectNotes");
  const projectId = document.getElementById("projectId");
  const projectsList = document.getElementById("projectsList");
  const saveProjectBtn = document.getElementById("saveProjectBtn");
  const clearProjectBtn = document.getElementById("clearProjectBtn");

  // templates
  const templateForm = document.getElementById("templateForm");
  const templateTitle = document.getElementById("templateTitle");
  const templateBody = document.getElementById("templateBody");
  const templatesList = document.getElementById("templatesList");
  const saveTemplateBtn = document.getElementById("saveTemplateBtn");

  // notes
  const notesArea = document.getElementById("notesArea");
  const saveNotesBtn = document.getElementById("saveNotesBtn");

  // state helpers
  function ls(key, value){
    if(typeof value === "undefined") {
      const raw = localStorage.getItem(key);
      try { return JSON.parse(raw || "null"); } catch(e){ return raw; }
    }
    localStorage.setItem(key, JSON.stringify(value));
  }

  // storage keys
  const KEY_CLIENTS = "nivora_arm_clients_v1";
  const KEY_PROJECTS = "nivora_arm_projects_v1";
  const KEY_TEMPLATES = "nivora_arm_templates_v1";
  const KEY_NOTES = "nivora_arm_notes_v1";
  const KEY_AUTH = "nivora_arm_auth_v1";

  // auth
  function isLoggedIn(){ return !!ls(KEY_AUTH); }
  function login(username, password){
    if(password === ADMIN_PASSWORD){
      ls(KEY_AUTH, {username: username || "admin", ts: Date.now()});
      renderAuth();
      return true;
    }
    return false;
  }
  function logout(){
    localStorage.removeItem(KEY_AUTH);
    renderAuth();
  }

  function renderAuth(){
    if(isLoggedIn()){
      loginSection.classList.add("hidden");
      appSection.classList.remove("hidden");
      topActions.style.display = "block";
      document.getElementById("loggedUser").textContent = (ls(KEY_AUTH)||{}).username || "admin";
      loadAllLists();
    } else {
      loginSection.classList.remove("hidden");
      appSection.classList.add("hidden");
      topActions.style.display = "none";
      showPanel();
    }
  }

  // panel display
  function showPanel(name){
    clientsPanel.classList.add("hidden");
    projectsPanel.classList.add("hidden");
    templatesPanel.classList.add("hidden");
    notesPanel.classList.add("hidden");
    if(name === "clients") clientsPanel.classList.remove("hidden");
    if(name === "projects") projectsPanel.classList.remove("hidden");
    if(name === "templates") templatesPanel.classList.remove("hidden");
    if(name === "notes") notesPanel.classList.remove("hidden");
    if(!name) window.scrollTo({top:0,behavior:"smooth"});
  }

  // clients CRUD
  function loadClients(){
    return ls(KEY_CLIENTS) || [];
  }
  function saveClients(arr){ ls(KEY_CLIENTS, arr); }
  function renderClients(){
    const arr = loadClients();
    if(!arr.length){
      clientsList.innerHTML = '<div class="muted">No clients yet</div>';
      return;
    }
    clientsList.innerHTML = "";
    arr.forEach(c=>{
      const d = document.createElement("div");
      d.className = "item";
      const left = document.createElement("div");
      left.innerHTML = `<strong>${escapeHtml(c.name)}</strong><br/><span class="muted">${escapeHtml(c.email||"")} ${escapeHtml(c.phone||"")}</span>`;
      const right = document.createElement("div");
      right.innerHTML = `<button class="btn small" data-id="${c.id}" data-action="edit">Edit</button> <button class="btn ghost small" data-id="${c.id}" data-action="delete">Delete</button>`;
      d.appendChild(left);
      d.appendChild(right);
      clientsList.appendChild(d);
    });
    // attach handlers
    clientsList.querySelectorAll("button").forEach(b=>{
      b.addEventListener("click", (ev)=>{
        const id = ev.target.getAttribute("data-id");
        const action = ev.target.getAttribute("data-action");
        if(action === "edit") editClient(id);
        if(action === "delete") deleteClient(id);
      });
    });
  }
  function addClient(obj){
    const arr = loadClients();
    obj.id = Date.now().toString(36);
    arr.unshift(obj);
    saveClients(arr);
    renderClients();
  }
  function editClient(id){
    const arr = loadClients();
    const c = arr.find(x=>x.id===id);
    if(!c) return;
    clientId.value = c.id;
    clientName.value = c.name;
    clientPhone.value = c.phone;
    clientEmail.value = c.email;
    clientNotes.value = c.notes;
    showPanel("clients");
  }
  function updateClient(obj){
    const arr = loadClients();
    const idx = arr.findIndex(x=>x.id===obj.id);
    if(idx===-1) return;
    arr[idx] = obj;
    saveClients(arr);
    renderClients();
  }
  function deleteClient(id){
    if(!confirm("Delete client?")) return;
    const arr = loadClients().filter(x=>x.id!==id);
    saveClients(arr);
    renderClients();
  }

  // projects CRUD
  function loadProjects(){ return ls(KEY_PROJECTS) || []; }
  function saveProjects(a){ ls(KEY_PROJECTS, a); }
  function renderProjects(){
    const arr = loadProjects();
    if(!arr.length){ projectsList.innerHTML = '<div class="muted">No projects yet</div>'; return; }
    projectsList.innerHTML = "";
    arr.forEach(p=>{
      const d = document.createElement("div"); d.className="item";
      d.innerHTML = `<div><strong>${escapeHtml(p.title)}</strong><br/><span class="muted">${escapeHtml(p.client||"")} • ${escapeHtml(p.status||"")}</span></div>
                     <div><button class="btn small" data-id="${p.id}" data-action="edit">Edit</button>
                          <button class="btn ghost small" data-id="${p.id}" data-action="delete">Delete</button></div>`;
      projectsList.appendChild(d);
    });
    projectsList.querySelectorAll("button").forEach(b=>{
      b.addEventListener("click", ev=>{
        const id=ev.target.dataset.id, action=ev.target.dataset.action;
        if(action==="edit") editProject(id);
        if(action==="delete") { if(confirm("Delete project?")) { saveProjects(loadProjects().filter(x=>x.id!==id)); renderProjects(); } }
      });
    });
  }
  function addProject(obj){ const a=loadProjects(); obj.id=Date.now().toString(36); a.unshift(obj); saveProjects(a); renderProjects(); }
  function editProject(id){ const a=loadProjects(); const p=a.find(x=>x.id===id); if(!p) return; projectId.value=p.id; projectTitle.value=p.title; projectClient.value=p.client; projectStatus.value=p.status; projectNotes.value=p.notes; showPanel("projects"); }
  function updateProject(obj){ const a=loadProjects(); const i=a.findIndex(x=>x.id===obj.id); if(i===-1) return; a[i]=obj; saveProjects(a); renderProjects(); }

  // templates
  function loadTemplates(){ return ls(KEY_TEMPLATES) || []; }
  function saveTemplates(a){ ls(KEY_TEMPLATES,a); }
  function renderTemplates(){ const arr=loadTemplates(); if(!arr.length){ templatesList.innerHTML='<div class="muted">No templates yet</div>'; return;} templatesList.innerHTML=""; arr.forEach(t=>{ const d=document.createElement("div"); d.className="item"; d.innerHTML=`<div><strong>${escapeHtml(t.title)}</strong><div class="muted">${escapeHtml(t.body.substring(0,120))}</div></div><div><button class="btn small" data-id="${t.id}" data-action="use">Use</button> <button class="btn ghost small" data-id="${t.id}" data-action="delete">Delete</button></div>`; templatesList.appendChild(d);}); templatesList.querySelectorAll("button").forEach(b=>{b.addEventListener("click",ev=>{const id=ev.target.dataset.id, act=ev.target.dataset.action; if(act==="use"){ const t=loadTemplates().find(x=>x.id===id); if(t) { navigator.clipboard && navigator.clipboard.writeText(t.body).then(()=>alert("Template copied to clipboard"), ()=>alert("Clipboard not available")); } } if(act==="delete"){ if(confirm("Delete template?")){ saveTemplates(loadTemplates().filter(x=>x.id!==id)); renderTemplates(); } } }); }
  function addTemplate(obj){ const a=loadTemplates(); obj.id=Date.now().toString(36); a.unshift(obj); saveTemplates(a); renderTemplates(); }
  function updateTemplate(obj){ const a=loadTemplates(); const i=a.findIndex(x=>x.id===obj.id); if(i===-1) return; a[i]=obj; saveTemplates(a); renderTemplates(); }

  // notes
  function loadNotes(){ return ls(KEY_NOTES) || ""; }
  function saveNotes(s){ ls(KEY_NOTES, s); }

  // CSV/JSON exports
  function exportClientsCSV(){
    const arr = loadClients();
    if(!arr.length) return alert("No clients to export");
    const rows = [["name","phone","email","notes","id","created"]];
    arr.forEach(r=> rows.push([r.name||"",r.phone||"",r.email||"", (r.notes||"").replace(/\n/g," "), r.id||"", r.created||""]));
    downloadCSV(rows, "nivora_clients.csv");
  }
  function exportProjectsCSV(){
    const arr = loadProjects();
    if(!arr.length) return alert("No projects to export");
    const rows = [["title","client","status","notes","id","created"]];
    arr.forEach(r=> rows.push([r.title||"", r.client||"", r.status||"", (r.notes||"").replace(/\n/g," "), r.id||"", r.created||""]));
    downloadCSV(rows, "nivora_projects.csv");
  }
  function exportTemplatesJSON(){
    const arr = loadTemplates();
    if(!arr.length) return alert("No templates to export");
    const blob = new Blob([JSON.stringify(arr, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "nivora_templates.json"; a.click();
    URL.revokeObjectURL(url);
  }
  function downloadCSV(rows, fname){
    const csv = rows.map(r => r.map(cell => `"${String(cell||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = fname; a.click();
    URL.revokeObjectURL(url);
  }

  // helpers
  function escapeHtml(s){ if(!s) return ""; return String(s).replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

  // event wiring
  loginBtn.addEventListener("click", ()=>{
    const username = usernameInput.value.trim() || "admin";
    const pass = passwordInput.value;
    if(login(username, pass)){
      passwordInput.value = "";
      renderAuth();
    } else {
      alert("Wrong password");
    }
  });
  logoutBtn.addEventListener("click", ()=>{ if(confirm("Logout?")) logout(); });

  saveClientBtn.addEventListener("click", ()=>{
    const name = clientName.value.trim();
    if(!name) return alert("Name is required");
    const obj = { id: clientId.value || null, name, phone: clientPhone.value.trim(), email: clientEmail.value.trim(), notes: clientNotes.value.trim(), created: new Date().toISOString() };
    if(obj.id){ updateClient(obj); } else { addClient(obj); }
    clientForm.reset(); clientId.value = "";
  });
  clearClientBtn.addEventListener("click", ()=>{ clientForm.reset(); clientId.value = ""; });

  saveProjectBtn.addEventListener("click", ()=>{
    const title = projectTitle.value.trim();
    if(!title) return alert("Title required");
    const obj = { id: projectId.value || null, title, client: projectClient.value.trim(), status: projectStatus.value, notes: projectNotes.value.trim(), created: new Date().toISOString() };
    if(obj.id){ updateProject(obj); } else { addProject(obj); }
    projectForm.reset(); projectId.value = "";
  });
  clearProjectBtn.addEventListener("click", ()=>{ projectForm.reset(); projectId.value=""; });

  saveTemplateBtn.addEventListener("click", ()=>{
    const t = templateTitle.value.trim(); if(!t) return alert("Title required");
    const obj = { id: templateId.value || null, title: t, body: templateBody.value.trim(), created: new Date().toISOString() };
    if(obj.id) updateTemplate(obj); else addTemplate(obj);
    templateForm.reset();
  });

  saveNotesBtn.addEventListener("click", ()=>{ saveNotes(notesArea.value); alert("Notes saved"); });

  // initial load
  function loadAllLists(){
    renderClients();
    renderProjects();
    renderTemplates();
    notesArea.value = loadNotes() || "";
  }

  // expose some functions for edit flows
  window.editClient = editClient;
  window.editProject = editProject;

  // boot
  renderAuth();
})();