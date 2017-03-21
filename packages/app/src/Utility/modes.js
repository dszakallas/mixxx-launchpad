export default (ctx, n, c, s, cs) => {
  if (ctx.shift && ctx.ctrl) {
    cs && cs()
  } else if (ctx.shift) {
    s && s()
  } else if (ctx.ctrl) {
    c && c()
  } else {
    n && n()
  }
}
