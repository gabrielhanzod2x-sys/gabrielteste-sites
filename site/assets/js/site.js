/* ============================================================
   BARBEARIA DO CARNEIRO — comportamento
   Sem dependências externas (o model-viewer é carregado
   sob demanda, a partir de assets/js/).
   ============================================================ */
(function () {
'use strict';

var $  = function (s, c) { return (c || document).querySelector(s); };
var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

var MENOS_MOV = window.matchMedia('(prefers-reduced-motion: reduce)');
function semMovimento() { return MENOS_MOV.matches; }


/* ------------------------------------------------------------
   1. CARROSSEL  (avaliações · cortes adultos · cortes infantis)
   Lâmina central em foco, vizinhas parcialmente visíveis.
   ------------------------------------------------------------ */
function Carrossel(raiz) {
  var pista   = $('[data-pista]', raiz);
  var laminas = $$('[data-lam]', pista);
  var pontos  = $('[data-pontos]', raiz);
  var total   = laminas.length;
  if (!total) return null;

  var atual   = 0;
  var auto    = parseInt(raiz.dataset.auto || '0', 10);
  var desl1   = parseFloat(raiz.dataset.desl || '64');   /* % de afastamento da vizinha */
  var desl2   = desl1 * 1.42;
  var relogio = null;
  var pausado = false;

  /* --- bolinhas --- */
  var bolinhas = [];
  if (pontos) {
    laminas.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Item ' + (i + 1) + ' de ' + total);
      b.addEventListener('click', function () { ir(i, true); });
      pontos.appendChild(b);
      bolinhas.push(b);
    });
  }

  /* distância circular assinada entre i e o atual */
  function desloc(i) {
    var d = i - atual;
    var meio = total / 2;
    if (d >  meio) d -= total;
    if (d < -meio) d += total;
    return d;
  }

  function pintar() {
    laminas.forEach(function (lam, i) {
      var d = desloc(i);
      var abs = Math.abs(d);
      var x, esc, rot;

      if (abs === 0)      { x = 0;            esc = 1;    rot = 0; }
      else if (abs === 1) { x = d * desl1;   esc = 0.78; rot = d * -13; }
      else                { x = d * desl2;   esc = 0.6;  rot = d * -18; }

      lam.style.transform =
        'translate(-50%,-50%) translateX(' + x + '%) rotateY(' + rot + 'deg) scale(' + esc + ')';
      lam.dataset.pos = abs <= 2 ? String(d) : 'x';

      /* acessibilidade: só a lâmina em foco é alcançável */
      var oculto = abs !== 0;
      lam.setAttribute('aria-hidden', oculto ? 'true' : 'false');
      $$('a,button,img[data-ampliar],[tabindex]', lam).forEach(function (el) {
        if (el.tagName === 'IMG') el.style.pointerEvents = oculto ? 'none' : '';
        else el.tabIndex = oculto ? -1 : 0;
      });
    });

    bolinhas.forEach(function (b, i) {
      b.setAttribute('aria-selected', i === atual ? 'true' : 'false');
    });
  }

  function ir(i, porUsuario) {
    atual = ((i % total) + total) % total;
    pintar();
    if (porUsuario) reiniciar();
  }
  function andar(p, porUsuario) { ir(atual + p, porUsuario); }

  /* --- setas --- */
  $$('[data-ir]', raiz).forEach(function (btn) {
    btn.addEventListener('click', function () {
      andar(parseInt(btn.dataset.ir, 10), true);
    });
  });

  /* --- teclado --- */
  raiz.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { andar(-1, true); e.preventDefault(); }
    if (e.key === 'ArrowRight') { andar( 1, true); e.preventDefault(); }
  });

  /* --- arraste / deslize --- */
  var px = 0, py = 0, arrastando = false, decidido = false, horizontal = false;

  pista.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    arrastando = true; decidido = false; horizontal = false;
    px = e.clientX; py = e.clientY;
    parar();
  });

  var dxAtual = 0;
  pista.addEventListener('pointermove', function (e) {
    if (!arrastando) return;
    var dx = e.clientX - px, dy = e.clientY - py;
    if (!decidido && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      decidido = true;
      horizontal = Math.abs(dx) > Math.abs(dy);
      if (horizontal) pista.classList.add('arrastando');
    }
    if (decidido && horizontal) {
      /* a pista segue o dedo com resistência, como algo físico */
      dxAtual = dx;
      var amortecido = dx / (1 + Math.abs(dx) / 420);
      pista.style.transform = 'translate3d(' + amortecido + 'px,0,0)';
    }
  });

  function soltar() {
    if (!arrastando) return;
    arrastando = false;
    pista.classList.remove('arrastando');
    pista.style.transform = '';
    if (horizontal && Math.abs(dxAtual) > 46) andar(dxAtual < 0 ? 1 : -1, true);
    dxAtual = 0; decidido = false; horizontal = false;
    retomar();
  }
  pista.addEventListener('pointerup', soltar);
  pista.addEventListener('pointercancel', soltar);
  pista.addEventListener('pointerleave', soltar);

  /* clique na lâmina vizinha traz ela para o foco */
  laminas.forEach(function (lam, i) {
    lam.addEventListener('click', function (e) {
      if (lam.dataset.pos !== '0') { e.preventDefault(); e.stopPropagation(); ir(i, true); }
    }, true);
  });

  /* --- avanço automático --- */
  function tocar() {
    if (!auto || semMovimento() || pausado || document.hidden) return;
    relogio = setTimeout(function () { andar(1); tocar(); }, auto);
  }
  function parar()     { clearTimeout(relogio); relogio = null; }
  function reiniciar() { parar(); tocar(); }
  function retomar()   { if (!relogio) tocar(); }

  if (auto) {
    ['mouseenter', 'focusin', 'touchstart'].forEach(function (ev) {
      raiz.addEventListener(ev, function () { pausado = true; parar(); }, { passive: true });
    });
    ['mouseleave', 'focusout'].forEach(function (ev) {
      raiz.addEventListener(ev, function () { pausado = false; retomar(); });
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) parar(); else retomar();
    });

    /* só roda quando está à vista */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (en.isIntersecting) { pausado = false; retomar(); }
          else { pausado = true; parar(); }
        });
      }, { threshold: 0.25 }).observe(raiz);
    } else { tocar(); }
  }

  pintar();
  return { ir: ir, pintar: pintar };
}

