import { useParams } from 'react-router-dom'
import DrawingCanvas from './DrawingCanvas.tsx'

export default function DrawingCanvasWrapper() {
  const { roomId } = useParams<{ roomId: string }>()

  if (!roomId) return <p>Room ID is required</p>

  return <DrawingCanvas roomId={roomId} />
}
