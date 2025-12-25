import { redis } from '@/lib/redis';
import { Elysia, t } from 'elysia'
import { nanoid } from 'nanoid'
import { authMiddleware } from './auth';
import { z } from 'zod'
import { Message, realtime } from '@/lib/realtime';

const ROOM_TTL_SECONDS = 60 * 10

const rooms = new Elysia({ prefix: '/room' })
  .post('/create', async () => {
    const roomId = nanoid();

    await redis.hset(`meta:${roomId}`, {
      connected: [],
      createdAt: Date.now(),
    })
    await redis.expire(`meta:${roomId}`, ROOM_TTL_SECONDS)
    return { roomId }
  })
  .use(authMiddleware)
  .get('/ttl', async ({ auth }) => {
    const remaining = await redis.ttl(`meta:${auth.roomId}`)
    if (!remaining) {
      throw new Error('Room does not exist')
    }
    return { remaining: remaining > 0 ? remaining : 0 }
  },
    {
      query: z.object({
        roomId: z.string(),
      })
    })
  .delete('/', async ({ auth }) => {

    await realtime.channel(auth.roomId).emit("chat.destroy", { isDestroyed: true })
    await Promise.all([
      redis.del(auth.roomId),
      redis.del(`meta:${auth.roomId}`),
      redis.del(`messages:${auth.roomId}`),
    ])
  },
    {
      query: z.object({
        roomId: z.string(),
      })
    })

const messages = new Elysia({ prefix: '/messages' })
  .use(authMiddleware)
  .post('/', async ({ body, auth }) => {
    const { sender, text } = body

    const roomExists = await redis.exists(`meta:${auth.roomId}`)
    if (!roomExists) {
      throw new Error('Room does not exist')
    }
    const message: Message = {
      id: nanoid(),
      sender,
      text,
      timestamp: Date.now(),
      roomId: auth.roomId,
    }
    // add message to history
    await redis.rpush(`messages:${auth.roomId}`, { ...message, token: auth.token })
    await realtime.channel(auth.roomId).emit("chat.message", message)

    // emforce expiration
    const remaining = await redis.ttl(`meta:${auth.roomId}`)
    await Promise.all([
      redis.expire(`messages:${auth.roomId}`, remaining),
      redis.expire(auth.roomId, remaining)
    ])

    return message
  },
    {
      query: z.object({
        roomId: z.string(),
      }),
      body: z.object({
        sender: z.string().max(100),
        text: z.string().max(1000),
      })
    })
  .get('/', async ({ auth }) => {
    const messages = await redis.lrange<Message>(`messages:${auth.roomId}`, 0, -1)
    return {
      messages: messages.map((m) => ({
        ...m,
        token: m.token === auth.token ? m.token : undefined
      }))
    }
  },
    {
      query: z.object({
        roomId: z.string(),
      })
    })

export const app = new Elysia({ prefix: '/api' })
  .use(rooms)
  .use(messages)

export const GET = app.fetch
export const POST = app.fetch
export const DELETE = app.fetch