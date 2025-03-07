"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import axios from 'axios';

const CameraComponent = () => {
  const [imageData, setImageData] = useState(null);
  const [landmarkInfo, setLandmarkInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } catch (err) {
      setError('Unable to access camera. Please ensure you have given camera permissions.');
      console.error('Error accessing camera:', err);
    }
  };

  const getNearbyLandmark = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=100&type=tourist_attraction&key=AIzaSyDIFhpQ9Gsg7ywcBF3Occx6jo5NxQ-781g`
      );
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].name;
      }
      return null;
    } catch (error) {
      console.error('Error getting nearby places:', error);
      return null;
    }
  };

  const getLandmarkInfo = async (landmarkName) => {
    try {
      const response = await axios.post(
        "https://api.perplexity.ai/chat/completions",
        {
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "You are a knowledgeable tour guide. Provide interesting information about landmarks in a conversational tone."
            },
            {
              role: "user",
              content: `Tell me about ${landmarkName}. Include its history, cultural significance, and 2-3 interesting facts that most people don't know. Keep it concise.`
            }
          ],
        },
        {
          headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY}`,
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error('Failed to get landmark information');
    }
  };

  const takePhoto = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Capture photo
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const photoData = canvas.toDataURL('image/jpeg');
      setImageData(photoData);

      // Get current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      // Get nearby landmark
      const landmark = await getNearbyLandmark(
        position.coords.latitude,
        position.coords.longitude
      );

      if (landmark) {
        const info = await getLandmarkInfo(landmark);
        setLandmarkInfo({
          name: landmark,
          description: info
        });
      } else {
        setError('No landmarks found nearby. Try getting closer or taking a clearer photo.');
      }
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Camera Viewfinder */}
      <div className="relative flex-1">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div className="relative h-32 bg-gradient-to-t from-black to-transparent">
        <button
          onClick={takePhoto}
          disabled={isLoading}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white border-4 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      {/* Landmark Info Modal */}
      {landmarkInfo && (
        <div className="fixed inset-0 bg-black/80 p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-xl mx-auto mt-20 shadow-xl">
            <h2 className="text-2xl font-bold mb-2">{landmarkInfo.name}</h2>
            <div className="prose prose-sm">
              {landmarkInfo.description.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-4 text-gray-700">
                  {paragraph}
                </p>
              ))}
            </div>
            <button
              onClick={() => setLandmarkInfo(null)}
              className="mt-6 w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
