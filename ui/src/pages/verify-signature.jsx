import { useLocalStorage } from "@uidotdev/usehooks";
import { useState } from "react";

async function verifySignature(publicKeyJWK, message, signature) {
  console.log(publicKeyJWK, message, signature);
  const publicKey = await crypto.subtle.importKey(
    "jwk",
    publicKeyJWK,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  // convert signature (bigint) to uint8array
  const signatureBytes = new Uint8Array(
    BigInt(signature).toString(16).match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );

  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signatureBytes,
    new TextEncoder().encode(message)
  );

  return verified;
}

function VerifySignature() {
  const [keys] = useLocalStorage("keys", {});
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [verified, setVerified] = useState(false);

  return (
    <div className="page-container">
      <h2>Sign Data</h2>

      <div className="input-group">
        <label>Public Key:</label>
        <textarea
          rows={10}
          cols={100}
          value={JSON.stringify(keys.publicKeyJWK, null, 2)}
          onChange={(e) => setKeys({ ...keys, publicKeyJWK: e.target.value })}
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

      <div className="input-group">
        <label>Signature:</label>
        <textarea
          rows={10}
          cols={100}
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
        />
      </div>

      <button
        disabled={!(keys.publicKeyJWK && message && signature)}
        onClick={() => {
          verifySignature(keys.publicKeyJWK, message, signature).then((s) =>
            setVerified(s)
          );
        }}
      >
        Generate Signature
      </button>

      <div className="result-display">
        <h3 style={{ color: verified ? "green" : "red" }}>
          Verification: {verified ? "Verified" : "Not Verified"}
        </h3>
      </div>
    </div>
  );
}

export default VerifySignature;

