
import { createClient } from '@makedotfun/sdk';

async function list() {
  const client = createClient({}); 
  try {
    const competitions = await client.bounties.list();
    console.log(JSON.stringify(competitions, null, 2));
  } catch (e) {
    console.error(e);
  }
}
list();
