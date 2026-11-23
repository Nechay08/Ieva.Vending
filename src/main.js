import './style.css'
import { products, vending } from './catalog.js'
import { copy } from './copy.js'
import { testPrices } from './test-prices.js'

const app = document.querySelector('#app')
const panel = document.querySelector('#panel')
const asset = (name) => import.meta.env.BASE_URL + 'images/' + name + '.webp'
const categories = ['all', 'beauty', 'travel', 'daily']
const languages = ['en', 'lv', 'ru']
const icons = {
  bag: '<path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 1 1 6 0v3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  star: '<path d="M12 2c0 6 4 10 10 10-6 0-10 4-10 10 0-6-4-10-10-10 6 0 10-4 10-10Z"/>'
}
const icon = (name) => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

let lang = read('evo-language', 'en')
if (!languages.includes(lang)) lang = 'en'
let category = 'all'
let activePanel = 'bag'
let checkoutEnabled = false
let checkoutPending = false
const checkoutEndpoint = '/api/checkout'
const savedBag = read('evo-bag', {})
const bag = Object.fromEntries(products.map(({id}) => {
  const quantity = savedBag[id]
  return [id, Number.isInteger(quantity) && quantity > 0 ? Math.min(quantity, 99) : 0]
}))
const count = () => Object.values(bag).reduce((sum, quantity) => sum + quantity, 0)
const isVending = () => location.hash === '#vending'
const t = () => copy[lang]

function brandLink() {
  const logo = import.meta.env.BASE_URL + 'images/ieva-logo.svg'
  return `<a class="wordmark" href="#essentials"><img src="${logo}" alt="Ieva Vending" width="575" height="647"></a>`
}

function header() {
  const text = t()
  return `<header class="header">
    ${brandLink()}
    <nav aria-label="Ieva">
      <a href="#essentials" ${!isVending() ? 'aria-current="page"' : ''}>Ieva Essentials</a>
      <a href="#vending" ${isVending() ? 'aria-current="page"' : ''}>Ieva Vending</a>
    </nav>
    <div class="header-tools">
      <label class="language">${icon('globe')}<select id="language" aria-label="${text.language}">
        ${languages.map(value => `<option value="${value}" ${value === lang ? 'selected' : ''}>${value.toUpperCase()}</option>`).join('')}
      </select></label>
      <button class="bag-trigger" data-bag aria-label="${text.bag} (${count()})">${icon('bag')}<span data-count>${count()}</span></button>
    </div>
  </header>`
}

function hero(vendingPage) {
  const text = t()
  const heading = vendingPage ? text.vendingTitle : text.hero
  return `<section class="hero ${vendingPage ? 'hero-vending' : ''}">
    <div class="hero-copy">
      <span class="eyebrow">${vendingPage ? 'Ieva Vending' : 'Ieva Essentials'}</span>
      <h1>${heading[0]} <em>${heading[1]}</em></h1>
      <p>${vendingPage ? text.vendingIntro : text.intro}</p>
      <button class="primary" data-scroll="${vendingPage ? 'inside' : 'collection'}">${vendingPage ? text.inside : text.shop}</button>
    </div>
    <div class="hero-media"><img src="${asset(vendingPage ? 'machine' : 'hero')}" alt="${vendingPage ? text.machine : text.heroAlt}" fetchpriority="high"></div>
  </section>`
}

function cards() {
  return products.filter(product => category === 'all' || product.category === category).map(product => `
    <article class="product">
      <button class="product-photo" data-product="${product.id}" aria-label="${product.name[lang]}">
        <img src="${asset(product.id)}" alt="" loading="lazy" width="512" height="512">
      </button>
      <div class="product-meta">
        <div><span class="eyebrow">${t()[product.category]}</span><h3><button data-product="${product.id}">${product.name[lang]}</button></h3></div>
        <button class="quick-add" data-add="${product.id}" aria-label="${t().add}: ${product.name[lang]}">${icon('plus')}</button>
      </div>
    </article>`).join('')
}

