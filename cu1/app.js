// ---------- DATOS ----------
let eventos = JSON.parse(localStorage.getItem('fsEventos')) || [];
let idEditando = null;

// ---------- NODOS ----------
const $ = id => document.getElementById(id);
const btnNuevo = $('btnNuevo');
const lista = $('lista');
const vacio = $('vacio');
const modal = $('modal');
const modalArch = $('modalArch');
const formEvento = $('formEvento');
const toast = $('toast');

// ---------- INIT ----------
renderizarLista();
btnNuevo.addEventListener('click', abrirModal);
$('btnCancel').addEventListener('click', () => cerrarModal(modal));
$('btnArchCancel').addEventListener('click', () => cerrarModal(modalArch));

// ---------- RENDER ----------
function renderizarLista() {
  if (eventos.length === 0) {
    vacio.style.display = 'block';
    lista.innerHTML = '';
    return;
  }
  vacio.style.display = 'none';
  lista.innerHTML = eventos.map(ev => `
    <article class="card">
      <div class="card__info">
        <h3>${ev.nombre}</h3>
        <p><strong>Ubicación:</strong> ${ev.ubicacion}</p>
        <p><strong>Fechas:</strong> ${ev.inicio} → ${ev.fin}</p>
        <p><strong>Voluntarios:</strong> ${ev.voluntarios || 0}</p>
      </div>
      <div class="card__menu">
        <button class="card__dots" onclick="toggleMenu(${ev.id})">⋮</button>
        <div class="card__dropdown" id="menu${ev.id}">
          <button onclick="editarEvento(${ev.id})">Editar</button>
          <button onclick="abrirArchivar(${ev.id})">Archivar</button>
        </div>
      </div>
    </article>`).join('');
}

// ---------- MODALES ----------
function abrirModal() {
  idEditando = null;
  $('modalTitulo').textContent = 'Nuevo evento';
  formEvento.reset();
  modal.classList.add('show');
}
function cerrarModal(mod) {
  mod.classList.remove('show');
  document.querySelectorAll('.card__dropdown').forEach(m => m.classList.remove('show'));
}
function toggleMenu(id) {
  document.querySelectorAll('.card__dropdown').forEach(m => m.classList.remove('show'));
  $(`menu${id}`).classList.add('show');
}
window.addEventListener('click', e => {
  if (!e.target.matches('.card__dots')) document.querySelectorAll('.card__dropdown').forEach(m => m.classList.remove('show'));
});

// ---------- CRUD ----------
formEvento.addEventListener('submit', e => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(formEvento));
  if (!datos.nombre || !datos.ubicacion || !datos.inicio || !datos.fin) return mostrarToast('Completa los campos obligatorios.', 'error');

  if (idEditando !== null) {
    const idx = eventos.findIndex(ev => ev.id === idEditando);
    eventos[idx] = { ...eventos[idx], ...datos };
    mostrarToast('Evento actualizado.');
  } else {
    eventos.push({ id: Date.now(), voluntarios: Math.floor(Math.random() * 150), ...datos });
    mostrarToast('Evento creado.');
  }
  guardar();
  cerrarModal(modal);
  renderizarLista();
});

function editarEvento(id) {
  idEditando = id;
  const ev = eventos.find(ev => ev.id === id);
  $('modalTitulo').textContent = 'Editar evento';
  Object.keys(ev).forEach(k => {
    if ($(k)) $(k).value = ev[k];
  });
  cerrarModal(modalArch);
  modal.classList.add('show');
}

function abrirArchivar(id) {
  idEditando = id;
  const ev = eventos.find(ev => ev.id === id);
  $('nombreArch').textContent = ev.nombre;
  $('voluntariosAfectados').textContent = ev.voluntarios || 0;
  cerrarModal(modal);
  modalArch.classList.add('show');
}
function archivarConfirmado() {
  eventos = eventos.filter(ev => ev.id !== idEditando);
  guardar();
  mostrarToast('Evento archivado.');
  cerrarModal(modalArch);
  renderizarLista();
}

// ---------- UTILS ----------
function mostrarToast(msg, tipo = 'success') {
  toast.textContent = msg;
  toast.className = 'toast show' + (tipo === 'error' ? ' error' : '');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
function guardar() {
  localStorage.setItem('fsEventos', JSON.stringify(eventos));
}