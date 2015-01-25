/**
 * This code is closed source and Confidential and Proprietary to
 * Appcelerator, Inc. All Rights Reserved.  This code MUST not be
 * modified, copy or otherwise redistributed without expression
 * written permission of Appcelerator. This file is licensed as
 * part of the Appcelerator Platform and governed under the terms
 * of the Appcelerator license agreement.
 */


#import <UIKit/UIKit.h>
#import <XCTest/XCTest.h>
#import "appcsecurity.h"

@interface EncryptionTest : XCTestCase

@end

@implementation EncryptionTest


- (void)testSHA1 {
    NSString *result = FNNAME(sha1)(@"abc");
    NSString *expected = @"a9993e364706816aba3e25717850c26c9cd0d89d";
    XCTAssertEqualObjects(result, expected);
}

- (void)testHMAC256 {
    NSString *result = FNNAME(hmac256)(@"key",@"value");
    NSString *expected = @"90fbfcf15e74a36b89dbdb2a721d9aecffdfdddc5c83e27f7592594f71932481";
    XCTAssertEqualObjects(result,expected);
}

- (void)testDecryption128 {
    NSString *value = @"n8aMjHGhlGd18E37vVOY3AYdRT7clytlLaUfuuNQBpA/lETIkpQ2ikkSRcpp111LbLZ6c3A4FCcAimr5iGa3Z4035gAJohB8zugVxDoxE9JQMTwFQP0aDDUzn15H18ytDGwxzgtxMdaTNdJrykw9CrRrdPVrguksPvS+rB32DOXUtf0b+CiwR7048fzxbtXTucHDP1+zmheIy0WXtYCFdfwLpTN2fDxn+GIYwRzljCslG8+9YOeiYgaPo854f9hUCSSGPtg08OLTQsipZw3O6ixUwmdQyyxm/w8rpr5y2I1Te9ocxcOZpXpZ7j2UaZvgvI6DcvG2wLsuYPYB9XSiWO+LCCRTMIR2SQOTACaXQS++wJGUPIpmfFHaA5uJvmbUzeqSBw3Kf8gyDLuffor32Y0PrA7sl/Lb0GkJlStwfrw=";
    NSString *key = @"key";
    NSString *pepper = @"pepper";
    NSString *hmacKey = @"hmacKey";
    NSString *encoding = @"base64";
    NSString *result = FNNAME(decrypt)(value,key,pepper,hmacKey,encoding,128);
    NSString *expected = @"ABC";
    XCTAssertEqualObjects(result,expected);
}

- (void)testDecryption128WithDerivedKey {
    NSString *value = @"WEL9pPtgCmgB/5jolBI7C39f27+EE5TtQVqgOkacdc0jZNcxWi+8D7OpI8tIBwUKOkYuhr1VeNN7nF95D6bnde5mNEa/4iklm39IgIieZWYXbviMtsyKLZgKKY2fUkEwnIZJstk+MBVciKozlFAOmRUTW3loZmTMCBtaF0SpATaLWRA2/ydBTHHDOdt0HVSdiaBUS/VQjnFMB9ili32qwurddHZfIC5QBOJNFpKrXHCruJqYdGvNQS7NRyMTdD2GtGtmme74JgHQIsWVsHyUy0YqamKdAnak7wUMRlz9RlXCxCNQOtrUIh6WTw7MYbkk2izqZfFuOcBuEFiIMRLf4Fk9aSYhOZB2GIC3s0EYFg++Mj5KBX7TtfAiQ98SQmTKXrzyjOUk0MycJRE+bBtt5XUO5tk+nushXw2NrbZIqNo=";
    NSString *key = @"7aebf3dc5f3ad209eb1658f4d07a9604";
    NSString *pepper = @"pepper";
    NSString *hmacKey = @"hmacKey";
    NSString *encoding = @"base64";
    NSString *result = FNNAME(decryptWithKey)(value,key,pepper,hmacKey,encoding,128);
    NSString *expected = @"ABC";
    XCTAssertEqualObjects(result,expected);
}

- (void)testDecryption192 {
    NSString *value = @"tyUxazhkHAALBPmrCzKQSX51a4CTomRGj3kZc9kTFW8ivsojobHNHqBzHLqLfdnemLlclA6Anf0ottNIfynEHeFmMA2IMncTs/TjokH5xyuhaObjAMlKMNP3IqHo7ONiuxtb/CBOScH6x92CWLVte3mcEsR8XwTaei4e5DWUeVj606DIsHptbZjJq0qSdIqSF1MgG5FYwzcAAUoM0XdC+K+bHJrBVeLObuct8FxUkm3FLBqORf/yCv0LvajuH63tUlEuAAQVpPtd76OZsledWQ2UXHOlGAzN51L6UhwjSrGXOsI4n6JOWAgyKyT84Q8gL7iENcrxlOK0jCUnS/3VSb2I5wHyuAt5ZCHeodw/hdzjrNxdUQrH5R2ecwfjSA5VfDQlGOUT4BhKPSgwJ8zEby9wpq45HpjYjKEtQ9sMtk0=";
    NSString *key = @"key";
    NSString *pepper = @"pepper";
    NSString *hmacKey = @"hmacKey";
    NSString *encoding = @"base64";
    NSString *result = FNNAME(decrypt)(value,key,pepper,hmacKey,encoding,192);
    NSString *expected = @"ABC";
    XCTAssertEqualObjects(result,expected);
}

