import { useEffect, useRef } from 'react'
import { Tldraw, Editor } from 'tldraw'
import 'tldraw/tldraw.css'

type Props = {
  roomId: string
}

export default function DrawingCanvas({ roomId }: Props) {
  const socketRef = useRef<WebSocket | null>(null)
  const editorRef = useRef<Editor | null>(null)
  const lastSentRef = useRef(0)
  const THROTTLE_INTERVAL = 5000 // ms

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8000/ws/draw/${roomId}/`)
    socketRef.current = socket

    socket.onopen = () => {
      console.log('WebSocket connected for drawing')
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'draw_sync' || data.type === 'draw_update') {
        try {
          const payload = data.payload
          const editor = editorRef.current
          if (editor && payload) {
            editor.store.loadSnapshot(payload)
          }
        } catch (e) {
          console.error('Error applying drawing update', e)
        }
      }
    }

    return () => {
      socket.close()
    }
  }, [roomId])

  const handleMount = (editor: Editor) => {
    editorRef.current = editor

    editor.store.listen(() => {
      const now = Date.now()
      if (now - lastSentRef.current < THROTTLE_INTERVAL) return
      lastSentRef.current = now

      const snapshot = editor.store.getSnapshot()
      socketRef.current?.send(
        JSON.stringify({
          type: 'draw_update',
          payload: snapshot,
        })
      )
    })
  }

  return (
    <div className="absolute inset-0 mt-17">
      <Tldraw onMount={handleMount} />
    </div>
  )
}