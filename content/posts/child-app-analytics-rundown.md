---
title: "Child App Analytics - Matomo vs Countly"
date: 2023-12-11T13:09:24+11:00
lastmod: 2024-07-14T18:00:00+11:00
summary: "Adding Analytics to my Blogsite"
tags: ['Countly', 'Matomo', 'Analytics', 'Privacy', 'Child Apps', 'Children']
---

## July 2024 Update - Removing Countly

Hiya - a quick update about 6 months on - I've removed the Countly integration from the site.

I'm not fully sure I ever set it up correctly, I was getting some CORS/CSP errors later on so I'm not sure 
I ever fully evaluated it properly.
This probably would have been fine if not for the below noted issue with using Countly on a Celeron Processor,
since I never would have needed to use different origins anyway but oh well.

The Matomo Analytics will stay (it's handy to see if people are looking at the site sometimes!).

Anyway, back to the original post:

## Child App Analytics - Matomo vs Countly

Recently at work, we started looking into adding Analytics to the family entertainment products we create for clients.

From the client's perspective, this is a no-brained request on surface level. 

Of course you want to know things like:

- How many users you have at any given time?
- How long are people staying on your site/app?
- Which "content" are they interacting with?
- Who are our core audience?

But as you collect more data about your audience, the more you come to learn about people - especially the kinds of people drawn to your app or site.
This can become a bit of a responsibility as your knowledge pool grows - especially when your core audience is in fact Children.

The Apple and Google app stores have their own policies on what kind of analytics you can collect, and which vendors are allowed to be used with your app when you're tagging the app as safe for Children.
And to be clear, this is a *good* thing - but it does restrict our options quite a lot.

## What Analytics can't we use?

The Terms of Service are fairly vague, like all Leagalese, in what's allowed. 
"Third Party" vendors are out unless they're marked as safe for Children. A valid list isn't provided anywhere that I can find, but we can assume that they're scanning for dodgy third party vendors that are likely to re-sell your analytics data to the highest bidder, potentially without your knowledge.

Y'know, like Google.

## What Analytics *are* safe?

Self-hosted and self-designed systems where you have full data control seem to be allowed no worries.

As far as I could tell on Apple Developer forums, Firebase Analytics would also be allowed if you turned off the Advertiser ID tracking - though part of me really questions how safe an option that is with Google being as they are in 2023 (and now owning Firebase).
It'd be a real shock to your brand's image if you were caught up in some Google-Sold-Our-App's-Analytics-Data type scandal by using Firebase just because it's easiest.

We could write our own system I guess, store it in our own DB and query it with like Google BigQuery, PowerBI, or AWS' data pipeline of 3 different apps.
But that is a notable amount of work that it doesn't make sense for an Agency to reproduce I think - someone must have already made the metaphorical wheel here.

## My Research so far

I had a look around for existing products, and honestly there wasn't a lot that reaaally seemed to market themselves as safe for the children's market.

Most analytics solutions seem to be:

- Made or bankrolled by VC firms (who will demand their money back at any cost including reselling your data)
- Marketed at product managers or C-level execs around growing your brand and revenue
- Looking to be a drop-in replacement for Google Analytics - which isn't really what I desired for a new app.

My findings ended in 2 major contenders:

### Countly Analytics

https://countly.com/

Countly was the first product that really advertised themselves to me as a place vying for the Children's market, via [this blog post](https://countly.com/blog/data-privacy-for-kids-apps-what-parents-and-developers-need-to-know). That and a few Apple Developer Forum threads recommended them

Part of my fear when bidding for work and recommending tech before we start (that I hadn't really tested mind you) is that they would be rejected by an app store once we had built the thing and signed all the potential Enterprise Edition contracts if required.

The children's entertainment space doesn't get a lot of highlighting in tech or B2B marketing, so seeing it pop up in a search was pretty well appreciated.
Also their features list was pretty extensive, and hit a few highlights in the RFP that I was looking at that would mean we could ditch Firebase entirely, so I was in like Flynn.

It's a tool based in NodeJS, and pushes all its data to MongoDB, which seems sensible to me.

One other cool thing Countly seems to market themselves with is that they can do analytics for all platforms, including games platforms like Unity, Native apps and Websites.

### Matomo Analytics

https://matomo.org/

Matomo was recommended to me by a colleague who had done some research on analytics tools some years prior.

The feature list looked vaguely comparable to Countly, and it probably would have worked out a little cheaper for the price.

It's based on PHP and MySQL, which is a classic combination.
Looking through their installation docs, I get the feeling it's designed to be run on a classical server as opposed to say, on Kubernetes.
It's totally fine, but it's not an architecture we are gravitating towards at work so much these days.

Matomo supposedly does support analytics for native apps, though I haven't tested it or anything yet.

## Okay so why this blog post?

I've done the unthinkable and decided to install _two_ analytics solutions into this blog site, so I can compare and contrast how each one works and what you get out of it with absolutely no customisation.

As such, I can recount my installation experience, and tell you how that feels so far.

Note that my home lab is running on UnRaid, with an Intel Celeron based CPU, and this will become relevant later.

### Matomo Installation

UnRaid's Community Apps repositories has a Matomo Template already listed in Ibracorp's system, so installation was a breeze.

I already had a MariaDB instance running, since it was being used by other containers, and my reverse proxy solution of choice, SWAG, already had an integration set up, so I could just set it up using SWAG's autoproxy mod.

From there, it was as simple as creating a user to log into the admin interface, entering my domain name to track, and then copying the supplied HTML code segment into the `layouts/partials/analytics.html` file for my Hugo/Congo template.

I could even see that it was working with the localhost testing server on my machine as I was writing, which is neat.
One thing I found by default is that the analytics admin panel doesn't distinguish that I was using `localhost` as the origin domain for events, rather than `phalanxhead.dev`, so that is funky.
I guess if you needed multi-environment analytics for testing, etc, you'd set up separate "Websites" instead of trying to segment based on environment.
That may sound obvious to you, but if you've used observability tooling like Datadog or Sentry before, it's somewhat different to how you would set up monitoring there.

### Countly Installation.

Unlike Matomo, there's no UnRaid Community Apps template for Countly - at least not at time of writing.

They do offer a docker-compose file for us to consume, so we can theoretically pull that apart and recreate the containers we need (which is multiple - Countly has a separate Frontend container to the main API).

The first hurdle I found is that MongoDB 5+ is not supported on CPUs that don't have `AVX` instruction sets.
Seems that most *Core ix* CPUs from Intel do have this support, but Pentium and Celeron chips do not.
Also Countly requires MongoDB 6+, so uuuuh... Beans.

Okay no problem, MongoDB Atlas should work fine for our use case - hell it's free for low traffic, which I have (this blog isn't insanely popular lol, and part of wanting Analytics is to find out if it's worth even dedicating time to expanding it).

Countly's docs don't really give a clear one-liner explanation for setting up Countly with MongoDB Atlas, they have a "Contact Us" suggestion, which is annoying at 9pm on a Sunday.
Through some messing around, I realised that you need to use `COUNTLY_CONFIG__MONGODB` as the environment variable for the connection string, instead of the supplied `COUNTLY_CONFIG__MONGODB_HOST` variable in their Docker-Compose setup (which connects to a self-hosted mongo instance in the same network).
I'm not a MongoDB expert, so while this may seem obvious to some, it wasn't to me lol.

Okay so now I had it installed (finally), and I could access the Frontend container via the `6001` port it said I should expose, and I tried to create a new Site to track and it just... sat there.
At this point I kinda gave up and went to bed, I was getting a 404 on their internal check call. I assume it has something to do with their 2-container split thing just not quite making sense in my head.

The other thing they have in their docker-compose file is an nginx container and I have no idea how that's supposed to be configured, or honestly how the domains for each container are supposed to be wired.
Since it's not a LinuxServer container set, it's not supported by SWAG Autoproxy either, so I'd have to configure SWAG's nginx layer manually and who can be bothered.

Given Countly was my preferred of the two products when pitching internally, I was a tiny bit miffed - even if half of the problems really weren't the product's fault (and partly are due to my laziness of not reading the docs)

Anyway this morning I decided to sign up for Countly Flex instead, and see how that would run.

You have to pay for "Tier 1" to get things like custom domain names, and some of the neater features, which is not something I want to do right now frankly, but once I had signed up, it was pretty easy to set up tbh.

The only real trick is that it was less insistent on how I should embed code in the blog site to send events to the server - I ended up needing to read the docs to find the correct code.
Matomo just gave me a snippet by default and I am not at all mad about it, but it's not really a big deal tbh.

Anyway, now that I've browsed both admin panels, Matomo seems to have a few more active tabs by default, but also embeds links for the plugins you may not have paid for yet, which I personally find a little annoying.
Countly just hides features you haven't paid for, and you can administer all that side via the Flex portal instead.
I gotta say, I kinda prefer it that way, especially for tools I'd be handing over to a Client, it feels a little more polished.

## Conclusion

Anyway that's my rant and also my minor disclosure that I'm now taking analytics info so I can get an actually accurate visitor count here.
I'll be most interested if it ends up that I get different numbers of visitors from the two tools, though I don't expect that.

Ultimately, I'm not too caring in which tool I end up liking better - the main thing is that we can safely take some user analytics without being evil or careless about it, and even better if I don't need to write my own tool.
