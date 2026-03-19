import puppeteer from "puppeteer";
import { CONFIG } from "./build/server/config.js";
import { generateBrowserArgs } from "./build/utils/puppeteer-logic.js";

async function inspectPlusButton() {
  console.log("🔍 Pepe está investigando el botón '+' (Add files or tools)...");
  
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

    const plusButtonSelector = 'button[aria-label="Add files or tools"]';
    console.log(`🖱️ Haciendo click en el botón '+' (${plusButtonSelector})...`);
    
    await page.waitForSelector(plusButtonSelector, { timeout: 5000 });
    await page.click(plusButtonSelector);
    
    console.log("⏳ Esperando a que se despliegue el contenido...");
    await new Promise(r => setTimeout(r, 2000));

    console.log("🔍 Escaneando el contenido del menú desplegado...");
    const menuItems = await page.evaluate(() => {
      // Buscamos elementos que suelen aparecer en popovers o menús de Radix/Headless UI
      const items = Array.from(document.querySelectorAll('[role="menuitem"], [role="option"], button, [class*="menu"], [class*="popover"]'));
      
      return items
        .map(el => ({
          text: el.innerText.trim(),
          ariaLabel: el.getAttribute('aria-label'),
          role: el.getAttribute('role'),
          tagName: el.tagName,
          isVisible: el.offsetWidth > 0 && el.offsetHeight > 0
        }))
        .filter(item => item.isVisible && item.text.length > 0);
    });
    
    if (menuItems.length > 0) {
      console.log(`📊 Se encontraron ${menuItems.length} elementos en el menú:`);
      // Eliminar duplicados por texto
      const uniqueItems = [...new Map(menuItems.map(m => [m.text, m])).values()];
      uniqueItems.forEach((m, i) => {
        console.log(`   ${i + 1}. [${m.text}] | Aria: "${m.ariaLabel}" | Role: ${m.role}`);
      });
    } else {
      console.log("⚠️ No se detectaron elementos interactivos en el menú.");
      console.log("📸 Tomando captura para ver qué pasó...");
      await page.screenshot({ path: "debug_plus_menu.png" });
    }

  } catch (error) {
    console.error("❌ Pepe tuvo un problema:", error);
  } finally {
    console.log("\n👋 Pepe cerrará el navegador en 15 segundos...");
    await new Promise(r => setTimeout(r, 15000));
    await browser.close();
  }
}

inspectPlusButton();
