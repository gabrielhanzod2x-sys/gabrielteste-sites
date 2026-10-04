# BARBEARIA DO CARNEIRO — memória técnica e visual do site

Documento vivo. **Não apague o histórico**: quando uma decisão for substituída,
registre a nova e mantenha a anterior marcada como superada.

| | |
|---|---|
| Criado em | 03/10/2026 |
| Última alteração | 03/10/2026 — construção inicial |
| Fonte visual oficial | `desgner final/` |
| Apoio visual | `referencias/` |
| Dados comerciais | `desgner final/informacoes-site-barbearia-do-carneiro.txt` |

---

## 1. COMO RODAR

O site é estático: HTML + CSS + JS, sem build, sem dependências de runtime externas.

```bash
node servidor.js
```

Abre em `http://localhost:4173`. Um servidor local é **necessário** (não abra o
`index.html` por `file://`): o visualizador 3D carrega módulos ES e WebAssembly,
que o protocolo de arquivo bloqueia.

Para publicar, suba **apenas a pasta `site/`** em qualquer hospedagem estática.
`servidor.js` e `.claude/launch.json` são ferramentas de desenvolvimento.

---

## 2. ESTRUTURA DE PASTAS

```
Barbearia do Carneiro/
├── claud ordens/            ordens e regras do projeto (não tocar)
├── desgner final/           ORIGINAIS — fonte visual oficial (não tocar)
├── referencias/             direção visual de apoio (não tocar)
├── servidor.js              servidor estático de desenvolvimento
├── .claude/launch.json      atalho de preview
└── site/                    ←  O SITE (é só isto que vai para o ar)
    ├── index.html
    ├── DOCUMENTACAO-PROJETO.md   (este arquivo)
    └── assets/
        ├── css/estilo.css
        ├── js/site.js
        ├── js/model-viewer.min.js    biblioteca 3D, servida localmente
        ├── js/draco/                 decodificador Draco local
        ├── img/
        ├── video/
        └── models/
```

> **Nenhum arquivo original foi renomeado, movido ou alterado.** Tudo em `site/assets/`
> é derivado, gerado a partir dos originais. Para regerar, veja a seção 9.

---

## 3. IDENTIDADE

### Tipografia

| Papel | Família | Por quê |
|---|---|---|
| Títulos gigantes | **Ultra** | Slab serif pesado de madeira tipográfica americana. É o que mais se aproxima do lettering das artes (`CORTES ADULTOS`, `PRÓTESE CAPILAR`, `PRODUTOS`). |
| Todo o resto | **Lora** | Serifada quente e muito legível. As artes usam texto serifado — por isso **não** foi usada sans-serif no corpo. |

Carregadas do Google Fonts com `display=swap` e `preconnect`.

### Cores (fichas em `:root`)

| Ficha | Valor | Uso |
|---|---|---|
| `--preto` | `#0a0806` | fundo da página |
| `--tijolo` / `--tijolo-claro` | `#3a1d12` / `#5a2d19` | textura arquitetônica |
| `--ambar` | `#f59621` | cor de ação, estado ativo, molduras |
| `--ambar-claro` / `--ambar-fundo` | `#ffb84d` / `#c9700f` | degradê dos botões cheios |
| `--cobre` / `--ouro` | `#b2702f` / `#8c6a3c` | acabamentos, sobretítulos |
| `--creme` / `--creme-2` / `--creme-3` | `#f6efe3` / `#e4d8c6` / `#b9a994` | texto em três níveis |

### Desgaste das letras

`.gasto` aplica uma máscara de ruído (`img/grunge.webp`, 400 px, escala 760 px)
que corrói as letras no máximo até 75 % de opacidade. É o “pintado na parede e
envelhecido” das artes. **Se aumentar o contraste dessa textura o título vira mofo** —
foi esse exatamente o erro na primeira versão. A textura certa tem média de
luminância ≈ 239 e menos de 3 % da área abaixo de 215.

---

## 4. SEÇÕES — composição e origem de cada peça

### Barra lateral esquerda (`.trilho`)

