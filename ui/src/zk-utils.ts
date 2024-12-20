import { UltraHonkBackend } from "@aztec/bb.js";
import fs from "fs";


export function splitBigIntToChunks(
  bigInt: bigint,
  chunkSize: number,
  numChunks: number
): bigint[] {
  const chunks: bigint[] = [];
  const mask = (1n << BigInt(chunkSize)) - 1n;
  for (let i = 0; i < numChunks; i++) {
    const chunk = (bigInt / (1n << (BigInt(i) * BigInt(chunkSize)))) & mask;
    chunks.push(chunk);
  }
  return chunks;
}


export async function geenrateKeyAndSignMessage(message: string) {
  const key = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );

  const publicKey = await crypto.subtle.exportKey("jwk", key.publicKey);
  const modulusBigInt = BigInt(
    "0x" + Buffer.from(publicKey.n as string, "base64").toString("hex")
  );
  const redcParam = (1n << (2n * 2048n + 4n)) / modulusBigInt;


  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key.privateKey,
    new TextEncoder().encode(message)
  );

  const signatureHex = Array.from(new Uint8Array(signature))
    .map((s) => s.toString(16).padStart(2, "0"))
    .join("");
  const signatureBigInt = BigInt(`0x${signatureHex}`);

  // Verify signature
  const verify = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key.publicKey,
    signature,
    new TextEncoder().encode(message)
  );

  console.log(verify);
      
  return { modulusBigInt, redcParam, signatureBigInt };
}

async function main() {
  // Generate a new RSA key pair using subtle crypto

  const message = "NAME 1990-01-01 Delhi";
  const messageUint8Array = new Uint8Array(100).fill(0);
  messageUint8Array.set(new TextEncoder().encode(message));

  const { modulusBigInt, redcParam, signatureBigInt } = await geenrateKeyAndSignMessage(message);

  const circuit = JSON.parse(fs.readFileSync("../circuits/target/noir_solidity.json", "utf8"));
  const { Noir } = await import("@noir-lang/noir_js");

  const backend = new UltraHonkBackend(circuit.bytecode);
  const noir = new Noir(circuit as any);

  const match = new Uint8Array(5);
  match.set(new TextEncoder().encode("world"));

  console.log(match);

  const input = {
    signed_data: {
      storage: Array.from(messageUint8Array).map((s) => s.toString()),
      len: message.length,
    },
    pubkey_modulus_limbs: splitBigIntToChunks(modulusBigInt, 120, 18).map((s) =>
      s.toString()
    ),
    redc_params_limbs: splitBigIntToChunks(redcParam, 120, 18).map((s) =>
      s.toString()
    ),
    signature_limbs: splitBigIntToChunks(signatureBigInt, 120, 18).map((s) =>
      s.toString()
    ),
    match: Array.from(match).map((s) => s.toString())
  };

  // console.log(input);

  // Generate witness and prove
  const startTime = performance.now();
  const { witness } = await noir.execute(input as any);
  const proof = await backend.generateProof(witness);
  const provingTime = performance.now() - startTime;

  console.log(`Proof generated in ${provingTime}ms`, proof);

  const verify = await backend.verifyProof(proof);
  console.log(verify);

  return { proof: proof.proof, circuit, provingTime };
}

main();
