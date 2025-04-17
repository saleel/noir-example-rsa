import { useLocalStorage } from "@uidotdev/usehooks";
import { useState } from "react";

async function verifySignature(publicKeyJWK, message, signature) {
  console.log(publicKeyJWK, message, signature);
  const publicKey = await crypto.subtle.importKey(
    "jwk",
    JSON.parse(publicKeyJWK),
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
  const [publicKeyJWK, setPublicKeyJWK] = useState(JSON.stringify(keys.publicKeyJWK, null, 2));
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [verified, setVerified] = useState(false);

  return (
    <div className="page-container">
      <h2>Verify Signature</h2>

      <div className="input-group">
        <label>Public Key:</label>
        <textarea
          rows={10}
          cols={100}
          value={publicKeyJWK}
          onChange={(e) => setPublicKeyJWK(e.target.value)}
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
        disabled={!(publicKeyJWK && message && signature)}
        onClick={() => {
          verifySignature(publicKeyJWK, message, signature).then((s) =>
            setVerified(s)
          );
        }}
      >
        Verify Signature
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