var carrosseis = $$('[data-carrossel]').map(Carrossel);


/* ------------------------------------------------------------
   1b. AVALIAÇÃO LONGA DESCE SOZINHA
   Mede o texto que não cabe no cartão; a animação (CSS) usa essa medida.
   ------------------------------------------------------------ */
(function () {
  var textos = $$('.palco--depo .fala__texto');
  textos.forEach(function (t) {
    var rolo = document.createElement('span');
    rolo.className = 'fala__rolo';
    while (t.firstChild) rolo.appendChild(t.firstChild);
    t.appendChild(rolo);
  });
  function medir() {
    textos.forEach(function (t) {
      var rolo = t.firstElementChild;
      var sobra = Math.ceil(rolo.scrollHeight - t.clientHeight);
      var longo = sobra > 4;
      t.classList.toggle('longo', longo);
      if (longo) {
        t.style.setProperty('--desce', (sobra + 6) + 'px');
        /* velocidade de leitura: ~22 px por segundo, nunca menos de 9 s */
        t.style.setProperty('--tempo', Math.max(9, (sobra * 2) / 22 / 0.36) + 's');
      }
    });
  }
  medir();
  window.addEventListener('resize', medir);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
})();


/* ------------------------------------------------------------
   2. ALTERNADOR  ADULTOS / INFANTIL
   ------------------------------------------------------------ */
(function () {
  var alterna = $('.alterna');
  if (!alterna) return;

  var abas    = $$('[data-aba]', alterna);
  var paineis = { adultos: $('#painel-adultos'), infantil: $('#painel-infantil') };
  var cabecas = {
    adultos:  $('[data-cab="adultos"]'),
    infantil: $('[data-cab="infantil"]')
  };

  function mostrar(nome, focar) {
    alterna.dataset.ativo = nome;

    abas.forEach(function (b) {
      var on = b.dataset.aba === nome;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
      if (on && focar) b.focus();
    });

    Object.keys(paineis).forEach(function (k) {
      if (paineis[k]) paineis[k].hidden = (k !== nome);
      if (cabecas[k]) cabecas[k].hidden = (k !== nome);
    });

    /* recalcula as lâminas do carrossel que acabou de aparecer */
    carrosseis.forEach(function (c) { if (c) c.pintar(); });

    /* reanima o cabeçalho e revela o conteúdo do painel */
    $$('[data-ar]', cabecas[nome]).forEach(function (el) { el.classList.add('vis'); });
    $$('[data-ar]', paineis[nome]).forEach(function (el) { el.classList.add('vis'); });
  }

  abas.forEach(function (b) {
    b.addEventListener('click', function () { mostrar(b.dataset.aba); });
  });

  alterna.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    mostrar(alterna.dataset.ativo === 'adultos' ? 'infantil' : 'adultos', true);
  });

  alterna.dataset.ativo = 'adultos';
})();


