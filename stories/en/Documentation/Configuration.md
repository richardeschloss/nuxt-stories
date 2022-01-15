---
title: Configuration
order: 2
---

# Configuration

In your `nuxt.config.js` file, just specify `nuxt-stories` as one of your `buildModules`. It will only be enabled if your environment is development OR if you specify `forceBuild: true`. There might be times where you want to host the app as a static site so that you can also share the stories. However, normally in production, you probably wouldn't want to package them.

```js
...
buildModules: [
  [ 'nuxt-stories', { forceBuild: false } ]
]
...
```

Alternatively, you can also specify the stories options separately:
```js
...
buildModules: ['nuxt-stories'],
stories: { /* stories options here */ }
...
```

## Module Options

| option | description | default |
|---|---|---|
| `forceBuild` | Force the creation of story routes | false |
| `lang` | stories language | 'en' |
| `storiesDir` | Stories Directory | 'stories' |
| `storiesAnchor` | Stories Route Root | `storiesDir` value |
| `ioOpts` | socket.io server options | See below |
| `staticHost` | static host options | See below |
| `fetch` | fetch feature enable, see [Fetching Data](/stories/en/Documentation/Fetching%20Data) | true |
| `watchStories` | enables filesystem watching of stories | `!staticHost` |
| `inputDebounceMs` | Debounce time for the text input to the editor | 350 ms |
| `titleDebounceMs` | Debounce time for renaming the story when the frontmatter title is changed | 700 ms |  
| `rootComponent` | Root component to use at the stories root route | [this lib]/components/Root.js |
| `langComponent` | Language component | [empty placeholder, this library's root imports its dependencies and uses them] |
| `storyComponent` | Story component |  [empty placeholder, this library's root imports its dependencies and uses them] |
 
### IO Options

By default, if a static host is not specified, the nuxt-stories module will start a socket.io server and will add a special "nuxtStories" socket.io client when your app starts up. The IO server is used to respond requests from the client to perform the following actions:

- Add story
- Rename story
- Remove story
- Fetch story
- Fetch all stories
- Saving markdown-based story

The IO options takes the following options:

| option | description | default |
|---|---|---|
| host | socket.io hostname | Nuxt app's hostname (localhost) |
| port | socket.io port | Nuxt app's port + 1 (3001) |
| url | socket.io url | undefined |

If you provide the socket.io url, any provided host or port will be ignored. The url provided will be used.

There is no need to specify the socket.io client. Under the hood, the nuxt-stories module will register the IO server and know how to auto setup the socket.io client using nuxt-socket-io. 

When the IO options are used, the CRUD operations will be accessed in a dropdown that appears when you hover over the stories, but always hidden if a static host were specified (see next sections)

### Static Host Options

If the `staticHost` options are truthy, all socket.io features will not be registered. This can be useful if you wish to create documents that you don't want others to change; i.e., you want the content to be *static* (and unchanged). Therefore, if staticHost is truthy, all the CRUD features for stories won't be registered, and when you hover over the stories in the sidebar, no CRUD dropdown will appear (as designed). 

The following are options for the static host: (pick one)

| option | description | default |
|---|---|---|
| mount | the static mount point for stories | '/markdown' |
| url | api endpoint for stories | undefined | 

The mount point or the url is where you expect the stories to be. It'll either be at:

1. [your host][mount]/stories.json

or

2. [your url] // some url that returns stories JSON.

You can either specify the mount point or the url. If you specify both, the url will be used. 
 But, by default, if `staticHost` is truthy (i.e., in the simplest form `true`), then the mount point will be '/markdown'. This mount point will statically serve the content in your stories directory ("stories" by default). 

If you are using the defaults, the nuxt-stories module will automatically scan your stories directory to build the following stories.json file that can then easily be fetched:

```js
{
  "en": {
    name: 'stories'
    path: '...',
    children: [...]
  },
  "es": {
    name: 'stories'
    path: '...',
    children: [...]
  }
}
```

It's simply a JSON grouped by language. This file in [stories directory] will then be accessible at [mount point]: '/markdown/stories.json'. 

If instead of providing a mount point, you provide a url that is something completely external (and out of your control), you just need to make sure that url provides stories.json in the correct format:

```js
{ 
  [language]: Story
}
```

Where each story has a schema:

```js
{
  name: String, /* Story name */
  path: String, /* Route path */
  idxs: [Number], /* Array of idxs that trace to this story (see below) */
  mdPath: String /* Story's relative markdown path */
  children: [Story]
}
```

The idxs help make it easier to navigate to each story, even after changing the order on the UI. For example, consider the following tree:

* story 1
  * child 1
* story 2
  * child 1

Story 1's "child1" would have idxs [0, 0], whereas story 2's "child1" would have idxs [1, 0]. Then, if the UI were after to change the order of the stories, it'd be easy to refer to the right "child1" by using those idxs.



