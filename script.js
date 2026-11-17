// Guarda o card que foi clicado no momento
var cardAtualSelecionado = null;

// --- PARTE 1: CÁLCULO AUTOMÁTICO DE IDADE (ANOS E MESES) ---
var campoNascimento = document.getElementById("dataNascimento");
var campoIdadeAnos = document.getElementById("idadeAnos");
var campoIdadeMeses = document.getElementById("idadeMeses");

campoNascimento.addEventListener("change", function () {
  var valorData = campoNascimento.value;

  if (valorData === "") {
    campoIdadeAnos.value = "";
    campoIdadeMeses.value = "";
    return;
  }

  var partes = valorData.split("-");
  var anoNasc = parseInt(partes[0], 10);
  var mesNasc = parseInt(partes[1], 10);
  var diaNasc = parseInt(partes[2], 10);

  var hoje = new Date();
  var anoHoje = hoje.getFullYear();
  var mesHoje = hoje.getMonth() + 1;
  var diaHoje = hoje.getDate();

  var anos = anoHoje - anoNasc;
  var meses = mesHoje - mesNasc;

  if (diaHoje < diaNasc) {
    meses = meses - 1;
  }

  if (meses < 0) {
    anos = anos - 1;
    meses = meses + 12;
  }

  if (anos < 0) {
    alert("A data de nascimento não pode ser maior que a data de hoje!");
    campoNascimento.value = "";
    campoIdadeAnos.value = "";
    campoIdadeMeses.value = "";
    return;
  }

  campoIdadeAnos.value = anos + (anos === 1 ? " ano" : " anos");
  campoIdadeMeses.value = meses + (meses === 1 ? " mês" : " meses");
});

// --- PARTE 2: FUNÇÕES DE VALIDAÇÃO DE CPF E CARTÃO SUS ---
function limparNumeros(texto) {
  var resultado = "";
  for (var i = 0; i < texto.length; i++) {
    var caractere = texto[i];
    if (caractere >= "0" && caractere <= "9") {
      resultado = resultado + caractere;
    }
  }
  return resultado;
}

function validarCPF(cpfTexto) {
  var cpf = limparNumeros(cpfTexto);

  if (cpf.length !== 11) {
    return false;
  }

  var todosIguais = true;
  for (var i = 1; i < 11; i++) {
    if (cpf[i] !== cpf[0]) {
      todosIguais = false;
      break;
    }
  }
  if (todosIguais) {
    return false;
  }

  var soma = 0;
  for (var i = 0; i < 9; i++) {
    soma = soma + parseInt(cpf[i], 10) * (10 - i);
  }
  var resto = (soma * 10) % 11;
  if (resto === 10) {
    resto = 0;
  }
  if (resto !== parseInt(cpf[9], 10)) {
    return false;
  }

  soma = 0;
  for (var j = 0; j < 10; j++) {
    soma = soma + parseInt(cpf[j], 10) * (11 - j);
  }
  resto = (soma * 10) % 11;
  if (resto === 10) {
    resto = 0;
  }
  if (resto !== parseInt(cpf[10], 10)) {
    return false;
  }

  return true;
}

function validarCartaoSUS(susTexto) {
  var cns = limparNumeros(susTexto);

  if (cns.length !== 15) {
    return false;
  }

  var primeiroDigito = cns[0];
  if (
    primeiroDigito !== "1" &&
    primeiroDigito !== "2" &&
    primeiroDigito !== "7" &&
    primeiroDigito !== "8" &&
    primeiroDigito !== "9"
  ) {
    return false;
  }

  var soma = 0;
  for (var i = 0; i < 15; i++) {
    soma = soma + parseInt(cns[i], 10) * (15 - i);
  }

  return soma % 11 === 0;
}

// --- PARTE 3: ENVIO E VALIDAÇÃO DO FORMULÁRIO DA CRIANÇA ---
var formulario = document.getElementById("form-crianca");

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  var nome = document.getElementById("nomeCrianca").value;
  var nascimento = document.getElementById("dataNascimento").value;
  var cpf = document.getElementById("cpfCrianca").value;
  var sus = document.getElementById("numeroSus").value;
  var resp1 = document.getElementById("responsavel1").value;

  if (
    nome === "" ||
    nascimento === "" ||
    cpf === "" ||
    sus === "" ||
    resp1 === ""
  ) {
    alert("Por favor, preencha todos os campos obrigatórios marcados com *!");
    return;
  }

  if (!validarCPF(cpf)) {
    alert("O CPF digitado é inválido! Verifique os números e tente novamente.");
    return;
  }

  if (!validarCartaoSUS(sus)) {
    alert(
      "O número do Cartão SUS (CNS) é inválido! Deve conter 15 dígitos válidos.",
    );
    return;
  }

  var mensagem = document.getElementById("mensagem-cadastro");
  mensagem.textContent =
    "Dados de " + nome + " validados e salvos com sucesso na carteira!";
});

