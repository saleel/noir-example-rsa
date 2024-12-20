use std::hash::sha256_var;
use bignum::{params::BigNumParams, RuntimeBigNum};
use rsa::{rsa::verify_sha256_pkcs1v15, types::RBN2048};
// use string_search::{StringBody64, SubString32};

global MAX_DATA_LENGTH: u32 = 20;


fn main(
  signed_data: [u8; MAX_DATA_LENGTH],
  signed_data_len: u32,
  pubkey_modulus_limbs: pub [Field; 18],
  redc_params_limbs: [Field; 18],
  signature_limbs: [Field; 18],
  // revealed_data: pub [u8; 3],
) {       
  let mut data_hash: [u8; 32] = sha256_var(signed_data, signed_data_len as u64);

  // Construct RSA 2048 params
  let params: BigNumParams<18, 2048> =
      BigNumParams::new(false, pubkey_modulus_limbs, redc_params_limbs);

  // Verify RSA signature
  let signature: RBN2048 = RuntimeBigNum::from_array(params, signature_limbs);
  assert(verify_sha256_pkcs1v15(data_hash, signature, 65537));


  // let haystack: StringBody64 = StringBody64::new(signed_data, signed_data_len);
  // let needle: SubString32 = SubString32::new(revealed_data, revealed_data.len());
  // let (result, match_position): (bool, u32) = haystack.substring_match(needle);
  // assert(result);
}
