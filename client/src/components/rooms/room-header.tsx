import type { Room } from '@/types'
import { ConnectionStatus } from '@/components/ui/connection-status'

interface RoomHeaderProps {
  room: Room | null
  code: string
  isConnected: boolean
}

export function RoomHeader({ room, code, isConnected }: RoomHeaderProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{room?.name}</h1>
          <p className="text-gray-500">
            Room Code: <span className="font-mono font-bold">{code}</span>
          </p>
        </div>
        <div className="text-right">
          <ConnectionStatus isConnected={isConnected} />
        </div>
      </div>
    </div>
  )
}
