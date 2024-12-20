import { useLocalStorage } from "@uidotdev/usehooks";
import { useState } from "react";
import { Noir } from "@noir-lang/noir_js";
import { UltraHonkBackend } from "@aztec/bb.js";
import circuit from "../../assets/circuit.json";

async function verifyProof(proof, publicInputs) {
  const backend = new UltraHonkBackend(circuit.bytecode);

  const proofParsed = Uint8Array.from(JSON.parse(proof) );
  const publicInputsParsed = JSON.parse(publicInputs);

  // Generate witness and prove
  const startTime = performance.now();
  const verified = await backend.verifyProof({ proof: proofParsed, publicInputs: publicInputsParsed });
  const verificationTime = performance.now() - startTime;

  return { verified, verificationTime };
}

function Verify() {
  const [proof, setProof] = useState("");
  const [publicInputs, setPublicInputs] = useState("");

  const [isVerifying, setIsVerifying] = useState(false);

  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="page-container">
      <h2>Verify Proof</h2>

      <div className="input-group">
        <label>Proof:</label>
        <textarea
          rows={10}
          cols={100}
          value={proof}
          onChange={(e) => setProof(e.target.value)}
        ></textarea>
      </div>

      <div className="input-group">
        <label>Public Input:</label>
        <textarea
          rows={10}
          cols={100}
          value={publicInputs}
          onChange={(e) => setPublicInputs(e.target.value)}
        ></textarea>
      </div>

      <button
        disabled={isVerifying}
        onClick={() => {
          setIsVerifying(true);
          verifyProof(proof, publicInputs)
            .then(setResult)
            .catch(setError)
            .finally(() => setIsVerifying(false));
        }}
      >
        Verify
      </button>

      <div className="result-display">
        <h3>Verification Result:</h3>
        <p style={{ color: result.verified ? "green" : "red" }}>
          Verified: {result.verified ? "true" : "false"}
        </p>
        <p>Verification Time: {result.verificationTime} ms</p>

        <br />
        {error && <p>Error: {error?.toString()}</p>}
      </div>
    </div>
  );
}

export default Verify;
