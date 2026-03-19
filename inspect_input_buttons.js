import puppeteer from "puppeteer";
import { CONFIG } from "./build/server/config.js";
import { generateBrowserArgs } from "./build/utils/puppeteer-logic.js";

async function inspectInputButtons() {
  console.log("🔍 Iniciando inspección de botones del área de texto...");
  
  const browser = await puppeteer.launch({
    headless: false,
    args: generateBrowserArgs(CONFIG.USER_AGENT),
    userDataDir: CONFIG.BROWSER_DATA_DIR
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  try {
    console.log("📍 Navegando a Perplexity...");
    await page.goto("https://www.perplexity.ai", { waitUntil: "networkidle2" });

    console.log("⌨️ Enfocando el input de búsqueda para activar la UI...");
    const inputSelector = '[role="textbox"]';
    await page.waitForSelector(inputSelector, { timeout: 10000 });
    await page.click(inputSelector);
    await page.keyboard.type(" "); // Un espacio para activar botones
    await new Promise(r => setTimeout(r, 1000));

    console.log("🔍 Escaneando botones en el área del input...");
    const buttons = await page.evaluate(() => {
      // Buscamos el contenedor que envuelve al textbox y sus botones hermanos
      const input = document.querySelector('[role="textbox"]');
      if (!input) return [];
      
      // Subimos un par de niveles para capturar el toolbar del input
      const container = input.closest('div').parentElement;
      
      return Array.from(container.querySelectorAll('button')).map(b => ({
        text: b.innerText.trim(),
        ariaLabel: b.getAttribute('aria-label'),
        className: b.className,
        isVisible: b.offsetWidth > 0 && b.offsetHeight > 0,
        html: b.outerHTML.substring(0, 300)
      }));
    });
    
    console.log(`📊 Se encontraron ${buttons.length} botones cerca del input:`);
    buttons.forEach((b, i) => {
      console.log(`\n--- Botón ${i + 1} ---`);
      console.log(`Texto: "${b.text}"`);
      console.log(`Aria-Label: "${b.ariaLabel}"`);
      console.log(`Visible: ${b.isVisible}`);
      console.log(`HTML: ${b.html}`);
    });

  } catch (error) {
    console.error("❌ Error durante la inspección:", error);
  } finally {
    console.log("\n👋 Mantendré el navegador abierto 15 segundos más...");
    await new Promise(r => setTimeout(r, 15000));
    await browser.close();
    console.log("🔒 Navegador cerrado.");
  }
}

inspectInputButtons();
