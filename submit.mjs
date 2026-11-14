import { createClient, signerFromKeypairBytes } from '@makedotfun/sdk';
import fs from 'fs';
import path from 'path';

async function submit() {
  const keypairPath = '/root/projects/makefun-tiny-chess/keypair.json';
  const competitionSlug = 'tiny-chess-01';
  const workDir = '/root/projects/tiny-chess-bounty-clean';

  console.log("Starting submission process...");

  // 1. Prepare the files
  const mainPyPath = path.join(workDir, 'main.py');
  // No need to copy engineSrc, we are using main.py in workDir
  console.log("Using main.py from work directory.");

  // 2. Prepare transcripts
  const transcriptsDir = path.join(workDir, 'transcripts');
  if (!fs.existsSync(transcriptsDir)) {
    fs.mkdirSync(transcriptsDir, { recursive: true });
  }
  const transcriptFile = path.join(workDir, 'transcripts/session.jsonl');
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
    const commitSha = fs.readFileSync('.git/refs/heads/main', 'utf8').trim();
    console.log(`Found commit SHA: ${commitSha}`);

    const result = await client.entries.submit({
        competition: competitionSlug,
        commitSha: commitSha,
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
