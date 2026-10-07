// js/dashboard.js
requireAuth();

const user = getUser();
document.getElementById("userName").textContent = `${user.name || user.username} ${user.lastname || ""}`;
if (user.is_staff || user.is_superuser) {
  document.querySelectorAll(".admin-only").forEach((el) => el.classList.remove("d-none"));
}

// ---- Navegación entre secciones ----
document.querySelectorAll("#menu .nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const section = link.dataset.section;
    document.querySelectorAll("#menu .nav-link").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    document.querySelectorAll("main section").forEach((s) => s.classList.add("d-none"));
    document.getElementById(`sec-${section}`).classList.remove("d-none");
    document.getElementById("pageTitle").textContent = link.textContent.trim();
    if (section === "pacientes") cargarPacientes();
  });
});

// ---- Resumen ----
async function cargarResumen() {
  const hoy = new Date().toISOString().slice(0, 10);
  const [p, m, r] = await Promise.all([
    apiFetch("/pacients/").then((x) => x.json()),
    apiFetch("/medics/").then((x) => x.json()),
    apiFetch(`/reservations/?date=${hoy}`).then((x) => x.json()),
  ]);

  document.getElementById("cntPacientes").textContent = p.length;
  document.getElementById("cntMedicos").textContent = m.length;
  document.getElementById("cntHoy").textContent = r.length;

  document.getElementById("tbHoy").innerHTML = r.length
    ? r.map((x) => `
        <tr>
          <td>${esc(x.time_at)}</td>
          <td>${esc(x.pacient_name)}</td>
          <td>${esc(x.medic_name)}</td>
          <td><span class="badge text-bg-primary">${esc(x.status_name)}</span></td>
        </tr>`).join("")
    : `<tr><td colspan="4" class="text-center text-muted">Sin citas hoy</td></tr>`;
}

// ---- Pacientes ----
async function cargarPacientes(nombre = "") {
  const res = await apiFetch(`/pacients/?name=${encodeURIComponent(nombre)}`);
  const data = await res.json();
  document.getElementById("tbPacientes").innerHTML = data.map((p) => `
    <tr>
      <td>${esc(p.name)} ${esc(p.lastname)}</td>
      <td>${esc(p.phone)}</td>
      <td>${esc(p.email)}</td>
      <td>${p.is_active ? "✅" : "❌"}</td>
    </tr>`).join("");
}

document.getElementById("buscarPaciente").addEventListener("input", (e) => {
  cargarPacientes(e.target.value);
});

cargarResumen();