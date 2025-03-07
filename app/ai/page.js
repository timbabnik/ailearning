"use client"

import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function AI() {
  const [activeSubject, setActiveSubject] = useState('Matematika')
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [savedItems, setSavedItems] = useState([])
  const [quickSaveInput, setQuickSaveInput] = useState('')

  // Simulate AI response
  const getAIResponse = (userMessage) => {
    const responses = [
      "To je zanimivo vprašanje! Lahko vam pomagam s tem.",
      "Razumem vašo dilemo. Poglejmo, kako lahko to rešimo.",
      "Dober primer! Pojdimo korak za korakom. fasdfasdf asdfa sdfasdf asdas dfa sdfas dfasdf asdfa sdfas dfasdf asdfa sd fasdf asdfasdfas dfa",
      "To je pomembna tema. Dovolite mi, da pojasnim.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }


  const addItemToSavedItems = () => {
    setSavedItems([...savedItems, "test"]);
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle Command/Ctrl + E
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault()
        
        // Find the last AI message
        const lastAiMessage = [...messages].reverse().find(msg => msg.sender === 'ai')
        
        if (lastAiMessage) {
          setSavedItems(prev => [...prev, {
            id: Date.now(),
            text: lastAiMessage.text
          }])
        }
      }

      // Handle Command/Ctrl + W
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault()
        if (quickSaveInput.trim()) {
          setSavedItems(prev => [...prev, {
            id: Date.now(),
            text: quickSaveInput
          }])
          setQuickSaveInput('')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [messages, quickSaveInput]) // Add messages and quickSaveInput as dependencies

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user'
    }
    
    // Simulate AI response
    const aiMessage = {
      id: Date.now() + 1,
      text: getAIResponse(inputMessage),
      sender: 'ai'
    }

    setMessages(prev => [...prev, userMessage, aiMessage])
    setInputMessage('')
  }

  const subjects = [
    { label: 'M', name: 'Matematika' },
    { label: 'K', name: 'Kemija' },
    { label: 'A', name: 'Angleščina' },
    { label: 'F', name: 'Fizika' },
  ]

  const topics = [
    'Linearni sistem enačb',
    'Geometrija valja',
    'Odvod',
    'Kotne funkcije',
    'Polinom',
  ]



  return (
    <main className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e1f23] p-5 fixed h-screen">
        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo.png" alt="Astra AI" width={30} height={30} />
          <span className="text-white font-semibold">Rabbit Hole</span>
        </div>

        <button className="w-full bg-[#4154f1] text-white py-2 px-4 rounded-lg flex items-center gap-2 mb-6">
          + NOV POGOVOR
        </button>

        <div className="flex gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.name}
              className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition"
              onClick={() => setActiveSubject(subject.name)}
            >
              {subject.label}
            </div>
          ))}
        </div>
        
        {/* Quick Save Input */}
        <input
          type="text"
          value={quickSaveInput}
          onChange={(e) => setQuickSaveInput(e.target.value)}
          placeholder="Type and press ⌘W to save..."
          className="mt-4 w-full bg-white/5 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4154f1]"
        />

        {/* Saved Items Map */}
        {savedItems.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-white/70 text-sm font-medium">Saved Items:</h3>
            <div className="">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 p-3 my-3 cursor-pointer rounded-lg text-white text-sm hover:bg-white/10 transition"
                >
                  {item.text.slice(0,22)}...
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 bg-[#1a1b1e] p-8 flex flex-col min-h-screen">
        {/* Header stays at top */}
        <header className="flex justify-between items-center">
          <h1 className="text-2xl text-white font-semibold">
            Hej Tim, dobrodošel! 👋
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full bg-white/10">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full bg-gray-400"></button>
          </div>
        </header>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col mt-8">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-4">
            {messages.map((message, index) => {
              // Check if this is the last AI message
              const isLastAiMessage = 
                message.sender === 'ai' && 
                messages.slice(index + 1).every(msg => msg.sender === 'user');

              return (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="w-full">
                    <div
                      className={`${
                        message.sender === 'user'
                          ? 'text-white text-right'
                          : 'bg-white/10 text-white p-4 rounded-md w-full'
                      }`}
                    >
                      {message.text}
                      <>
                      {isLastAiMessage && (
                      <div className="flex gap-2 mt-4">
                      <button className="px-4 py-3 bg-white/10 hover:bg-white/10 text-white text-sm rounded-lg transition">
                        Save
                        <span className='ml-3 text-xs border border-white/50 rounded-lg px-2 py-1'>⌘ E</span>
                      </button>
                      <button className="px-4 py-3 bg-white/10 hover:bg-white/10 text-white text-sm rounded-lg transition">
                        Rabbit Hole
                        <span className='text-xs ml-3 border border-white/50 rounded-lg px-2 py-1'>⌘ R</span>
                      </button>
                    </div>
                    )}
                      </>
                    </div>
                    
                    {/* Buttons only for last AI message */}
                    
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSubmit} className="mt-auto">
            <div className="relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Napiši svoje vprašanje..."
                className="w-full bg-[#1a1b1e] border border-white/50 text-white pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-[#4154f1]"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-white/10"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}