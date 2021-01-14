function loadDevTools(callback: VoidFunction) {
  // check URL first
  const url = new URL(window.location.toString())
  const setInUrl = url.searchParams.has('dev-tools')
  const urlEnabled = url.searchParams.get('dev-tools') === 'true'
  if (setInUrl) {
    return urlEnabled ? go() : callback()
  }

  // we only want isolated pages to have it if the query param is set
  if (url.pathname.startsWith('/isolated')) return callback()

  // the check localStorage
  const localStorageValue = window.localStorage.getItem('dev-tools')
  const setInLocalStorage = localStorageValue != undefined
  const localStorageEnabled = localStorageValue === 'true'
  if (setInLocalStorage) {
    return localStorageEnabled ? go() : callback()
  }

  // the default is off in Cypress
  if (window.hasOwnProperty('Cypress')) return callback()

  // the default is on in development
  if (process.env.NODE_ENV === 'development') return go()

  return callback()

  function go() {
    // use a dynamic import so the dev-tools code isn't bundled with the regular
    // app code so we don't worry about bundle size.
    import('./dev-tools').then(devTools => devTools.install()).finally(callback)
  }
}

export {loadDevTools}

/*
eslint
  eqeqeq: "off",
*/
