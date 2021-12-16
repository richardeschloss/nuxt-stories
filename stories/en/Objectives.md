---
title: Objectives
order: 0
---

# My Ideal Workflow

## What I want
I want to be able to develop applications at the speed of thought. I want those applications to aggregate information and display that information in a manner that suits my specific personal preferences. I want those applications to just work and be easy to maintain. But, if I think of every application as a collection of components strung together, it's really perfectly ironed out components I want that are easy to design, tweak and reuse anytime.


My existing workflow for solving problems is flawed. It might involve manual data entry into outdated spreadsheets, or manually navigating to multiple websites for information I want, or jumping in and out of mobile apps. The workflow is made even slower when those websites don't prioritize the delivery of content.

There has to be a better way. I envision a set of stories that use only the components I specify. In fact, my ideal way to write an application is to simply write the components it uses. For example:

```
<App>
  <NutritionData food="Apple" />
  <Recipes food="Apple" sortBy="price" />  
</App>
```

So yes, while each of these components will ultimately need to specify HTML tags, I only want to think of them when I've reached the lowest level of that particular component; i.e., at the point `<NutritionData />` needs a table, that's when the HTML `<table />` tag finally comes in. 


The reader might ask, what do these components look like? Where do they get placed?  Well, that's where the stories come in. 


To me, it makes the most sense to jot my notes and thoughts down in markdown, since it's the fastest way I can write in a somewhat organized way (and use a markdown viewer to see those notes in a pretty way instantly). But, I want to take it a step further and see the actual component running in my story so I can see right away if it's working and looking correctly. 

So, if I'm designing a component, my story might look something like:

"The `<NutritionData />` component shall display the nutrition data for the provided food item. It will default to "Apple" if no food is specified. "

And then be able to see the component right away if I type the component without the ` marks. So maybe on first glance, that component would be an un-styled empty table, but then as the component gets developed, the story would show the updated view.

To develop components, it's useful to be able to feed those components dummy data, because the goal first is to style it accordingly (because we know the real data is just an API call away, but we don't want to get bogged down by those API requests and waiting for that data). Even the choice of API provider can become a story point. 

If possible, I would design the components directly on the UI, and have those styles get immediately saved back on the filesystem. At the least, I need to my notes to get saved as I type them. It's a win-win when I can quickly *write* notes in a somewhat messy fashion, but then quickly read them back in a beautiful way. No fussing around with UI controls like "B" or "*I*", just type and be done with it.

I want the application to be *mine* and *ours*. I guess it's the developer and designer within me. So even if it can be argued that "a nutrition app exists", it doesn't necessarily meet the look-and-feel I want. I don't want to wait for *those developers* to make changes when I can empower myself to do it myself today. 

Lastly, I realized that I greatly underestimated the need for content search and quick navigation. So, not only do I require a fast way to look up my buried thoughts, I need to get to the exact section on my mind instantly. This means having a search that highlights the matched word in context of the found searches. It means having a table-of-contents that navigates to the exact section of interest quickly (and with a smooth animation so I know something is going on).  

## What I do not want

* When I make changes to code or to styles, I don't want wait forever to see the changes on the UI. I want to see the changes quickly. 


* I don't want to have to keep clicking the document reload button or having the app do it. I just want to go to the desired route *now* and not wait for the entire DOM tree to load! I know I can do better. 


* DevTools in the drawer or separate screen can be useful, but if possible, I want to avoid the need to switch between the tools and the application. Sometimes I want to inspect an element or component without having to drill down to it each time. Same goes for global state. I'd rather just map the state used by a given component, and see that, rather than drilling through all of Vuex. (But, there are times where I'm glad I have Vue devTools so that I can see the full state!)


* I don't want my dependencies (and waiting for them to install) to keep screwing me over. The process for installing dependencies is slow and painful. If possible, I'd prefer to download and cache only the dependencies I need and then run at light speed. 


* I don't want to be limited to a small set of controls, styles, tools, fonts, whatever. The INTERNET is global and filled with resources and growing. I want my design palette to feel infinite. This means, when it comes to styling my components, I'm not limited to "text-white" or "text-primary", but I can use a color picker that easily lets me pick colors and gradients. If there's a component that exists on Bit or NPM, I would want to be able to quickly download and use it (and understand, my standard for "quick". I want really fast).

* I don't want to pigeonhole myself into one framework vs. another. Even if I really love the framework, the way I think about applications I'm thinking about the components I need, and I try to write those components in somewhat a framework-agnostic way (although, frameworks offer features that make it difficult to really be agnostic). 

* I don't want my testing procedures to slow me down, but rather speed them up. Normally, automated testing does make me go faster, but usually only when a UI is not involved. Once the UI testing is needed, the testing process is not a joy at all. It's a lot of boilerplate code and scaffolding that slows me (and all of us) down. It would be better to have those tests scaffolded when the stories are written, so that they are ready to go. Whether it's jest, ava or testing right in the browser, I'm not exactly sure what I want the implementation to be, but at a simple level, suppose we have a story point:

"Clicking the Refresh button shall refresh the list of recipes". 

In a testing framework, this looks like:

* Ava

```js
test('Refresh recipes button', (t) => {
  const recipeList = new RecipeList() 
  recipeList.$el.querySelector('#refresh')
  t.true(/* some condition */)
})
```

Jest

```js
it('Refresh recipes button', () => {
  const recipeList = new RecipeList() 
  recipeList.$el.querySelector('#refresh')
  expect(/* some condition */)
})
```

In both the above cases, see what drag it is to write a test just for a button click? Not shown is the boilerplate needed to set up the DOM because those tests generally run in node, not the browser. So the tests have to wait for JSDOM to fire up. Perhaps it would make us more productive to just run the tests in the browser and report the results and coverage (implementation details to be thought about...). 

## Where stories can live


It depends what I'm building. If I'm building a library, that library will have documentation written for it, and I'll want to host that documentation to some static site. I.e., that documentation would just be a static hosted version of the stories I write. If there has been a major set of features released worth discussing, that's when I like to publish an article about it on popular websites such as Medium.com or dev.to. But really, I think I'd be more helpful to the reader if I just published the working stories. This way, the reader could just try out features in the browser and tweak 


At the same time though, as I'm building my library and its UI components, 

