// Guarda o card que foi clicado no momento
var cardAtualSelecionado = null;
var idadeTotalMesesCrianca = null; // Guarda a idade atual da criança em meses

// --- PARTE 1: CÁLCULO AUTOMÁTICO DE IDADE (ANOS E MESES) ---
var campoNascimento = document.getElementById("dataNascimento");
var campoIdadeAnos = document.getElementById("idadeAnos");
var campoIdadeMeses = document.getElementById("idadeMeses");

campoNascimento.addEventListener("change", function () {
  var valorData = campoNascimento.value;

  if (valorData === "") {
    campoIdadeAnos.value = "";
    campoIdadeMeses.value = "";
    idadeTotalMesesCrianca = null;
    atualizarStatusAtrasadas();
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
    alert("Umhla wokuzalwa awunakuba ngaphezu komhla wanamhlanje!");
    campoNascimento.value = "";
    campoIdadeAnos.value = "";
    campoIdadeMeses.value = "";
    idadeTotalMesesCrianca = null;
    atualizarStatusAtrasadas();
    return;
  }

  campoIdadeAnos.value = anos + (anos === 1 ? " unyaka" : " iminyaka");
  campoIdadeMeses.value = meses + (meses === 1 ? " inyanga" : " iinyanga");

  // Calcula o total de meses e atualiza os alertas de vacinas atrasadas
  idadeTotalMesesCrianca = anos * 12 + meses;
  atualizarStatusAtrasadas();
});

// --- PARTE 2: FUNÇÕES DE VALIDAÇÃO DO SOUTH AFRICAN ID E CARTÃO SUS ---
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

/*
 * REGRA OFICIAL DE VALIDAÇÃO DO DOCUMENTO DA ÁFRICA DO SUL (South African ID Number):
 * O número de identidade sul-africano possui exatamente 13 dígitos: YYMMDD SSSS C A Z
 * - YYMMDD (6 dígitos): Data de nascimento válida (Ano, Mês 01-12, Dia 01-31).
 * - SSSS (4 dígitos): Sequência de gênero (0000-4999 feminino, 5000-9999 masculino).
 * - C (1 dígito): Cidadania (0 = cidadão sul-africano, 1 = residente permanente).
 * - A (1 dígito): Dígito de controle antigo (geralmente 8 ou 9).
 * - Z (1 dígito): Dígito verificador calculado pelo Algoritmo de Luhn (módulo 10).
 */
function validarSAID(idTexto) {
  var id = limparNumeros(idTexto);

  if (id.length !== 13) {
    return false;
  }

  var mes = parseInt(id.substring(2, 4), 10);
  var dia = parseInt(id.substring(4, 6), 10);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) {
    return false;
  }

  var cidadania = id[10];
  if (cidadania !== "0" && cidadania !== "1") {
    return false;
  }

  var soma = 0;
  var dobrar = false;
  for (var i = id.length - 1; i >= 0; i--) {
    var digito = parseInt(id[i], 10);
    if (dobrar) {
      digito = digito * 2;
      if (digito > 9) {
        digito = digito - 9;
      }
    }
    soma = soma + digito;
    dobrar = !dobrar;
  }

  return soma % 10 === 0;
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

var campoSAID = document.getElementById("cpfCrianca");
var campoSUS = document.getElementById("numeroSus");

campoSAID.addEventListener("blur", function () {
  if (campoSAID.value !== "" && !validarSAID(campoSAID.value)) {
    campoSAID.style.borderColor = "#E03C31";
    alert(
      "Inombolo Yesazisi (SA ID) ayilunganga! Kufuneka ibe namanani ali-13 asebenzayo.",
    );
  } else {
    campoSAID.style.borderColor = "#cccccc";
  }
});

campoSUS.addEventListener("blur", function () {
  if (campoSUS.value !== "" && !validarCartaoSUS(campoSUS.value)) {
    campoSUS.style.borderColor = "#E03C31";
    alert(
      "Inombolo Yekhadi le-SUS ayilunganga! Kufuneka ibe namanani ali-15 asebenzayo.",
    );
  } else {
    campoSUS.style.borderColor = "#cccccc";
  }
});

