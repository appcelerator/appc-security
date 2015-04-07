-keeppackagenames

-keep class com.appcelerator.security.Security {
	java.lang.String hmac256(...);
	java.lang.String sha1(...);
	java.lang.String decrypt(...);
	java.lang.String decryptWithKey(...);
	java.lang.String bytesToHex(...);
	java.lang.String hexToBytes(...);
}