function essentials() {
  const text = t()
  return `${hero(false)}
  <section class="collection wrap" id="collection">
    <div class="section-heading"><h2>${text.collection}</h2><p>${text.collectionIntro}</p></div>
    <div class="filters">${categories.map(value => `<button data-category="${value}" aria-pressed="${category === value}">${text[value]}</button>`).join('')}</div>
    <div class="grid" id="products">${cards()}</div>
  </section>
  <section class="vending-link"><div>${icon('star')}<h2>Ieva Vending</h2><p>${text.vendingIntro}</p><a class="primary" href="#vending">${text.inside}</a></div><img src="${asset('machine')}" alt="${text.machine}" loading="lazy"></section>`
}

function vendingPage() {
  const text = t()
  return `${hero(true)}
    <section class="collection wrap" id="inside">
      <div class="section-heading"><h2>${text.inside}</h2><p>${text.insideIntro}</p></div>
      <ul class="vending-grid">${vending.map(row => `<li>${icon('star')}<h3>${row[languages.indexOf(lang)]}</h3></li>`).join('')}</ul>
    </section>
    <section class="how wrap"><h2>${text.how}</h2><ol>${text.steps.map(step => `<li>${step}</li>`).join('')}</ol></section>`
}

function footer() {
  const text = t()
  return `<footer><div class="wrap footer-wrap"><div>${brandLink()}<div class="footer-links"><a href="#essentials">Ieva Essentials</a><a href="#vending">Ieva Vending</a></div></div>
  <dl>${['where', 'contact', 'support'].map(key => `<div><dt>${text[key]}</dt><dd>—</dd></div>`).join('')}</dl></div></footer>`
}

function render() {
  document.documentElement.lang = lang
  document.title = isVending() ? 'Ieva Vending | Ieva' : 'Ieva Essentials | Ieva Vending'
  app.innerHTML = `${header()}<main id="main" tabindex="-1">${isVending() ? vendingPage() : essentials()}</main>${footer()}<div class="toast" role="status" aria-live="polite"></div>`
}

function formatPrice(cents) {
  return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

function checkoutControls() {
  if (!count()) return ''
  const subtotal = products.reduce((total, {id}) => total + bag[id] * testPrices[id], 0)
  return `<div class="checkout-controls">
    <p>${t().testSubtotal} <strong>${formatPrice(subtotal)}</strong></p>
    <button class="primary" data-checkout ${checkoutPending ? 'disabled' : ''}>${checkoutEnabled ? t().checkout : t().simulateCheckout}</button>
    <p role="status" data-checkout-status></p>
  </div>`
}

async function startCheckout(button) {
  if (checkoutPending) return
  const status = panel.querySelector('[data-checkout-status]')
  if (!checkoutEnabled) {
    status.textContent = t().simulationComplete
    return
  }
  checkoutPending = true
  button.disabled = true
  status.textContent = ''
  try {
    const items = products.filter(({id}) => bag[id]).map(({id}) => ({id, quantity: bag[id]}))
    const response = await fetch(checkoutEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, language: lang }),
      signal: AbortSignal.timeout(15000)
    })
    const result = await response.json()
    if (!response.ok || !result.url?.startsWith('https://checkout.stripe.com/')) throw new Error()
    location.assign(result.url)
  } catch {
    checkoutPending = false
    const current = panel.querySelector('[data-checkout]')
    if (current) {
      current.disabled = false
      panel.querySelector('[data-checkout-status]').textContent = t().checkoutError
    }
  }
}

