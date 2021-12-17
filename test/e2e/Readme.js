import { equal as is } from 'assert'

export default {
  id(ctx) {
    const comp = new ctx.Comp({}).$mount()
    is(comp.$el.id, 'readme')
    return '✔️'
  },
  src(ctx) {
    const comp = new ctx.Comp({}).$mount()
    is(comp.$el.getAttribute('src'), '/nuxtStories/README.md')
    return '✔️'
  }  
}