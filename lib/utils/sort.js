export function sortStories (stories) {
  const copy = [ ...stories ]
  return copy.sort(({ frontMatter: a }, { frontMatter: b }) => {
    const aOrder = a ? a.order : 0
    const bOrder = b ? b.order : 0
    if (aOrder > bOrder) {
      return 1
    } else if (aOrder < bOrder) {
      return -1
    }
    return 0
  })
}
