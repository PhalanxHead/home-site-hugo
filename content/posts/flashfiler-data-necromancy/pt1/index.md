---
title: "Part 1: What's all the Fuss?"
date: 2022-07-10T12:00:00+10:00
lastmod: 2022-07-12T12:00:00+10:00
summary: "A quick background about why I even care about FlashFiler or NexusDB"
tags: ['FlashFiler', 'FF2', 'Delphi', 'NexusDB', 'FarmOS', 'Farm']
series: ['FlashFiler Data Necromancy']
---

## The Backstory
Semi-well-known fact about me (since I never shut up about it), is that my family owns a medium sized cropping farm.
It has been a big part of my life since I was very small. 
Like most small businesses, it generates a fair chungus of a paper trail, some of which we have even been able to digitise over time!

One of the substantial parts of the paperwork we keep is paddock records, essentially writing down what operations we take on each paddock, be it sowing, spraying, harvesting or some other manual operation.
I'd dare say my Grandpa would have kept paper records for most of his life, and he still keeps fairly well-documented diaries of his portion of the business, but a much younger version of my Dad decided to start digitising a lot of the rates and records back in the 90s.

Fast forward to the early-ish 2000s, the Microsoft Access program he had been using gets superseded (in our operation, at least) by a program called Concepts Rural, a product made by a now-defunct New Zealand company. The license for the software was like $600 or something, but it seemed to do everything we wanted, so it became an important part of our cropping cycle.

One of the downsides to the license is that -- despite being a fairly specialised piece of tech -- you needed a unique license key per-computer to run it on. 

{{< alert "skull-crossbones" >}}
DRM. Don't we love it?
{{< /alert >}}

Since the software is so expensive, and dealing with sales is an annoyingly unnecessary process if your computer is working fine, we simply didn't think to ask the question "what happens when this PC dies?" for a long while. 
That is, until the old Windows XP machine it was running on got itself a little scareware virus when I was about 13, and we finally realised we had a bit of a ticking time-bomb on our hands. A minor panic later, we discovered that the company that made the software either no longer supported it, or flat out didn't exist as an entity anymore, I don't remember which. 

We unfortunately had the extra issue that we couldn't just extract the contents of the program's internal database into a currently-supported tool. 
A proprietary DB system isn't really something that's easy to adapt to your current design, unless you want to pay big money to a consultant. It happens in the business world all the time, but a small family farm really can't justify the expense.

The program, fortunately, did output some kind of zip-file backup, but the extent of my deeper programming knowledge at the time was installing Minecraft mods, hosting a Minecraft Server (yeah I was that kid), and the saddest GameMaker attempts imaginable.
So, like any small business owners, we just stopped using that PC for anything but paddock records, detached it from the internet, hoping to put off the problem of migrating to a new system for as long as possible.

Unfortunately, if transition has taught me anything, it's that ignoring your problems and hoping they go away simply makes everyone involved cry more when they inevitably surface.

## So what now?

This tiny little time-bomb has been annoying me for nearly a decade now. The computer still runs, but trusting a Dell desktop running Windows XP that's more than 15 years old for mission-critical software is pretty ambitious. 
At one point I managed to convince Dad to buy and install a RAID controller so we can at least attempt to save the thing if the HDD dies, but this isn't really a long-term solution.
Fortunately, I know a lot more now than when I was a teenager, I've even done some of my own consulting!
I also now own a NAS I can host things on, so I considered just making my own replacement for Concepts Rural.

Unfortunately, I know myself, and my ADHD brain will _definitely_ not let me write a whole software project in my downtime, even if I was committed to never having a weekend again. So the next best option is to find some other product we can translate to.
There's a number of solutions around, but I decided to stick to open source software, so we will hopefully never run into the vendor tie-in and company death problems again. 
I can host it on my own machine, it only costs me the time I'm willing to put into it, and we aren't paying John Deere for the privilege of them selling our data to whoever they decide they like this week. Or just straight back to us, really.

I decided to go with [FarmOS](https://farmos.org/), since they seemed to have the most complete solution around, even if it's not perfectly what we wanted. I guess I can always modify it if I want to do anything custom (which I'll likely blog about at some point too :stuck_out_tongue_winking_eye:)
I can't say I'm the world's biggest fan of PHP/Drupal, but it's always a thing I can learn I guess.

Now just to extract all the data from the backup files and import it into FarmOS. Shouldn't be too hard! Right?