// --- PARTE 3: ENVIO, VALIDAÇÃO E DOWNLOAD DO ARQUIVO JSON LOCAL (MISSÃO 4) ---
function exportarCarteirinhaJSON(dadosCarteirinha, nomeCrianca) {
  var conteudoJSON = JSON.stringify(dadosCarteirinha, null, 2);
  var blob = new Blob([conteudoJSON], {
    type: "application/json;charset=utf-8",
  });
  var url = URL.createObjectURL(blob);

  var nomeArquivoLimpo = nomeCrianca.trim().toLowerCase().replace(/\s+/g, "_");
  if (nomeArquivoLimpo === "") {
    nomeArquivoLimpo = "umntwana";
  }

  var linkDownload = document.createElement("a");
  linkDownload.href = url;
  linkDownload.download = "ikhadi_lokugonya_" + nomeArquivoLimpo + ".json";
  document.body.appendChild(linkDownload);
  linkDownload.click();
  document.body.removeChild(linkDownload);
  URL.revokeObjectURL(url);
}

var formulario = document.getElementById("form-crianca");

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  var nome = document.getElementById("nomeCrianca").value;
  var nascimento = document.getElementById("dataNascimento").value;
  var idadeAnos = document.getElementById("idadeAnos").value;
  var idadeMeses = document.getElementById("idadeMeses").value;
  var saId = document.getElementById("cpfCrianca").value;
  var sus = document.getElementById("numeroSus").value;
  var resp1 = document.getElementById("responsavel1").value;
  var resp2 = document.getElementById("responsavel2").value;

  if (
    nome === "" ||
    nascimento === "" ||
    saId === "" ||
    sus === "" ||
    resp1 === ""
  ) {
    alert("Nceda ugcwalise zonke iindawo ezinyanzelekileyo eziphawulwe ngo-*!");
    return;
  }

  if (!validarSAID(saId)) {
    campoSAID.style.borderColor = "#E03C31";
    alert(
      "Inombolo Yesazisi (SA ID) ayilunganga! Jonga amanani uze uzame kwakhona.",
    );
    return;
  }

  if (!validarCartaoSUS(sus)) {
    campoSUS.style.borderColor = "#E03C31";
    alert(
      "Inombolo Yekhadi le-SUS ayilunganga! Kufuneka ibe namanani ali-15 asebenzayo.",
    );
    return;
  }

  var todosCards = document.querySelectorAll(".card-vacina");
  var registroVacinas = [];

  for (var i = 0; i < todosCards.length; i++) {
    var card = todosCards[i];
    var foiAplicada = card.classList.contains("tomada");
    var estaAtrasada = card.classList.contains("atrasada");

    var itemVacina = {
      vacina: card.querySelector("h3").textContent,
      dose: card.querySelector(".etiqueta-dose").textContent,
      idade: card.querySelectorAll("p")[0].textContent,
      status: foiAplicada
        ? "Igonyiwe (Aplicada)"
        : estaAtrasada
          ? "Iphuthiwe (Atrasada)"
          : "Ilindile (Pendente)",
      aplicada: foiAplicada,
    };

    if (foiAplicada) {
      itemVacina.dados_aplicacao = {
        data_aplicacao: card.dataset.dataAplicacao || "",
        numero_lote: card.dataset.numeroLote || "",
        unidade_aplicadora: card.dataset.unidadeAplicadora || "",
        responsavel_aplicacao: card.dataset.responsavelAplicacao || "",
      };
    }

    registroVacinas.push(itemVacina);
  }

  var carteirinhaCompleta = {
    sistema: "Ikhadi Ledijithali Lokugonya Abantwana - SUS (UMzantsi Afrika)",
    data_exportacao: new Date().toISOString(),
    dados_crianca: {
      nome_completo: nome,
      data_nascimento: nascimento,
      idade_anos: idadeAnos,
      idade_meses: idadeMeses,
      south_african_id: limparNumeros(saId),
      cartao_sus: limparNumeros(sus),
      responsavel_legal_1: resp1,
      responsavel_legal_2: resp2,
    },
    vacinas: registroVacinas,
  };

  exportarCarteirinhaJSON(carteirinhaCompleta, nome);

  var mensagem = document.getElementById("mensagem-cadastro");
  mensagem.textContent =
    "Iinkcukacha zika-" +
    nome +
    " ziqinisekisiwe kwaye ifayile ye-JSON ikhutshelwe ngempumelelo!";
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
  atualizarStatusAtrasadas();
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

function extrairIdadeLimiteMeses(textoIdade) {
  var texto = textoIdade.toLowerCase();

  if (texto.indexOf("ekuzalweni") !== -1) {
    return 0;
  }

  if (texto.indexOf("ukususela") !== -1) {
    return 6;
  }

  var numeros = texto.match(/\d+/g);
  if (!numeros || numeros.length === 0) {
    return 0;
  }

  var maiorValor = parseInt(numeros[numeros.length - 1], 10);

  if (texto.indexOf("minyaka") !== -1 || texto.indexOf("unyaka") !== -1) {
    return maiorValor * 12;
  }

  return maiorValor;
}

