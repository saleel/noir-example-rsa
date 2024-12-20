import { useLocalStorage } from "@uidotdev/usehooks";
import { useState } from "react";
import { Noir } from "@noir-lang/noir_js";
import { UltraHonkBackend } from "@aztec/bb.js";
import circuit from "../../assets/circuit.json";

async function generateProof(
  publicKeyBigInt,
  redcParamBigInt,
  signatureBigInt,
  message,
  revealedData
) {
  const messageUint8Array = new Uint8Array(20);
  messageUint8Array.set(new TextEncoder().encode(message));

  const revealedDataUint8Array = new Uint8Array(3);
  revealedDataUint8Array.set(new TextEncoder().encode(revealedData));

  const input = {
    signed_data: Array.from(messageUint8Array).map((s) => s.toString()),
    signed_data_len: message.length,
    revealed_data: revealedData.split("").map((s) => s.charCodeAt(0)),
    pubkey_modulus_limbs: splitBigIntToLimbs(publicKeyBigInt, 120, 18).map(
      (s) => s.toString()
    ),
    redc_params_limbs: splitBigIntToLimbs(redcParamBigInt, 120, 18).map((s) =>
      s.toString()
    ),
    signature_limbs: splitBigIntToLimbs(signatureBigInt, 120, 18).map((s) =>
      s.toString()
    ),
  };

  const noir = new Noir(circuit);
  const backend = new UltraHonkBackend(circuit.bytecode);

  // Generate witness and prove
  const startTime = performance.now();
  const { witness } = await noir.execute(input);
  const proof = await backend.generateProof(witness);
  const provingTime = performance.now() - startTime;

  return { proof: proof.proof, publicInputs: proof.publicInputs, provingTime };
}

function Prove() {
  const [keys] = useLocalStorage("keys", {});
  const [pubkeyModulusBigInt, setPubkeyModulusBigInt] = useState(
    keys.pubkeyModulusBigInt
  );
  const [redcParamBigInt, setRedcParamBigInt] = useState(keys.redcParam);
  const [message, setMessage] = useState("");
  const [signatureBigInt, setSignatureBigInt] = useState("");
  const [revealedData, setRevealedData] = useState("");

  const [proof, setProof] = useState([]);
  const [publicInputs, setPublicInputs] = useState([]);
  const [provingTime, setProvingTime] = useState("");

  const [isProving, setIsProving] = useState(false);

  return (
    <div className="page-container">
      <h2>Generate Proof</h2>

      <div className="input-group">
        <label>Message (private input)</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={20}
        />
      </div>

      <div className="input-group">
        <label>Revealed Data (public input)</label>
        <input
          type="text"
          value={revealedData}
          onChange={(e) => setRevealedData(e.target.value)}
          maxLength={3}
        />
      </div>

      <div className="input-group">
        <label>Public Key Modulus (public input)</label>
        <textarea
          value={pubkeyModulusBigInt}
          rows={10}
          cols={100}
          onChange={(e) => setPubkeyModulusBigInt(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Redc param (public input)</label>
        <textarea
          value={redcParamBigInt}
          rows={10}
          cols={100}
          onChange={(e) => setRedcParamBigInt(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Signature (public input)</label>
        <textarea
          value={signatureBigInt}
          rows={10}
          cols={100}
          onChange={(e) => setSignatureBigInt(e.target.value)}
        />
      </div>

      <button
        disabled={isProving}
        onClick={() => {
          setIsProving(true);
          generateProof(pubkeyModulusBigInt, redcParamBigInt, signatureBigInt, message, revealedData)
            .then(({ proof, publicInputs, provingTime }) => {
              console.log(proof, provingTime);
              setProof(proof);
              setPublicInputs(publicInputs);
              setProvingTime(provingTime);
            })
            .catch((e) => {
              console.error(e);
            })
            .finally(() => {
              setIsProving(false);
            });
        }}
      >
        {isProving ? "Generating..." : "Generate Proof"}
      </button>

      <div className="result-display">
        <h3>Proof:</h3>
        <textarea rows={10} cols={100} value={JSON.stringify(Array.from(proof))} readOnly />

        <h3>Public Inputs:</h3>
        <textarea rows={10} cols={100} value={JSON.stringify(publicInputs, null, 2)} readOnly />

        <p>Proving time: {provingTime}ms</p>
      </div>
    </div>
  );
}

export default Prove;

// utils

// Convert a bigint to limbs
// if you multiple each limb by 2**(bitSize * index) and take a sum, you get the original bigint
export function splitBigIntToLimbs(bigInt, bitSize, numLimbs) {
  const limbs = [];
  const mask = (1n << BigInt(bitSize)) - 1n;
  for (let i = 0; i < numLimbs; i++) {
    const chunk = (BigInt(bigInt) / (1n << (BigInt(i) * BigInt(bitSize)))) & mask;
    limbs.push(chunk);
  }
  return limbs;
}

// 120 bits * 18 libs > 2048