function renderPanel() {
  const text = t()
  const product = products.find(({id}) => id === activePanel)
  panel.classList.toggle('detail-panel', Boolean(product))
  const title = product ? product.name[lang] : text.bag
  panel.setAttribute('aria-labelledby', 'panel-title')
  panel.innerHTML = `<div class="panel-head"><h2 id="panel-title">${title}</h2><button class="icon-button" data-close aria-label="${text.close}">${icon('close')}</button></div>` +
    (product ? `<img class="detail-img" src="${asset(product.id)}" alt="${title}"><p class="eyebrow">${text[product.category]}</p><button class="primary" data-add="${product.id}">${text.add}</button>`
    : `<div class="bag-items">${count() ? products.filter(({id}) => bag[id]).map(({id, name}) => `
      <div class="bag-line"><img src="${asset(id)}" alt=""><div><strong>${name[lang]}</strong><p>${formatPrice(testPrices[id])}</p>
        <div class="quantity"><button data-quantity="${id}" data-change="-1" aria-label="${text.quantity} −">−</button><span>${bag[id]}</span><button data-quantity="${id}" data-change="1" aria-label="${text.quantity} +">+</button></div>
        <button class="remove" data-remove="${id}">${text.remove}</button></div></div>`).join('') : `<p>${text.empty}</p>`}</div>`) +
    `${product ? '' : checkoutControls()}<p class="panel-note">${text.testNote}</p>`
}

function showPanel(id) {
  activePanel = id
  renderPanel()
  if (!panel.open) panel.showModal()
}

let toastTimer
function updateBag(id, quantity) {
  bag[id] = Math.max(0, Math.min(99, quantity))
  write('evo-bag', bag)
  document.querySelector('[data-count]').textContent = count()
  document.querySelector('[data-bag]').setAttribute('aria-label', `${t().bag} (${count()})`)
}

function notify() {
  const toast = document.querySelector('.toast')
  toast.innerHTML = `<span>${t().added}</span><button data-bag>${t().bag} (${count()})</button>`
  toast.classList.add('visible')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600)
}

document.addEventListener('click', event => {
  if (event.target === panel) panel.close()
  const button = event.target.closest('button')
  if (!button) return
  const data = button.dataset
  if ('checkout' in data) void startCheckout(button)
  if ('bag' in data) showPanel('bag')
  if ('close' in data) panel.close()
  if (data.scroll) document.getElementById(data.scroll)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  if (data.product) showPanel(data.product)
  if (data.add) {
    updateBag(data.add, bag[data.add] + 1)
    if (panel.open) showPanel('bag')
    else notify()
  }
  if (data.quantity || data.remove) {
    const id = data.quantity || data.remove
    updateBag(id, data.remove ? 0 : bag[id] + Number(data.change))
    renderPanel()
    const selector = data.remove ? `[data-remove="${id}"]` : `[data-quantity="${id}"][data-change="${data.change}"]`
    ;(panel.querySelector(selector) || panel.querySelector('[data-close]')).focus()
  }
  if (data.category) {
    category = data.category
    document.querySelectorAll('[data-category]').forEach(control => control.setAttribute('aria-pressed', control === button))
    document.querySelector('#products').innerHTML = cards()
  }
})

app.addEventListener('change', ({ target }) => {
  if (target.id !== 'language' || !languages.includes(target.value)) return
  lang = target.value
  write('evo-language', lang)
  render()
  document.querySelector('#language').focus({ preventScroll: true })
})

window.addEventListener('hashchange', () => {
  render()
  window.scrollTo(0, 0)
  document.querySelector('main').focus({ preventScroll: true })
})
render()

fetch(checkoutEndpoint)
  .then(response => response.ok ? response.json() : null)
  .then(data => {
    checkoutEnabled = data?.enabled === true
    if (checkoutEnabled && panel.open && activePanel === 'bag') renderPanel()
  })
  .catch(() => {})

const returnUrl = new URL(location.href)
const checkoutResult = returnUrl.searchParams.get('checkout')
if (['test-return', 'canceled'].includes(checkoutResult)) {
  returnUrl.searchParams.delete('checkout')
  history.replaceState(history.state, '', returnUrl)
  const toast = document.querySelector('.toast')
  toast.textContent = checkoutResult === 'test-return' ? t().checkoutReturn : t().checkoutCanceled
  toast.classList.add('visible')
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 4500)
}
