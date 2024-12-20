import { useLocalStorage } from "@uidotdev/usehooks";
import { useState } from "react";

async function generateSignature(privateKeyJWK, message) {
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    privateKeyJWK,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(message) // Convert message to Uint8Array (bytes of ascii characters)
  );

  console.log(new Uint8Array(signature));

  // Convert signature to hex string and then to BigInt
  const signatureHex = Array.from(new Uint8Array(signature))
    .map((s) => s.toString(16).padStart(2, "0"))
    .join("");

  const signatureBigInt = BigInt(`0x${signatureHex}`);
  return signatureBigInt;
}

function SignData() {
  const [keys] = useLocalStorage("keys", {});
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");

  return (
    <div className="page-container">
      <h2>Sign Data</h2>

      <div className="input-group">
        <label>Private Key:</label>
        <textarea
          rows={10}
          cols={100}
          value={JSON.stringify(keys.publicKeyJWK, null, 2)}
          onChange={(e) => setKeys({ ...keys, privateKeyJWK: e.target.value })}
        />
      </div>

      <div className="input-group">
        <label>Message:</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button
        disabled={!(keys.privateKeyJWK && message)}
        onClick={() => {
          generateSignature(keys.privateKeyJWK, message).then(s => setSignature(s.toString()));
        }}
      >
        Generate Signature
      </button>

      <div className="result-display">
        <h3>Signature:</h3>
        <textarea readOnly rows={10} cols={100} value={signature} />
      </div>
    </div>
  );
}

export default SignData;
