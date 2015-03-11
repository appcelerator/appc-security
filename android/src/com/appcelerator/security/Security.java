/**
 * This code is closed source and Confidential and Proprietary to
 * Appcelerator, Inc. All Rights Reserved.  This code MUST not be
 * modified, copied or otherwise redistributed without express
 * written permission of Appcelerator. This file is licensed as
 * part of the Appcelerator Platform and governed under the terms
 * of the Appcelerator license agreement.
 */

package com.appcelerator.security;

import android.util.Base64;
import android.util.Log;

import javax.crypto.*;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;

public class Security {

    /*
     Debugging.
     */
    private static final boolean DEBUG = false;
    private static final String TAG = Security.class.getSimpleName();

    /*
     Configuration.
     */
    private static final int ITERATIONS = 100;
    private static final int SALT_LENGTH = 512;
    private static final int IV_LENGTH = 32;
    private static final int HMAC_LENGTH = 64;
    private static final float KEY_LENGTH = 32; // kCCKeySizeAES256

    /**
     * produce an HMAC-256 for data using key
     *
     * @param key  for performing HMAC
     * @param data to HMAC
     * @return HMAC value
     */
    public static String hmac256(String key, String data) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] bytes = sha256_HMAC.doFinal(data.getBytes());
            return bytesToHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return null;
        } catch (InvalidKeyException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * produce a SHA1 from data
     *
     * @param data to hash
     * @return hashed value of data
     */
    public static String sha1(String data) {
        try {
            MessageDigest mDigest = MessageDigest.getInstance("SHA1");
            byte[] result = mDigest.digest(data.getBytes());
            return bytesToHex(result);
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * decrypt an encrypted value using key, pepper and hmacKey and return
     * resulting plainText
     *
     * @param value    encrypted string
     * @param key      the key
     * @param pepper   the pepper
     * @param hmacKey  the hmacKey
     * @param encoding defaults to hex. can pass in base64 as well
     * @param size     of the AES encoding. Can pass in 128, 192 or 512 (default).
     * @return plain text or null if decryption failed
     */
    public static String decrypt(String value, String key, String pepper, String hmacKey, String encoding, int size) {
        return processDecrypt(value, key, true, pepper, hmacKey, encoding, size);
    }

    /**
     * Decrypt an encrypted value using computed derived key, pepper and hmacKey
     * and return resulting plainText
     *
     * @param value         encrypted string
     * @param derivedKeyHex key computed during encryption
     * @param pepper        the pepper used with the salt
     * @param hmacKey       the hmac key
     * @param encoding      defaults to hex. can pass in base64 as well
     * @param size          of the AES encoding. Can pass in 128, 192 or 512 (default).
     * @return plain text or null if decryption failed
     */
    public static String decryptWithKey(String value, String derivedKeyHex, String pepper, String hmacKey, String encoding, int size) {
        return processDecrypt(value, derivedKeyHex, false, pepper, hmacKey, encoding, size);
    }
   
    /**
     * Used by bytesToHex to create hex strings.
     */
    final private static char[] hexArray = "0123456789abcdef".toCharArray();

    /**
     * Converts the provided byte array to a hex string.
     * From http://stackoverflow.com/questions/9655181/convert-from-byte-array-to-hex-string-in-java
     *
     * @param bytes Bytes to be converted
     * @return A hex string
     */
    public static String bytesToHex(byte[] bytes) {
        char[] hexChars = new char[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = hexArray[v >>> 4];
            hexChars[j * 2 + 1] = hexArray[v & 0x0F];
        }
        return new String(hexChars);
    }

    /**
     * Converts the provided hex string to a byte array.
     * From http://stackoverflow.com/questions/18714616/convert-hex-string-to-byte
     *
     * @param s A hex string to be converted.
     * @return A byte array
     */
    public static byte[] hexToBytes(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];

        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4) + Character.digit(s.charAt(i + 1), 16));
        }

        return data;
    }

    /*
     * Utilities.
     */

    /**
     * decrypt an encrypted value using key, pepper and hmacKey and return
     * resulting plainText
     *
     * @param value     encrypted string
     * @param key       the key
     * @param deriveKey whether or not to derive the key; if false, we assume it has already been derived and is in hex format
     * @param pepper    the pepper
     * @param hmacKey   the hmacKey
     * @param encoding  defaults to hex. can pass in base64 as well
     * @param size      of the AES encoding. Can pass in 128, 192 or 512 (default).
     * @return plain text or null if decryption failed
     */
    private static String processDecrypt(String value, String key, boolean deriveKey, String pepper, String hmacKey, String encoding, int size) {
        try {
            String encryptedText = encoding != null && encoding.equals("base64") ? bytesToHex(Base64.decode(value, Base64.DEFAULT)) : value;

            if (encryptedText.length() <= HMAC_LENGTH + SALT_LENGTH + IV_LENGTH) {
                if (DEBUG) {
                    throw new SecurityException("invalid encrypted data");
                }
                return null;
            }

            float keySizeFactor = (float) (256.0 / (float) size);
            String hmacValue = encryptedText.substring(0, HMAC_LENGTH);
            String saltValue = encryptedText.substring(HMAC_LENGTH, HMAC_LENGTH + SALT_LENGTH);
            String ivValue = encryptedText.substring(HMAC_LENGTH + SALT_LENGTH, HMAC_LENGTH + SALT_LENGTH + IV_LENGTH);
            String encValue = encryptedText.substring(SALT_LENGTH + HMAC_LENGTH + IV_LENGTH);
            String saltAndPepper = sha1(saltValue + pepper);

            String hmacTestStr = encValue + saltAndPepper + ivValue;
            String hmacTestValue = hmac256(hmacKey, hmacTestStr);

            if (DEBUG) {
                Log.d(TAG, "------- BEGIN DECRYPTION ------\n");
                Log.d(TAG, "encryptedText = " + encryptedText + "\n");
                Log.d(TAG, "hmac = " + hmacValue + "\n");
                Log.d(TAG, "saltValue = " + saltValue + "\n");
                Log.d(TAG, "ivValue = " + ivValue + "\n");
                Log.d(TAG, "encValue = " + encValue + "\n");
                Log.d(TAG, "saltAndPepper = " + saltAndPepper + "\n");
                Log.d(TAG, "hmacTest = " + hmacTestStr + "\n");
                Log.d(TAG, "hmacTestValue = " + hmacTestValue + "\n");
            }

            if (!constantTimeCompare(hmacTestValue, hmacValue)) {
                if (DEBUG) {
                    throw new SecurityException("encrypted data has been tampered with");
                }
                return null;
            }

            byte[] derivedKey = deriveKey
                    ? CPbkdf2.derive(key, saltAndPepper, ITERATIONS, (int) Math.floor(KEY_LENGTH / keySizeFactor))
                    : hexToBytes(key);
            byte[] ivKey = hexToBytes(ivValue);
            if (DEBUG) {
                Log.d(TAG, "derived key= " + Arrays.toString(derivedKey) + "\n");
                Log.d(TAG, "iv key= " + Arrays.toString(ivKey) + "\n");
                Log.d(TAG, "------- END DECRYPTION ------\n");
            }

            byte[] decrypted = aesDecrypt(derivedKey, ivValue, encValue, keySizeFactor);
            return new String(decrypted, "UTF-8");
        } catch (Exception e) {
            if (DEBUG) {
                Log.d(TAG, "Exception hit during decryption", e);
                throw new SecurityException(e);
            }
        }
        if (DEBUG) {
            throw new SecurityException("decryption failed");
        }
        return null;
    }

    /**
     * Decrypts a string based on the provided parameters and size.
     *
     * @param key       The key bytes
     * @param ivHex     The iv key
     * @param encHex    The enc hex
     * @param keyFactor The key factor
     * @return A decrypted byte array
     */
    private static byte[] aesDecrypt(byte[] key, String ivHex, String encHex, float keyFactor) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, InvalidKeyException, BadPaddingException, IllegalBlockSizeException {
        byte[] iv = hexToBytes(ivHex);
        byte[] enc = hexToBytes(encHex);

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key, "AES");
        IvParameterSpec ivParameterSpec = new IvParameterSpec(iv);
        cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, ivParameterSpec);

        return cipher.doFinal(enc);

    }

    /**
     * Test for constant time comparison which both checks the values and ensures that we don't have a timing attack.
     * This validates that the encrypted value hasn't been modified from what we encrypted.
     *
     * @param a The first string
     * @param b The second string
     * @return The result of the comparison
     */
    private static boolean constantTimeCompare(String a, String b) {
        int sentinel = 0;

        if (a.length() != b.length()) {
            return false;
        }

        for (int c = 0; c <= (a.length() - 1); c++) {
            sentinel |= a.charAt(c) ^ b.charAt(c);
        }

        return sentinel == 0;
    }
}