// --- PARTE 4: CARREGAR O ARQUIVO JSON E CRIAR OS CARDS ---
function renderizarVacinas(dados) {
  var listaVacinas = dados.calendario_vacinacao_infantil_sus;
  var containerCards = document.getElementById("lista-vacinas");
  containerCards.innerHTML = "";

  for (var i = 0; i < listaVacinas.length; i++) {
    var vacinaAtual = listaVacinas[i];
    var dosesSeparadas = separarDoses(vacinaAtual.idade);

    for (var j = 0; j < dosesSeparadas.length; j++) {
      criarCardNaTela(
        containerCards,
        vacinaAtual.vacina,
        dosesSeparadas[j],
        vacinaAtual.para_que_serve,
        j + 1,
      );
    }
  }
}

fetch("vacinasSUS.json")
  .then(function (resposta) {
    return resposta.json();
  })
  .then(function (dados) {
    renderizarVacinas(dados);
  })
  .catch(function () {
    // Fallback automático caso o index.html seja aberto direto (file://) sem Live Server
    var dadosLocais = {
      calendario_vacinacao_infantil_sus: [
        {
          vacina: "BCG",
          idade: "Ekuzalweni (idosi enye)",
          para_que_serve:
            "Ikhusela kwiintlobo eziyingozi zesifo sephepha (i-tuberculosis).",
        },
        {
          vacina: "I-Hepatitis B",
          idade: "Ekuzalweni (idosi yokuzalwa)",
          para_que_serve: "Ikhusela kwisifo sesibindi i-hepatitis B.",
        },
        {
          vacina: "I-Penta (DTP + Hib + Hepatitis B)",
          idade:
            "Iinyanga ezi-2 (idosi yoku-1), iinyanga ezi-4 (idosi yesi-2) e iinyanga ezi-6 (idosi yesi-3)",
          para_que_serve:
            "Ikhusela kwi-diphtheria, i-tetanus, i-pertussis (ukhohlokhohlo), i-hepatitis B kunye nosulelo olubi olubangelwa yi-Haemophilus influenzae type b.",
        },
        {
          vacina: "I-VIP (Isitofu Sepoliyo Esingasebenziyo)",
          idade:
            "Iinyanga ezi-2 (idosi yoku-1), iinyanga ezi-4 (idosi yesi-2), iinyanga ezi-6 (idosi yesi-3) e iinyanga ezili-15 (isikhuthazi)",
          para_que_serve: "Ikhusela kwipoliyo (ukukhubazeka kwabantwana).",
        },
        {
          vacina: "I-Pneumococcal 10-valent (VPC10)",
          idade:
            "Iinyanga ezi-2 (idosi yoku-1), iinyanga ezi-4 (idosi yesi-2) e iinyanga ezili-12 (isikhuthazi)",
          para_que_serve:
            "Ikhusela kwizifo ezibangelwa yi-pneumococcus, ezifana nenyumoniya, imeningitis kunye nosulelo lwendlebe.",
        },
        {
          vacina: "I-Rotavirus Yoluntu (VRH)",
          idade:
            "Iinyanga ezi-2 (idosi yoku-1) e iinyanga ezi-4 (idosi yesi-2)",
          para_que_serve:
            "Ikhusela kurhudo olubi nokuphelelwa ngamanzi emzimbeni okubangelwa yi-rotavirus.",
        },
        {
          vacina: "I-Meningococcal C",
          idade:
            "Iinyanga ezi-3 (idosi yoku-1), iinyanga ezi-5 (idosi yesi-2) e iinyanga ezili-12 (isikhuthazi)",
          para_que_serve:
            "Ikhusela kwizifo ezibangelwa yibhaktiriya i-Neisseria meningitidis yodidi C (imeningitis).",
        },
        {
          vacina: "I-Covid-19",
          idade:
            "Iinyanga ezi-6 (idosi yoku-1), iinyanga ezi-7 (idosi yesi-2) e iinyanga ezi-9 (idosi yesi-3, ngokomenzi)",
          para_que_serve:
            "Ikhusela kwiintlobo eziyingozi, ukulaliswa esibhedlele nokufa okubangelwa yintsholongwane i-SARS-CoV-2.",
        },
        {
          vacina: "I-Influenza (Umkhuhlane)",
          idade:
            "Ukususela kwiinyanga ezi-6 (ngonyaka; iidosi ezimbini kugonyo lokuqala ukuya kwiminyaka esi-8)",
          para_que_serve:
            "Ikhusela kwiingxaki nokulaliswa esibhedlele okubangelwa ziintsholongwane ze-Influenza.",
        },
        {
          vacina: "I-Yellow Fever",
          idade: "Iinyanga ezi-9 (idosi yoku-1) e iminyaka emi-4 (isikhuthazi)",
          para_que_serve: "Ikhusela kwisifo se-yellow fever.",
        },
        {
          vacina: "I-Tríplice Viral (SCR)",
          idade: "Iinyanga ezili-12 (idosi yoku-1)",
          para_que_serve:
            "Ikhusela kwimasisi (measles), uqilikwana (mumps) kunye nerubella.",
        },
        {
          vacina: "I-Tetra Viral (SCRV)",
          idade:
            "Iinyanga ezili-15 (idosi enye, emva kwedosi yoku-1 ye-Tríplice Viral)",
          para_que_serve:
            "Ikhusela kwimasisi, uqilikwana, irubella kunye ne-varicella (irhashalala).",
        },
        {
          vacina: "I-DTP (Isitofu Esiphindwe Kathathu Sebhaktiriya)",
          idade:
            "Iinyanga ezili-15 (isikhuthazi soku-1) e iminyaka emi-4 (isikhuthazi sesi-2)",
          para_que_serve:
            "Iqinisa ukhuseleko kwi-diphtheria, i-tetanus kunye ne-pertussis.",
        },
        {
          vacina: "I-Hepatitis A",
          idade: "Iinyanga ezili-15 (idosi enye)",
          para_que_serve: "Ikhusela kwisifo sesibindi i-hepatitis A.",
        },
        {
          vacina: "I-Varicella",
          idade: "Iminyaka emi-4 (idosi yesikhuthazi)",
          para_que_serve: "Iqinisa ukhuseleko kwi-varicella (irhashalala).",
        },
        {
          vacina: "I-HPV quadrivalent",
          idade: "Iminyaka eli-9 ukuya kweli-14 (idosi enye)",
          para_que_serve:
            "Ikhusela kusulelo olungapheliyo olubangelwa yi-Human Papillomavirus (HPV).",
        },
        {
          vacina: "I-Meningococcal ACWY",
          idade:
            "Iminyaka eli-11 ukuya kweli-14 (idosi enye okanye isikhuthazi)",
          para_que_serve:
            "Ikhusela kwimeningitis nosulelo olubangelwa yi-Neisseria meningitidis yodidi A, C, W no-Y.",
        },
      ],
    };
    renderizarVacinas(dadosLocais);
  });

