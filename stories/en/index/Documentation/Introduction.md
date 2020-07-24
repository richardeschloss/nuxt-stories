---
title: Introduction
order: 1
---

# Introduction

## What is nuxt-stories?

nuxt-stories is a module that you can use to rapidly write stories, gameplans, notes, documentation, whatever for your Nuxt web app. This process of writing stories is known as "storybooking". 

Miscommunication of requirements from the start is usually how problems occur in web apps. This tool strives to help you and your stakeholders communicate requirements much more efficiently. Having stories that also contain your *functional components* will make it crystal clear what the web app does. Plus, if you use a version control system such as git, you can quickly change branches to see different versions of stories/layouts/whatever.

If you've heard of popular patterns such as "Test Driven Development" or "Behavior Driven Development", you may want to consider "Story Driven Development". If you've ever been at a bar or campfire with friends, it's common to hear "I gotta a great app idea for xyz, it would be great if it did 1, 2, 3...", but at the same time, no one ever acts on that because they don't have the tool (well, maybe only 10% of people actually do something about it). Now, with the right development tool, you can quickly jot down the stories asap and get the web app wired up faster than ever. 

## nuxt-stories vs storybookjs

There is a lot that's cool about storybookjs. If you're already in the REACT world, it's probably the ideal solution. Storybook is REACT-centric, which attempts to make itself pluggable into Angular, Vue and other front-end frameworks, but from my experience, it was more complicated than I wanted it to be. Whenever I wanted "vue storybookjs", I had to download the boatload of react dependencies. I wanted to keep things much more lightweight. And, trying to get storybook to play nicely with Nuxt was even more of challenge. I'm sure if I set aside a weekend I could have managed, but I knew I could just create something similar myself, and fit my needs in minutes instead of days. That's what nuxt-stories is. Lightweight, far from perfect, but with time, will be a pretty awesome solution for storybooking in Nuxt.

Consider nuxt-stories as a respectable alternative to storybookjs. Think of it as a potential rising star. It takes on a completely different approach to solving the storybooking problem. It's goal is to be integrated into Nuxt framework (but still have the module be reusable enough to be ported elsewhere). It also wants to let you do more things from the UI, since that's where you see your stories. I find editing on the UI (with auto saving) much faster than editing in a desktop IDE and waiting for Hot Module Reloading to to do it's thing. 

To reiterate, much respect goes to storybookjs. I really like their idea, however, when it came time to using storybook with **Nuxt**, I found myself running into several roadblocks and problems that this module intends to solve:

1. I needed to maintain a separate config in the .storybook folder, when I would have preferred to just maintain config in one place: nuxt.config
2. It would require a separate 'npm run' command, so if I had my nuxt app running in dev mode, it meant that every time I wanted to design components in isolation, I had to run storybook, instead of just going to my "storybook routes"
3. Sometimes I wanted to make use of Nuxt plugins, modules, and Vuex while designing components (use cases to be saved for future discussion), but because the storybook environment was isolated, I couldn't easily tap into the Nuxt features I needed. It would require either ugly hacks to config or a lot of extra work that I didn't want to be bothered it. Since storybooking is something I would plan to do for all professional projects, I can't afford to spend too much time fighting the tool and redoing configs. Plus, if I happened to be super smart and figure the config out once, good luck if I could remember all those steps for the next project several months later.
4. The AH HA moment! NUXT _already_ provides you all the tools you need to build a storybook quickly that works alongside your app really nicely! Just EXTEND THE ROUTES when in dev mode only! Then just navigate to those routes! EASY!

## nuxt-stories vs. nuxt-content

These two are very similar, but address different problems. The focus of this module is to primarily a *developer tool* for rapid writing of stories. These stories are meant to serve as clearly documenting project requirements for a web app. Therefore, included in this module is the ability to rapidly compile Vue components *as you type* them on the stories UI. Quickly change the properties to see how the components change.

Nuxt content is also a very awesome module, but my understanding is it serves a slightly different purpose: to make writing static content (such as blog posts) much easier. In fact, I use it to write nuxt-socket-io docs and love a lot of things about it and may plan to carry some ideas over to this project! Nuxt content is also styled using Tailwind, whereas nuxt-stories uses Bootstrap. So the developer has options. 

