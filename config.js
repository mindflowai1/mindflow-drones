/* Configure os canais e substitua os espaços de mídia por arquivos locais.
   WhatsApp: código do país + DDD + número, apenas dígitos. Ex.: 5531...
   Imagens: "assets/imoveis.webp". Vídeos: "assets/filme.mp4".
   Campos vazios mantêm os placeholders e não simulam um envio. */
window.AEROVISION = {
  whatsapp: "5531999766846",
  media: { hero: "", services: "", property: "assets/servico-imoveis.png", launch: "assets/servico-lancamentos.png", construction: "assets/servico-obras.png", delivery: "assets/servico-entregas.png", portfolio: "", about: "", portrait: "assets/aerovision-piloto-v1.png", contact: "" },
  heroVideo: "drone.mp4",
  films: [
    { category: "IMOBILIÁRIO", title: "Cada imóvel, uma perspectiva.", poster: "assets/imobiliario-preview.jpg", video: "imobiliario.mp4" }
  ]
};
