package com.appcelerator.security;

import android.app.Application;
import android.test.ApplicationTestCase;

/**
 * <a href="http://d.android.com/tools/testing/testing_android.html">Testing Fundamentals</a>
 */
public class ApplicationTest extends ApplicationTestCase<Application> {
	// TODO: I'm not entirely sure how to run these tests, now. These are from the android studio project.
    public ApplicationTest() {
        super(Application.class);
    }

    public void testSHA1() {
        String result = Security.sha1("abc");
        String expected = "a9993e364706816aba3e25717850c26c9cd0d89d";
        assertEquals(expected, result);
    }

    public void testHMAC256() {
        String result = Security.hmac256("key", "value");
        String expected = "90fbfcf15e74a36b89dbdb2a721d9aecffdfdddc5c83e27f7592594f71932481";
        assertEquals(expected, result);
    }

    public void testDecryption128() {
        String value = "n8aMjHGhlGd18E37vVOY3AYdRT7clytlLaUfuuNQBpA/lETIkpQ2ikkSRcpp111LbLZ6c3A4FCcAimr5iGa3Z4035gAJohB8zugVxDoxE9JQMTwFQP0aDDUzn15H18ytDGwxzgtxMdaTNdJrykw9CrRrdPVrguksPvS+rB32DOXUtf0b+CiwR7048fzxbtXTucHDP1+zmheIy0WXtYCFdfwLpTN2fDxn+GIYwRzljCslG8+9YOeiYgaPo854f9hUCSSGPtg08OLTQsipZw3O6ixUwmdQyyxm/w8rpr5y2I1Te9ocxcOZpXpZ7j2UaZvgvI6DcvG2wLsuYPYB9XSiWO+LCCRTMIR2SQOTACaXQS++wJGUPIpmfFHaA5uJvmbUzeqSBw3Kf8gyDLuffor32Y0PrA7sl/Lb0GkJlStwfrw=";
        String key = "key";
        String pepper = "pepper";
        String hmacKey = "hmacKey";
        String encoding = "base64";
        String result = Security.decrypt(value, key, pepper, hmacKey, encoding, 128);
        String expected = "ABC";
        assertEquals(expected, result);
    }

    public void testDecryption128WithDerivedKey() {
        String value = "WEL9pPtgCmgB/5jolBI7C39f27+EE5TtQVqgOkacdc0jZNcxWi+8D7OpI8tIBwUKOkYuhr1VeNN7nF95D6bnde5mNEa/4iklm39IgIieZWYXbviMtsyKLZgKKY2fUkEwnIZJstk+MBVciKozlFAOmRUTW3loZmTMCBtaF0SpATaLWRA2/ydBTHHDOdt0HVSdiaBUS/VQjnFMB9ili32qwurddHZfIC5QBOJNFpKrXHCruJqYdGvNQS7NRyMTdD2GtGtmme74JgHQIsWVsHyUy0YqamKdAnak7wUMRlz9RlXCxCNQOtrUIh6WTw7MYbkk2izqZfFuOcBuEFiIMRLf4Fk9aSYhOZB2GIC3s0EYFg++Mj5KBX7TtfAiQ98SQmTKXrzyjOUk0MycJRE+bBtt5XUO5tk+nushXw2NrbZIqNo=";
        String key = "7aebf3dc5f3ad209eb1658f4d07a9604";
        String pepper = "pepper";
        String hmacKey = "hmacKey";
        String encoding = "base64";
        String result = Security.decryptWithKey(value, key, pepper, hmacKey, encoding, 128);
        String expected = "ABC";
        assertEquals(expected, result);
    }

    public void testDecryption192() {
        String value = "tyUxazhkHAALBPmrCzKQSX51a4CTomRGj3kZc9kTFW8ivsojobHNHqBzHLqLfdnemLlclA6Anf0ottNIfynEHeFmMA2IMncTs/TjokH5xyuhaObjAMlKMNP3IqHo7ONiuxtb/CBOScH6x92CWLVte3mcEsR8XwTaei4e5DWUeVj606DIsHptbZjJq0qSdIqSF1MgG5FYwzcAAUoM0XdC+K+bHJrBVeLObuct8FxUkm3FLBqORf/yCv0LvajuH63tUlEuAAQVpPtd76OZsledWQ2UXHOlGAzN51L6UhwjSrGXOsI4n6JOWAgyKyT84Q8gL7iENcrxlOK0jCUnS/3VSb2I5wHyuAt5ZCHeodw/hdzjrNxdUQrH5R2ecwfjSA5VfDQlGOUT4BhKPSgwJ8zEby9wpq45HpjYjKEtQ9sMtk0=";
        String key = "key";
        String pepper = "pepper";
        String hmacKey = "hmacKey";
        String encoding = "base64";
        String result = Security.decrypt(value, key, pepper, hmacKey, encoding, 192);
        String expected = "ABC";
        assertEquals(expected, result);
    }

