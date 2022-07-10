---
title: "Raw HTML Site"
date: 2022-01-01T14:00:13+10:00
summary: 'A version of this website written in raw HTML. [[Link to Project](/old_site)]'
---
[[Link to Project](/old_site)]

In late 2021, I bought myself a new Asustor NAS, with the intent of using it to finally reduce the number of physical PCs I had taking up space in the house.
My older gaming PC had been my main source of storage to that point, but actually getting files off it was a many-minute process, and I figured any amount of reduction from that would be helpful.

Truth be told, I'll never go back to not having a NAS again, although I'm not sure I'd buy Asustor next time, their software is fairly janky.

Anyway, the point is, the NAS by default had some options for hosting a static website (using Apache), and I figured it can't hurt to have a minimal site available to show off some of my projects and resume and whatnot.

But building a whole thing in React or something was definitely overkill, so I figured why not learn the basics of web development, from raw HTML5.
I had also seen some pretty cool projects on twitter (that I now can't find a link to) that sort of replicated that Web 1.1 aesthetic of MS-Dos grey boxes, but in HTML5. It made me wonder what you get out of the box with HTML5 without all the bloat of webpack and nodejs and whatnot.

So I built the linked site using as little tooling as I could. Just HTML5 and whatever JS and CSS I could reasonably write by hand. 
It was a fun little weekend! But then I lost interest. Also Google really struggled to index it, and I didn't really want to learn the history of SEO so I gave up :').

Unfortunately, as I've get further into learning things, I have decided it'd be handy to be able to share things without needing to think about managing recent posts or static linking around the site.
I played a little bit at work with `Jekyll`, which is what github pages works with by default, but it was a pain to really get it to work on my work Mac (Ruby is a prick to install via `brew` apparently), and I am not a big fan of the default github themes.

Some searching turned up `Hugo`, which sounded a bit more extensible. So far I'm impressed! I think the docs assume a little bit much in terms of how its preprocessing/templating system works (which Jekyll is even worse for tbh), but so far I seem to have been able to make it do what I want! I can just write Markdown in peace, and eventually re-upload to my NAS server when I need. Switching to Github Pages should be fairly easy, if I ever get too pissed off by how much my NAS just stops docker containers for no reason as well.