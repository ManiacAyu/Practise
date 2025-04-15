import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { EditorState, Compartment } from '@codemirror/state'
import { EditorView, basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { oneDark } from '@codemirror/theme-one-dark'
import throttle from 'lodash.throttle'

const Editor = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const socketRef = useRef<WebSocket | null>(null)

  const [username, setUsername] = useState('')
  const [fontSize, setFontSize] = useState(14)
  const [language, setLanguage] = useState('javascript')

  const languageCompartment = useRef(new Compartment()).current
  const fontSizeCompartment = useRef(new Compartment()).current

  const throttledSend = useRef(
    throttle((content: string) => {
      socketRef.current?.send(JSON.stringify({
        type: 'code_update',
        payload: content,
      }))
    }, 200)
  ).current

  useEffect(() => {
    const name = localStorage.getItem('username')
    if (!name) {
      alert('Username missing. Redirecting to home.')
      navigate('/')
      return
    }
    setUsername(name)

    if (editorRef.current && !viewRef.current) {
      const state = EditorState.create({
        doc: '',
        extensions: [
          basicSetup,
          oneDark,
          languageCompartment.of(javascript()),
          fontSizeCompartment.of(EditorView.theme({ '&': { fontSize: `${fontSize}px` } })),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const content = update.state.doc.toString()
              throttledSend(content)
            }
          }),
        ],
      })

      viewRef.current = new EditorView({
        state,
        parent: editorRef.current,
      })
    }

    const socket = new WebSocket(`ws://localhost:8000/ws/editor/${roomId}/`)
    socketRef.current = socket

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'code_update' && viewRef.current) {
        const current = viewRef.current.state.doc.toString()
        if (data.payload !== current) {
          viewRef.current.dispatch({
            changes: { from: 0, to: current.length, insert: data.payload },
          })
        }
      }
    }

    return () => {
      socket.close()
    }
  }, [roomId, navigate, fontSizeCompartment, languageCompartment, throttledSend])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    const extension = lang === 'python'
      ? python()
      : lang === 'java'
        ? java()
        : javascript()

    viewRef.current?.dispatch({
      effects: languageCompartment.reconfigure(extension),
    })
  }

  const handleFontSizeChange = (size: number) => {
    setFontSize(size)
    viewRef.current?.dispatch({
      effects: fontSizeCompartment.reconfigure(
        EditorView.theme({ '&': { fontSize: `${size}px` } })
      ),
    })
  }

  return (
    <div className="flex flex-col gap-0 h-screen bg-blue-400">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#1E1E1E]">
        <h2 className="text-lg font-semibold text-white">
          🏷 Room ID: <span className="text-blue-500">{roomId}</span> | 👤 {username}
        </h2>
        <div className="flex gap-3 items-center">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="border rounded px-3 py-1 bg-[#333333] text-white"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          <select
            value={fontSize}
            onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
            className="border rounded px-3 py-1 bg-[#333333] text-white"
          >
            {[12, 14, 16, 18, 20].map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
          <button
            className="bg-gray-100 text-black px-3 py-1 rounded hover:bg-gray-200"
            onClick={() => navigate('/')}
          >
            ⬅️ Home
          </button>
          <button
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            onClick={() => navigate(`/draw/${roomId}`)}
          >
            ✏️ Go to Drawing
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="bg-[#1E1E1E] text-white rounded-md shadow-lg flex-1 overflow-auto"
        style={{ minHeight: '80vh' }}
      />
    </div>
  )
}

export default Editor
