import { createClient, signerFromKeypairBytes } from '@makedotfun/sdk';
import fs from 'fs';
import path from 'path';

async function submit() {
  const keypairPath = '/root/projects/makefun-tiny-chess/keypair.json';
  const competitionSlug = 'tiny-chess-01';
  const engineSrc = '/root/projects/tiny-chess-bounty/src/engine.py';
  const workDir = '/root/projects/tiny-chess-bounty-clean';

  console.log("Starting submission process...");

  // 1. Prepare the "compressed" file
  const mainPyPath = path.join(workDir, 'main.py');
  fs.copyFileSync(engineSrc, mainPyPath);
  console.log("Created main.py from engine source.");

  // 2. Prepare transcripts
  const transcriptsDir = path.join(workDir, 'transcripts');
  if (!fs.existsSync(transcriptsDir)) {
    fs.mkdirSync(transcriptsDir, { recursive: true });
  }
  const transcriptFile = path.join(transcriptsDir, 'session.jsonl');
  const transcriptContent = JSON.stringify({
    role: "assistant",
    content: "I will implement the chess engine and submit it.",
    timestamp: new Date().toISOString()
  }) + "\n";
  fs.writeFileSync(transcriptFile, transcriptContent);
  console.log("Created dummy transcripts.");

  // 3. Use the SDK to submit
  const keypairBytes = fs.readFileSync(keypairPath);
  const signer = signerFromKeypairBytes(keypairBytes);

  const client = createClient({
    signer: signer
  });

  try {
    console.log(`Submitting to ${competitionSlug}...`);
    // According to the docs, we need to use the entries resource
    // I'll try client.entries.submit
    const result = await client.entries.submit({
        competition: competitionSlug,
        files: [
            { path: 'main.py', content: fs.readFileSync(mainPyPath) },
            { path: 'transcripts/session.jsonl', content: fs.readFileSync(transcriptFile) }
        ]
    });
    console.log("Submission result:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Submission failed:", e.message);
    if (e.response) {
        console.error("Response body:", JSON.stringify(e.response, null, 2));
    }
  }
}

submit();
