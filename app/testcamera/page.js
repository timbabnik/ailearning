'use client'; // Mark this as a Client Component

import { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';

export default function TestCamera() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [textRegions, setTextRegions] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const takePicture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageUrl);

      // Stop camera stream
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());

      // Process image for text regions
      processImageForText(imageUrl);
    }
  };

  const processImageForText = async (imageUrl) => {
    setIsProcessing(true);
    try {
      const result = await Tesseract.recognize(imageUrl, 'eng', {
        logger: m => console.log(m)
      });
      
      console.log('Tesseract result:', result.data); // Debug log
      
      // Extract text blocks
      const blocks = [];
      result.data.blocks?.forEach((block, index) => {
        blocks.push({
          id: index,
          text: block.text,
          bbox: block.bbox,
          selected: false
        });
      });
      
      console.log('Processed blocks:', blocks); // Debug log
      setTextRegions(blocks);
    } catch (error) {
      console.error('Error processing text:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleTextSelection = (region) => {
    console.log('Toggling region:', region); // Debug log
    
    setTextRegions(prev => {
      const updated = prev.map(r => ({
        ...r,
        selected: r.id === region.id ? !r.selected : r.selected
      }));
      
      // Update selected text immediately
      const selectedTexts = updated
        .filter(r => r.selected)
        .map(r => r.text)
        .join(' ');
      
      console.log('Selected text:', selectedTexts); // Debug log
      setSelectedText(selectedTexts);
      
      return updated;
    });
  };

  const copySelectedText = async () => {
    if (!selectedText) {
      console.log('No text selected'); // Debug log
      return;
    }
    
    try {
      await navigator.clipboard.writeText(selectedText);
      alert('Text copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy text:', error);
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = selectedText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Text copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1b1e]">
      {!capturedImage ? (
        // Camera View
        <div className="relative h-screen">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <button
            onClick={takePicture}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4"
          >
            <div className="w-12 h-12 rounded-full border-4 border-black" />
          </button>
        </div>
      ) : (
        // Text Selection View
        <div className="relative">
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full"
            />
            {!isProcessing && textRegions.map(region => (
              <button
                key={region.id}
                onClick={() => toggleTextSelection(region)}
                className={`absolute cursor-pointer ${
                  region.selected 
                    ? 'bg-blue-500/30 border-2 border-blue-500' 
                    : 'hover:bg-white/10 border border-transparent'
                }`}
                style={{
                  left: `${((region.bbox?.x0 || 0) / (canvasRef.current?.width || 1)) * 100}%`,
                  top: `${((region.bbox?.y0 || 0) / (canvasRef.current?.height || 1)) * 100}%`,
                  width: `${(((region.bbox?.x1 || 0) - (region.bbox?.x0 || 0)) / (canvasRef.current?.width || 1)) * 100}%`,
                  height: `${(((region.bbox?.y1 || 0) - (region.bbox?.y0 || 0)) / (canvasRef.current?.height || 1)) * 100}%`,
                  padding: '4px'
                }}
              >
                <span className="text-transparent select-none">{region.text}</span>
              </button>
            ))}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1e1f23] border-t border-gray-800">
            {isProcessing ? (
              <div className="text-white text-center">Processing image...</div>
            ) : (
              <>
                {selectedText && (
                  <div className="mb-4 p-2 bg-[#2d2f34] text-white rounded-lg">
                    {selectedText}
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setCapturedImage(null);
                      setTextRegions([]);
                      setSelectedText('');
                      startCamera();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg"
                  >
                    Retake
                  </button>
                  <button
                    onClick={copySelectedText}
                    disabled={!selectedText}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                  >
                    Copy Selected Text
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}