    public void testDecryption192WithDerivedKey() {
        String value = "YEcfI6itbBlKDDhT6qifhMuDRxp10IzhfZH2cUpERSwQyKLk8ArGysGxeyfvVFGnwGIGH8WchaPDNrNdH9BLV1lqJ2Kicba5FUFhxl48e99lz10mivugotxMdOesvsCWxE1LGcYfvlUcljZpnR+eHt4emC2C9wkBVgwHrqbN4+Z2D4U++e7Q/da0/jBcnQUYsvJf3MWOvxDotVBEgCZC3b8FeIFdSvW3zN7qBsAVCxzKAcaV/xhNerqyts1FzG0I044aenPBQThxVRNOtz9poIC5vMCbhRLABH7I+5x3tdq/fY27NYxzEj2E4Kw4oinyp53dORYvfL6p0jTpMz2yYiL7JdDYTvBOIvOO28ynRyj7cmUWJa+K26Q9mHRz5Bt6mQBb1Fdp4xXaDaTyGmKLlYD/yfRKKyuzMXSWw9LdMac=";
        String key = "473c135465aa5569e5d4bef84fe9a48ab87b382a8735af3c";
        String pepper = "pepper";
        String hmacKey = "hmacKey";
        String encoding = "base64";
        String result = Security.decryptWithKey(value, key, pepper, hmacKey, encoding, 192);
        String expected = "ABC";
        assertEquals(expected, result);
    }

    public void testDecryption256() {
        String value = "3tBG8ej3HIzoWhddFS8ooxFWASChJkYsa/EFJdpddeB+ZtB569nZRd4+o/UVmZIOY5Xh1Zs43et7UTr0dXMhWafQg9LUfwGRnWfS+jMft58BRTTZytSLtU3X5OCQt5l7YkSmM82HM2tkNu2D5LB9/lb7QycyMqINDijkVu5xN8M+cRMH2uN5Pd8yUgVVpJmBaVgWlydmS+PoNBzl2mo1Ib38GThW7/uQQCFH1fg0ipvyR7f+o01g4S32k4OGW2XHiwKqcxIs7a3D++IZniZQrCZcEiWQKdpKA/ytjficH2MktqNlpj/nVAb5K2ZmPNG+Y8nLX0WhY0ailwuYG66GBiH56EDGcCvJYPQCdm6edC4yf4VE4hqPgFL3hRR8Mv0sKsVRxFwtSIkVenNVT8wvv3yo2k/lI5PL9jy7k8oCA+8=";
        String key = "key";
        String pepper = "pepper";
        String hmacKey = "hmacKey";
        String encoding = "base64";
        String result = Security.decrypt(value, key, pepper, hmacKey, encoding, 256);
        String expected = "ABC";
        assertEquals(expected, result);
    }

    public void testDecryption256WithDerivedKey() {
        String value = "FNvfUEQfR1Mk/3/eNAppXPHDZ9rOsw86E2uewz79jsecX7xc558jqhGru/TtF9/Fcg+PzZdHU7P8fDKeSJemh0O4FwKrXwUZ57FJ9Sg4XwvMgorZde4OeZrNhqYU5NDjE5NyJee548e4zuQ+C6pthp5VXwM/ht0UQPmTGcRae53wxu436f0pe7PG9FpPNy/lJN3HoeBD8xS0tW5rpQscy1qzqoEYCQByRt7sl8EdPidfEcJE9DSpA/svN56qkfMEDtn+kre8fdseVD7FBZ5b5NI9yV8CY59+vy3Tiw3gT6QU5lTU0W3i/VMEcDMofAV21s5xuJnQoVyAV0sz2BogIX5qhVI69XtFj8WXBFCysmDizlNO0qUtKFCd6fzG9LBsNjF/OqR2pO4twSx4j+K1psn9vBdlzIARVKYu+3UJQCo=";
        String key = "708ccb1ce2baaf550808149a7904162d221d8f3fb02ed812e49a01058ee4ea07";
        String pepper = "pepper";
        String hmacKey = "hmacKey";
        String encoding = "base64";
        String result = Security.decryptWithKey(value, key, pepper, hmacKey, encoding, 256);
        String expected = "ABC";
        assertEquals(expected, result);
    }

    public void testDecryption256WithDerivedKeyAndHighRotations() {
        String value = "2AcyTktd1uMXTdKC6z8Owj71NcPsRv4Fot7iBGWZqoPt4GZV2hbjLH48OkhAJwBwI7QRc7S7xhh+geid5WmO1uhIaH0kkXCL+NXgC4qEmtoTqS+hxwSbIyHKM2oRvKeoVGfgt2F2NQ1+kHEZTa8faKSu5AGvSm8MTiqR0GKEHr4SXrKVfMZ1R/dgkCrGARVAIi7PQrL/mS03PYmV1PeRHmBi5ynIMzXXONpENK9ezXs8qyPNmbmJo20B92YEhd5kZtOfjrChuFS81YeMF0R1ZhKZzoY67X12dn+bVapIW+qatMMkMrBlJsAUUvnGP9YtWJM2tQ7qXMAe7kiNZAvi8uADoA6g+EDKJplJPDdy9HPfwh4hFFVR1+JvxDw456OyiVO/jTxb3llYYlZ4pkSecmLZhP0GyweU83EXke94O1o=";
        String key = "308df69930b737745efb3a89c01c5ac271a775fe74b258013251cc60013fca46";
        String pepper = "pepper";
        String hmacKey = "hmacKey";
        String encoding = "base64";
        String result = Security.decryptWithKey(value, key, pepper, hmacKey, encoding, 256);
        String expected = "ABC";
        assertEquals(expected, result);
    }


}