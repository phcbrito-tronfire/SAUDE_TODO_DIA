/* =========================================================
   RAIZ — script.js
   Todas as interações do site.

   ÍNDICE
   01. Menu responsivo          08. Calculadora de IMC
   02. Barra de progresso       09. Meta de hidratação
   03. Botão voltar ao topo     10. Distância caminhada
   04. Contadores animados      11. Quiz de mitos
   05. Filtro de exercícios     12. Formulário de assinatura
   06. Abas do plano semanal    13. Animação de entrada
   07. Modal das receitas       14. Menu ativo / 15. Ano atual
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  /* ===== 01. MENU RESPONSIVO ===== */
  const menuBotao = document.getElementById("menuBotao");
  const menu = document.getElementById("menu");

  menuBotao.addEventListener("click", function () {
    const aberto = menu.classList.toggle("menu--aberto");
    menuBotao.classList.toggle("menu-botao--aberto", aberto);
    menuBotao.setAttribute("aria-expanded", aberto);
    menuBotao.setAttribute("aria-label", aberto ? "Fechar menu de navegação" : "Abrir menu de navegação");
  });

  document.querySelectorAll(".menu__link").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("menu--aberto");
      menuBotao.classList.remove("menu-botao--aberto");
      menuBotao.setAttribute("aria-expanded", "false");
    });
  });


  /* ===== 02. BARRA DE PROGRESSO DA LEITURA ===== */
  const cabecalho = document.getElementById("cabecalho");
  const progressoBarra = document.getElementById("progressoBarra");
  const botaoTopo = document.getElementById("botaoTopo");

  function aoRolar() {
    const rolagem = window.scrollY;
    const altura = document.documentElement.scrollHeight - window.innerHeight;
    const percentual = altura > 0 ? (rolagem / altura) * 100 : 0;

    progressoBarra.style.width = percentual + "%";
    cabecalho.classList.toggle("cabecalho--rolado", rolagem > 12);

    /* ===== 03. BOTÃO VOLTAR AO TOPO ===== */
    botaoTopo.hidden = rolagem < 600;
  }

  window.addEventListener("scroll", aoRolar);
  aoRolar();

  botaoTopo.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });


  /* ===== 04. CONTADORES ANIMADOS ===== */
  function animarContador(elemento) {
    const alvo = Number(elemento.dataset.alvo);
    const duracao = 1400;
    const inicio = performance.now();

    function passo(agora) {
      const progresso = Math.min((agora - inicio) / duracao, 1);
      // Curva de desaceleração para o número "frear" no final
      const suave = 1 - Math.pow(1 - progresso, 3);
      elemento.textContent = Math.round(alvo * suave);
      if (progresso < 1) requestAnimationFrame(passo);
    }

    requestAnimationFrame(passo);
  }

  const contadores = document.querySelectorAll(".contador");

  if ("IntersectionObserver" in window) {
    const obsContador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          animarContador(entrada.target);
          obsContador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.5 });

    contadores.forEach(function (c) { obsContador.observe(c); });
  } else {
    contadores.forEach(function (c) { c.textContent = c.dataset.alvo; });
  }


  /* ===== 05. FILTRO DE EXERCÍCIOS ===== */
  const botoesFiltro = document.querySelectorAll(".filtro");
  const exercicios = document.querySelectorAll("#listaExercicios .cartao");

  botoesFiltro.forEach(function (botao) {
    botao.addEventListener("click", function () {
      const categoria = botao.dataset.filtro;

      botoesFiltro.forEach(function (b) { b.classList.remove("filtro--ativo"); });
      botao.classList.add("filtro--ativo");

      exercicios.forEach(function (cartao) {
        const pertence = categoria === "todos" || cartao.dataset.categoria === categoria;
        cartao.classList.toggle("cartao--oculto", !pertence);
      });
    });
  });


  /* ===== 06. ABAS DO PLANO SEMANAL ===== */
  const abas = document.querySelectorAll(".aba");
  const paineis = document.querySelectorAll(".painel");

  abas.forEach(function (aba) {
    aba.addEventListener("click", function () {
      const alvo = aba.dataset.aba;

      abas.forEach(function (a) {
        const ativa = a === aba;
        a.classList.toggle("aba--ativa", ativa);
        a.setAttribute("aria-selected", ativa);
      });

      paineis.forEach(function (painel) {
        const mostrar = painel.dataset.painel === alvo;
        painel.hidden = !mostrar;
        painel.classList.toggle("painel--ativo", mostrar);
      });
    });
  });


  /* ===== 07. MODAL DAS RECEITAS ===== */
  const modal = document.getElementById("modal");
  const modalConteudo = document.getElementById("modalConteudo");
  const modalFechar = document.getElementById("modalFechar");
  let elementoAnterior = null; // guarda o foco para devolver ao fechar

  function abrirModal(id) {
    const modelo = document.getElementById("receita-" + id);
    if (!modelo) return;

    elementoAnterior = document.activeElement;
    modalConteudo.innerHTML = modelo.innerHTML;
    modal.hidden = false;
    document.body.style.overflow = "hidden"; // trava a rolagem do fundo
    modalConteudo.focus();
  }

  function fecharModal() {
    modal.hidden = true;
    modalConteudo.innerHTML = "";
    document.body.style.overflow = "";
    if (elementoAnterior) elementoAnterior.focus();
  }

  document.querySelectorAll("[data-abrir]").forEach(function (botao) {
    botao.addEventListener("click", function () {
      abrirModal(botao.dataset.abrir);
    });
  });

  modalFechar.addEventListener("click", fecharModal);

  modal.addEventListener("click", function (evento) {
    if (evento.target.hasAttribute("data-fechar")) fecharModal();
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && !modal.hidden) fecharModal();
  });


  /* ===== 08. CALCULADORA DE IMC ===== */
  const formIMC = document.getElementById("formIMC");
  const campoPeso = document.getElementById("peso");
  const campoAltura = document.getElementById("altura");
  const erroIMC = document.getElementById("erroIMC");
  const saidaIMC = document.getElementById("saidaIMC");

  function numero(campo) {
    return parseFloat(String(campo.value).replace(",", "."));
  }

  function classificarIMC(imc) {
    if (imc < 18.5) return "Abaixo do peso";
    if (imc < 25)   return "Peso adequado";
    if (imc < 30)   return "Sobrepeso";
    return "Obesidade";
  }

  formIMC.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const peso = numero(campoPeso);
    const alturaCm = numero(campoAltura);

    campoPeso.classList.remove("invalido");
    campoAltura.classList.remove("invalido");
    erroIMC.textContent = "";

    if (isNaN(peso) || peso < 20 || peso > 400) {
      erroIMC.textContent = "Informe um peso entre 20 e 400 kg.";
      campoPeso.classList.add("invalido");
      campoPeso.focus();
      saidaIMC.hidden = true;
      return;
    }

    if (isNaN(alturaCm) || alturaCm < 100 || alturaCm > 250) {
      erroIMC.textContent = "Informe a altura em centímetros, entre 100 e 250.";
      campoAltura.classList.add("invalido");
      campoAltura.focus();
      saidaIMC.hidden = true;
      return;
    }

    // IMC = peso ÷ (altura em metros)²
    const alturaM = alturaCm / 100;
    const imc = peso / (alturaM * alturaM);

    document.getElementById("valorIMC").textContent = imc.toFixed(1).replace(".", ",");
    document.getElementById("faixaIMC").textContent = classificarIMC(imc);
    saidaIMC.hidden = false;
  });


  /* ===== 09. META DE HIDRATAÇÃO ===== */
  const formAgua = document.getElementById("formAgua");
  const campoPesoAgua = document.getElementById("pesoAgua");
  const campoClima = document.getElementById("clima");
  const erroAgua = document.getElementById("erroAgua");
  const saidaAgua = document.getElementById("saidaAgua");

  formAgua.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const peso = numero(campoPesoAgua);
    const fator = parseFloat(campoClima.value);

    campoPesoAgua.classList.remove("invalido");
    erroAgua.textContent = "";

    if (isNaN(peso) || peso < 20 || peso > 400) {
      erroAgua.textContent = "Informe um peso entre 20 e 400 kg.";
      campoPesoAgua.classList.add("invalido");
      campoPesoAgua.focus();
      saidaAgua.hidden = true;
      return;
    }

    // Referência usual: 35 ml por quilo, ajustada pela rotina do dia
    const mililitros = peso * 35 * fator;
    const litros = mililitros / 1000;
    const copos = Math.round(mililitros / 250);

    document.getElementById("valorAgua").textContent = litros.toFixed(1).replace(".", ",") + " L";
    document.getElementById("coposAgua").textContent = "Cerca de " + copos + " copos de 250 ml";
    saidaAgua.hidden = false;
  });


  /* ===== 10. DISTÂNCIA CAMINHADA ===== */
  const formPassos = document.getElementById("formPassos");
  const campoPassos = document.getElementById("passos");
  const campoAlturaPassos = document.getElementById("alturaPassos");
  const erroPassos = document.getElementById("erroPassos");
  const saidaPassos = document.getElementById("saidaPassos");

  formPassos.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const passos = numero(campoPassos);
    const alturaCm = numero(campoAlturaPassos);

    campoPassos.classList.remove("invalido");
    campoAlturaPassos.classList.remove("invalido");
    erroPassos.textContent = "";

    if (isNaN(passos) || passos < 0 || passos > 100000) {
      erroPassos.textContent = "Informe um número de passos entre 0 e 100.000.";
      campoPassos.classList.add("invalido");
      campoPassos.focus();
      saidaPassos.hidden = true;
      return;
    }

    if (isNaN(alturaCm) || alturaCm < 100 || alturaCm > 250) {
      erroPassos.textContent = "Informe a altura em centímetros, entre 100 e 250.";
      campoAlturaPassos.classList.add("invalido");
      campoAlturaPassos.focus();
      saidaPassos.hidden = true;
      return;
    }

    // Comprimento médio do passo: 41% da altura
    const passoM = (alturaCm * 0.41) / 100;
    const km = (passos * passoM) / 1000;
    const minutos = Math.round((km / 4.8) * 60); // ritmo médio de caminhada: 4,8 km/h

    document.getElementById("valorPassos").textContent = km.toFixed(2).replace(".", ",") + " km";
    document.getElementById("tempoPassos").textContent = "Equivale a cerca de " + minutos + " min caminhando";
    saidaPassos.hidden = false;
  });


  /* ===== 11. QUIZ DE MITOS ===== */
  const perguntas = [
    {
      texto: "Fazer abdominal todos os dias elimina a gordura da barriga.",
      resposta: "mito",
      explicacao: "Não existe perda de gordura localizada. O abdominal fortalece o músculo, mas a redução de gordura acontece no corpo todo, a partir do conjunto de alimentação, movimento e sono."
    },
    {
      texto: "Musculação faz bem para a saúde dos ossos.",
      resposta: "verdade",
      explicacao: "O estímulo mecânico da carga aumenta a densidade óssea e ajuda a prevenir osteoporose, principalmente com o avanço da idade."
    },
    {
      texto: "Comer carboidrato à noite engorda mais.",
      resposta: "mito",
      explicacao: "O corpo não tem um relógio que decide guardar gordura depois das 18h. O que pesa é o conjunto da alimentação ao longo dos dias, não o horário isolado de um alimento."
    },
    {
      texto: "Suco natural de fruta pode substituir a fruta inteira sem perdas.",
      resposta: "mito",
      explicacao: "No processo de fazer o suco boa parte da fibra se perde, e é justamente a fibra que dá saciedade e desacelera a absorção do açúcar. A fruta inteira alimenta melhor."
    },
    {
      texto: "Caminhar 30 minutos por dia já traz benefício real para a saúde.",
      resposta: "verdade",
      explicacao: "Estudos consistentes mostram redução de risco cardiovascular, melhora do humor e do sono mesmo em atividades de intensidade moderada como a caminhada."
    }
  ];

  let indiceAtual = 0;
  let acertos = 0;

  const quizIndice = document.getElementById("quizIndice");
  const quizTotal = document.getElementById("quizTotal");
  const quizPergunta = document.getElementById("quizPergunta");
  const quizAcoes = document.getElementById("quizAcoes");
  const quizFeedback = document.getElementById("quizFeedback");
  const quizVeredito = document.getElementById("quizVeredito");
  const quizExplicacao = document.getElementById("quizExplicacao");
  const quizProxima = document.getElementById("quizProxima");
  const quizFinal = document.getElementById("quizFinal");
  const quizPlacar = document.getElementById("quizPlacar");
  const quizReiniciar = document.getElementById("quizReiniciar");
  const quizProgresso = document.getElementById("quizProgresso");

  quizTotal.textContent = perguntas.length;

  function mostrarPergunta() {
    const atual = perguntas[indiceAtual];
    quizIndice.textContent = indiceAtual + 1;
    quizPergunta.textContent = atual.texto;
    quizFeedback.hidden = true;
    quizFinal.hidden = true;
    quizAcoes.hidden = false;
    quizProgresso.style.width = (indiceAtual / perguntas.length) * 100 + "%";
  }

  function responder(resposta) {
    const atual = perguntas[indiceAtual];
    const certo = resposta === atual.resposta;

    if (certo) acertos++;

    quizVeredito.textContent = certo ? "Você acertou!" : "Não é bem assim.";
    quizVeredito.className = "quiz__veredito " + (certo ? "quiz__veredito--certo" : "quiz__veredito--errado");
    quizExplicacao.textContent = atual.explicacao;

    quizAcoes.hidden = true;
    quizFeedback.hidden = false;
    quizProxima.textContent = indiceAtual === perguntas.length - 1 ? "Ver resultado" : "Próxima";
    quizProgresso.style.width = ((indiceAtual + 1) / perguntas.length) * 100 + "%";
  }

  function finalizar() {
    quizPergunta.textContent = "Fim do quiz";
    quizIndice.textContent = perguntas.length;
    quizFeedback.hidden = true;
    quizAcoes.hidden = true;
    quizFinal.hidden = false;
    quizPlacar.textContent = "Você acertou " + acertos + " de " + perguntas.length + ".";
  }

  quizAcoes.querySelectorAll("[data-resposta]").forEach(function (botao) {
    botao.addEventListener("click", function () {
      responder(botao.dataset.resposta);
    });
  });

  quizProxima.addEventListener("click", function () {
    if (indiceAtual < perguntas.length - 1) {
      indiceAtual++;
      mostrarPergunta();
    } else {
      finalizar();
    }
  });

  quizReiniciar.addEventListener("click", function () {
    indiceAtual = 0;
    acertos = 0;
    mostrarPergunta();
  });

  mostrarPergunta();


  /* ===== 12. CHECKLIST DE HÁBITOS ===== */
  const caixas = document.querySelectorAll("#listaHabitos input[type='checkbox']");
  const anel = document.getElementById("anel");
  const anelTexto = document.getElementById("anelTexto");
  const mensagemHabitos = document.getElementById("mensagemHabitos");
  const limparHabitos = document.getElementById("limparHabitos");

  function atualizarHabitos() {
    let marcados = 0;
    caixas.forEach(function (caixa) { if (caixa.checked) marcados++; });

    const percentual = Math.round((marcados / caixas.length) * 100);
    anel.style.setProperty("--porcentagem", percentual);
    anelTexto.textContent = percentual + "%";

    let mensagem;
    if (percentual === 0)        mensagem = "Marque os hábitos que você já cumpriu hoje.";
    else if (percentual < 40)    mensagem = "Começou. Escolha mais um item da lista para hoje.";
    else if (percentual < 70)    mensagem = "Bom ritmo. Sua rotina já tem uma base montada.";
    else if (percentual < 100)   mensagem = "Quase tudo em ordem. Falta pouco para fechar o dia.";
    else                         mensagem = "Dia completo. Repetir isso algumas vezes por semana já é o suficiente.";

    mensagemHabitos.textContent = mensagem;
  }

  caixas.forEach(function (caixa) {
    caixa.addEventListener("change", atualizarHabitos);
  });

  limparHabitos.addEventListener("click", function () {
    caixas.forEach(function (caixa) { caixa.checked = false; });
    atualizarHabitos();
  });

  atualizarHabitos();


  /* ===== 13. ACORDEÃO DAS DÚVIDAS ===== */
  const botoesAcordeao = document.querySelectorAll(".acordeao__botao");

  botoesAcordeao.forEach(function (botao) {
    botao.addEventListener("click", function () {
      const item = botao.parentElement;
      const conteudo = botao.nextElementSibling;
      const jaAberto = item.classList.contains("acordeao__item--aberto");

      document.querySelectorAll(".acordeao__item").forEach(function (outro) {
        outro.classList.remove("acordeao__item--aberto");
        outro.querySelector(".acordeao__conteudo").style.maxHeight = null;
        outro.querySelector(".acordeao__botao").setAttribute("aria-expanded", "false");
      });

      if (!jaAberto) {
        item.classList.add("acordeao__item--aberto");
        conteudo.style.maxHeight = conteudo.scrollHeight + "px";
        botao.setAttribute("aria-expanded", "true");
      }
    });
  });


  /* ===== 14. FORMULÁRIO DE ASSINATURA ===== */
  const formAssinatura = document.getElementById("formAssinatura");
  const campoNome = document.getElementById("nome");
  const campoEmail = document.getElementById("email");
  const campoInteresse = document.getElementById("interesse");
  const erroAssinatura = document.getElementById("erroAssinatura");
  const sucessoAssinatura = document.getElementById("sucessoAssinatura");

  const padraoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  formAssinatura.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim();

    erroAssinatura.textContent = "";
    sucessoAssinatura.textContent = "";
    campoNome.classList.remove("invalido");
    campoEmail.classList.remove("invalido");

    if (nome.length < 2) {
      erroAssinatura.textContent = "Digite seu nome para continuar.";
      campoNome.classList.add("invalido");
      campoNome.focus();
      return;
    }

    if (!padraoEmail.test(email)) {
      erroAssinatura.textContent = "Digite um e-mail válido, no formato nome@exemplo.com.";
      campoEmail.classList.add("invalido");
      campoEmail.focus();
      return;
    }

    // Site estático: a confirmação acontece apenas na tela
    sucessoAssinatura.textContent =
      "Pronto, " + nome + "! Você vai receber os conteúdos de " + campoInteresse.value.toLowerCase() + ".";
    formAssinatura.reset();
  });


  /* ===== 15. ANIMAÇÃO DE ENTRADA AO ROLAR ===== */
  const elementosRevelar = document.querySelectorAll(".revelar");

  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("revelar--visivel");
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.1 });

    elementosRevelar.forEach(function (elemento) { observador.observe(elemento); });
  } else {
    elementosRevelar.forEach(function (elemento) { elemento.classList.add("revelar--visivel"); });
  }


  /* ===== 16. LINK ATIVO NO MENU CONFORME A SEÇÃO ===== */
  const secoes = document.querySelectorAll("main section[id]");
  const links = document.querySelectorAll(".menu__link");

  if ("IntersectionObserver" in window) {
    const observadorMenu = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          links.forEach(function (link) {
            const alvo = link.getAttribute("href") === "#" + entrada.target.id;
            link.classList.toggle("menu__link--ativo", alvo);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    secoes.forEach(function (secao) { observadorMenu.observe(secao); });
  }


  /* ===== 17. ANO ATUAL NO RODAPÉ ===== */
  document.getElementById("ano").textContent = new Date().getFullYear();

});
