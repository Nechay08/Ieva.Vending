import { products } from '../src/catalog.js'
import { testPrices } from '../src/test-prices.js'

const byId = new Map(products.map(product => [product.id, product]))
const shippingCountries = 'AT BE BG HR CY CZ DE DK EE ES FI FR GR HU IE IT LT LU LV MT NL PL PT RO SE SI SK'.split(' ')

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}

async function parseBody(req) {
  let content = ''
  for await (const chunk of req) {
    content += chunk
    if (content.length > 4096) throw new Error('Request too large')
  }
  return JSON.parse(content)
}

export function checkoutMiddleware({ key, origin, fetchStripe = fetch }) {
  const enabled = /^sk_test_\S+$/.test(key) && Boolean(origin)
  const codespacesOrigin = /^https:\/\/[a-z0-9-]+-\d+\.app\.github\.dev$/.test(origin)

  return async (req, res, next) => {
    const path = req.url?.split('?')[0]
    if (path !== '/api/checkout') return next()
    if (req.method === 'GET') return json(res, 200, { enabled })
    if (req.method !== 'POST') return json(res, 405, { error: 'method' })
    if (!enabled) return json(res, 503, { error: 'unavailable' })
    const fetchSite = req.headers['sec-fetch-site']
    const browserOrigin = req.headers['x-ieva-checkout-origin']
    // The Codespaces port proxy can change the standard Origin header.
    const forwardedSameOrigin = codespacesOrigin && fetchSite === 'same-origin' && browserOrigin === origin
    if ((fetchSite && fetchSite !== 'same-origin') ||
        (browserOrigin && browserOrigin !== origin) ||
        (req.headers.origin !== origin && !forwardedSameOrigin)) {
      return json(res, 403, { error: 'origin' })
    }

    let order
    try { order = await parseBody(req) }
    catch { return json(res, 400, { error: 'invalid_order' }) }

    const items = order?.items
    if (!Array.isArray(items) || !items.length || items.length > byId.size) {
      return json(res, 400, { error: 'invalid_order' })
    }

    const language = ['en', 'lv', 'ru'].includes(order.language) ? order.language : 'en'
    const params = new URLSearchParams({
      mode: 'payment',
      'metadata[ieva_source]': 'essentials_sandbox',
      success_url: origin + '/?checkout=test-return#essentials',
      cancel_url: origin + '/?checkout=canceled#essentials',
      locale: language === 'lv' ? 'en' : language
    })
    for (const [index, country] of shippingCountries.entries()) {
      params.set(`shipping_address_collection[allowed_countries][${index}]`, country)
    }

    const seen = new Set()
    const orderItems = []
    for (const [index, item] of items.entries()) {
      const product = byId.get(item?.id)
      if (!product || seen.has(product.id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        return json(res, 400, { error: 'invalid_order' })
      }
      seen.add(product.id)
      orderItems.push({ id: product.id, quantity: item.quantity })
      const line = `line_items[${index}]`
      params.set(line + '[quantity]', item.quantity)
      params.set(line + '[price_data][currency]', 'eur')
      params.set(line + '[price_data][unit_amount]', testPrices[product.id])
      params.set(line + '[price_data][product_data][name]', product.name[language])
    }

    params.set('metadata[ieva_items]', JSON.stringify(orderItems))

    try {
      const response = await fetchStripe('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + key },
        body: params,
        signal: AbortSignal.timeout(12000)
      })
      if (!response.ok) {
        const errorCodes = {
          400: 'stripe_request',
          401: 'stripe_key',
          403: 'stripe_permission',
          429: 'stripe_rate_limit'
        }
        const requestId = response.headers.get('request-id')
        const safeRequestId = /^req_[a-zA-Z0-9]+$/.test(requestId ?? '') ? requestId : undefined
        let field
        if (response.status === 400) {
          const rejection = await response.json().catch(() => null)
          const parameter = rejection?.error?.param
          if (typeof parameter === 'string' && parameter &&
              [...params.keys()].some(name => name === parameter || name.startsWith(parameter + '['))) {
            field = parameter
          }
        }
        return json(res, 502, {
          error: errorCodes[response.status] ?? 'stripe_service',
          requestId: safeRequestId,
          field
        })
      }
      const session = await response.json()
      if (session.livemode !== false || typeof session.url !== 'string' || !session.url.startsWith('https://checkout.stripe.com/')) {
        return json(res, 502, { error: 'stripe_session' })
      }
      return json(res, 200, { url: session.url })
    } catch {
      return json(res, 502, { error: 'stripe_connection' })
    }
  }
}