Fixa, 76 px, só ícones — exatamente como nas artes. Ordem tirada das artes
(não da ordem das seções na página):

`Início · Cortes · Prótese · Produtos · Agendar · O Carneiro · Avaliações · Localização · Instagram`

* Estado ativo: quadrado âmbar + traço na borda esquerda, decidido por **scrollspy**.
* No hover/foco cada ícone revela uma etiqueta à direita (`::after` com `data-rotulo`).
  As artes não mostram etiqueta porque são estáticas; ela existe só no hover/foco e
  é obrigatória para acessibilidade.
* No celular vira painel lateral: as mesmas etiquetas viram texto de verdade ao lado
  do ícone, abertas pelo gatilho fixo com o símbolo do Carneiro.

### 1 · Apresentação inicial (`.hero`)

| Peça | Origem |
|---|---|
| Cena de fundo (parede, cadeira, espelho, lâmpadas) | `img/hero-cena.webp` — recorte limpo da arte `01 - Apresentação inicial/Imagem do ChatGPT…16_13_34.png` (região x 782–1672, y 0–697, sem texto nem interface) |
| Parede à esquerda | `img/tijolo.webp` ← `01 - Apresentação inicial/FUNDO.jpeg` |
| Brasão | `img/logo-carneiro.webp` ← `01 - Apresentação inicial/logo.png` |
| Avaliações | os **cinco** cards reais `01`–`05 - avaliação … premium.png` |

* O CTA é **“AGENDAR PELO WHATSAPP”** e vai direto para o WhatsApp — é o rótulo
  da arte aprovada. Os demais CTAs, que não nomeiam canal, abrem a escolha
  (ver seção 5). Ver pendência **P-1**.
* A prova social é `5,0 ★ · 47 avaliações`.
* Nenhum depoimento foi inventado. **“Mariana Costa”, que aparece no esboço do
  hero, não existe e não entrou no site.**

### 2 · O Carneiro (`.carneiro`)

Foto real de Thales sangrando pela esquerda (46 % da largura), texto à direita.
O certificado que ele segura aparece também recortado no painel de credencial
(`img/certificado.webp`, recorte da mesma foto). Texto em primeira pessoa,
conforme aprovado, fechando com *“Aqui, cliente não é só cliente. É amigo.”*

Credencial: **MELHOR DO ANO · ATENDIMENTO E QUALIDADE · 2022**. Nenhum outro prêmio.

### 3 · Cortes (`.cortes`) — alternador ADULTOS / INFANTIL

As artes trazem um alternador em pílula no topo, e é assim que foi feito:
dois painéis (`#painel-adultos`, `#painel-infantil`) que **nunca aparecem juntos**
(`hidden` de verdade, não só escondido visualmente).

> Isso atende as duas exigências ao mesmo tempo: adulto e infantil ficam
> completamente separados, e nenhuma tela mistura fotos de criança e de adulto.
> O rodapé da área adulta termina limpo — a troca fica no topo, não embaixo.

* **Adultos**: carrossel com as 5 fotos reais + painel escuro com os **14 serviços**
  e os CTAs `VER CATÁLOGO COMPLETO` / `ESCOLHER MEU CORTE`.
  As artes mostram 7 linhas de preço; a tabela completa foi mantida porque é a
  informação comercial oficial — o painel rola e tem desvanecimento nas bordas.
* **Antes e depois**: bloco editorial separado, abaixo do carrossel adulto, com
  `02 - antes premium.png` e `01 - depois premium.png` na ordem correta.
  Não está desenhado nas artes, mas os arquivos existem na pasta e são exigidos.
* **Infantil**: carrossel com as 3 artes reais + painel com ursinho,
  *“UM CORTE FEITO PARA CADA ESTILO.”* e os CTAs `VER CATÁLOGO COMPLETO` /
  `AGENDAR HORÁRIO`. **Nenhum preço infantil foi inventado.**

