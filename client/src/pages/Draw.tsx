// src/pages/Draw.tsx
import { useParams, useNavigate } from 'react-router-dom'
import DrawingCanvas from '../components/DrawingCanvas'

export default function DrawPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()

  if (!roomId) {
    return <div className="p-4 text-red-500">Room ID is required in the URL</div>
  }

  return (
    <div className="flex flex-col w-screen h-screen bg-gray-100">
      <header className="flex items-center justify-between bg-white shadow-md p-4">
        <div className="text-lg font-semibold text-gray-700">Drawing Room: <span className="font-mono">{roomId}</span></div>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={() => navigate('/')}
          >
            Home
          </button>
          <button
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
            onClick={() => navigate(`/editor/${roomId}`)}
          >
            Go to Editor
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <DrawingCanvas roomId={roomId} />
      </main>
    </div>
  )
}