/* ------------------------------------------------------------
   3. SCROLLSPY DA BARRA LATERAL
   ------------------------------------------------------------ */
(function () {
  var elos = $$('[data-spy]');
  if (!elos.length || !('IntersectionObserver' in window)) return;

  var porId = {};
  elos.forEach(function (a) { porId[a.dataset.spy] = a; });

  /* #infantis e #avaliacoes pertencem a seções maiores */
  var alvos = elos.map(function (a) { return document.getElementById(a.dataset.spy); })
                  .filter(Boolean);

  var visiveis = {};

  var obs = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      /* a área realmente visível decide — seções altas e baixas competem em pé de igualdade */
      var r = en.intersectionRect;
      visiveis[en.target.id] = en.isIntersecting ? (r.height * r.width) : 0;
    });

    var melhorId = null, melhor = 0;
    Object.keys(visiveis).forEach(function (id) {
      if (visiveis[id] > melhor) { melhor = visiveis[id]; melhorId = id; }
    });

    elos.forEach(function (a) { a.classList.remove('ativo'); a.removeAttribute('aria-current'); });
    if (melhorId && porId[melhorId]) {
      porId[melhorId].classList.add('ativo');
      porId[melhorId].setAttribute('aria-current', 'true');
    }
  }, { threshold: [0, .04, .1, .2, .35, .5, .7, .9, 1], rootMargin: '-10% 0px -28% 0px' });

  alvos.forEach(function (t) { obs.observe(t); });
})();


/* ------------------------------------------------------------
   4. MENU LATERAL NO CELULAR
   ------------------------------------------------------------ */
(function () {
  var gatilho = $('.gatilho');
  var trilho  = $('#trilho');
  var veu     = $('.veu');
  if (!gatilho || !trilho || !veu) return;

  function abrir() {
    trilho.classList.add('aberto');
    gatilho.setAttribute('aria-expanded', 'true');
    gatilho.setAttribute('aria-label', 'Fechar menu');
    veu.hidden = false;
    requestAnimationFrame(function () { veu.classList.add('vis'); });
    document.body.style.overflow = 'hidden';
  }
  function fechar() {
    trilho.classList.remove('aberto');
    gatilho.setAttribute('aria-expanded', 'false');
    gatilho.setAttribute('aria-label', 'Abrir menu');
    veu.classList.remove('vis');
    setTimeout(function () { veu.hidden = true; }, 280);
    document.body.style.overflow = '';
  }
  function alternar() {
    if (trilho.classList.contains('aberto')) fechar(); else abrir();
  }

  gatilho.addEventListener('click', alternar);
  veu.addEventListener('click', fechar);
  trilho.addEventListener('click', function (e) {
    if (e.target.closest('a')) fechar();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && trilho.classList.contains('aberto')) { fechar(); gatilho.focus(); }
  });
})();


/* ------------------------------------------------------------
   4b. BARRA LATERAL QUE SE RECOLHE SOZINHA (computador e tablet)
   Só reaparece quando a pessoa vai até ela: mouse na borda esquerda ou
   foco pelo teclado. Rolar a página NÃO traz a barra de volta (pedido do
   cliente). Recolhe 2,4 s depois que o mouse sai. A borda âmbar fica
   visível como alça.
   ------------------------------------------------------------ */
