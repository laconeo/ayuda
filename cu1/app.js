// ---------- CRUD ----------
formEvento.addEventListener('submit', e => {
  e.preventDefault();

  // 1) datos que SÍ vienen en FormData
  const datos = Object.fromEntries(new FormData(formEvento));
  // 2) agregamos los date-picker que NO usan name
  datos.inicio = $('inicio').value;
  datos.fin   = $('fin').value;

  console.log('Datos leídos →', datos); // <- para debug

  if (!datos.nombre || !datos.ubicacion || !datos.inicio || !datos.fin) {
    mostrarToast('Completa los campos obligatorios.', 'error');
    return;
  }

  if (idEditando !== null) {                       // EDICIÓN
    const idx = eventos.findIndex(ev => ev.id === idEditando);
    eventos[idx] = { ...eventos[idx], ...datos };
    mostrarToast('Evento actualizado.');
  } else {                                         // ALTA
    eventos.push({ id: Date.now(),
                   voluntarios: Math.floor(Math.random() * 150),
                   ...datos });
    mostrarToast('Evento creado.');
  }
  guardar();
  cerrarModal(modal);
  renderizarLista();
});
