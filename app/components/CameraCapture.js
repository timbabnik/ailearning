'use client'
import { useState, useRef } from 'react'
import axios from 'axios'

export default function CameraCapture() {
  const [imageData, setImageData] = useState(null)
  const [landmarkInfo, setLandmarkInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      videoRef.current.srcObject = stream
      streamRef.current = stream
    } catch (err) {
      console.error('Error accessing camera:', err)
    }
  }

  // Take photo
  const takePhoto = async () => {
    setIsLoading(true)
    try {
      // Create canvas and get image data
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoRef.current, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg')
      setImageData(imageData)

      // Get current location
      const position = await getCurrentPosition()
      
      // Identify landmark using Google Cloud Vision API
      const landmark = await identifyLandmark(imageData)
      
      if (landmark) {
        // Get landmark information using Perplexity API
        const info = await getLandmarkInfo(landmark)
        setLandmarkInfo(info)
      } else {
        // Try using reverse geocoding with location
        const nearbyPlace = await getNearbyPlace(position.coords)
        if (nearbyPlace) {
          const info = await getLandmarkInfo(nearbyPlace)
          setLandmarkInfo(info)
        }
      }
    } catch (err) {
      console.error('Error capturing photo:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Get current position
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })
  }

  // Get landmark info from Perplexity
  const getLandmarkInfo = async (landmarkName) => {
    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          { 
            role: "system", 
            content: "Provide concise, interesting information about landmarks."
          },
          { 
            role: "user", 
            content: `Tell me about ${landmarkName}. Include its history, significance, and interesting facts.`
          }
        ],
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY}`,
        },
      }
    )
    return response.data.choices[0].message.content
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Camera Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-[70vh] object-cover"
      />

      {/* Controls */}
      <div className="fixed bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black to-transparent">
        <button
          onClick={takePhoto}
          className="w-16 h-16 rounded-full bg-white mx-auto block"
        />
      </div>

      {/* Landmark Info Modal */}
      {landmarkInfo && (
        <div className="fixed inset-0 bg-black/80 p-6">
          <div className="bg-white rounded-lg p-6 max-w-xl mx-auto mt-20">
            <h2 className="text-2xl font-bold mb-4">About this Landmark</h2>
            <p className="text-gray-700">{landmarkInfo}</p>
            <button
              onClick={() => setLandmarkInfo(null)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
        </div>
      )}
    </div>
  )
} 