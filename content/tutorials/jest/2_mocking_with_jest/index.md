---
title: "Part 2: Mocking with Jest"
date: 2024-07-14T18:00:00+10:00
lastmod: 2024-07-14T19:00:00+10:00
summary: "How to use Jest to Mock, Stub and Spy on functions"
tags: ['Jest', 'Testing', 'Unit Tests', 'NodeJS', 'Javascript', 'Mocking', 'Stubbing', "Spy"]
series: ['Introduction to Jest']
---

## Testing Services with Jest

### Mock vs Stub vs Spy

Most testing reference documents will discuss some combination of Mocking, Stubbing and Spying as a tool for testing services. However, terminology has become muddled as more and more digital ink has been spilled, and frameworks have been introduced.

Let's briefly define the above terms.

  

#### Mocking

Mocking is when you replace the implementation of a function, service, or other coroutine with a no-op operation, and return null or 0. Often you will use this to remove some external dependency like a HTTP call, or a send to a logging framework. It can also be used to replace some expensive call with a no-op.

Technically speaking, mocks don't do any calculation or return any real implementation/data. They're the dumbest possible unit, and we use them to replace side-effects.

  

#### Stubbing

Stubbing is like mocking, but your replacement function might have a tiny amount of brains to it, and might return actual, useful data. It simulates some behaviour.

This article will use Mock and Stub interchangeably, as `jest` doesn't draw any real distinction between them (apart from mocks are not given implementations by default).

  

#### Spying

Spying, unlike mocking or stubbing, doesn't replace the default implementation of a piece of code (at least, unless you tell it to). Generally you would use spying to check that a method is being called with the right parameters, and the correct number of times.

  

### A Mock/Stub Example

Why would you want to mock or stub a function? In essence it comes down to the structure of your unit test.

Typically, each test should be looking to verify one specific piece of behaviour, eg: `The SMS Service sends one SMS to each unique number in the recipient list` .

This description implies 2 things:

*   The service is responsible for de-duplicating the recipient list
*   This service needs to call its SMS Provider once for each list item after de-duplication.

Realistically, we don't care who the SMS provider is, or how they are told to send an SMS, those can be handled downstream or in integration testing.

We probably don't want to be sending real SMSes out in this case though! So let's mock/stub the SMS Provider.

  

We may or may not care, in this tests case, what the response from the SMS Provider call is. If we do, we would stub the function to return some reasonable response, and if we don't, a mock is sufficient.

  

It can also be used to stand in for long running compute functions that we don't necessarily want to run every time we run `yarn test` .

  

For example, if we have a file like this:

```typescript
// /app/service/send-sms.ts
import { sendSms } from 'my_sms_library';

/**
 * Returns true when we successfully send an sms message
 */
export function sendSmsFromMe(destNumber: string, message: string): boolean {
  // Maybe do some validation on the destinationNumber

  try {
    const smsResponse = sendSms({
      sendingNumber: 'myNumber',
      destinationNumber: destNumber,
      message: message,
      apiKey: '<some precofigured thing>'
    });

    if(smsResponse.code === 200) {
      return true;
    }
  } catch { 
    return false; 
  }
  return false;
}
```

  

We may want to pretend to call `sendSms` instead of actually calling it (so we don't send a real sms out or spam the sms provider with junk).

However, Good Unit Testing principles dictate that we should make sure that `sendSmsFromMe` returns the correct response when `sendSms` gives us an error or something, so let's just pretend we own `sendSms` instead.

  

Below is the code for the minimal mock of the function where we tell it what we expect (I haven't tested this though whoops):

```typescript
// /test/service/send-sms.test.ts
import { sendSms } from 'my_sms_library';
import { sendSmsFromMe } from '/app/service/send-sms.ts';

jest.mock('my_sms_library');
// You can also specify the mock type, but I haven't here.
const mockedSendSms = sendSms as jest.Mock;

describe('send-sms', () => {
  describe('sendSmsFromMe', () => {

    afterEach(() => {
      // Remove any lingering metadata about the mock
      mockedSendSms.clearMock();
    });

    it('Returns true when the service returns a 200 code', () => {
      mockedSendSms.mockResolvedValue({ code: 200, messageId: '123445315' });
      expect(sendSmsFromMe('<my number>', 'Hello stranger!')).toBe(true);
    });

    it('Returns false when the service returns something other than a 200 code', () => {
      mockedSendSms.mockResolvedValue({ code: 400, error: `That didn't work!` });
      expect(sendSmsFromMe('<my number>', 'Hello stranger!')).toBe(false);
    });

    it('Returns false when the service throws an error', () => {
      mockedSendSms.mockImplementation(() => {throw new Error(`Hey! I don't like that!`)});
      expect(sendSmsFromMe('<my number>', 'Hello stranger!')).toBe(false);
    });
  });
});
```

We can also interrogate the mock to see how many times it was called, and with what arguments.

It'd not be good for say, an SMS Api to accidentally get called multiple times to send 1 SMS, so this can be helpful to test.

  

```typescript
// /test/service/send-sms.test.ts
import { sendSms } from 'my_sms_library';
import { sendSmsFromMe } from '/app/service/send-sms.ts';

