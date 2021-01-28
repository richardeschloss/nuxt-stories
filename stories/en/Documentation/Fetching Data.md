---
  title: Fetching Data
  order: 4
  fetch:
    csvIn: /someFile.csv 
    csv: /someFile.csv | csv
    someJsonIn: /someJson.json
    someJson: /someJson.json | json > lS
  nodeFetch:
    someJson2: /someJson.json | json > sS
---

# Fetching Data

A special fetch feature is introduced and enabled by default in v2.0.13 of nuxt-stories. It will respect two properties "fetch" and "nodeFetch" in the frontMatter. The syntax for both is identical, with the main difference being *where* the fetch is initiated: client or server.

In addition to fetching data, the feature also allows you to instantly parse the data and redirect the fetched to browser storage depending on the syntax you provide.

The most basic format is this:

```html
---
  fetch:
    [prop1]: [path or url] [| format?] [> [dest?]]
  nodeFetch:
    [prop2]: [path or url] [| format?] [> [dest?]]
---
```

The results will be merged into a property "fetched" that will contain the responses. The response will also be stored in vuex so other stories can easily access it.

The supported formats are: 
* text - default
* csv 
* json
* xml

The supported destinations are:
* localStorage (alias "lS")
* sessionStorage (alias "sS")

## Fetch example

In this story, the frontMatter contains:
```html
  fetch: 
    csv: /someFile.csv | csv
    someJson: /someJson.json | json > lS
```

To analyze this line-by-line, this means to:

1. Fetch "/someFile.csv", then parse the response as csv (with the "| csv") and store the json result in this component's fetched (`this.fetched.csv`).
Here is the response: 

> Input: {{ fetched.csvIn }}

> Output: {{ fetched.csv }}

2. Fetch "/someJson.json", then parse the response as json (with the "| json"), store the json result in `this.fetched.someJson` and then also send that response to localStorage (with the "> lS", using the alias):

> Input: {{ fetched.someJsonIn }}

> Output: {{ fetched.someJson }}

> Also stored in: (remove ticks to see it)

`{{` localStorage.fetched[$route.path] `}}`

## Node fetch example

NOTE: this only works with a running server. I.e., it won't work on static deploys.

This story's frontMatter also contains the following nodeFetch entries:

```html
  nodeFetch:
    someJson2: /someJson.json | json > sS
```

It is important to note that the responses from both `fetch` and `nodeFetch` get merged into a single `this.fetched` object, so the property names need to be unique. Since `fetch` already specified "someJson", we can't re-use that in `nodeFetch`. We have to give it a unique name, for example "someJson2".

In this example, it's very similar to the one before, but instead of sending the response to localStorage, we send it to sessionStorage (using the alias "sS").

> You can see it below: (remove tick marks)

`{{` sessionStorage.fetched `}}`

Also, as a convenience to the user, while node-fetch normally requires the hostname to be provided, the nuxt-stories plugin handles this for you. If you provide relative path, it will prepend `window.location.origin` to satisfy node-fetch's requirement.

## Parametric fetch

There are times when the routes are parametric. I.e., `/path/to/search?id=:productId&count=:count`

There are also times where the parameters to provide are not defined on the component, but are defined in environment variables, such as API keys: `/getData?apiKey=$API_KEY`

The nuxt-stories module supports both kinds of routes. Consider the following frontMatter:

```html
---
  productId: 123
  count: 5
  fetch:
    list: /path/to/search?id=:productId&count=:count
  nodeFetch:
    myResp: /myData?apiKey=$API_KEY
---
```

The following will take place:
1. On the client, ":productId" and ":count" will be replaced by this component's `productId` and `count`, respectively. So the fetch request will go to: `/path/to/search?id=123&count=5`. The result will be stored in `this.list`

2. On the server, "$API_KEY" will be replaced by process.env[API_KEY], and so that environment variable will need to be defined when the server is running. The fetch will request `/myData?apiKey=[process.env[API_KEY]]` and the result will also stored in `this.myResp`.

## Fetching with Options

This module also allows [fetch options](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters) to be wired to the underlying fetch API using the property `fetchOpts` in the frontMatter. There are times where certain resources require HTTP headers to also be sent with the request. This is where fetchOpts comes into play:

```html
  fetch:
    resp1: somehost.com/path/needs/opts
    resp2: somehost.com/path/also/needs/opts
    resp3: someOtherHost.com/needs/opts
  fetchOpts:
    resp1: 
      headers:
        cookie: abc123
    resp2: 
      headers:
        cookie: abc123
    resp3:
      mode: no-cors
```  

The fetchOpts needs to have the same property names as the fetch or nodeFetch objects, so that the module knows what option set to send to a specific route. So, in the snippet above, the fetchOpts would get sent to each route. `someHost.com` would get the cookie "abc123", whereas `someOtherHost.com` would receive no cookies, the fetch API would consume the "mode: no-cors" options for that endpoint.

The above can get quite tedious to write, so as an initial convenience, option sets can be aliased with a string prefixed with ":" like this:

```html
  someHostOpts:
    headers:
      cookie: abc123
  fetch:
    resp1: somehost.com/path/needs/opts
    resp2: somehost.com/path/also/needs/opts
    resp3: someOtherHost.com/needs/opts
  fetchOpts:
    resp1: ":someHostOpts"
    resp2: ":someHostOpts"
    resp3:
      mode: no-cors
``` 

Here, `someHostOpts` is now defined on the component and can be re-used with ":someHostOpts" in the "fetchOpts" frontMatter.

## Accessing from Vuex

As mentioned before, all the responses are contained in this components `this.fetched` object. This actually is a computed property, which simply pulls from the Vuex store, keying off the current route `$route.path`. Therefore, if any other story needs to access what was fetched in one story, it can with `$store.state.$nuxtStories.fetched[story relative path]`:

{{ $store.state.$nuxtStories.fetched }}