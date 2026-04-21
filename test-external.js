import fetch from 'node-fetch';

async function test() {
  const local = await fetch('http://localhost:3000/api/properties').then(r=>r.text());
  console.log("Local Length:", local.length, local.substring(0, 50));
  
  const ext = await fetch('https://ais-dev-2fys55tfj3ljgyqegb7q2g-352664458686.asia-southeast1.run.app/api/properties').then(r=>r.text());
  console.log("Ext Length:", ext.length, ext.substring(0, 50));
}
test();