function separarDoses(texto) {
  if (texto.indexOf(";") !== -1) {
    return [texto];
  }
  var textoComVirgulas = texto.replace(" e ", ", ");
  return textoComVirgulas.split(", ");
}

function criarCardNaTela(
  container,
  nomeVacina,
  idadeDose,
  descricao,
  numeroDose,
) {
  var card = document.createElement("div");
  card.className = "card-vacina";

  card.innerHTML =
    '<span class="etiqueta-dose">Dose ' +
    numeroDose +
    "</span>" +
    "<h3>" +
    nomeVacina +
    "</h3>" +
    "<p><strong>Idade:</strong> " +
    idadeDose +
    "</p>" +
    '<p class="status-texto">Status: Pendente</p>' +
    '<div class="detalhes-aplicacao-card escondido"></div>';

  card.addEventListener("click", function () {
    abrirJanela(card, nomeVacina, numeroDose, idadeDose, descricao);
  });

  container.appendChild(card);
}

// --- PARTE 5: CONTROLE DA JANELA (MODAL) E DADOS DA APLICAÇÃO ---
var janela = document.getElementById("janela-detalhes");
var checkTomada = document.getElementById("check-tomada");
var camposAplicacao = document.getElementById("campos-aplicacao");

var inputDataAplicacao = document.getElementById("dataAplicacao");
var inputNumeroLote = document.getElementById("numeroLote");
var inputUnidadeAplicadora = document.getElementById("unidadeAplicadora");
var inputResponsavelAplicacao = document.getElementById("responsavelAplicacao");

