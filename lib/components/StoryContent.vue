<template>
  <b-col cols="12" md="9" xl="8"
    class="bd-content pb-md-5 pl-md-5">
    <breadcrumbs 
      class="float-left mt-2 mb-0 mb-lg-2"
    />
    <div class="clearfix d-block"></div>
    <main id="story-start" class="bd-main" role="main">
      <header class="bd-content"></header>
      <section class="bd-content">
        <nuxt-child />
      </section>
    </main>
  </b-col>
</template>

<style scoped>
#story-start {
  padding-bottom: 50vh;
}
</style>