jest.mock('my_sms_library');
// You can also specify the mock type, but I haven't here.
const mockedSendSms = sendSms as jest.Mock;

describe('send-sms', () => {
  describe('sendSmsFromMe', () => {

    afterEach(() => {
      // Remove any lingering metadata about the mock
      mockedSendSms.clearMock();
    });

    it('Returns true when the service returns a 200 code', () => {
      mockedSendSms.mockResolvedValue({ code: 200, messageId: '123445315' });
      expect(sendSmsFromMe('<my number>', 'Hello stranger!')).toBe(true);
    });

    it('Only calls the Sms Library once per sms request', () => {
      mockedSendSms.mockResolvedValue({ code: 200, messageId: '123445315' });
      sendSmsFromMe('<my number>', 'Hello stranger!');
      expect(mockedSendSms).toBeCalledTimes(1);
    });

    // You'd probably pre-configure these in some kind of config file, and you might keep a dummy copy in your repo for this particular test.
    it('Adds the api key and my number as the source!', () => {
      mockedSendSms.mockResolvedValue({ code: 200, messageId: '123445315' });
      sendSmsFromMe('<my number>', 'Hello stranger!');
      expect(mockedSendSms).toBeCalledWith({
        sendingNumber: 'myNumber',
        destinationNumber: '<my number>',
        message: 'Hello stranger!',
        apiKey: '<some precofigured thing>'
      });
    });

    // ... other tests redacted
  });
});
```

  

Don't forget you can use the scope of your containing block to reduce the number of strings you have to retype, or the number of similar mocks you need to set up!

  

---

### Spying on functions with Jest

Okay, so we can see the obvious use case for mocking - we don't want to call an AWS Service for example, but maybe we are testing something that handles some data it might return.

But when would we use spying? And how do we call it in Jest?

  

Generally, spying is used when we don't want to change the implementation of a class, but we do care about how it's being used.

  

Here's some generic examples where you'd maybe want to use a spy over a mock:

*   I need to test my http client service is only sending one request when I call it, and is not meaningfully modifying the responses. I'd use a Spy + a tool like Nock to create generic test cases.

When testing the consumers of this service, I will write a stub for this service.

  

*   I have some publisher/subscriber model, and I really need to make sure the subscriber is receiving notifications in specific circumstances (ie: I have a checkbox checked).

I don't want to mock this subscriber particularly, but I need to verify that the subscription and unsubscription is actually working as I intended.

  

### Mocking Singletons with Jest

Singletons are a common design pattern in a reasonable amount of software. The typical case is that you have some configuration data that you want to use in your service that you don't want to retrieve or parse each time the service is created.

  

Unfortunately, since singletons give you a weird call pattern, mocking their functions is a bit of a pain.

  

One solution is to refactor the singleton service to be provided via [dependency injection](https://app.clickup.com/6943244/v/dc/6kwgc-1766/6kwgc-72782), but this does add some amount of structural overhead to your application, may require learning a framework, and otherwise requires justifying the work to actually implement.

  

We can, however, mock the singleton functions using Jest Spies.

  

Wait! I just said that spies don't change their target's behaviour!

Well... They can in Jest! Probably because they can in other mocking frameworks, and Jest thinks it wants to be the testing framework to end all the rest.

It's a good thing too, since the way that regular jest mocking works isn't really conducive to dealing with class instances.

  

Take for example the following service and consumer, and let's say we want to test the consumer works properly.

  

```typescript
// src/service/db-service.ts
export class DbService {
	private static instance: DbService;
	public static getInstance(): DbService {
		if (this.instance == null) {
			this.instance = new DbService();
		}
		return this.instance;
	}

