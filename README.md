# Barbearia do Carneiro

Site institucional da **Barbearia do Carneiro**, em Varginha (MG). Barbeiro Thales Rodrigues, desde 2016.

**Site no ar:** https://gabrielhanzod2x-sys.github.io/gabrielteste-sites/

## Seções

1. Apresentação, com as avaliações reais do Google
2. Conheça o Carneiro (Thales Rodrigues)
3. Cortes adultos e infantis, com a tabela de serviços
4. Prótese capilar
5. Produtos e vitrine 3D
6. Localização e contatos

## Rodar no computador

Precisa do [Node.js](https://nodejs.org).

- **Windows:** dois cliques em `ABRIR SITE.bat`.
- **Terminal:** `node servidor.js` e abrir http://localhost:4173

Use sempre o servidor. Se o `index.html` for aberto direto do arquivo, o navegador bloqueia o 3D.

## Estrutura

```
site/                  o site (é só isto que vai para o ar)
  index.html
  assets/css/          estilo.css
  assets/js/           site.js, Lenis, model-viewer e decodificador Draco (todos locais)
  assets/img/          imagens otimizadas (WebP)
  assets/video/        vídeo da prótese
  assets/models/       modelos 3D comprimidos (.glb)
servidor.js            servidor local de desenvolvimento
DOCUMENTACAO-PROJETO.md  memória técnica: decisões, histórico, pendências
```

HTML, CSS e JavaScript puros, sem etapa de build. A publicação no GitHub Pages é automática a cada push na branch `main` (`.github/workflows/publicar-site.yml`).
