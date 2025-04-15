import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  const [roomId, setRoomId] = useState('')
  const [username, setUsername] = useState('')
  const navigate = useNavigate()

  const handleJoin = (type: 'editor' | 'draw') => {
    if (!roomId.trim() || !username.trim()) {
      toast.error('Both Room ID and Username are required!')
      return
    }

    localStorage.setItem('username', username)
    navigate(`/${type}/${roomId}`)
  }

  const handleGenerateRoom = () => {
    const newRoomId = uuidv4()
    setRoomId(newRoomId)
    toast.success(`Room created hurrayy!`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center px-4 py-8">
      <ToastContainer />
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col gap-6 items-center">
        <h1 className="text-4xl font-extrabold text-indigo-600 text-center">Code & Draw Collaborator</h1>

        <div className="flex flex-col w-full gap-1">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={handleGenerateRoom}
            className="text-sm text-indigo-600 hover:text-indigo-800 self-end transition"
          >
            Generate Random Room ID
          </button>

          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border mt-6 border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-4 mt-2 w-full justify-center">
          <button
            className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition"
            onClick={() => handleJoin('editor')}
          >
            Join Editor
          </button>
          <button
            className="bg-green-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition"
            onClick={() => handleJoin('draw')}
          >
            Join Drawing
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
