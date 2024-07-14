---
title: "Part 3: Fancier Mocking Tools - Nock, Aws-SDK v2"
date: 2024-07-14T19:00:00+10:00
lastmod: 2024-07-14T20:00:00+10:00
summary: "Mocking with extension libraries for Rest APIs (Nock) and AWS-SDK v2"
tags: ['Jest', 'Testing', 'Unit Tests', 'NodeJS', 'Javascript', 'Mocking', 'Stubbing', 'Spy', 'AWS-SDK', 'AWS', 'Nock', 'RestApi']
series: ['Introduction to Jest']
---

Mocking RestAPIs with Nock
--------------------------

[nock/nock: HTTP server mocking and expectations library for Node.js (github.com)](https://github.com/nock/nock)

Nock is a framework that allows the tester to mock restAPI responses, in HTTP format even.

This allows us to test our code against diverse responses, without the need for an integration server.

It can also let us get a little creative with our validation code, and ensure that we are handling unexpected responses correctly.

  

For example, the `axios` library provides async http calls to other services, but itself as a service can be hard to mock correctly, as its error handling can be somewhat subtle.

`nock` allows us to verify our code against what axios would actually do in a specific reaponse case (say, a 404 error), as opposed to us guessing based off their documents.

  

Nock automatically converts header keys in requests to lower case. In most cases, API gateways should also be case insensitive, but be sure to check this before relying on Nock to test your request headers.

For example, the following header arrangements should be equivalent on most HTTP servers:

```json
{
    "Authorization":"MyAuthKey", 
    "accept":"application/json", 
    "deviceId":"12345"
}

{
    "authorization":"MyAuthKey", 
    "accept":"application/json", 
    "deviceid":"12345"
}
```

However some specific server implementations may not be the case. Using Nock to test your header arrangements are cased correctly may not be a suitable test in this case.

  

The following describes a possible test pattern using Nock to control axios calls:

```typescript
import nock from 'nock';
import * as AuthService from '/app/service/authentication-service';
import { CustomError } from '/app/service/error';
import axios from 'axios';

// Make sure Axios will work with Nock
axios.defaults.adapter = require('axios/lib/adapters/http');

describe('authenticate', () => {
    const authDomainRoot = 'https://example.com';
    const authUrlPath = '/auth';

    afterEach(() => {
        // Don't forget to reset any Nock mocks after each test (since we are mocking per-test)
        nock.cleanAll();
    });

    it('Throws a specific error if the Auth API returns 400', async () => {
        const scope = nock(authDomainRoot).post(authUrlPath).reply(400, {});

        try {
            const response = await AuthService.authenticate('thisIsAnAuthCode', 'thisIsNotAJwt');
            console.log(response);
            fail('Expected to throw CustomError but did not');
        } catch (e) {
            if (!(e instanceof CustomError)) {
                fail('Expected to throw CustomError, but threw something else');
            } else {
                const specificCustomErr = new CustomError(400, '07', `Something went wrong, please try again`);
                expect(e.errorCode).toEqual(specificCustomErr.errorCode);
                expect(e.message).toEqual(specificCustomErr.message);
                expect(e.httpCode).toEqual(specificCustomErr.httpCode);
            }
        }
    });

    it('Throws a specific error if the Auth API returns 500', async () => {
        const scope = nock(authDomainRoot).post(authUrlPath).reply(500, {});

        try {
            const response = await AuthService.authenticate('thisIsAnAuthCode', 'thisIsNotAJwt');
            console.log(response);
            fail('Expected to throw CustomError but did not');
        } catch (e) {
            if (!(e instanceof CustomError)) {
                fail('Expected to throw CustomError, but threw something else');
            } else {
                const specificCustomErr = new CustomError(500, '10', `Something went wrong, please try again`);
                expect(e.errorCode).toEqual(specificCustomErr.errorCode);
                expect(e.message).toEqual(specificCustomErr.message);
                expect(e.httpCode).toEqual(specificCustomErr.httpCode);
            }
        }
    });

    it('Returns the same tokens provided by the Auth API', async () => {
        const mockAccessToken = 'ThisIsAnAccessToken';
        const mockRefreshToken = 'ThisIsARefreshToken';
        const scope = nock(authDomainRoot)
            .post(authUrlPath)
            .reply(200, { access_token: mockAccessToken, refresh_token: mockRefreshToken });

        const response = await AuthService.authenticate('thisIsAnAuthCode', 'thisIsNotAJwt');
        expect(response.accessToken).toEqual(mockAccessToken);
        expect(response.refreshToken).toEqual(mockRefreshToken);
    });

    it('The provided authCode is present in the body', async () => {
        const mockAccessToken = 'ThisIsAnAccessToken';
        const mockRefreshToken = 'ThisIsARefreshToken';
        const mockAuthCode = 'thisIsAnAuthCode';
        let caughtBody;
        const scope = nock(authDomainRoot)
            .post(authUrlPath)
            .reply(200, function (uri, reqBody) {
                caughtBody = reqBody;
                return { access_token: mockAccessToken, refresh_token: mockRefreshToken };
            });

        await AuthService.authenticate(mockAuthCode, 'thisIsNotAJwt');
        const bodyAsParams = new URLSearchParams(caughtBody);
        expect(bodyAsParams.get('code')).toEqual(mockAuthCode);
        expect(bodyAsParams.get('grant_type')).toEqual('authorization_code');
    });

    it('The provided clientAssertion is present in the body', async () => {
        const mockAccessToken = 'ThisIsAnAccessToken';
        const mockRefreshToken = 'ThisIsARefreshToken';
        const mockJwt = 'thisIsNotAJwt';
        let caughtBody;
        const scope = nock(authDomainRoot)
            .post(authUrlPath)
            .reply(200, function (uri, reqBody) {
                caughtBody = reqBody;
                return { access_token: mockAccessToken, refresh_token: mockRefreshToken };
            });

        await AuthService.authenticate('thisIsAnAuthCode', mockJwt);
        const bodyAsParams = new URLSearchParams(caughtBody);
        expect(bodyAsParams.get('client_assertion')).toEqual(mockJwt);
        expect(bodyAsParams.get('client_assertion_type')).toEqual(
            'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
        );
    });
});
```

###   

Mocking AWS Services with `aws-sdk-mock`
----------------------------------------

`aws-sdk-mock` gives the user a little more control over mocking the Aws SDK. Specifically, it overrides specific functions of the SDK with your own implementation, preserving the type contract.

  

Note: \`aws-sdk-mock\` is built for the 'v2' version of the \`aws-sdk\`.  
For v3 (ie the one that uses \`@aws-sdk/client-<service>\`), use [https://github.com/m-radzikowski/aws-sdk-client-mock](https://github.com/m-radzikowski/aws-sdk-client-mock)

  

The standard pattern for mocking with `aws-sdk-mock` and `jest` looks like so:

```typescript
import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import { getFile } from 'app/service/s3-service'; // This is our wrapper service for S3

import type { GetObjectOutput, GetObjectRequest } from 'aws-sdk/clients/s3';

describe('s3-service', () => {
    describe('getFile', () => {
        // Create a Jest Mock Function that we can query about calls later.
        let mockGetObject: jest.Mock<GetObjectOutput, [req: GetObjectRequest]>;
        beforeAll(() => {
            // Write an implementation for our Jest Mock
            mockGetObject = jest.fn((req: GetObjectRequest): GetObjectOutput => {
                return { Body: 'Test Body', VersionId: 'V1' };
            });


            // Note that we need to set the AWS SDK instance before we try to mock it.
            AWSMock.setSDKInstance(AWS);
            // Overwrite S3.getObject() with AWSMock. 
            // Note that we use the `callback()` function, leaving the Error side undefined.
            AWSMock.mock('S3', 'getObject', (params, callback) => {
                callback(undefined, mockGetObject(params));
            });
        });

        afterAll(() => {
            // Restore S3's normal functionality
            AWSMock.restore('S3', 'getObject');
            // Clear out the Jest Mock as well, just to be safe
            jest.resetAllMocks();
        });

        afterEach(() => {
            // Clear data from the mock, ie how many times it was called, etc
            mockGetObject.mockClear();
        });

        // Test that our wrapper is returning what we told it to from the mock
        it('Returns the requested file if the file exists', async () => {
            const awsResp = await getFile('testBucket', 'testFolder/testFile.txt');

            expect(awsResp).toEqual({ Body: 'Test Body', VersionId: 'V1' });
        });

        // Test that we aren't calling S3 more than we have to
        it('Calls the getObject function once per request', async () => {
            await getFile('testBucket', 'testFolder/testFile.txt');

            expect(mockGetObject).toHaveBeenCalledTimes(1);
        });
    });
});


```

  

This pattern allows us to modify the return of an AWS SDK function individually, but also use a standard return in most cases.

  

Note that the AWS SDK class and method are described by strings, which are equivalent to the name of the function you are overriding in your code. `aws-sdk-mock` should warn you if you are overriding it incorrectly.

  

### Mocking AWS Errors without `aws-sdk-mock`

When testing unit behaviour in the event of an error, it can be helpful to mock when AWS returns some kind of error. The `aws-sdk` typically throws an `AWSError` object when it fails (as a promise rejection).

Unfortunately, this data type is not something `jest` will typically handle in its `expect().toThrow()` matching hook.

This pattern is known to work if there is a wrapper typescript service around the AWS SDK service (in the below example as `/app/service/s3-service.ts` ), but could potentially work with `aws-sdk-mock` as well.

We can use the following pattern to mock an error response. This sample uses S3.

  

```typescript
// File: /app/service/s3-service.ts
import { S3 } from 'aws-sdk';

/**
 * Retrieves a file from an S3 Bucket as an S3 Object
 * @param Bucket The S3 bucket to fetch from
 * @param Key The name + path of the file to fetch
 * @returns The file as an S3 Object Promise
 */
export const getFile = async (Bucket: string, Key: string) =>
    new S3()
        .getObject({
            Bucket,
            Key,
        })
        .promise();


```

  

```typescript
// File: /app/service/s3-wrapper-service.ts
import * as s3 from './s3-service';
import type { PromiseResult } from 'aws-sdk/lib/request';
import type { AWSError, S3 } from 'aws-sdk';

/**
 * Fetches the contents of a file from an S3 bucket as a string. Returns an empty string if the file doesn't exist. Throws an {@link AWSError} on any other failure.
 * @param bucketName The name of the S3 bucket to read from
 * @param key The file name + path to read.
 * @returns The body of the file as a string. If the file doesn't exist, returns an empty string. If there is another error, throws it.
 */
export async function fetchFromS3(bucketName: string, key: string): Promise<string> {
    let file: PromiseResult<S3.GetObjectOutput, AWSError>;

    try {
        file = await s3.getFile(bucketName, key);
    } catch (e) {
        const error = e as AWSError;

        // If no files exists - just treat it as an empty file
        if (error.code === 'NoSuchKey') {
            return '';
        }
        throw e;
    }
    if (!file.Body) {
        // If the file doesn't exist - just treat it as an empty one
        return '';
    }
    return file.Body.toString();
}
```

  

```typescript
// File: /test/s3-wrapper-service.test.ts
import * as s3 from 'app/service/s3-service';
import { fetchFromS3 } from 'app/service/s3-wrapper-service';
import type { AWSError } from 'aws-sdk';

jest.mock('app/service/s3-service');

describe('fetchFromS3', () => {
    it('Returns an empty string if S3 returned `NoSuchKey` as an error', async () => {
        const noSuchKeyError: AWSError = {
            code: 'NoSuchKey',
            message: 'NoSuchKey error',
            name: 'No Such Key error or something',
            time: new Date(),
        };
        (s3.getFile as jest.Mock).mockRejectedValue(noSuchKeyError);
        const result = await fetchFromS3(process.env.DH_MIRROR_BUCKET!, 'testfile.csv');
        expect(result).toEqual('');
    });
    
    it("Throws S3 errors that aren't `NoSuchKey`", async () => {
      const otherError: AWSError = {
          code: 'ServiceUnavailable',
          message: 'need more kfc 21 piece buckets',
          name: 'ServiceUnavailable',
          time: new Date(),
      };
      (s3.getFile as jest.Mock).mockRejectedValue(otherError);
    
      try {
          await fetchFromS3('test-bucket', 'current.json');
          fail('Expected to throw but did not');
      } catch (e) {
          expect(s3.getFile).toBeCalledWith('test-bucket', 'current.json');
          expect(e).toBe(otherError);
      }
    });
});
```

Note the `try/fail/catch` block in the second `it()` statement.

  

### Mocking AWS PromiseResult

Occasionally, there is the use case in the AWS SDK to inspect the raw `$response` object that AWS returns inside some SDK Result. This contains errors and the raw HTTP response object.

Unfortunately, doing this in application code means that you also need to mock it in your AWS Mocks.

Below is an example of this working correctly for KMS:

  

```typescript
// /test/mocks/aws-result.ts
import AWS from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';

/** This produces a valid AWS PromiseResult that a mock funtion could return */
export function awsSuccessPromiseResult<T>(resp: T): PromiseResult<T, AWS.AWSError> {
	return {
		...resp,
		$response: {
			data: resp,
			hasNextPage: () => {
				return false;
			},
			requestId: '',
			redirectCount: 0,
			retryCount: 0,
			nextPage: () => {},
			error: undefined,
			httpResponse: {
				body: '',
				headers: {},
				statusCode: 200,
				statusMessage: 'OK',
				streaming: false,
				createUnbufferedStream: () => {
					return {};
				},
			},
		},
	};
}

/** This produces a valid AWS Error PromiseResult response */
export function awsErrorPromiseResult(): PromiseResult<any, AWS.AWSError> {
	const otherError: AWS.AWSError = {
		code: 'ServiceUnavailable',
		message: 'need more kfc 21 piece buckets',
		name: 'ServiceUnavailable',
		time: new Date(),
	};
	return {
		$response: {
			data: undefined,
			hasNextPage: () => {
				return false;
			},
			requestId: '',
			redirectCount: 0,
			retryCount: 0,
			nextPage: () => {},
			error: otherError,
			httpResponse: {
				body: '',
				headers: {},
				statusCode: 200,
				statusMessage: 'OK',
				streaming: false,
				createUnbufferedStream: () => {
					return {};
				},
			},
		},
	};
}
```

  

---

```typescript
// /test/jwt-service.test.ts
import jwt from 'jsonwebtoken';
import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import KMS from 'aws-sdk/clients/kms';
import { PromiseResult } from 'aws-sdk/lib/request';
import { awsSuccessPromiseResult } from './mocks/aws-results';

describe('JwtService', () => {
	let mockSign;
	beforeAll(() => {
		mockSign = jest.fn((req: KMS.SignRequest): PromiseResult<KMS.SignResponse, AWS.AWSError> => {
			const resp = {
				KeyId: req.KeyId,
				SigningAlgorithm: req.SigningAlgorithm,
				Signature: 'ThisSignatureVerifiesThatTheJwtIsToooootallyLegit',
			};
			return awsSuccessPromiseResult(resp);
		});

		// Overwriting KMS.sign()
		AWSMock.setSDKInstance(AWS);
		AWSMock.mock('KMS', 'sign', (params, callback) => {
			callback(undefined, mockSign(params));
		});
	});

	afterAll(() => {
		// Restore KMS
		AWSMock.restore('KMS', 'sign');
		jest.resetAllMocks();
	});

	describe('signJwt', () => {
		afterEach(() => {
			mockSign.mockClear();
		});

		it('Mocks the signature correctly', async () => {
			const response = await new KMS().sign({
			    Message: '{"recordA":"A very transgender value", ...<other JWT stuff>}',
			    KeyId: '99999',
			    SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256',
			    MessageType: 'RAW',
		    })
		    .promise();
			console.log(response);
			console.log(JSON.stringify(jwt.decode(response)));
			expect(true).toBeTruthy();
		});
	});
});
```

  

---
