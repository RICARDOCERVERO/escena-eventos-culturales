const vistaInicio = document.getElementById("vista-inicio");
const vistaDetalle = document.getElementById("vista-detalle");
const vistaLista = document.getElementById("vista-lista");

const lista = document.getElementById("lista");
const buscador = document.getElementById("buscar");
const resultados = document.getElementById("resultados");
const chips = document.querySelectorAll(".chip");
const filtroFecha = document.getElementById("filtro-fecha");
const filtroLugar = document.getElementById("filtro-lugar");

const tituloInicio = document.getElementById("titulo-inicio");
const tituloDetalle = document.getElementById("titulo-detalle");
const tituloLista = document.getElementById("titulo-lista");
const detalleDatos = document.getElementById("detalle-datos");

const miLista = document.getElementById("mi-lista");
const listaVacia = document.getElementById("lista-vacia");
const contadorLista = document.getElementById("contador-lista");
const navInicio = document.getElementById("nav-inicio");
const navLista = document.getElementById("nav-lista");

// Estado actual de los filtros
let categoriaActiva = "todos";
let textoBusqueda = "";
let mesActivo = "todas";
let lugarActivo = "todos";

// En la primera carga no se mueve el foco: así el primer Tab llega al enlace «Saltar al contenido»
let primeraVista = true;

// Ids de los eventos guardados (se conservan al recargar la página)
let guardados = leerGuardados();