> ⚠ **Decisão importante:** as fotos infantis **não são fotos soltas** — são artes
> compostas que já trazem moldura dourada própria. Por isso o carrossel infantil
> usa `.palco--alto`, que não desenha uma segunda moldura em volta: só o realce
> âmbar da lâmina em foco. Emoldurar de novo cria moldura dentro de moldura.
> As fotos **adultas**, essas sim, são fotos simples e levam a moldura âmbar.

### 4 · Prótese capilar (`.protese`)

Vídeo real 9:16 à esquerda em moldura âmbar com `ASSISTA`, texto à direita.
Terminologia: **PRÓTESE CAPILAR** e **SOLUÇÕES PARA CALVÍCIE**.
Em nenhum lugar se fala em implante ou procedimento cirúrgico.

Comportamento do vídeo:
`preload="none"` → pré-carrega a 400 px da área visível → toca mudo em laço ao
entrar em foco → pausa ao sair e quando a aba fica oculta → botão de som visível.
Com `prefers-reduced-motion` não inicia sozinho.

### 5 · Produtos (`.produtos`)

As **três fotos oficiais**: pomadas no quadro grande, prateleira e linha de barba
nos dois quadros menores. Texto à direita, fechando com
*“MAIS QUE CUIDADO. UMA EXPERIÊNCIA.”*

**Vitrine 3D** (`.vitrine`) — exigida pelas ordens, não desenhada nas artes:
palco escuro único, bancada de madeira, os dois `.glb` reais em plintos.
Carrega sozinha quando chega perto (ou no botão `EXPLORAR EM 3D`), nunca no
carregamento inicial. Gira sozinha só uma vez, por 2,6 s, e para.
Sem WebGL ou em conexão econômica, mostra as fotos reais e avisa discretamente.

### 6 · Localização (`.local`)

Fachada real à esquerda em moldura âmbar com a faixa `VENHA NOS VISITAR`.
À direita: endereço, horários, telefone, os três atalhos (Instagram / WhatsApp /
AppBarber) e o mapa do Google realmente incorporado, com a faixa
`ABRIR NO GOOGLE MAPS`.

Os horários seguem o formato compacto das artes, com uma terceira linha para
segunda e domingo, que a arte não mostrava.

### Rodapé

Assinatura curta: brasão, “Desde 2016 · Varginha — MG”, links essenciais e uma
linha de contato. Não é um rodapé de colunas.

---

## 5. FLUXO DE AGENDAMENTO

| Canal | Destino |
|---|---|
| WhatsApp | `https://wa.me/5535988989336` |
| On-line | `https://sites.appbarber.com.br/barbeariadocarn-qkom` |

Todo botão com `data-agendar` abre o diálogo `#agenda` (elemento `<dialog>` nativo:
Esc fecha, foco fica preso dentro, volta para o botão de origem ao fechar).

**Exceção, por fidelidade às artes:** o CTA do hero diz “AGENDAR PELO WHATSAPP”
e os três atalhos da seção de localização nomeiam o canal — esses vão direto,
porque abrir uma escolha depois de já ter escolhido confundiria. Ver **P-1**.

---

## 6. MOVIMENTO

Uma curva só em todo o site: `--curva: cubic-bezier(.22,.61,.28,1)`,
em três tempos: `--rapido .26s` · `--medio .52s` · `--lento .9s`.

| Onde | O quê |
|---|---|
| Entrada de blocos | `[data-ar]` sobe 16 px e aparece, em cascata de 60 ms |
| Carrosséis | lâmina central em foco, vizinhas em perspectiva; avanço automático só nas avaliações (7 s), pausando no hover, no foco, fora da tela e com a aba oculta |
| Botões | elevação de 1–2 px e reforço da luz âmbar |
| Fotos | zoom de 3,5 % no hover, só na lâmina em foco |
| Vídeo | reage à visibilidade da seção |
| 3D | responde só à interação; a apresentação inicial para em 2,6 s |

`prefers-reduced-motion` desliga **tudo**: entradas, rolagem suave, avanço
automático e o início do vídeo. Testado.

---

## 7. ACESSIBILIDADE

