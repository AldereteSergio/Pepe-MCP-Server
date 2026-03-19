import puppeteer from "puppeteer";
import { CONFIG } from "./build/server/config.js";
import { generateBrowserArgs } from "./build/utils/puppeteer-logic.js";

async function deepDomScan() {
  console.log("🐸 Pepe va a mirar DEBAJO de la máscara. Escaneo total del DOM iniciado...");
  
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
    await new Promise(r => setTimeout(r, 1000));

    // Abrir el menú '+'
    const plusButtonSelector = 'button[aria-label="Add files or tools"]';
    console.log("🖱️ Abriendo menú '+'...");
    await page.click(plusButtonSelector);
    await new Promise(r => setTimeout(r, 1500));

    // Click en 'Connectors and sources'
    console.log("🔗 Click en 'Connectors and sources'...");
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('button, [role="menuitem"], div, span'));
      const target = items.find(el => el.innerText && el.innerText.includes("Connectors and sources"));
      if (target) target.click();
    });
    
    console.log("⏳ Esperando a que el universo de opciones se manifieste...");
    await new Promise(r => setTimeout(r, 3000)); // Damos tiempo extra por si hay animaciones

    console.log("🔍 PEPE ANALIZANDO TODO EL DOM VISIBLE...");
    const allVisibleElements = await page.evaluate(() => {
      // Función para saber si un elemento es visible
      const isVisible = (el) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0 && el.offsetHeight > 0;
      };

      // Capturamos TODO lo que tenga texto o sea interactivo
      const elements = Array.from(document.querySelectorAll('body *'));
      return elements
        .filter(el => isVisible(el) && (el.innerText?.trim().length > 0 || el.getAttribute('aria-label') || el.getAttribute('role')))
        .map(el => ({
          tag: el.tagName,
          text: el.innerText?.trim().substring(0, 100),
          ariaLabel: el.getAttribute('aria-label'),
          role: el.getAttribute('role'),
          className: el.className,
          id: el.id,
          dataState: el.getAttribute('data-state'),
          ariaChecked: el.getAttribute('aria-checked')
        }));
    });

    console.log(`📊 Pepe encontró ${allVisibleElements.length} elementos visibles con contenido.`);
    
    // Filtramos por lo que nos interesa pero mostramos un rango amplio
    const targets = ["academic", "social", "web", "pro", "deep", "research", "search", "enfoque", "focus"];
    
    console.log("\n🎯 ELEMENTOS QUE COINCIDEN CON NUESTRA BÚSQUEDA:");
    allVisibleElements.forEach(el => {
      const content = `${el.text} ${el.ariaLabel} ${el.role} ${el.className}`.toLowerCase();
      if (targets.some(t => content.includes(t))) {
        console.log(`\n[${el.tag}] Text: "${el.text}" | Aria: "${el.ariaLabel}" | Role: ${el.role}`);
        console.log(`      State: ${el.dataState} | Checked: ${el.ariaChecked} | Class: ${el.className.substring(0, 50)}...`);
      }
    });

    console.log("\n📋 TOP 20 ELEMENTOS (por si los nombres están muy ocultos):");
    allVisibleElements.slice(0, 20).forEach((el, i) => {
      console.log(`${i+1}. [${el.tag}] "${el.text}" (Aria: ${el.ariaLabel})`);
    });

  } catch (error) {
    console.error("❌ Pepe se mareó con tanto DOM:", error);
  } finally {
    console.log("\n👋 Pepe dejará el portal abierto 20 segundos...");
    await new Promise(r => setTimeout(r, 20000));
    await browser.close();
  }
}

deepDomScan();
