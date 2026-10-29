import fs from 'fs';
import path from 'path';

const filesToPatch = [
  path.resolve('node_modules/vite/dist/client/client.mjs'),
  path.resolve('node_modules/vite/dist/client/bundledDevClient.mjs'),
];

for (const filePath of filesToPatch) {
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf-8');

  // Fix 1: ws.send(JSON.stringify(data)) when ws is undefined
  content = content.replaceAll(
    'ws.send(JSON.stringify(data));',
    'if (ws && typeof ws.send === "function" && ws.readyState === ws.OPEN) { ws.send(JSON.stringify(data)); }'
  );

  // Fix 2: this.transport.send(payload) in HMRClient
  content = content.replaceAll(
    'this.transport.send(payload).catch((err) => {',
    'if (this.transport && typeof this.transport.send === "function") { try { const _p = this.transport.send(payload); if (_p && typeof _p.catch === "function") _p.catch(() => {}); } catch {} } else return; (function(dummy){})((err) => {'
  );

  // Fix 3: wsTransport.send(data)
  content = content.replaceAll(
    'wsTransport.send(data);',
    'if (wsTransport && typeof wsTransport.send === "function") { wsTransport.send(data); }'
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Successfully patched ${filePath}`);
}