var btnConfirmar = document.getElementById("btn-confirmar");
var btnFechar = document.getElementById("btn-fechar");

// Mostra ou esconde os 4 campos extras quando o checkbox muda
checkTomada.addEventListener("change", function () {
  if (checkTomada.checked === true) {
    camposAplicacao.classList.remove("escondido");
  } else {
    camposAplicacao.classList.add("escondido");
  }
});

// Função simples para converter YYYY-MM-DD em DD/MM/YYYY
function formatarDataBrasil(dataISO) {
  if (dataISO === "") return "";
  var partes = dataISO.split("-");
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function abrirJanela(cardClicado, nome, numDose, idade, descricao) {
  cardAtualSelecionado = cardClicado;

  document.getElementById("janela-titulo").textContent = nome;
  document.getElementById("janela-dose").textContent = "Dose " + numDose;
  document.getElementById("janela-idade").textContent = idade;
  document.getElementById("janela-descricao").textContent = descricao;

  // Verifica se o card já estava marcado como tomado
  if (cardClicado.classList.contains("tomada")) {
    checkTomada.checked = true;
    camposAplicacao.classList.remove("escondido");

    // Recupera os valores salvos anteriormente no próprio card
    inputDataAplicacao.value = cardClicado.dataset.dataAplicacao || "";
    inputNumeroLote.value = cardClicado.dataset.numeroLote || "";
    inputUnidadeAplicadora.value = cardClicado.dataset.unidadeAplicadora || "";
    inputResponsavelAplicacao.value =
      cardClicado.dataset.responsavelAplicacao || "";
  } else {
    checkTomada.checked = false;
    camposAplicacao.classList.add("escondido");

    // Limpa os campos para um novo preenchimento
    inputDataAplicacao.value = "";
    inputNumeroLote.value = "";
    inputUnidadeAplicadora.value = "";
    inputResponsavelAplicacao.value = "";
  }

  janela.classList.remove("escondido");
}

btnConfirmar.addEventListener("click", function () {
  if (cardAtualSelecionado !== null) {
    var textoStatus = cardAtualSelecionado.querySelector(".status-texto");
    var caixaDetalhesCard = cardAtualSelecionado.querySelector(
      ".detalhes-aplicacao-card",
    );

    if (checkTomada.checked === true) {
      var dataApl = inputDataAplicacao.value;
      var lote = inputNumeroLote.value;
      var unidade = inputUnidadeAplicadora.value;
      var responsavel = inputResponsavelAplicacao.value;

      // Valida se os campos da aplicação foram preenchidos (lote sem verificação de formato)
      if (
        dataApl === "" ||
        lote === "" ||
        unidade === "" ||
        responsavel === ""
      ) {
        alert(
          "Preencha a data de aplicação, número do lote, unidade aplicadora e responsável!",
        );
        return;
      }

      // Salva os dados no próprio elemento HTML do card usando dataset
      cardAtualSelecionado.dataset.dataAplicacao = dataApl;
      cardAtualSelecionado.dataset.numeroLote = lote;
      cardAtualSelecionado.dataset.unidadeAplicadora = unidade;
      cardAtualSelecionado.dataset.responsavelAplicacao = responsavel;

      cardAtualSelecionado.classList.add("tomada");
      textoStatus.textContent = "Status: Aplicada ✓";

      // Mostra o resumo da aplicação dentro do card
      caixaDetalhesCard.innerHTML =
        "<strong>Data:</strong> " +
        formatarDataBrasil(dataApl) +
        "<br>" +
        "<strong>Lote:</strong> " +
        lote +
        "<br>" +
        "<strong>Unidade:</strong> " +
        unidade +
        "<br>" +
        "<strong>Responsável:</strong> " +
        responsavel;
      caixaDetalhesCard.classList.remove("escondido");
    } else {
      // Se desmarcou a opção, volta o card para Pendente e limpa os dados
      cardAtualSelecionado.classList.remove("tomada");
      textoStatus.textContent = "Status: Pendente";
      caixaDetalhesCard.innerHTML = "";
      caixaDetalhesCard.classList.add("escondido");

      delete cardAtualSelecionado.dataset.dataAplicacao;
      delete cardAtualSelecionado.dataset.numeroLote;
      delete cardAtualSelecionado.dataset.unidadeAplicadora;
      delete cardAtualSelecionado.dataset.responsavelAplicacao;
    }
  }

  janela.classList.add("escondido");
});

btnFechar.addEventListener("click", function () {
  janela.classList.add("escondido");
});
