import { useLocalStorage } from "@uidotdev/usehooks";

async function generateRSAKeyPair() {
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

  const publicKeyJWK = await crypto.subtle.exportKey("jwk", key.publicKey);
  const privateKeyJWK = await crypto.subtle.exportKey("jwk", key.privateKey);

  const pubkeyModulusBigInt = jwkToBigInt(publicKeyJWK.n);
  const redcParam = (1n << (2n * 2048n + 4n)) / pubkeyModulusBigInt;

  return {
    publicKeyJWK,
    privateKeyJWK,
    pubkeyModulusBigInt: pubkeyModulusBigInt.toString(),
    redcParam: redcParam.toString(),
  };
}

function GenerateKeys() {
  const [keys, setKeys] = useLocalStorage("keys", {});

  return (
    <div className="page-container">
      <h2>Generate RSA Key Pair</h2>
      <button onClick={() => generateRSAKeyPair().then(setKeys)}>
        Generate Key Pair
      </button>

      <div className="result-display">
        <h3>Private Key (JWK):</h3>
        <textarea rows={10} cols={100} readOnly value={JSON.stringify(keys.privateKeyJWK, null, 2)} />

        <h3>Public Key (JWK):</h3>
        <textarea rows={10} cols={100} readOnly value={JSON.stringify(keys.publicKeyJWK, null, 2)} />

        <h3>Public Key BigInt:</h3>
        <textarea rows={10} cols={100} readOnly value={keys.pubkeyModulusBigInt} />

        <h3>Reduction Parameter:</h3>
        <textarea rows={10} cols={100} readOnly value={keys.redcParam} />
      </div>
    </div>
  );
}

export default GenerateKeys;


// Utils

const jwkToBigInt = (jwkBase64url) => {
  // 1. Convert from base64url to base64
  const base64 = jwkBase64url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(jwkBase64url.length + ((4 - (jwkBase64url.length % 4)) % 4), "=");

  // 2. Convert base64 to binary string
  const binaryStr = atob(base64);

  // 3. Convert binary string to BigInt
  // We multiply by 256 for each byte (moving left)
  // and add the byte value for the current position
  return [...binaryStr].reduce(
    (acc, char) => acc * 256n + BigInt(char.charCodeAt(0)),
    0n
  );
};