* Toda a navegação por teclado, com foco sempre visível (`:focus-visible`, contorno âmbar).
* Nas lâminas fora de foco, links e imagens saem da ordem de tabulação.
* Carrosséis: setas do teclado, botões com rótulo, pontos como `role="tablist"`.
* Alternador adultos/infantil: `role="tab"` / `role="tabpanel"`, setas do teclado.
* Scrollspy marca `aria-current` no item ativo.
* Todas as imagens têm `alt` descritivo; as avaliações trazem o texto da avaliação
  no `alt`, para quem usa leitor de tela.
* Os atalhos nunca dependem só de ícone: todos têm rótulo visível.
* Link “Ir para o conteúdo” antes de tudo.

---

## 8. DESEMPENHO

Medido com o site servido localmente, 1600 × 1000:

| | |
|---|---|
| Primeiro carregamento, sem rolar | **~1,0 MB** em 19 arquivos |
| CLS do hero | **0,000** |
| 3D e vídeo no carregamento inicial | **nenhum** |

* Toda mídia abaixo da dobra é `loading="lazy"` / `preload="none"`.
* Todo `<img>` e `<video>` tem `width`/`height`, e os quadros têm `aspect-ratio` —
  por isso o layout não salta.
* Os dois modelos 3D saíram de **65,4 MB e 62,5 MB** para **1,35 MB e 1,19 MB**
  (simplificação de malha + Draco + texturas WebP 1024). O decodificador Draco
  (345 KB) está servido localmente — o site não depende de CDN em tempo de execução.
* O brasão é servido como **máscara de luminância** (56 KB) em vez de PNG com
  canal alfa (361 KB). Navegador sem `mask-mode` cai no WebP com alfa.

---

## 9. COMO OS DERIVADOS FORAM GERADOS

Todos com `ffmpeg`, a partir dos originais, que **continuam intactos**.

```bash
# fotos  (exemplo)
ffmpeg -i "<original>" -vf "scale=920:-2:flags=lanczos" -quality 84 saida.webp

# brasão → máscara de luminância (o desenho é branco puro)
ffmpeg -i "desgner final/01 - Apresentação inicial/logo.png" \
       -vf "format=gray,scale=720:-1:flags=lanczos" -quality 90 logo-carneiro.webp

# brasão → reserva com canal alfa
ffmpeg -i logo.png -vf "format=rgba,geq=r=255:g=255:b=255:a='max(max(r(X,Y),g(X,Y)),b(X,Y))',\
       scale=720:-1:flags=lanczos" -quality 85 logo-carneiro-alfa.webp

# selo do Carneiro isolado (apaga o texto em arco e a tarja de data)
#   recorte 504×438 em (198,151) sobre o brasão de 900 px

# fotos de produto: tira as faixas desfocadas do enquadramento original
ffmpeg -i pomadas.jpg -vf "crop=1080:775:0:165,scale=1040:-2" -quality 84 produto-pomadas.webp

# vídeo da prótese
ffmpeg -t 12.45 -i "<original.mp4>" -vf "crop=578:1020:71:50,scale=558:-2:flags=lanczos" \
       -c:v libx264 -crf 27 -preset slow -movflags +faststart -c:a aac -b:a 72k protese.mp4

# modelos 3D
npx @gltf-transform/cli optimize "<original.glb>" saida.glb \
    --compress draco --simplify true --simplify-error 0.004 \
    --texture-compress webp --texture-size 1024
```

> **Sobre o vídeo:** o original tem 22 s e vem com tarja preta em volta
> (conteúdo real em x 71–648, y 50–1068 de um quadro 720×1280). O recorte tira a
> tarja — sem ele sobra moldura preta dentro da moldura âmbar. O corte em 12,45 s
> termina onde acaba o trecho da prótese; o que vem depois é um encarte de
> localização, que já é a seção 6. **O arquivo original não foi tocado.**

---

## 10. DECISÕES QUE NÃO DEVEM SER DESFEITAS SEM MOTIVO

