export default (cb) => {
  let shift = false
  let ctrl = false

  return function (data) {
    if (data.value) {
      shift = data.context.shift
      ctrl = data.context.ctrl
    } else {
      data.context.shift = shift
      data.context.ctrl = ctrl
    }
    cb.apply(this, arguments)
  }
}
