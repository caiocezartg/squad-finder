import { useState, useEffect } from 'react'
import { useRoomsCache } from './use-rooms-cache'
import { parseWsPayload } from '@/lib/ws-validators'
import { roomCreatedPayloadSchema, roomDeletedPayloadSchema } from '@squadfinder/schemas/ws'
import type { WebSocketEventHandler } from '@/lib/ws-client'

export interface UseLobbyEventsOptions {
  isConnected: boolean
  send: (type: string, data: unknown) => void
  on: (event: string, handler: WebSocketEventHandler) => () => void
}

export interface UseLobbyEventsReturn {
  isSubscribed: boolean
}

export function useLobbyEvents({
  isConnected,
  send,
  on,
}: UseLobbyEventsOptions): UseLobbyEventsReturn {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { addRoom, removeRoom } = useRoomsCache()

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
      unsubscribeDeleted()
      setIsSubscribed(false)
    }
  }, [isConnected, on, send, addRoom, removeRoom])

  return { isSubscribed }
}
