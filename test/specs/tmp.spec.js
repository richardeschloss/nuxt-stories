import assert from 'assert'
import { delay } from "les-utils/utils/promise.js"

const { strictEqual: is } = assert // TBD: maybe alias in the utils?

const Mod = {
  async fn1() {
    await delay(100)
    return false
  },
  fn2() {
    return true
  }
}

const tests = {
  async 'It shall do something'(ctx) {
    ctx.suppliedInfo = 'abc123'
    var a = 1
    is(a, 3, 'a is not 3')
    return await Mod.fn1(ctx)
  },
  async 'It shall do xyz'() {
    return Mod.fn2()
  }
}

export default tests