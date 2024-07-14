---
title: "Part 4: Appendix"
date: 2024-07-14T20:00:00+10:00
lastmod: 2024-07-14T21:00:00+10:00
summary: "Stuff I wanted to mention but was unsure where to put it"
tags: ['Jest', 'Testing', 'Unit Tests', 'NodeJS', 'Javascript', 'Mocking', 'Stubbing', "Spy"]
series: ['Introduction to Jest']
---

Using Jest with VSCode
----------------------

The main Jest plugin for VSCode is here: [Jest - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest)

  

There is a config setting to turn off running tests automatically on save - add the following line to your `settings.json` file:

```plain
"jest.autoRun": "off",
```

  

The plugin is known to not work so well with yarn workspaces. In this case, it may be easier to simply use the CLI commands:

[Jest CLI Options · Jest (jestjs.io)](https://jestjs.io/docs/cli)

Hacks
-----

### Boolean logic for Expect statements

We can write a fairly comprehensive test by using multiple `expect` statements in one test. ie:

```typescript
it('Does 2 things', () => {
  expect(thingOne).toBeTruthy();
  expect(thingTwo).toBeTruthy();
});
```

This gives us the equivalent of a logical AND statement - if anything fails, the whole test fails.

Jest, however, doesn't support logical OR on first inspection, ie:

```typescript
it('Does one of 2 things', () => {
  expect(result).toBe(thingOne jest.or thingTwo);
});
```

This makes sense somewhat, a unit really shouldn't have 2 equally valid outputs for 1 input.

  

However occasionally we might test something where it is helpful - like testing a mock where the call order doesn't matter.

  

In this case we can wrap the `expect` in a `try/catch` , and it will take either option. Example:

  

```typescript
it('Calls the mock service with one of 2 arg sets', () => {
  try{
    expect(mockService).toBeCalledWith({ argA: 'myArgA', argB: 'myArgB' });
  } catch {
    expect(mockService).toBeCalledWith({ argA: 'yourArgA', argB: 'yourArgB' });
  }
});
```

In this case, only 1 of the expect statements is required for the test to pass.

  

Samples
-------

#### Expressiveness

Here is a very expressive sample for a date/time validation function.

Using such detailed samples allows us to find the exact places and edge cases that a service might fail if adjusted.

```typescript
describe('validateDateTimeString', () => {
    describe('Date strings', () => {
        it('Accepts a well formatted string', () => {
            expect(validateDateTimeString('01/01/2021', 'dd/MM/yyyy')).toBeTruthy();
        });

        it("Rejects a string that requires leading zeroes, but doesn't supply them", () => {
            expect(validateDateTimeString('1/1/2021', 'dd/MM/yyyy')).toBeFalsy();
        });

        it('Rejects a date where the year position is not where it is expected', () => {
            expect(validateDateTimeString('2021/01/01', 'dd/MM/yyyy')).toBeFalsy();
        });

        it('Rejects a date where the day value is larger than can be in any month', () => {
            expect(validateDateTimeString('90/01/2021', 'dd/MM/yyyy')).toBeFalsy();
        });

        it('Rejects a date where the month value is larger than 12', () => {
            expect(validateDateTimeString('01/90/2021', 'dd/MM/yyyy')).toBeFalsy();
        });

        it('Rejects a date where the year value is longer than the required four digits', () => {
            expect(validateDateTimeString('01/01/12021', 'dd/MM/yyyy')).toBeFalsy();
        });

        it('Rejects a date where the day value (40) is larger than can be for a given month', () => {
            expect(validateDateTimeString('40/08/2021', 'dd/MM/yyyy')).toBeFalsy();
        });

        it('Rejects a date where the day value is in the months column (ie - American formatting)', () => {
            expect(validateDateTimeString('04/30/2021', 'dd/MM/yyyy')).toBeFalsy();
        });

        it('Accepts a date where the day value (30) is within the given month (April)', () => {
            expect(validateDateTimeString('30/04/2021', 'dd/MM/yyyy')).toBeTruthy();
        });

        it('Rejects a date where the day value (31) is larger than can be for a given month (April)', () => {
            expect(validateDateTimeString('31/04/2021', 'dd/MM/yyyy')).toBeFalsy();
        });

        it('Accepts a date where the day value (31) is within the given month (January)', () => {
            expect(validateDateTimeString('31/01/2021', 'dd/MM/yyyy')).toBeTruthy();
        });

        it('Rejects a date where the day value (32) is larger than can be for a given month (January)', () => {
            expect(validateDateTimeString('32/01/2021', 'dd/MM/yyyy')).toBeFalsy();
        });

        it('Accepts a date where the day value (28) exists for the given February (2022)', () => {
            expect(validateDateTimeString('28/02/2022', 'dd/MM/yyyy')).toBeTruthy();
        });

        it('Rejects a date where the day value (29) does not exist for the given February (2022)', () => {
            expect(validateDateTimeString('29/02/2022', 'dd/MM/yyyy')).toBeFalsy();
        });

        it('Accepts a date where the day value (29) exists for the given February (2024)', () => {
            expect(validateDateTimeString('29/02/2024', 'dd/MM/yyyy')).toBeTruthy();
        });

        it('Rejects a date where the day value (30) does not exist for the given February (2024)', () => {
            expect(validateDateTimeString('30/02/2024', 'dd/MM/yyyy')).toBeFalsy();
        });

        it('Accepts a date where the day value (28) exists for the given February (2100)', () => {
            expect(validateDateTimeString('28/02/2100', 'dd/MM/yyyy')).toBeTruthy();
        });

        it('Rejects a date where the day value (29) does not exist for the given February (2100)', () => {
            expect(validateDateTimeString('29/02/2100', 'dd/MM/yyyy')).toBeFalsy();
        });

        it('Rejects a date that is given in English instead of the required date string', () => {
            expect(validateDateTimeString('1st of January 2021', 'dd/MM/yyyy')).toBeFalsy();
        });
    });

    describe('Time strings', () => {
        it('Accepts a time string that is formatted correctly for the given format', () => {
            expect(validateDateTimeString('01:01:01', 'HH:mm:ss')).toBeTruthy();
        });

        it('Rejects a time with an hour value that is too high', () => {
            expect(validateDateTimeString('60:01:01', 'HH:mm:ss')).toBeFalsy();
        });

        it('Rejects a time with a minute value that is too high', () => {
            expect(validateDateTimeString('01:90:01', 'HH:mm:ss')).toBeFalsy();
        });

        it('Rejects a time with a second value that is too high', () => {
            expect(validateDateTimeString('01:01:90', 'HH:mm:ss')).toBeFalsy();
        });

        it('Rejects a time with a value written in english, instead of the required date format', () => {
            expect(validateDateTimeString('midnight', 'HH:mm:ss')).toBeFalsy();
        });
    });
});


```