(function () {
  var trilho = $('#trilho');
  if (!trilho) return;
  var alca = $('.trilho__alca', trilho);
  var GRANDE = window.matchMedia('(min-width: 761px)');
  var ESPERA = 2400;
  var relogio = null;

  function ocupada() {
    return trilho.matches(':hover') || trilho.contains(document.activeElement);
  }
  function recolher() {
    if (!GRANDE.matches) return;
    if (ocupada()) { agendar(); return; }
    trilho.classList.add('recolhido');
  }
  function agendar() {
    clearTimeout(relogio);
    relogio = setTimeout(recolher, ESPERA);
  }
  function mostrar() {
    if (!GRANDE.matches) return;
    trilho.classList.remove('recolhido');
    agendar();
  }

  /* mouse encostando na borda esquerda, onde fica o fio âmbar */
  document.addEventListener('mousemove', function (e) {
    if (trilho.classList.contains('recolhido') && e.clientX <= 24) mostrar();
  }, { passive: true });

  trilho.addEventListener('mouseenter', function () { clearTimeout(relogio); trilho.classList.remove('recolhido'); });
  trilho.addEventListener('mouseleave', agendar);
  trilho.addEventListener('focusin', mostrar);
  trilho.addEventListener('focusout', agendar);
  if (alca) alca.addEventListener('click', mostrar);

  GRANDE.addEventListener('change', function () {
    trilho.classList.remove('recolhido');
    if (GRANDE.matches) agendar(); else clearTimeout(relogio);
  });

  /* começa visível e se recolhe logo depois */
  if (GRANDE.matches) { clearTimeout(relogio); relogio = setTimeout(recolher, 3200); }
})();


/* ------------------------------------------------------------
   4c. FOTOS QUE APARECEM SUAVEMENTE
   Imagem sob demanda começa invisível e entra com fade ao terminar de baixar.
   ------------------------------------------------------------ */
(function () {
  $$('img[loading="lazy"]').forEach(function (img) {
    if (img.complete && img.naturalWidth) return;
    img.classList.add('img-espera');
    function pronta() { img.classList.remove('img-espera'); img.classList.add('img-pronta'); }
    img.addEventListener('load', pronta, { once: true });
    img.addEventListener('error', pronta, { once: true });
  });
})();


/* ------------------------------------------------------------
   4d. ROLAGEM COM INÉRCIA (Lenis)
   Desacelera a roda do mouse como um movimento físico. No toque fica o
   rolar nativo do celular, que já é fluido. Desligado com movimento reduzido.
   ------------------------------------------------------------ */
var lenis = null;
(function () {
  if (semMovimento() || typeof window.Lenis !== 'function') return;
  lenis = new window.Lenis({
    lerp: 0.085,
    wheelMultiplier: 0.95,
    smoothWheel: true,
    syncTouch: false,
    prevent: function (no) {
      return !!(no.closest && no.closest('model-viewer, iframe, dialog, [data-lenis-prevent]'));
    }
  });
  function quadro(t) { lenis.raf(t); requestAnimationFrame(quadro); }
  requestAnimationFrame(quadro);

  /* diálogos e menu do celular param a rolagem do fundo */
  $$('dialog').forEach(function (d) {
    new MutationObserver(function () {
      if (d.open) lenis.stop(); else lenis.start();
    }).observe(d, { attributes: true, attributeFilter: ['open'] });
  });
  var trilho = $('#trilho');
  if (trilho) new MutationObserver(function () {
    if (trilho.classList.contains('aberto')) lenis.stop(); else lenis.start();
  }).observe(trilho, { attributes: true, attributeFilter: ['class'] });
})();


/* ------------------------------------------------------------
   5. REVELAÇÃO AO ROLAR
   ------------------------------------------------------------ */
(function () {
  var alvos = $$('[data-ar]');
  var secoes = $$('section');

  if (!('IntersectionObserver' in window) || semMovimento()) {
    alvos.forEach(function (e) { e.classList.add('vis'); });
    secoes.forEach(function (e) { e.classList.add('vis'); });
    return;
  }

  function finalizar(el) {
    var feito = false;
    function fim() {
      if (feito) return; feito = true;
      el.classList.add('ar-fim');
      el.style.removeProperty('--atraso');
    }
    el.addEventListener('transitionend', function f(ev) {
      if (ev.target !== el || ev.propertyName !== 'transform') return;
      el.removeEventListener('transitionend', f); fim();
    });
    setTimeout(fim, 2600);
  }

  var obs = new IntersectionObserver(function (ents, o) {
    /* quem entra junto aparece em cascata, de cima para baixo */
    var novos = ents.filter(function (en) { return en.isIntersecting; })
                    .map(function (en) { return en.target; })
                    .sort(function (a, b) {
                      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
                      return (ra.top - rb.top) || (ra.left - rb.left);
                    });
    novos.forEach(function (el, i) {
      el.style.setProperty('--atraso', Math.min(i, 6) * 0.09 + 's');
      el.classList.add('vis');
      finalizar(el);
      o.unobserve(el);
    });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });

  alvos.forEach(function (e) { obs.observe(e); });

  var obsSec = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) { if (en.isIntersecting) en.target.classList.add('vis'); });
  }, { threshold: .1 });
  secoes.forEach(function (e) { obsSec.observe(e); });
})();


