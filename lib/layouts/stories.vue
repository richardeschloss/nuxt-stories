<template>
  <div>
    <nuxt />
  </div>
</template>

<script>
export default {
  data () {
    return {
      socketStatus: {}
    }
  },
  mounted () {
    this.$nuxtStories.mountedAnchor(this)
  }
}
</script>

<style>
@import url('~assets/css/stories.min.css');
.page-enter-active,
.page-leave-active {
  transition: opacity 0.5s;
}
.page-enter,
.page-leave-to {
  opacity: 0;
}
</style>

<style lang="scss">
@import url('~assets/scss/stories.overrides.scss');

.bd-content {
  > h1 {
    margin-top: 1rem;
  }

  > h2,
  > h3,
  > h4 {
    &[id]:before {
      height: 1rem;
      margin-top: -1rem;
    }
  }

  > h4,
  > h5 {
    margin-top: 1rem;
  }

  &.bd-component-reference {
    h2 {
      margin-top: 3rem;
    }
    h3 {
      margin-top: 1.5rem;
    }
    h4,
    h5 {
      margin-top: 1rem;
    }
  }
}

.bd-toc {
  @media (min-width: 768px) {
    border-left: 1px solid rgba(0, 0, 0, 0.1);
  }

  .section-nav {
    border-left: none;

    .toc-entry {
      > .nav-link {
        padding-left: 0;
        padding-right: 0;

        + .nav {
          @supports (position: sticky) {
            display: none;
          }
        }

        &.active {
          font-weight: 600;

          + .nav {
            display: flex !important;
          }
        }
      }
    }
  }
}
</style>
