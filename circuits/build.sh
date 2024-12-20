nargo compile --silence-warnings

echo "Gate count:"
bb gates -b target/rsa_sample.json | jq  '.functions[0].circuit_size'

# Copy to app/assets
mkdir -p "../ui/assets"
cp target/rsa_sample.json "../ui/assets/circuit.json"
bb write_vk_ultra_honk -b ./target/rsa_sample.json -o ./target/vk

echo "Generating vkey.json to ui/assets..."
node -e "const fs = require('fs'); fs.writeFileSync('../ui/assets/circuit-vkey.json', JSON.stringify(Array.from(Uint8Array.from(fs.readFileSync('./target/vk')))));"

echo "Done"