/* ------------------------------------------------------------
   6. VÍDEO DA PRÓTESE
   Carrega só perto da área visível, toca mudo, pausa ao sair.
   ------------------------------------------------------------ */
(function () {
  var caixa = $('[data-video]');
  if (!caixa) return;

  var video    = $('video', caixa);
  var assistir = $('.video__assistir', caixa);
  var som      = $('.video__som', caixa);
  var pronto   = false;

  function preparar() {
    if (pronto) return;
    pronto = true;
    video.src = video.dataset.src;
    video.load();
  }

  function tocar() {
    preparar();
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* o navegador bloqueou: fica no cartaz */ });
  }

  video.addEventListener('playing', function () {
    assistir.hidden = true;
    som.hidden = false;
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0) assistir.hidden = false;
  });

  assistir.addEventListener('click', function () {
    tocar();
    /* o toque é um gesto do usuário: já pode sair do mudo */
    video.muted = false;
    som.setAttribute('aria-pressed', 'true');
    som.setAttribute('aria-label', 'Desativar som do vídeo');
  });

  som.addEventListener('click', function () {
    video.muted = !video.muted;
    var ligado = !video.muted;
    som.setAttribute('aria-pressed', ligado ? 'true' : 'false');
    som.setAttribute('aria-label', ligado ? 'Desativar som do vídeo' : 'Ativar som do vídeo');
  });

  if (!('IntersectionObserver' in window)) return;

  /* pré-carrega quando chega perto */
  new IntersectionObserver(function (ents, o) {
    ents.forEach(function (en) {
      if (!en.isIntersecting) return;
      preparar();
      o.disconnect();
    });
  }, { rootMargin: '400px 0px' }).observe(caixa);

  /* toca mudo ao entrar em foco, pausa ao sair */
  new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      if (en.isIntersecting) {
        if (!semMovimento() && video.paused) { video.muted = true; tocar(); }
      } else if (!video.paused) {
        video.pause();
      }
    });
  }, { threshold: .45 }).observe(caixa);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && !video.paused) video.pause();
  });
})();


/* ------------------------------------------------------------
   7. VITRINE 3D
   Os .glb só entram em cena sob demanda.
   ------------------------------------------------------------ */
(function () {
  var vitrine = $('[data-vitrine]');
  if (!vitrine) return;

  var pecas      = $$('[data-peca]', vitrine);
  var botao      = $('[data-explorar]', vitrine);
  var instrucao  = $('[data-instrucao]', vitrine);
  var fallback   = $('[data-fallback]', vitrine);
  var iniciado   = false;

  function temWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
               (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  function semSuporte() {
    if (botao) botao.hidden = true;
    if (instrucao) instrucao.hidden = true;
    if (fallback) fallback.hidden = false;
  }

  function montar() {
    if (iniciado) return;
    iniciado = true;

    if (!temWebGL()) { semSuporte(); return; }

    if (botao) {
      botao.disabled = true;
      botao.hidden = true;
    }
    pecas.forEach(function (p) {
      var carga = $('.peca__carga', p);
      if (carga) carga.hidden = false;
    });

    /* decodificador Draco local — precisa existir ANTES do módulo subir */
    var base = location.href.replace(/[^/]*$/, '');
    window.ModelViewerElement = window.ModelViewerElement || {};
    window.ModelViewerElement.dracoDecoderLocation = base + 'assets/js/draco/';

    var s = document.createElement('script');
    s.type = 'module';
    s.src = 'assets/js/model-viewer.min.js';

    s.onerror = function () {
      pecas.forEach(function (p) {
        var c = $('.peca__carga', p); if (c) c.hidden = true;
      });
      semSuporte();
    };

    s.onload = function () {
      pecas.forEach(function (p) {
        var mv = document.createElement('model-viewer');
        mv.setAttribute('src', p.dataset.modelo);
        mv.setAttribute('alt', p.dataset.alt || '');
        mv.setAttribute('camera-controls', '');
        mv.setAttribute('touch-action', 'pan-y');
        mv.setAttribute('shadow-intensity', '1.1');
        mv.setAttribute('shadow-softness', '0.9');
        mv.setAttribute('exposure', '1.05');
        mv.setAttribute('environment-image', 'legacy');
        mv.setAttribute('interaction-prompt', 'none');
        mv.setAttribute('min-camera-orbit', 'auto auto 5%');
        mv.setAttribute('max-camera-orbit', 'auto auto 300%');
        mv.setAttribute('camera-orbit', '-22deg 76deg 110%');
        mv.setAttribute('disable-tap', '');

        mv.addEventListener('load', function () {
          p.classList.add('carregado');
          var c = $('.peca__carga', p); if (c) c.hidden = true;
          if (instrucao) instrucao.hidden = false;

          /* uma única apresentação curta, depois para */
          if (!semMovimento()) {
            mv.setAttribute('auto-rotate', '');
            mv.setAttribute('rotation-per-second', '26deg');
            setTimeout(function () { mv.removeAttribute('auto-rotate'); }, 2600);
          }
        });

        mv.addEventListener('error', function () {
          var c = $('.peca__carga', p); if (c) c.hidden = true;
          if (fallback) fallback.hidden = false;
        });

        p.appendChild(mv);
      });
    };

    document.head.appendChild(s);
  }

  if (botao) botao.addEventListener('click', montar);

  /* monta sozinho quando a vitrine chega perto — exceto em conexão econômica */
  var econ = navigator.connection &&
             (navigator.connection.saveData ||
              /2g/.test(navigator.connection.effectiveType || ''));

  if (!econ && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (ents, o) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        o.disconnect();
        montar();
      });
    }, { rootMargin: '260px 0px' }).observe(vitrine);
  }
})();