- (void)testDecryption192WithDerivedKey {
    NSString *value = @"YEcfI6itbBlKDDhT6qifhMuDRxp10IzhfZH2cUpERSwQyKLk8ArGysGxeyfvVFGnwGIGH8WchaPDNrNdH9BLV1lqJ2Kicba5FUFhxl48e99lz10mivugotxMdOesvsCWxE1LGcYfvlUcljZpnR+eHt4emC2C9wkBVgwHrqbN4+Z2D4U++e7Q/da0/jBcnQUYsvJf3MWOvxDotVBEgCZC3b8FeIFdSvW3zN7qBsAVCxzKAcaV/xhNerqyts1FzG0I044aenPBQThxVRNOtz9poIC5vMCbhRLABH7I+5x3tdq/fY27NYxzEj2E4Kw4oinyp53dORYvfL6p0jTpMz2yYiL7JdDYTvBOIvOO28ynRyj7cmUWJa+K26Q9mHRz5Bt6mQBb1Fdp4xXaDaTyGmKLlYD/yfRKKyuzMXSWw9LdMac=";
    NSString *key = @"473c135465aa5569e5d4bef84fe9a48ab87b382a8735af3c";
    NSString *pepper = @"pepper";
    NSString *hmacKey = @"hmacKey";
    NSString *encoding = @"base64";
    NSString *result = FNNAME(decryptWithKey)(value,key,pepper,hmacKey,encoding,192);
    NSString *expected = @"ABC";
    XCTAssertEqualObjects(result,expected);
}

- (void)testDecryption256 {
    NSString *value = @"3tBG8ej3HIzoWhddFS8ooxFWASChJkYsa/EFJdpddeB+ZtB569nZRd4+o/UVmZIOY5Xh1Zs43et7UTr0dXMhWafQg9LUfwGRnWfS+jMft58BRTTZytSLtU3X5OCQt5l7YkSmM82HM2tkNu2D5LB9/lb7QycyMqINDijkVu5xN8M+cRMH2uN5Pd8yUgVVpJmBaVgWlydmS+PoNBzl2mo1Ib38GThW7/uQQCFH1fg0ipvyR7f+o01g4S32k4OGW2XHiwKqcxIs7a3D++IZniZQrCZcEiWQKdpKA/ytjficH2MktqNlpj/nVAb5K2ZmPNG+Y8nLX0WhY0ailwuYG66GBiH56EDGcCvJYPQCdm6edC4yf4VE4hqPgFL3hRR8Mv0sKsVRxFwtSIkVenNVT8wvv3yo2k/lI5PL9jy7k8oCA+8=";
    NSString *key = @"key";
    NSString *pepper = @"pepper";
    NSString *hmacKey = @"hmacKey";
    NSString *encoding = @"base64";
    NSString *result = FNNAME(decrypt)(value,key,pepper,hmacKey,encoding,256);
    NSString *expected = @"ABC";
    XCTAssertEqualObjects(result,expected);
}

- (void)testDecryption256WithDerivedKey {
    NSString *value = @"FNvfUEQfR1Mk/3/eNAppXPHDZ9rOsw86E2uewz79jsecX7xc558jqhGru/TtF9/Fcg+PzZdHU7P8fDKeSJemh0O4FwKrXwUZ57FJ9Sg4XwvMgorZde4OeZrNhqYU5NDjE5NyJee548e4zuQ+C6pthp5VXwM/ht0UQPmTGcRae53wxu436f0pe7PG9FpPNy/lJN3HoeBD8xS0tW5rpQscy1qzqoEYCQByRt7sl8EdPidfEcJE9DSpA/svN56qkfMEDtn+kre8fdseVD7FBZ5b5NI9yV8CY59+vy3Tiw3gT6QU5lTU0W3i/VMEcDMofAV21s5xuJnQoVyAV0sz2BogIX5qhVI69XtFj8WXBFCysmDizlNO0qUtKFCd6fzG9LBsNjF/OqR2pO4twSx4j+K1psn9vBdlzIARVKYu+3UJQCo=";
    NSString *key = @"708ccb1ce2baaf550808149a7904162d221d8f3fb02ed812e49a01058ee4ea07";
    NSString *pepper = @"pepper";
    NSString *hmacKey = @"hmacKey";
    NSString *encoding = @"base64";
    NSString *result = FNNAME(decryptWithKey)(value,key,pepper,hmacKey,encoding,256);
    NSString *expected = @"ABC";
    XCTAssertEqualObjects(result,expected);
}

- (void)testPerformanceDecryption128 {
    [self measureBlock:^{
        for (size_t c=0;c<100;c++){
            [self testDecryption128];
        }
    }];
}

- (void)testPerformanceDecryption192 {
    [self measureBlock:^{
        for (size_t c=0;c<100;c++){
            [self testDecryption192];
        }
    }];
}

- (void)testPerformanceDecryption256 {
    [self measureBlock:^{
        for (size_t c=0;c<100;c++){
            [self testDecryption256];
        }
    }];
}

- (void)testPerformanceDecryption128WithDerivedKey {
    [self measureBlock:^{
        for (size_t c=0;c<100;c++){
            [self testDecryption128WithDerivedKey];
        }
    }];
}

- (void)testPerformanceDecryption192WithDerivedKey {
    [self measureBlock:^{
        for (size_t c=0;c<100;c++){
            [self testDecryption192WithDerivedKey];
        }
    }];
}

- (void)testPerformanceDecryption256WithDerivedKey {
    [self measureBlock:^{
        for (size_t c=0;c<100;c++){
            [self testDecryption256WithDerivedKey];
        }
    }];
}

@end
