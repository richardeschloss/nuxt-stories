export type moduleOptions = {
  forceBuild?: Boolean;
  lang?: String;
  codeStyle?: String;
  storiesDir?: String;
  storiesAnchor?: String;
  ioOpts?;
  markdown?;
  staticHost?: Boolean | String | Object;
  fetch?: Boolean;
  watchStories?: Boolean;
  versions?: Array<{version: string, url?: string}>;
  appliedStyles?: String;
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    stories?: moduleOptions
  }
}