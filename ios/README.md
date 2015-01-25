# Appcelerator Security Library for IOS

This is a basic security library for decryption and other security related tasks that are common in iOS.

This library was created as a secure coding best practice for use with Appcelerator iOS related software.

It is made available on GitHub for peer review and for transparency in our security practices.  If you find a security related issue with this software, please use [Responsible Disclosure of Security Vulnerabilities](http://www.appcelerator.com/privacy/responsible-disclosure-of-security-vulnerabilities/) by reporting it.

## Usage

The following APIs are available:

- `AppC_hmac256(key,data)`: HMAC-256 using key data
- `AppC_sha1(data)`: SHA1 data
- `AppC_decrypt(value,key,pepper,hmacKey,encoding,size)`: decrypt an previously encrypted blob
- `AppC_decryptWithKey(value,derivedKey,pepper,hmacKey,encoding,size)`: decrypt an previously encrypted blob using precalculated derived key

### Example Decryption

After an encryption (not shown), use the information provided (however, not stored in the source code, please!):

```objective-c
NSString *value = @"n8aMjHGhlGd18E37vVOY3AYdRT7clytlLaUfuuNQBpA/lETIkpQ2ikkSRcpp111LbLZ6c3A4FCcAimr5iGa3Z4035gAJohB8zugVxDoxE9JQMTwFQP0aDDUzn15H18ytDGwxzgtxMdaTNdJrykw9CrRrdPVrguksPvS+rB32DOXUtf0b+CiwR7048fzxbtXTucHDP1+zmheIy0WXtYCFdfwLpTN2fDxn+GIYwRzljCslG8+9YOeiYgaPo854f9hUCSSGPtg08OLTQsipZw3O6ixUwmdQyyxm/w8rpr5y2I1Te9ocxcOZpXpZ7j2UaZvgvI6DcvG2wLsuYPYB9XSiWO+LCCRTMIR2SQOTACaXQS++wJGUPIpmfFHaA5uJvmbUzeqSBw3Kf8gyDLuffor32Y0PrA7sl/Lb0GkJlStwfrw=";
NSString *key = @"key";
NSString *pepper = @"pepper";
NSString *hmacKey = @"hmacKey";
NSString *encoding = @"base64";
NSString *result = AppC_decrypt(value,key,pepper,hmacKey,encoding,128);
```

The above example with decrypt the encrypted blob and return the result `ABC` if decryption was successful or `nil` if not.

### Building the Library

Please run the included `build.sh` to build a universal static library with the following architectures: `armv7`, `arm64`, `i386`, `x86_64`.

Take the resulting library in `build/libappcsecurity.a` and use it in your Xcode project.

## License

While this source code is made available on Github and is public, this code is closed source and Confidential and Proprietary to Appcelerator, Inc. All Rights Reserved.  This code MUST not be modified, copy or otherwise redistributed without expression written permission of Appcelerator. This file is licensed as part of the Appcelerator Platform and governed under the terms of the Appcelerator license agreement.
