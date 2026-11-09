async function run() {
  const tabs = await fetch('http://localhost:9222/json').then(r => r.json());
  const t = tabs.find(x => x.url && x.url.includes('documents.html'));
  if (!t) { console.log('Tab not found'); process.exit(1); }
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    setTimeout(() => {
      ws.send(JSON.stringify({ 
        id: 3, 
        method: 'Runtime.evaluate', 
        params: { 
          expression: `({
            tbodyLength: document.getElementById('documentsTableBody')?.innerHTML?.length,
            mobileLength: document.getElementById('documentsMobileCards')?.innerHTML?.length,
            docListLength: typeof WDSDB !== 'undefined' ? (WDSDB.getConfig().documentsList?.length) : 'NO WDSDB',
            defaultDocsLength: typeof DEFAULT_DOCUMENTS_LIST !== 'undefined' ? DEFAULT_DOCUMENTS_LIST.length : 'NO DEFAULT',
            cloudSyncDone: typeof WDSDB !== 'undefined' ? 'WDSDB EXISTS' : 'NO'
          })`, 
          returnByValue: true 
        } 
      }));
    }, 1500);
  };
  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.method === 'Runtime.exceptionThrown') {
      console.error('EXCEPTION:', JSON.stringify(data.params));
    }
    if (data.id === 3) {
      console.log('DOCUMENTS EVAL:', JSON.stringify(data.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    }
  };
}

run();
