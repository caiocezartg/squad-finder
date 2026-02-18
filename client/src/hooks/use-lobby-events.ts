import { useState, useEffect } from 'react'
import { useRoomsCache } from './use-rooms-cache'
import { parseWsPayload } from '@/lib/ws-validators'
import {
  roomCreatedPayloadSchema,
  roomUpdatedPayloadSchema,
  roomDeletedPayloadSchema,
} from '@squadfinder/schemas/ws'
import type { WebSocketEventHandler } from '@/lib/ws-client'

interface UseLobbyEventsOptions {
  isConnected: boolean
  send: (type: string, data: unknown) => void
  on: (event: string, handler: WebSocketEventHandler) => () => void
}

interface UseLobbyEventsReturn {
  isSubscribed: boolean
}

export function useLobbyEvents({
  isConnected,
  send,
  on,
}: UseLobbyEventsOptions): UseLobbyEventsReturn {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { addRoom, updateRoom, removeRoom } = useRoomsCache()

  useEffect(() => {
    if (!isConnected) return

    const unsubscribeLobbySubscribed = on('lobby_subscribed', () => {
      setIsSubscribed(true)
    })

    const unsubscribeCreated = on('room_created', (raw) => {
      const data = parseWsPayload(roomCreatedPayloadSchema, raw)
      if (!data) return
      addRoom(data.room)
    })

    const unsubscribeUpdated = on('room_updated', (raw) => {
      const data = parseWsPayload(roomUpdatedPayloadSchema, raw)
      if (!data) return
      updateRoom(data.roomId, { memberCount: data.memberCount })
    })

    const unsubscribeDeleted = on('room_deleted', (raw) => {
      const data = parseWsPayload(roomDeletedPayloadSchema, raw)
      if (!data) return
      removeRoom(data.roomId)
    })

    // Subscribe to lobby AFTER handlers are registered
    send('subscribe_lobby', {})

    return () => {
      unsubscribeLobbySubscribed()
      unsubscribeCreated()
      unsubscribeUpdated()
      unsubscribeDeleted()
      setIsSubscribed(false)
    }
  }, [isConnected, on, send, addRoom, updateRoom, removeRoom])

  return { isSubscribed }
}
