'use client'
import { useState, useRef, useEffect } from 'react'
import { Camera, BookOpen, Copy, Check } from 'lucide-react'

export default function Read() {
  const [capturedImage, setCapturedImage] = useState(null)
  const [savedTexts, setSavedTexts] = useState([])
  const [isCopied, setIsCopied] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    startCamera()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      alert('Unable to access camera. Please make sure you have given camera permissions.')
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current) return
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg')
    setCapturedImage(imageData)
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  const handleCopyText = async () => {
    const selection = window.getSelection()
    const selectedText = selection.toString()
    
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText)
        setSavedTexts(prev => [...prev, {
          id: Date.now(),
          text: selectedText,
          timestamp: new Date().toISOString()
        }])
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy text:', err)
      }
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#1a1b1e]">
      {!capturedImage ? (
        // Camera view takes full height
        <div className="h-full flex flex-col">
          <div className="relative flex-1 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!videoRef.current?.srcObject && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
                  <p>Starting camera...</p>
                </div>
              </div>
            )}
          </div>
          <div className="bg-[#1e1f23] p-4 flex justify-center items-center gap-4">
            <button
              onClick={startCamera}
              className="p-2 text-white hover:text-blue-400"
              title="Retry camera"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-[#1e1f23] flex items-center justify-center border-2 border-white"
            >
              <Camera className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      ) : (
        // Results view with scrollable content
        <div className="h-full flex flex-col">
          {/* Fixed header */}
          <div className="flex-shrink-0 p-4 bg-[#1e1f23] border-b border-gray-800">
            <h1 className="text-lg font-semibold text-white">Captured Image</h1>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto p-4">
              <div className="bg-[#1e1f23] rounded-lg shadow-lg overflow-hidden">
                <div className="relative">
                  <div 
                    className="select-text" 
                    style={{ 
                      WebkitUserSelect: 'text',
                      WebkitTouchCallout: 'default'
                    }}
                  >
                    <img
                      ref={imageRef}
                      src={capturedImage}
                      alt="Captured page"
                      className="w-full"
                      style={{
                        WebkitUserSelect: 'text',
                        WebkitTouchCallout: 'default'
                      }}
                    />
                  </div>
                  
                  <button
                    onClick={handleCopyText}
                    className="absolute top-4 right-4 p-2 bg-[#1a1b1e] rounded-full shadow-lg"
                  >
                    {isCopied ? (
                      <Check className="w-6 h-6 text-green-500" />
                    ) : (
                      <Copy className="w-6 h-6 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-4 p-4 bg-[#1e1f23] rounded-lg text-gray-300">
                <p>
                  Press and hold on the text in the image to select it. Tap the copy button to save the selection.
                </p>
              </div>

              {/* Saved Texts */}
              {savedTexts.length > 0 && (
                <div className="mt-8 mb-20">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                    <BookOpen className="w-5 h-5" />
                    Saved Texts
                  </h2>
                  <div className="space-y-4">
                    {savedTexts.map(item => (
                      <div
                        key={item.id}
                        className="bg-[#1e1f23] p-4 rounded-lg shadow"
                      >
                        <p className="text-gray-200">{item.text}</p>
                        <p className="text-sm text-gray-400 mt-2">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed FAB */}
          <button
            onClick={() => {
              setCapturedImage(null)
              startCamera()
            }}
            className="fixed bottom-4 right-4 bg-[#1e1f23] text-white p-4 rounded-full shadow-lg border border-gray-700"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  )
}