# Aerovision

Landing page estática em HTML, CSS e JavaScript puros. Sem instalação ou build.

## Visualizar

Abra `index.html` no navegador ou execute `python -m http.server 4173 --bind 127.0.0.1` nesta pasta e acesse `http://127.0.0.1:4173`.

## Conteúdo e contato

Edite `config.js` para adicionar o WhatsApp comercial com país e DDD (somente dígitos), os caminhos de imagens e o vídeo completo do portfólio. As mídias permanecem opcionais e usam placeholders enquanto os campos estiverem vazios. Não há métricas ou depoimentos fictícios.

Sem número configurado, o formulário prepara um resumo copiável e informa que nada foi enviado. Com o número configurado, abre o WhatsApp com a mensagem para o visitante revisar e enviar. Não existe backend, envio automático ou armazenamento de dados.

## Mídias

Crie uma pasta `assets` com suas imagens WebP/AVIF/JPG e vídeos MP4. Use caminhos como `assets/hero.webp` em `media.hero`, `assets/hero.mp4` em `heroVideo` e `assets/imovel.mp4` em `films[0].video`. Os vídeos do portfólio devem ser arquivos de vídeo, não links de páginas do YouTube.

- Hero e fundos: imagens horizontais, idealmente 1920 × 1080. Deixe a área principal da cena à direita para preservar a leitura do título.
- Cards: imagens horizontais, aproximadamente 800 × 500.
- Retrato/bastidores: imagem vertical com o assunto à direita.
- Portfólio: posters 16:9 e vídeos com compressão para web.
- O vídeo de fundo é silencioso e pausa fora da tela; não inicia com movimento reduzido ativado.

## Responsividade

Seções com altura da viewport, navegação fixa e conteúdo adaptado por largura e altura. Serviços deslizam horizontalmente no celular; o contato usa duas etapas sem perder os dados ao voltar. Alturas mínimas de segurança preservam leitura em telas muito baixas, orientação paisagem ou zoom, permitindo rolagem vertical da página nesses casos.

Os dados reais de contato e as mídias devem ser configurados antes de divulgar o site. A hospedagem pode servir estes arquivos diretamente; nenhum framework é necessário.

## Portfólio por rolagem

`portfolio.js` usa os 50 JPGs originais de `ezgif-6f0d38f3732351ee-jpg`, em ordem numérica. Preserve essa pasta na publicação. O canvas carrega até três imagens simultâneas e conserva até 16 frames decodificados. A seção fica fixa durante 300svh de percurso no desktop e 270svh no celular. O MP4 abre pelo botão Assistir ao filme. Movimento reduzido exibe capa e acesso direto ao filme, sem fixação prolongada.

A galeria mantém a imagem em 16:9, sem zoom ou texto sobreposto. Título e capítulos ficam na coluna lateral no desktop e acima do filme no celular. Use o servidor HTTP local para a sequência, pois o carregamento por fetch não funciona ao abrir o HTML diretamente via file://.
