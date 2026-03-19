import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagePath = path.join(__dirname, 'meme_lain.jpg');

console.log(`🚀 Iniciando prueba de Pepe con imagen: ${imagePath}`);

const request = JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "search",
    arguments: {
      query: "Describe what you see in this attached image.",
      attachments: [imagePath]
    }
  }
});

const child = spawn('node', ['build/main.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

child.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('STDOUT:', output);
  
  try {
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('{')) {
        const json = JSON.parse(line);
        console.log('--- RESPUESTA DE PEPE ---');
        console.log(JSON.stringify(json, null, 2));
        if (json.id === 1) {
          child.kill();
          process.exit(0);
        }
      }
    }
  } catch (e) {
    // Not JSON
  }
});

child.stdin.write(request + '\n');

setTimeout(() => {
  console.log('⏰ Tiempo de espera agotado (60s). Matando proceso...');
  child.kill();
  process.exit(1);
}, 60000);
