import puppeteer from "puppeteer";
import { CONFIG } from "./build/server/config.js";
import { generateBrowserArgs } from "./build/utils/puppeteer-logic.js";

async function finalSurgicalScan() {
  console.log("🐸 Pepe está iniciando el escaneo quirúrgico final (JS puro)...");
  
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

    // 1. Buscar el input de archivos oculto
    console.log("📁 Buscando el input de carga de archivos...");
    const fileInputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input[type="file"]')).map(i => ({
        id: i.id,
        className: i.className,
        accept: i.getAttribute('accept'),
        html: i.outerHTML.substring(0, 200)
      }));
    });
    console.log(`📊 Se encontraron ${fileInputs.length} inputs de archivo.`);
    fileInputs.forEach(i => console.log(`   - HTML: ${i.html}`));

    // 2. Abrir el menú '+'
    const plusButtonSelector = 'button[aria-label="Add files or tools"]';
    console.log("🖱️ Abriendo menú '+'...");
    await page.click(plusButtonSelector);
    await new Promise(r => setTimeout(r, 1500));

    // 3. Click en 'Connectors and sources'
    console.log("🔗 Buscando 'Connectors and sources'...");
    const connectorsFound = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[role="menuitem"], button'));
      const target = items.find(el => el.innerText.includes("Connectors and sources"));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });

    if (connectorsFound) {
      console.log("✅ Click en 'Connectors and sources' realizado.");
      await new Promise(r => setTimeout(r, 2000));

      console.log("🔍 Escaneando opciones de Focus (Academic, Social, etc)...");
      const focusOptions = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('button, [role="checkbox"], [role="menuitem"], span'));
        return elements
          .map(el => ({
            text: el.innerText.trim(),
            role: el.getAttribute('role'),
            checked: el.getAttribute('aria-checked') || el.getAttribute('data-state'),
            html: el.outerHTML.substring(0, 150)
          }))
          .filter(item => 
            item.text.length > 0 && 
            (item.text.toLowerCase().includes("academic") || 
             item.text.toLowerCase().includes("social") || 
             item.text.toLowerCase().includes("web") ||
             item.text.toLowerCase().includes("academico") ||
             item.text.toLowerCase().includes("redes"))
          );
      });

      console.log("📋 Opciones de Focus detectadas:");
      focusOptions.forEach((opt, i) => {
        console.log(`   ${i + 1}. [${opt.text}] | Role: ${opt.role} | State: ${opt.checked}`);
        console.log(`      HTML: ${opt.html}`);
      });
    } else {
      console.log("❌ No se encontró 'Connectors and sources' en el menú.");
    }

  } catch (error) {
    console.error("❌ Error de Pepe:", error);
  } finally {
    console.log("\n👋 Pepe cerrará en 20 segundos...");
    await new Promise(r => setTimeout(r, 20000));
    await browser.close();
  }
}

finalSurgicalScan();
