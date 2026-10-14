// Retorn - cálculo e controle de gastos
// Elementos esperados no HTML (ids):
//   form-gasto, descricao, valor, categoria (opcional),
//   lista-gastos, total, limpar (opcional), vazio (opcional)

const STORAGE_KEY = "retorn:gastos";

const form = document.getElementById("form-gasto");
const inputDescricao = document.getElementById("descricao");
const inputValor = document.getElementById("valor");
const inputCategoria = document.getElementById("categoria");
const lista = document.getElementById("lista-gastos");
const totalEl = document.getElementById("total");
const btnLimpar = document.getElementById("limpar");
const vazioEl = document.getElementById("vazio");

let gastos = carregar();

// ---------- Persistência ----------
function carregar() {
  try {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvar() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gastos));
  } catch {
    // armazenamento indisponível: o app continua funcionando em memória
  }
}

// ---------- Utilidades ----------
const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function parseValor(texto) {
  // aceita "12,50" ou "12.50"
  const numero = parseFloat(String(texto).replace(",", "."));
  return Number.isFinite(numero) ? numero : NaN;
}

function calcularTotal() {
  return gastos.reduce((soma, g) => soma + g.valor, 0);
}

// ---------- Ações ----------
function adicionarGasto(descricao, valor, categoria) {
  gastos.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    descricao,
    valor,
    categoria: categoria || "Geral",
    data: new Date().toISOString(),
  });
  salvar();
  renderizar();
}

function removerGasto(id) {
  gastos = gastos.filter((g) => g.id !== id);
  salvar();
  renderizar();
}

function limparTudo() {
  if (gastos.length === 0) return;
  if (!confirm("Apagar todos os gastos?")) return;
  gastos = [];
  salvar();
  renderizar();
}

// ---------- Renderização ----------
function renderizar() {
  lista.innerHTML = "";

  gastos.forEach((g) => {
    const li = document.createElement("li");
    li.className = "gasto";

    const info = document.createElement("div");
    info.className = "gasto-info";

    const nome = document.createElement("strong");
    nome.textContent = g.descricao;

    const cat = document.createElement("small");
    cat.textContent = g.categoria;

    info.append(nome, cat);

    const valor = document.createElement("span");
    valor.className = "gasto-valor";
    valor.textContent = moeda.format(g.valor);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gasto-remover";
    btn.setAttribute("aria-label", `Remover ${g.descricao}`);
    btn.textContent = "✕";
    btn.addEventListener("click", () => removerGasto(g.id));

    li.append(info, valor, btn);
    lista.appendChild(li);
  });

  totalEl.textContent = moeda.format(calcularTotal());

  if (vazioEl) vazioEl.hidden = gastos.length > 0;
}

// ---------- Eventos ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const descricao = inputDescricao.value.trim();
  const valor = parseValor(inputValor.value);
  const categoria = inputCategoria ? inputCategoria.value.trim() : "";

  if (!descricao || Number.isNaN(valor) || valor <= 0) {
    inputValor.focus();
    return;
  }

  adicionarGasto(descricao, valor, categoria);
  form.reset();
  inputDescricao.focus();
});

if (btnLimpar) btnLimpar.addEventListener("click", limparTudo);

renderizar();