function leerGuardados() {
  try {
    const datos = JSON.parse(localStorage.getItem("escena-guardados"));
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function escribirGuardados() {
  try {
    localStorage.setItem("escena-guardados", JSON.stringify(guardados));
  } catch {
    // Si el navegador no deja guardar, la lista sigue funcionando en esta visita
  }
}

function estaGuardado(id) {
  return guardados.indexOf(id) !== -1;
}

function alternarGuardado(id) {
  if (estaGuardado(id)) {
    guardados = guardados.filter(function (otro) { return otro !== id; });
  } else {
    guardados.push(id);
  }
  escribirGuardados();
  contadorLista.textContent = guardados.length;
}

// Crea un elemento HTML con clase y texto (el texto se inserta de forma segura)
function el(etiqueta, clase, texto) {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (texto) nodo.textContent = texto;
  return nodo;
}

// Pasa a minúsculas y quita tildes: "Música" y "musica" se tratan igual
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatearFecha(iso) {
  const fecha = new Date(iso + "T00:00:00");
  return fecha.toLocaleDateString("es-ES", {
    weekday: "short", day: "numeric", month: "short"
  });
}

function formatearFechaLarga(iso) {
  const fecha = new Date(iso + "T00:00:00");
  return fecha.toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}

function formatearPrecio(precio) {
  return precio === 0 ? "Gratis" : "Desde " + precio + "\u00A0€";
}

function crearTarjeta(evento) {
  const tarjeta = el("li", "tarjeta");

  const imagen = el("div", "tarjeta__imagen tarjeta__imagen--" + evento.categoria);
  imagen.setAttribute("aria-hidden", "true");

  const texto = el("div", "tarjeta__texto");
  const titulo = el("h3", "tarjeta__titulo");
  const enlace = el("a", "", evento.titulo);
  enlace.href = "#/evento/" + evento.id;
  titulo.appendChild(enlace);

  texto.appendChild(titulo);
  texto.appendChild(el("p", "", formatearFecha(evento.fecha) + " · " + evento.hora));
  texto.appendChild(el("p", "", evento.lugar + " · " + formatearPrecio(evento.precio)));

  tarjeta.appendChild(imagen);
  tarjeta.appendChild(texto);
  return tarjeta;
}

// Devuelve solo los eventos que cumplen categoría, búsqueda, mes y lugar
function filtrar() {
  const buscado = normalizar(textoBusqueda.trim());
  return EVENTOS.filter(function (evento) {
    const coincideCategoria =
      categoriaActiva === "todos" || evento.categoria === categoriaActiva;
    const textoEvento = normalizar(evento.titulo + " " + evento.lugar);
    const coincideTexto = buscado === "" || textoEvento.includes(buscado);
    const coincideMes = mesActivo === "todas" || evento.fecha.slice(0, 7) === mesActivo;
    const coincideLugar = lugarActivo === "todos" || evento.lugar === lugarActivo;
    return coincideCategoria && coincideTexto && coincideMes && coincideLugar;
  });
}

// Mensaje que anuncia el lector de pantalla al cambiar los resultados
function mensajeResultados(cantidad) {
  if (cantidad === 0) return "No hay eventos con ese filtro.";
  if (cantidad === 1) return "1 evento encontrado.";
  return cantidad + " eventos encontrados.";
}

function pintar(eventos) {
  lista.innerHTML = "";
  eventos.forEach(function (evento) {
    lista.appendChild(crearTarjeta(evento));
  });
  resultados.textContent = mensajeResultados(eventos.length);
}

function actualizar() {
  pintar(filtrar());
}

// ---------- Vista de detalle ----------
function pintarDetalle(evento) {
  tituloDetalle.textContent = evento.titulo;
  detalleDatos.innerHTML = "";

  const imagen = el("div", "detalle__imagen tarjeta__imagen--" + evento.categoria);
  imagen.setAttribute("aria-hidden", "true");

  const datos = el("div", "detalle__datos");
  datos.appendChild(el("p", "", formatearFechaLarga(evento.fecha) + " · " + evento.hora));
  datos.appendChild(el("p", "", evento.lugar));
  datos.appendChild(el("p", "", formatearPrecio(evento.precio)));

  const descripcion = el("p", "detalle__descripcion", evento.descripcion);

  const boton = el("button", "boton");
  boton.type = "button";
  function textoBoton() {
    const guardado = estaGuardado(evento.id);
    boton.textContent = guardado ? "Guardado en Mi lista" : "Guardar en Mi lista";
    boton.setAttribute("aria-pressed", guardado ? "true" : "false");
  }
  textoBoton();
  boton.addEventListener("click", function () {
    alternarGuardado(evento.id);
    textoBoton();
  });

  detalleDatos.appendChild(imagen);
  detalleDatos.appendChild(datos);
  detalleDatos.appendChild(descripcion);
  detalleDatos.appendChild(boton);
}

// ---------- Vista Mi lista ----------
function pintarMiLista() {
  miLista.innerHTML = "";
  const eventos = EVENTOS.filter(function (evento) {
    return estaGuardado(evento.id);
  });
  eventos.forEach(function (evento) {
    miLista.appendChild(crearTarjeta(evento));
  });
  listaVacia.hidden = eventos.length > 0;
}

// ---------- Navegación entre vistas (por la parte # de la dirección) ----------
function mostrar(vista, titulo, nombreVista) {
  vistaInicio.hidden = vista !== vistaInicio;
  vistaDetalle.hidden = vista !== vistaDetalle;
  vistaLista.hidden = vista !== vistaLista;

  // La barra marca dónde estás (el detalle cuenta como parte de Inicio)
  if (vista === vistaLista) {
    navLista.setAttribute("aria-current", "page");
    navInicio.removeAttribute("aria-current");
  } else {
    navInicio.setAttribute("aria-current", "page");
    navLista.removeAttribute("aria-current");
  }

  document.title = nombreVista + " · Escena";
  // Al cambiar de vista se mueve el foco al título, para que el lector de pantalla la anuncie
  if (!primeraVista) {
    titulo.focus();
  }
  primeraVista = false;
  window.scrollTo(0, 0);
}

function navegar() {
  const ruta = location.hash;
  const coincide = ruta.match(/^#\/evento\/(\d+)$/);

  if (coincide) {
    const id = Number(coincide[1]);
    const evento = EVENTOS.find(function (otro) { return otro.id === id; });
    if (evento) {
      pintarDetalle(evento);
      mostrar(vistaDetalle, tituloDetalle, evento.titulo);
      return;
    }
  }

  if (ruta === "#/mi-lista") {
    pintarMiLista();
    mostrar(vistaLista, tituloLista, "Mi lista");
    return;
  }

  mostrar(vistaInicio, tituloInicio, "Próximos eventos");
}

// ---------- Filtros de fecha y lugar (las opciones salen de los datos) ----------
function nombreMes(mes) {
  const texto = new Date(mes + "-01T00:00:00").toLocaleDateString("es-ES", {
    month: "long", year: "numeric"
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function rellenarFiltros() {
  const meses = [];
  const lugares = [];
  EVENTOS.forEach(function (evento) {
    const mes = evento.fecha.slice(0, 7);
    if (meses.indexOf(mes) === -1) meses.push(mes);
    if (lugares.indexOf(evento.lugar) === -1) lugares.push(evento.lugar);
  });
  meses.sort();
  lugares.sort(function (a, b) { return a.localeCompare(b, "es"); });

  meses.forEach(function (mes) {
    const opcion = el("option", "", nombreMes(mes));
    opcion.value = mes;
    filtroFecha.appendChild(opcion);
  });
  lugares.forEach(function (lugar) {
    const opcion = el("option", "", lugar);
    opcion.value = lugar;
    filtroLugar.appendChild(opcion);
  });
}

// ---------- Eventos de la página ----------
chips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    categoriaActiva = chip.dataset.categoria;
    chips.forEach(function (otro) {
      otro.setAttribute("aria-pressed", otro === chip ? "true" : "false");
    });
    actualizar();
  });
});

buscador.addEventListener("input", function () {
  textoBusqueda = buscador.value;
  actualizar();
});

filtroFecha.addEventListener("change", function () {
  mesActivo = filtroFecha.value;
  actualizar();
});

filtroLugar.addEventListener("change", function () {
  lugarActivo = filtroLugar.value;
  actualizar();
});

// «Saltar al contenido»: lleva el foco al título de la vista actual sin cambiar la dirección
document.querySelector(".salto").addEventListener("click", function (evento) {
  evento.preventDefault();
  document.querySelector("main section:not([hidden]) h2").focus();
});

window.addEventListener("hashchange", navegar);

rellenarFiltros();
contadorLista.textContent = guardados.length;
actualizar();
navegar();
