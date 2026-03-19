import puppeteer from "puppeteer";
import { CONFIG } from "./build/server/config.js";
import { generateBrowserArgs } from "./build/utils/puppeteer-logic.js";

async function inspectAllButtons() {
  console.log("🔍 Iniciando escaneo total de botones...");
  
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

    console.log("⌨️ Activando el input...");
    const inputSelector = '[role="textbox"]';
    await page.waitForSelector(inputSelector, { timeout: 10000 });
    await page.click(inputSelector);
    await page.keyboard.type(" ");
    await new Promise(r => setTimeout(r, 2000));

    console.log("🔍 Escaneando TODOS los botones visibles...");
    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.innerText.trim(),
        ariaLabel: b.getAttribute('aria-label'),
        isVisible: b.offsetWidth > 0 && b.offsetHeight > 0,
        html: b.outerHTML.substring(0, 200)
      })).filter(b => b.isVisible);
    });
    
    console.log(`📊 Se encontraron ${buttons.length} botones visibles en total.`);
    
    // Filtramos por palabras clave que podrían indicar investigación profunda (Deep Research, Pro, Focus, etc)
    const keywords = ["pro", "deep", "research", "focus", "enfoque", "modelo", "model", "investigación", "deep research"];
    
    buttons.forEach((b, i) => {
      const match = keywords.some(k => 
        (b.text && b.text.toLowerCase().includes(k)) || 
        (b.ariaLabel && b.ariaLabel.toLowerCase().includes(k))
      );
      
      if (match || b.text === "" || b.ariaLabel === null) {
        console.log(`\n[${i + 1}] Texto: "${b.text}" | Aria: "${b.ariaLabel}"`);
        console.log(`    HTML: ${b.html}`);
      }
    });

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    console.log("\n👋 Cerrando en 15 segundos...");
    await new Promise(r => setTimeout(r, 15000));
    await browser.close();
  }
}

inspectAllButtons();