/* ------------------------------------------------------------
   8. ESCOLHA DO CANAL DE AGENDAMENTO
   ------------------------------------------------------------ */
(function () {
  var dlg = $('#agenda');
  if (!dlg || !dlg.showModal) return;

  var voltar = null;

  $$('[data-agendar]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      voltar = btn;
      dlg.showModal();
    });
  });

  dlg.addEventListener('close', function () {
    if (voltar && document.contains(voltar)) voltar.focus();
    voltar = null;
  });

  /* clique fora fecha */
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg) dlg.close();
  });

  /* ao escolher um canal, fecha o diálogo */
  $$('.agenda__opcao', dlg).forEach(function (a) {
    a.addEventListener('click', function () { setTimeout(function () { dlg.close(); }, 120); });
  });
})();


/* ------------------------------------------------------------
   9. AMPLIAÇÃO DE IMAGEM
   ------------------------------------------------------------ */
(function () {
  var dlg = $('#lupa');
  if (!dlg || !dlg.showModal) return;

  var img = $('[data-lupa-img]', dlg);
  var txt = $('[data-lupa-txt]', dlg);
  var voltar = null;

  $$('img[data-ampliar]').forEach(function (foto) {
    foto.style.cursor = 'zoom-in';
    foto.addEventListener('click', function (e) {
      if (foto.closest('[data-lam]') && foto.closest('[data-lam]').dataset.pos !== '0') return;
      e.preventDefault();
      voltar = foto;
      img.src = foto.currentSrc || foto.src;
      img.alt = foto.alt;
      txt.textContent = foto.alt;
      dlg.showModal();
    });
  });

  dlg.addEventListener('close', function () {
    img.removeAttribute('src');
    if (voltar && document.contains(voltar)) voltar.focus();
    voltar = null;
  });

  dlg.addEventListener('click', function (e) {
    if (e.target === dlg || e.target === img) dlg.close();
  });
})();


/* ------------------------------------------------------------
   10. ROLAGEM SUAVE (respeitando o movimento reduzido)
   ------------------------------------------------------------ */
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (!id || id === '#') return;
    var alvo = document.querySelector(id);
    if (!alvo) return;

    e.preventDefault();
    if (lenis) lenis.scrollTo(alvo, { duration: 1.5, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    else alvo.scrollIntoView({ behavior: semMovimento() ? 'auto' : 'smooth', block: 'start' });

    /* leva o foco junto, para o teclado */
    var tin = alvo.hasAttribute('tabindex');
    if (!tin) alvo.setAttribute('tabindex', '-1');
    alvo.focus({ preventScroll: true });
    if (!tin) alvo.addEventListener('blur', function lim() {
      alvo.removeAttribute('tabindex');
      alvo.removeEventListener('blur', lim);
    });

    if (history.replaceState) history.replaceState(null, '', id);
  });
})();

})();
