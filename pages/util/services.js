export const replaceProtocol = href => href.replace(/^https?:\/\/[^/]*/, '')
export const replaceMaximoPrefix = href => href.replace('/maximo/oslc/os/', '/pelos/')
export const hrefToPostHref = href => replaceMaximoPrefix(replaceProtocol(href))