function atualizarStatusAtrasadas() {
  var todosCards = document.querySelectorAll(".card-vacina");

  for (var i = 0; i < todosCards.length; i++) {
    var card = todosCards[i];
    var textoStatus = card.querySelector(".status-texto");

    if (card.classList.contains("tomada")) {
      card.classList.remove("atrasada");
      continue;
    }

    var limiteMeses = parseInt(card.dataset.idadeLimiteMeses, 10);

    if (
      idadeTotalMesesCrianca !== null &&
      idadeTotalMesesCrianca > limiteMeses
    ) {
      card.classList.add("atrasada");
      textoStatus.textContent = "Isimo: Iphuthiwe (Atrasada) ⚠️";
    } else {
      card.classList.remove("atrasada");
      textoStatus.textContent = "Isimo: Ilindile";
    }
  }
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
  card.dataset.idadeLimiteMeses = extrairIdadeLimiteMeses(idadeDose);

  card.innerHTML =
    '<span class="etiqueta-dose">Idosi ' +
    numeroDose +
    "</span>" +
    "<h3>" +
    nomeVacina +
    "</h3>" +
    "<p><strong>Ubudala:</strong> " +
    idadeDose +
    "</p>" +
    '<p class="status-texto">Isimo: Ilindile</p>' +
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

checkTomada.addEventListener("change", function () {
  if (checkTomada.checked === true) {
    camposAplicacao.classList.remove("escondido");
  } else {
    camposAplicacao.classList.add("escondido");
  }
});

function formatarDataBrasil(dataISO) {
  if (dataISO === "") return "";
  var partes = dataISO.split("-");
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function abrirJanela(cardClicado, nome, numDose, idade, descricao) {
  cardAtualSelecionado = cardClicado;

  document.getElementById("janela-titulo").textContent = nome;
  document.getElementById("janela-dose").textContent = "Idosi " + numDose;
  document.getElementById("janela-idade").textContent = idade;
  document.getElementById("janela-descricao").textContent = descricao;

  if (cardClicado.classList.contains("tomada")) {
    checkTomada.checked = true;
    camposAplicacao.classList.remove("escondido");

    inputDataAplicacao.value = cardClicado.dataset.dataAplicacao || "";
    inputNumeroLote.value = cardClicado.dataset.numeroLote || "";
    inputUnidadeAplicadora.value = cardClicado.dataset.unidadeAplicadora || "";
    inputResponsavelAplicacao.value =
      cardClicado.dataset.responsavelAplicacao || "";
  } else {
    checkTomada.checked = false;
    camposAplicacao.classList.add("escondido");

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

      if (
        dataApl === "" ||
        lote === "" ||
        unidade === "" ||
        responsavel === ""
      ) {
        alert(
          "Nceda ugcwalise umhla wokugonya, inombolo yebhetshi, iziko lezempilo kunye negama lomongi!",
        );
        return;
      }

      cardAtualSelecionado.dataset.dataAplicacao = dataApl;
      cardAtualSelecionado.dataset.numeroLote = lote;
      cardAtualSelecionado.dataset.unidadeAplicadora = unidade;
      cardAtualSelecionado.dataset.responsavelAplicacao = responsavel;

      cardAtualSelecionado.classList.remove("atrasada");
      cardAtualSelecionado.classList.add("tomada");
      textoStatus.textContent = "Isimo: Igonyiwe ✓";

      caixaDetalhesCard.innerHTML =
        "<strong>Umhla:</strong> " +
        formatarDataBrasil(dataApl) +
        "<br>" +
        "<strong>Ibhetshi:</strong> " +
        lote +
        "<br>" +
        "<strong>Iziko:</strong> " +
        unidade +
        "<br>" +
        "<strong>Umgonyi:</strong> " +
        responsavel;
      caixaDetalhesCard.classList.remove("escondido");
    } else {
      cardAtualSelecionado.classList.remove("tomada");
      caixaDetalhesCard.innerHTML = "";
      caixaDetalhesCard.classList.add("escondido");

      delete cardAtualSelecionado.dataset.dataAplicacao;
      delete cardAtualSelecionado.dataset.numeroLote;
      delete cardAtualSelecionado.dataset.unidadeAplicadora;
      delete cardAtualSelecionado.dataset.responsavelAplicacao;

      atualizarStatusAtrasadas();
    }
  }

  janela.classList.add("escondido");
});

btnFechar.addEventListener("click", function () {
  janela.classList.add("escondido");
});
