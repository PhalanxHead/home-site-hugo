---
title: "Part 3: The Pits of Despair"
date: 2022-07-10T14:00:00+10:00
lastmod: 2022-07-12T12:00:00+10:00
summary: "Why will this project not simply work?"
tags: ['FlashFiler', 'FF2', 'Delphi', 'NexusDB', 'FarmOS']
series: ['FlashFiler Data Necromancy']
---

## You can try to be too clever for your own good

Once upon a time, I remember reading something about SQL Server being able to connect to an ODBC Data source in order to make the thing queryable.
I figured I'd give that a shot, since the ODBC driver clearly, definitely works properly on my machine.

Initially, I tried to put SQL Server in a docker container, only to learn that SQL Server for Linux doesn't actually support ODBC Source linking, unless it's another SQL Server. Drats.

Just for good measure, I try the official Windows version as well, but I can't seem to get it to connect. My kingdom for a nice error message, instead of simply silently closing the connection window.
Whatever, it's only a few hours wasted.

## Time to bust out the big guns - a script

At this point, I decide to try and write all the table contents out via a NodeJS app, just using the [npm ODBC adapter](https://www.npmjs.com/package/odbc). Unfortunately, the driver tells me that I have an issue with an architecture mismatch.
It does make sense, the driver says it's 32 bit only, and my laptop is 64 bit, like almost every computer made after 2012. 
It's probably also the issue I had with SQL Server, but I am not intending to try to fix that now.

I spend a bit of time trying to work out how to make NodeJS run for 32 bit, but I gave up and decided to try writing a C# program instead. 
I know I can make .NET run in 32-bit mode, so there's a good chance it'll just work :smile: Right?

```cs
// Program.cs
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Odbc;
using System.Threading.Tasks;

namespace ConsoleApp1 {
    class Program {
        public static DataSet GetDataSetFromAdapter(DataSet dataSet, string connectionString, string queryString) {
            using (OdbcConnection connection = new OdbcConnection(connectionString)) {
                OdbcDataAdapter adapter = new OdbcDataAdapter(queryString, connection);
                try {
                    connection.Open();
                    adapter.Fill(dataSet);
                } catch (Exception ex) {
                    Console.WriteLine(ex.Message);
                }
            }
            return dataSet;
        }

        static async Task Main(string[] args)
        {
            string connString = "DSN=ConRDB";
            string queryString = $"Select * FROM ACTIVITY";
            DataSet dataSet = new DataSet('Activity');

            try {
                var ds = GetDataSetFromAdapter(dataSet, connString, queryString);
                string json = JsonConvert.SerializeObject(ds, Formatting.Indented);

                System.IO.File.WriteAllText(@$"C:\Users\user\Desktop\Projects\FarmOSTransfer\TransferProj\DbAsJson\Activity.json", json);
                Console.WriteLine($"Done Reading Activity!");
            }
            catch (Exception e) {
                Console.WriteLine("Got Error! {0}", e.Message);
            }
        }
    }
}
```

Okay simple enough, this should at least tell me if it'll work. It's not a CSV, but that's okay, FarmOS has a client API in TypeScript, so it should be able to read JSON as well.

Here's where something looked a bit off. 
FlashFiler Explorer says that there is over 2000 rows in this database, but there are barely 700 records in the JSON file.
Weirdly, none of the ActivityId fields are more than 1000 in the JSON output. 
Also, C# says it closed with an error, but no error message. Really starting to hate not having nice errors and deep documentation :expressionless:.

Playing around with some SQL sorting, I realise something super frustrating, and a little odd. 
As soon as ODBC gets to a primary key of more than 999, the whole things quits. 

I start to give up hope. 
I have to assume this is a bug with the architecture mismatch, but I don't have access to a 32-bit machine anymore. 
In fact, I'm not sure I've ever owned my own i386 machine, only using my parents'. 
This is becoming a major bummer.

## What if we learned Delphi... and we were both girls?

Welp the FFE program can display all the data. 
Surely it can't be that hard to just add a freakin' CSV exporter, right? I have access to the source code!
I'll just download the Delphi IDE and add a few lines of code, can't be that hard? 
I know heaps of programming languages, what's one more? 
Not that I know anything about Delphi but hey.

Googling indicates that Delphi was once owned by Borland, but is now maintained by [Embarcadero](https://www.embarcadero.com/products/delphi).
I had looked at their site briefly after realising I had access to the FlashFiler source code, but I thought it was odd that I needed to sign up to download an IDE. 
Let's do that anyway.
This is a choice I now am slightly annoyed about, mostly because: wow they spam you with emails! But I'm too lazy to unsubscribe :joy:.

I've since uninstalled RAD Studio, and I really can't be bothered downloading it again for a screengrab, but it gives me major Visual Studio 2011 vibes.

{{< figure 
    src="RadStudio.png" 
    alt="RAD Studio website screengrab"
    caption="RAD Studio? More like I don't want to learn to navigate this today"
>}}

The idea of having a Native UI Builder tool -- in the vein of Visual Basic .NET -- in 2022 intrigues me, but I don't have time for this today, and I don't think there's any demand in my job for it right now. 
I assume the main consumer base for Delphi now is big corpos who have decades of legacy tooling in Delphi, and are afraid of doing change-management to a web-based system.
Maybe if maintaining that appeals to me one day, I'll look into learning it, but not for now.

Anyway, opening the FF2 source in RAD Studio gives me a bunch of missing module errors, and frankly I don't feel like learning a whole new build system today. 
In fact, the whole thing of proprietary code built in a proprietary IDE with a massive standard library both scares and intrigues me.
I know development before 2010 was very much like this, in that you had to use the tool's provided IDE for a lot of stuff. 
Hell, Microsoft is still trying *so* hard to make you do it with VS2022, and it breaks my heart. 
But I really am not a big fan of it. 
I don't really want to do paid, phone-based or email-based support, and forum-based support with 3 decades of legacy really needs a lot of intuition to parse easily.
I know getting help with JS is spread out over decades of forums and blogs, but at least it's all accessible without needing to bother someone, or wait for them to check their emails. If they ever will.

## Surely the road doesn't end here! I've come so far!

I am genuinely stumped at this point. But it has to be a problem I can solve!

Google-fu turns up... not a whole lot to begin with. A few places just linking to the source code.
[This (what I must assume is an)](https://groups.google.com/g/borland.public.delphi.thirdparty-tools/c/DiA3AU9uDV0) email chain (or maybe it's a long-dead forum thread?) is discussing whether FF is a good DB System to use, not knowing it'd be dead just 3 years later.

I realise that I was all of 3 years old when this was being written, and I am beginning to feel more like I'm doing necromancy than data recovery. Maybe not at [Foone's level](https://www.patreon.com/foone) but yikes.

[Oasis Digital seems to have a solution](https://studyres.com/doc/15184506/flashfiler-to-rdbms-data-converter) for the exact issue I'm working on, but there's no trace of it on their site.
I do find the [source for their project on GitHub](https://github.com/OasisDigital/flashfiler-to-rdbms) later, but it's also written in Delphi, and once again, compilation is not something I want to attempt. 
Really wish they had released an executable when they published the whitepaper -- which was like a decade ago. Oh well.

I cannot for the life of me find the link now, but I remember seeing some kind of forum post discussing what the next stages and offerings were, now that TurboPower had gone out of business. 
It discussed NexusDB as a "Phoenix from the Ashes" kind of project, that had really started development as TurboPower lost steam.
It even mentioned that their DB had some kind of migration support for FlashFiler! Geez that'd be nice.

Googling around some more, I see some references to this "FFE.zip" file that might be able to do the CSV export I've been after for ages, but I can't seem to find a way to access it!
I try [This link](https://nexusdb.com/forums/showthread.php?t=12677), which seems to be a host with an in-tact copy of it, but it needs forum access, and I can't seem to get the website to send me an email to sign up for the forum!
[Here's another reference to it](http://www.delphigroups.info/2/85/28865.html), but sadly it seems it's staying dead.

Actually, that fist link looks familiar. Let's explore this NexusDB Site a little more.
