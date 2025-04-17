use sha256::sha256_var;
use bignum::{params::BigNumParams, RuntimeBigNum};
use rsa::{rsa::verify_sha256_pkcs1v15};
use string_search::{StringBody64, SubString32};

global MAX_DATA_LENGTH: u32 = 64;


fn main(
  signed_data: [u8; MAX_DATA_LENGTH],
  signed_data_len: u32,
  pubkey_modulus_limbs: pub [u128; 18],
  redc_params_limbs: [u128; 18],
  signature_limbs: [u128; 18],
  revealed_data: pub [u8; 20],
  revealed_data_len: u32,
) {       
  let mut data_hash: [u8; 32] = sha256_var(signed_data, signed_data_len as u64);

  // Construct RSA 2048 params
  let params: BigNumParams<18, 2048> =
      BigNumParams::new(false, pubkey_modulus_limbs, redc_params_limbs);

  // Verify RSA signature
  let signature = RuntimeBigNum{ params, limbs: signature_limbs };
  assert(verify_sha256_pkcs1v15(data_hash, signature, 65537));


  let haystack: StringBody64 = StringBody64::new(signed_data, signed_data_len);
  let needle: SubString32 = SubString32::new(revealed_data, revealed_data_len);
  let (result, match_position): (bool, u32) = haystack.substring_match(needle);
  assert(result);
}