1. **Barra lateral só com ícones**, na ordem das artes. Etiqueta só no hover/foco.
2. **Alternador adultos/infantil** com painéis mutuamente exclusivos.
3. **Carrossel infantil sem moldura externa** — as artes já têm moldura própria.
4. **Carrossel adulto com moldura âmbar** — são fotos simples.
5. **Apenas os cinco cards reais de avaliação.** Nada de depoimento inventado.
6. **Nenhum preço infantil.**
7. **“Prótese capilar” / “soluções para calvície”** — nunca “implante”.
8. **A marca do Carneiro é a assinatura das avaliações**, não o “G” do Google.
   O Google aparece só como fonte, em letra pequena.
9. **3D e vídeo nunca no carregamento inicial.**
10. **Textura de desgaste suave.** Ver seção 3.
11. **Originais preservados.** Todo derivado é regerável pela seção 9.

---

## 11. PENDÊNCIAS — CONFIRMAR COM O THALES ANTES DE PUBLICAR

| # | Item | Situação |
|---|---|---|
| **P-1** | O CTA do hero vai direto para o WhatsApp (rótulo da arte) em vez de abrir a escolha de canal. Confirmar se é isso mesmo ou se deve abrir a escolha como os demais. | **decisão do cliente** |
| P-2 | Nota 5,0 e 47 avaliações | pode ter mudado |
| P-3 | Os 14 preços e as durações | podem ter mudado |
| P-4 | Horários de atendimento | confirmar |
| P-5 | Instagram `@barbeariadocarneiro` | veio do esboço da seção 6, confirmar |
| P-6 | AppBarber ainda é a plataforma de agendamento | confirmar |
| P-7 | Preços dos cortes infantis | não existem no site, aguardando |
| P-8 | Wi-Fi, estacionamento e acessibilidade | constam no AppBarber, **ainda não entraram no site** |
| P-9 | Formas de pagamento, banheiro, atendimento infantil | hoje **não aparecem**; se confirmados, entram num bloco discreto na seção 6 |

---

## 12. HISTÓRICO

### 03/10/2026 — construção inicial

**O que foi feito.** Site completo das seis seções, a partir das artes de
`desgner final/`: barra lateral fixa com scrollspy, hero com carrossel das
avaliações reais, seção do Thales, cortes com alternador adultos/infantil,
antes e depois, prótese com vídeo, produtos com vitrine 3D, localização com mapa
incorporado, rodapé-assinatura, diálogo de agendamento e ampliação de imagem.

**Por quê.** Transformar a direção de arte já aprovada em um site funcional,
responsivo e rápido, sem inventar layout novo.

**Como.** HTML + CSS + JS puros, sem build e sem dependência de CDN em execução.
Todas as imagens, o vídeo e os modelos 3D foram derivados dos originais com
`ffmpeg` e `gltf-transform` (seção 9).

**Correções feitas durante a construção** — todas valem como aprendizado:

* Textura de desgaste estava agressiva demais e os títulos pareciam mofados;
  a faixa de luminância foi comprimida para 182–255.
* O vídeo da prótese tinha tarja preta dentro da moldura âmbar: resolvido com
  recorte do retângulo de conteúdo real.
* O carrossel infantil emoldurava artes que já tinham moldura.
* `model-viewer` não traz o decodificador meshopt — os modelos foram
  recompactados em Draco, com o decodificador servido localmente.
* O scrollspy classificava por proporção da seção, o que fazia seções altas
  perderem para as baixas; passou a classificar por **área visível**.
* `[hidden]` não vencia o `display` explícito dos botões; regra global corrigida.
* `PRODUTOS` e `BARBEARIA DO CARNEIRO` estouravam a coluna; os títulos passaram
  a ter teto em unidades de contêiner (`cqw`).

**O que preservar.** Seção 10.

### 03/10/2026 — ajustes pedidos pelo cliente (noite)