	private connectionString: string;

	private constructor() {
		if (!process.env.DB_CONNECTION_STRING) {
			throw new Error('process.env.DB_CONNECTION_STRING not set');
		}
		this.connectionString = process.env.DB_CONNECTION_STRING;
	}

    /** Retrieves the record with the given ID from the database */
	async getRecord(recordId: string): Promise<{ id: string; value: string }> {
		// Actual implementation removed because we don't care, let's return some random string for now.
		return { id: recordId, value: 'Hello World!' };
	}
}
```

  

```typescript
// src/service/email-service.ts

/** Retrieves a given record from the DB and renders it as HTML */
export async function renderRecordAsHtml(recordId: string): Promise<string> {
	try {
		const record = await DbService.getInstance().getRecord(recordId);
		return `<!Doctype html><html><body><h1>${record.id}</h1><p>${record.value}</p></body></html>`;
	} catch (e) {
		throw new Error('Something went horribly wrong');
	}
}
```

  

```typescript
// test/service/email-service.ts

describe('renderRecordAsHtml', () => {
    const mockRecordValue1 = 'Our own special record value!';
	let dbServiceInstance: DbService;
	let dbServiceSpy: jest.SpyInstance;

	beforeAll(() => {
		process.env.DB_CONNECTION_STRING = 'blah!';
		// Get the service *before* running the suite, as we need to use the same class instance to mock it.
		dbServiceInstance = DbService.getInstance();

		// Now let's mock it
		dbServiceSpy = jest.spyOn(dbServiceInstance, 'getRecord');
		dbServiceSpy.mockImplementation((recordId: string) => {
			return { id: recordId, value: mockRecordValue1 };
		});
	});

	afterEach(() => {
		dbServiceSpy.mockClear();
	});

	afterAll(() => {
		delete process.env.DB_CONNECTION_STRING;
		jest.resetAllMocks();
	});

	// We use our default (set in beforeAll()) if we don't override it
	it('Inserts the record ID into a H1 tag', async () => {
		const recordAsHtml = await renderRecordAsHtml('314');
		expect(recordAsHtml).toEqual(expect.stringContaining(`<h1>314</h1>`));
	});

	it('Inserts the value inside a paragraph tag', async () => {
		const recordAsHtml = await renderRecordAsHtml('314');
		expect(recordAsHtml).toEqual(expect.stringContaining(`<p>${mockRecordValue1}</p>`));
	});

	// Or we can override it for this specific test set!
	it('Inserts the record ID into a H1 tag after overriding the implementation', async () => {
		const mockIdOnce = 'This is a fake ID!';
		const mockRecordOnce = 'This is our own record :p';
		dbServiceSpy.mockImplementationOnce(() => {
			return { id: mockIdOnce, value: mockRecordOnce };
		});

		const recordAsHtml = await renderRecordAsHtml('314');
		expect(recordAsHtml).toEqual(expect.stringContaining(`<h1>${mockIdOnce}</h1>`));
	});

	// But this one still uses the default implementation!
	it('Inserts the value inside a paragraph tag', async () => {
		const recordAsHtml = await renderRecordAsHtml('314');
		expect(recordAsHtml).toEqual(expect.stringContaining(`<p>${mockRecordValue1}</p>`));
	});

	// We can even make it throw an error!
	it('Throws ~Something went horribly wrong~ if the record is not found', async () => {
		dbServiceSpy.mockImplementationOnce(() => {
			throw new Error('Heck!');
		});

		try {
			const recordAsHtml = await renderRecordAsHtml('314');
			fail('Expected to throw error "Something went horribly wrong", but did not');
		} catch (e) {
			expect(e).not.toBeNull();
			expect(e).toEqual(new Error('Something went horribly wrong'));
			expect(e).not.toEqual(new Error('Heck!'));
		}
	});
});
```

The above will correctly mock the implementation of the `DbService`, but we still need to know the implementation details of `DbService.getInstance()`.

  

In particular, if you are testing multiple functions inside `email-service.ts` , you will need to allow a singleton reset so you aren't sharing state between tests, or structure your tests such that all the mocking is done before all the suites run. This is pretty annoying IMO.
