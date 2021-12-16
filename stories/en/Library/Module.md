---
title: Module
order: 1
---

# Module Options

See [ModuleOptions](/stories/en/Documentation/Configuration#module-options)

# Requirements

## Normal mode

| Title | Description | Current Value |
| --- | --- | --- |
| Runtime config | The module shall pass the moduleOptions to the public runtime config. It shall also attach the stories tree to that runtime config. This config will be available at: `this.$config.nuxtStories` from any Vue component | <json :data="$config.nuxtStories" :deep="1" /> |
| Components | It shall register components in [lib]/components and prefix with NuxtStories (in Nuxt's `components:dirs` hook) | <json :data="componentNames('NuxtStories').sort()" />  |
| DB (Server-side) | It shall register the LokiDB. If `watchStories` is set, it shall enable filesystem watching | |
| Routes | It shall register the story routes | <json :data="$config.nuxtStories.routes" /> 
| Templates | It shall add the library's directories: ['assets/svg', 'components', 'utils', 'store'], so that the library has access to that at runtime | |
| Modules | It shall register modules ['nuxt-socket-io'] if running with `staticHost` unset. If `staticHost` is set, that module shall not be added | Modules added: <json :data="$config.nuxtStories.modulesAdded" /><br/>Sockets: <json  :data="$config.nuxtSocketIO" /> |
| Middlewares | It shall register middleware* for the following request paths: <ul><li>/nuxtStories: `storiesDir` </li><li>/nuxtStories/svg: [lib]/assets/svg</li><li>/nuxtStories/README.md: [app]/README.md </li> </ul> | <json :data="$config.nuxtStories.middlewares" /> |
| Plugins | It shall add the nuxt-stories plugin. See [Plugin](./Plugin) | <json :data="$config.nuxtStories.plugins" /> | 

## Non-development mode

Module shall do nothing if not in development mode AND `forceBuild` is not set.

 