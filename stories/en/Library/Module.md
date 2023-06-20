---
title: Module
order: 1
---

# Module Options

See <RouterLink to="/stories/en/Documentation/Configuration#module-options">Module Options</RouterLink>

# Requirements

## Normal mode

| Title | Description | Current Value |
| --- | --- | --- |
| Runtime config | The module shall pass the moduleOptions to the public runtime config. It shall also attach the stories tree to that runtime config. This config will be available at: `this.$config.public.nuxtStories` from any Vue component | <json :data="$config.nuxtStories" :deep="1" /> |
| DB (Server-side) | It shall register the LokiDB. If `watchStories` is set, it shall enable filesystem watching | |
| Routes | It shall register the story routes (in Nuxt3, this is done with `extendPages`) | Routes: <json :data="$config.nuxtStories.routes" />, Current parameters: <json :data="$route.params" /> |
| Modules | It shall register modules ['nuxt-socket-io'] if running with `target` is "server". Otherwise, that module shall not be installed. The stories socket.io server by default will run at port = Nuxt's port + 100 (3100). If `staticHost` is unset, the socket.io-client configuration for storiesSocket (name === 'nuxtStories') shall also be added | Modules installed: <json :data="$config.nuxtStories.modulesAdded" /><br/>Sockets: <json  :data="$config.nuxtSocketIO" /> |
| Middlewares | It shall register middleware* for the following request paths: <ul><li>/nuxtStories: `storiesDir` (this is used to serve the stories on a static host) </li><li>/nuxtStories/svg: [lib]/assets/svg</li><li>/nuxtStories/README.md: [app]/README.md </li><li>/nuxtStories/coverage: [app]/coverage</li></ul> | <json :data="$config.nuxtStories.middlewares" /> |
| Plugins | It shall add the nuxt-stories plugin. See [Plugin](./Plugin) |  |

## Non-development mode

Module shall do nothing if not in development mode AND `forceBuild` is not set.

 # Tests

<TestRunner testFile="test/specs/Module.spec.js" />

Note: Here, when running tests for *module*, Nuxt is also running right now. So, we need to remember that the NODE_ENV may be set to 'development' and not 'testing'. We need the testRunner to set the NODE_ENV to 'testing' in the spawned child_process for the tests to run correctly.

# Coverage

<TestCoverage file="lib/module.js" />