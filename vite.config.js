import { defineConfig, loadEnv } from 'vite'
import { checkoutMiddleware } from './server/checkout.js'

function checkoutOrigin(value) {
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) {
      return url.origin
    }
  } catch {}
  return ''
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const origin = checkoutOrigin(env.IEVA_CHECKOUT_ORIGIN)
  const checkout = checkoutMiddleware({ key: env.STRIPE_SECRET_KEY ?? '', origin })
  return {
    server: { allowedHosts: origin ? [new URL(origin).hostname] : [] },
    plugins: [{
      name: 'ieva-test-checkout',
      configureServer(server) { server.middlewares.use(checkout) },
      configurePreviewServer(server) { server.middlewares.use(checkout) }
    }]
  }
})
