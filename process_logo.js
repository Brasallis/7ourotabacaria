const Jimp = require('jimp');

async function processImage() {
  try {
    const image = await Jimp.read('public/Logo.png');
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // Se for fundo escuro (quase preto/azul escuro), força pra ser preto absoluto
      if (r < 50 && g < 50 && b < 60) {
        this.bitmap.data[idx + 0] = 0;
        this.bitmap.data[idx + 1] = 0;
        this.bitmap.data[idx + 2] = 0;
      } else {
        // Se não for o fundo, provavelmente é a letra/logo dourada
        // Vamos realçar o dourado aumentando saturação e brilho
        const newR = Math.min(255, r * 1.3);
        const newG = Math.min(255, g * 1.25);
        const newB = Math.min(255, b * 0.9);
        
        this.bitmap.data[idx + 0] = newR;
        this.bitmap.data[idx + 1] = newG;
        this.bitmap.data[idx + 2] = newB;
      }
    });

    await image.writeAsync('public/Logo.png');
    console.log("Logo processada com sucesso!");
  } catch (error) {
    console.error("Erro ao processar imagem:", error);
  }
}

processImage();
