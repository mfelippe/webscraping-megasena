const pupperteer = require("puppeteer");
const fs = require("node:fs");

// quantidade de sorteios a ser buscados
var sorteios = 100;

(async () => {
  console.log("=========== Iniciando aplicação ===================");

  const browser = await pupperteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  // abertura da pagina da caixa
  await page.goto("https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx", {
    waitUntil: "networkidle2",
  });

  // espera o carregamento da página
  await page.waitForSelector(".related-box");
  var numerosSorteados = [];

  // seletor do botão de anterior
  const anterior = "ul.clearfix> li>a";

  // lopp para saber quantos resultados buscar
  for (let index = 0; index < sorteios; index++) {
    // seleciona a lista de números de cada sorteio
    const result = await page.evaluate(() => {
      const dezenas = Array.from(
        document.querySelector("ul#ulDezenas").querySelectorAll("li.ng-binding")
      ).map((el) => Number(el.innerHTML));

      return dezenas;
    });

    // clica para o sorteio anterior
    await page.click(anterior);

    // aguarda os resultados os nº serem renderizados
    await page.waitForSelector("li.ng-binding");

    // salva os números encontrados
    numerosSorteados.push(result);
  }

  console.log(`foram encontrados ${numerosSorteados.length} resultados ✔`);

  // salvando os dados encontrados em um arquivo csv

  const csvString = [
    ["Nº 1", "Nº 2", "Nº 3", "Nº 4", "Nº 5", "Nº 6"],
    ...numerosSorteados,
  ]
    .map((e) => e.join(","))
    .join("\r\n");

  fs.writeFile("sorteios.csv", csvString, (err) => {
    if (err) console.error(err);
    else console.log("Ok");
  });

  console.log("=========== Finalizando aplicação ===================");

  // fecha a aplicação
  await browser.close();
})();
