import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { link, mkdir, open, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { products } from '../src/catalog.js'

const productIds = new Set(products.map(({ id }) => id))
const paidEvents = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded'])

function validSignature(body, header, secret) {
  if (typeof header !== 'string') return false
  const fields = header.split(',')
  const timestamp = fields.find(field => /^t=\d+$/.test(field))?.slice(2)
  if (!timestamp || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false

  const expected = createHmac('sha256', secret).update(timestamp + '.').update(body).digest()
  return fields.some(field => /^v1=[a-f0-9]{64}$/i.test(field) &&
    timingSafeEqual(expected, Buffer.from(field.slice(3), 'hex')))
}

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > 256 * 1024) return null
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

function paidOrder(event) {
  const session = event.data?.object
  if (event.livemode !== false || !paidEvents.has(event.type) || session?.object !== 'checkout.session' ||
      session.livemode !== false || session.mode !== 'payment' || session.payment_status !== 'paid' ||
      session.metadata?.ieva_source !== 'essentials_sandbox' ||
      !/^cs_test_[a-zA-Z0-9_]{1,120}$/.test(session.id ?? '') ||
      !Number.isSafeInteger(session.amount_total) || session.amount_total < 1 ||
      session.currency !== 'eur') return null

  const items = JSON.parse(session.metadata.ieva_items)
  if (!Array.isArray(items) || !items.length || items.length > productIds.size ||
      !items.every(item => productIds.has(item?.id) && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99) ||
      new Set(items.map(item => item.id)).size !== items.length) return null

  return {
    sessionId: session.id,
    paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    status: 'paid',
    testMode: true,
    currency: session.currency,
    amountTotal: session.amount_total,
    items: items.map(({ id, quantity }) => ({ id, quantity })),
    paidAt: new Date(event.created * 1000).toISOString()
  }
}

async function saveOrder(directory, order) {
  await mkdir(directory, { recursive: true, mode: 0o700 })
  const temporary = join(directory, '.' + randomUUID())
  const target = join(directory, order.sessionId + '.json')
  const file = await open(temporary, 'wx', 0o600)
  try {
    try {
      await file.writeFile(JSON.stringify(order, null, 2) + '\n')
      await file.sync()
    } finally {
      await file.close()
    }
    // Create the final name only once, after the complete record is on disk.
    await link(temporary, target)
  } catch (error) {
    if (error.code !== 'EEXIST') throw error
  } finally {
    await unlink(temporary)
  }
}

export function stripeOrdersMiddleware({ secret, directory }) {
  return async (req, res, next) => {
    if (req.url?.split('?')[0] !== '/api/stripe/webhook') return next()
    if (req.method !== 'POST') return res.writeHead(405).end()
    if (!/^whsec_\S+$/.test(secret)) return res.writeHead(503).end()

    let order
    try {
      const body = await readBody(req)
      if (!body) return res.writeHead(413).end()
      if (!validSignature(body, req.headers['stripe-signature'], secret)) return res.writeHead(400).end()
      order = paidOrder(JSON.parse(body))
    } catch {
      return res.writeHead(400).end()
    }

    try {
      if (order) await saveOrder(directory, order)
      return res.writeHead(200).end()
    } catch {
      console.error('Ieva could not persist a Stripe test order.')
      return res.writeHead(500).end()
    }
  }
}