**Barra lateral nova** — refeita pela arte `06 - LOCALIZAÇÃO/…18_59_08.png`: mascote do barbeiro no topo
(`img/mascote-barbeiro.webp`, recortado da arte), ícones de traço novos, Instagram separado por um traço,
borda direita em âmbar luminoso, etiqueta em pílula com seta.
**Recolhe sozinha** depois de 2,4 s sem navegação e volta ao rolar a página, ao levar o mouse à margem
esquerda ou ao usar o teclado; recolhida, sobra só o fio âmbar na borda. Agora fica *sobre* o conteúdo
(`--trilho-l: 0`). No celular continua sendo gaveta aberta pelo gatilho.
Atenção: o mascote usa `mix-blend-mode: screen` para sumir com o fundo preto — **não** pôr `filter` nele,
senão o quadrado preto reaparece.

**Hero** — bloco do logo deslocado para o meio (`margin-left: clamp(0, 7vw, 170px)`) e ampliado
(logo até 400 px, frase até 2,85 rem). Saiu da regra de telas acima de 1800 px, que o centralizava inteiro.

**Prêmio (seção do Thales)** — removidos os dois “•” do texto; certificado trocado pela imagem
`06 - LOCALIZAÇÃO/…18_59_40.png`; quebras de linha do texto iguais às da arte.

### 03/10/2026 — fluidez, celular e publicação

**Movimento:** rolagem com inércia (Lenis, local em `assets/js/lenis.min.js`, desligada com movimento
reduzido; no toque fica o rolar nativo). Revelação dos blocos em cascata, com leve desfoque no desktop;
só o estado *oculto* tem regra CSS, para não anular o hover dos elementos revelados. Fotos sob demanda
entram com fade. Carrossel acompanha o arraste com resistência e volta com mola.

**Barra lateral:** só reaparece quando o mouse encosta na borda esquerda (ou pelo teclado). Rolar a
página não traz a barra de volta. Topo da barra: logo da barbearia (no lugar do mascote).

**Hero (desktop):** logo, frase e botões totalmente centralizados; logo até 600 px; cena da barbearia
cobre o hero inteiro (sem emenda). Botões com 28 px de espaço.

**Avaliação longa:** sem barra de rolagem; o texto desce sozinho devagar no cartão do meio e volta
(animação CSS, distância medida pelo JS em `--desce`). Pausa com o mouse em cima.

**Celular (auditado em 390 e 360 px):** `html,body{overflow-x:clip}` (no iPhone o hidden só no body
ainda deixava arrastar a tela para o lado); carrosséis recortados; nenhum texto abaixo de ~11,5 px;
pontinhos dos carrosséis com 32 px de área de toque; botões e links com 44 px de altura.

**Peso:** os PNGs `trofeu-premio-sem-fundo` (1,2 MB), `whatsapp-sem-fundo` e
`barbeiro-appbarber-sem-fundo` viraram WebP (50 KB no total). Os PNGs foram para `ativos-originais/`,
que fica fora do site e do repositório.

**Publicação:** repositório `gabrielhanzod2x-sys/gabrielteste-sites`, GitHub Pages pela Action
`.github/workflows/publicar-site.yml`, que publica só a pasta `site/`. Os originais
(`desgner final/`, `referencias/`, `claud ordens/`) ficam fora do repositório (`.gitignore`).
Esta documentação saiu de `site/` para a raiz, para não ficar pública no endereço do site.

### 04/10/2026 — seção do Thales: apresentação e fala entre aspas

**O que mudou:** acima do texto do Thales entrou um texto de apresentação em terceira pessoa (barbeiro
desde 2016; começou jovem; incertezas e dúvidas ao abrir o negócio; esforço e ajuda de Deus; 10 anos de
certificados, cursos e aperfeiçoamentos; referência em corte e qualidade em Varginha). O texto que já
existia ficou **intacto, entre aspas**, com a assinatura “— Thales Rodrigues”, porque é fala dele.
**Por quê:** pedido do cliente. **Como:** blocos `.apresenta` e `.prosa--fala` em `index.html`/`estilo.css`.
**Preservar:** nenhuma frase da fala do Thales foi alterada; a apresentação usa só o que o cliente contou
(sem números de cursos ou certificados inventados). O texto do prêmio ficou com linhas travadas no desktop.
