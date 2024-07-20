export const getGridRowData = (api, cb = () => true) => {
  const items = []
  if (api) {
    api.forEachNode(node => {
      if (cb(node)) {
        items.push(node.data)
      }
    })
  }
  return items
}
