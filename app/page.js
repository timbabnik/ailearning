'use client'
import { useState, useEffect } from 'react'
import { ChevronRight, Calendar, BookOpen, Star, Brain, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { auth, googleProvider, db } from '../firebase'// Make sure the path is correct
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'react-hot-toast'  // For notifications
import axios from "axios";

export default function Main() {
  const [email, setEmail] = useState('')
  const [selectedDay, setSelectedDay] = useState("Mon")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showModal, setShowModal] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  

const handleSubmit = async (e) => {
  e.preventDefault();
  

  if (!waitlistEmail) {
    toast.error('Please enter your email');
    return;
  }

  try {
    // Create a form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://hooks.zapier.com/hooks/catch/21965926/2qz7ck4/';
    form.target = '_blank'; // This prevents page reload

    // Add email input
    const emailInput = document.createElement('input');
    emailInput.type = 'hidden';
    emailInput.name = 'email';
    emailInput.value = waitlistEmail;
    form.appendChild(emailInput);

    // Add timestamp
    const timestampInput = document.createElement('input');
    timestampInput.type = 'hidden';
    timestampInput.name = 'timestamp';
    timestampInput.value = new Date().toISOString();
    form.appendChild(timestampInput);

    // Add form to body, submit it, and remove it
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    // Show success message
    toast.success('Successfully joined waitlist!');
    setWaitlistEmail('');
    setShowModal(false);

  } catch (error) {
    console.error("Error sending request:", error);
    toast.error('Something went wrong. Please try again.');
  }
};

  
  // Move colorMap outside the function to use it in multiple places
  const colorMap = {
    Mon: 'blue',
    Tue: 'purple',
    Wed: 'purple',
    Thu: 'purple',
    Fri: 'purple',
    Sat: 'green',
    Sun: 'yellow'
  };
  
  const getLearningColorClasses = (day) => {
    const isSelected = selectedDay === day;
    const color = colorMap[day];
    
    return isSelected 
      ? `bg-${color}-500 text-white border-2 border-${color}-500`
      : `text-gray-300 border-2 border-${color}-500 bg-${color}-500/10 hover:bg-${color}-500/20`;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleWaitlistSubmit = async () => {
    if (!waitlistEmail) {
      toast.error('Please enter your email')
      return
    }

    try {
      setIsSubmitting(true)
      
      // Add email to waitlist collection
      await addDoc(collection(db, 'waitlist'), {
        email: waitlistEmail,
        timestamp: serverTimestamp(),
      })

      // Show success message
      toast.success('Thank you for joining our waitlist!')
      
      // Clear the input
      setWaitlistEmail('')
      
      // Close the modal
      setShowModal(false)

    } catch (error) {
      console.error('Error adding email to waitlist:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add this test function near your other handlers
  const sendTestEmail = async () => {
    try {
      // Create a form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://hooks.zapier.com/hooks/catch/21965926/2qz7ck4/';
      form.style.display = 'none'; // Hide the form

      // Add test data
      const testData = {
        email: 'tim.babnik16@gmail.com',
        timestamp: new Date().toISOString(),
        subject: 'Test Email',
        message: 'Timo tuki'
      };

      // Add each field to the form
      Object.entries(testData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      // Create an iframe to handle the submission
      const iframe = document.createElement('iframe');
      iframe.name = 'submit-iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // Target the iframe
      form.target = 'submit-iframe';

      // Add form to body, submit it, and remove it
      document.body.appendChild(form);
      form.submit();

      // Clean up after submission
      setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
      }, 1000);

      toast.success('Test email sent!');
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error('Failed to send test email');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1b1e] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-20 animate-float-slow">
          <div className="w-40 h-56 bg-[#1e1f23] rounded-lg shadow-xl transform rotate-6 flex flex-col items-center justify-center p-4">
            <BookOpen className="w-8 h-8 text-blue-500 mb-2" />
            <div className="w-20 h-2 bg-blue-500/20 rounded mb-2"></div>
            <div className="w-16 h-2 bg-blue-500/20 rounded"></div>
          </div>
        </div>

        <div className="absolute top-1/3 right-24 animate-float-normal">
          <div className="w-40 h-56 bg-[#1e1f23] rounded-lg shadow-xl transform -rotate-12 flex flex-col items-center justify-center p-4">
            <Star className="w-8 h-8 text-purple-500 mb-2" />
            <div className="w-20 h-2 bg-purple-500/20 rounded mb-2"></div>
            <div className="w-16 h-2 bg-purple-500/20 rounded"></div>
          </div>
        </div>

        <div className="absolute bottom-1/4 right-40 animate-float-fast">
          <div className="w-40 h-56 bg-[#1e1f23] rounded-lg shadow-xl transform rotate-12 flex flex-col items-center justify-center p-4">
            <Brain className="w-8 h-8 text-green-500 mb-2" />
            <div className="w-20 h-2 bg-green-500/20 rounded mb-2"></div>
            <div className="w-16 h-2 bg-green-500/20 rounded"></div>
          </div>
        </div>

        {/* Interactive Background Elements */}
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.05), transparent 80%)`
          }}
        />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/10 rounded-full animate-float-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />

        {/* Sparkles Effect */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`
            }}
          >
            <Sparkles className="w-3 h-3 text-blue-500/20" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative">
        {/* Navigation */}
        <header className="border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <span className="text-xl font-bold text-white">
                  Odin's<span className="text-blue-500"> AI</span>
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <Link 
                  href="/learn"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/learn"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Get Started
                </Link>
                {showModal && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-[#1a1b1e] to-[#252629] p-8 rounded-2xl max-w-md w-full mx-4 border border-white/10 shadow-xl shadow-black/20">
                      <div className="relative">
                        {/* Decorative elements */}
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl" />
                        
                        <h3 className="text-2xl font-bold text-white mb-2 relative">Get Access Now</h3>
                        <p className="text-gray-400 mb-8">Experience personalized AI-powered learning today and transform your education journey!</p>
                        
                        <div className="relative mb-6">
                          <input
                            type="email" 
                            placeholder="Enter your email"
                            value={waitlistEmail}
                            onChange={(e) => setWaitlistEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 text-white placeholder-gray-400 rounded-xl border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/5 rounded-xl pointer-events-none" />
                        </div>

                        <div className="flex justify-end gap-4">
                          <button
                            onClick={() => setShowModal(false)}
                            className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors relative group"
                            disabled={isSubmitting}
                          >
                            Cancel
                            <span className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                          <button
                            onClick={handleWaitlistSubmit}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Joining...</span>
                              </>
                            ) : (
                              'Join Waitlist'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
       

        {/* Add margin-top to the first section to account for fixed header */}
        <div className="relative pt-16">
          {/* Content Container - Add relative to keep content above background */}
          <div className="relative">
            {/* Hero Image */}
            <div className="absolute top-0 right-0 w-full md:w-1/2 h-[500px] opacity-20">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a1b1e] via-transparent to-transparent"></div>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src="https://i.postimg.cc/Hsg4cNyP/IMG-1262.png" 
                className="h-[700px] w-auto object-contain mt-10 rounded-3xl border-2 border-white/50"
              />
            </div>
            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
              
              <div className="text-center">
                <h1 id="learn" className="text-4xl sm:text-6xl font-bold text-white mb-6">
                  
                  Learn new things, <span className="text-blue-500">Revisit old ones</span>
                </h1>
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                  Let AI create your personalized learning journey and deliver bite-sized lessons to your inbox daily
                </p>
                
                {/* CTA Section */}
                <div className="max-w-md mx-auto relative">
                  <input
                    type="email"
                    placeholder="What you'd like to learn?"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm px-4 py-3 bg-white/10 text-white placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 pr-32"
                  />
                  <Link 
                    href="/learn"
                    className="absolute right-2 top-1/2 -translate-y-1/2 whitespace-nowrap px-4 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    Get Started
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#1e1f23] rounded-xl mt-32">
                <div className="text-center mb-12">
                  <h2 id="schedule" className="text-3xl font-bold text-white mb-4">
                    Email Automation - Daily Learning Schedule
                  </h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    1. Create AI-personalized courses and get each chapter delivered to your inbox daily<br/>
                    2. Upload your books highlights and notes, and receive them in your email<br/>
                    3. Revisit your favorites notes at the right time to remember them forever<br/>
                    4. Receive random highlights from your books and notes every day
                  </p>
                </div>
                <p className="text-gray-600 font-bold max-w-2xl mx-auto text-center">
                  *Below is an example that you can customize to your liking*
                </p>

                {/* Calendar Grid */}
                <div className="max-w-md mx-auto mt-6">
                  <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const isSelected = selectedDay === day;
                      
                      return (
                        <button
                          key={day}
                          onClick={() => {
                            setSelectedDay(isSelected ? null : day);
                          }}
                          className="flex flex-col items-center gap-1"
                        >
                          <span className="text-gray-400 text-xs">
                            {day}
                          </span>
                          <div
                            className={`
                              w-10 h-20 rounded-full flex items-center justify-center transition-all duration-200
                              ${getLearningColorClasses(day)}
                            `}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Day Info */}
                  {selectedDay && (
                    <div className={`mt-8 bg-${colorMap[selectedDay]}-500/20 rounded-lg p-6`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 bg-${colorMap[selectedDay]}-500/20 rounded-lg`}>
                          <Calendar className={`w-5 h-5 text-${colorMap[selectedDay]}-500`} />
                        </div>
                        <h3 className="text-white font-medium">
                          {colorMap[selectedDay] === 'blue' ? "Deep Learning" :
                           colorMap[selectedDay] === 'purple' ? "History of Roman Empire" :
                           colorMap[selectedDay] === 'green' ? "Random Highlights" :
                           colorMap[selectedDay] === 'yellow' ? "Favorite" :
                           "Today's Email"}
                        </h3>
                      </div>

                      {colorMap[selectedDay] === 'purple' && (
                        <div className="rounded-lg mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3 mt-4">
                          
                              <h3 className="text-white font-medium">
                                {selectedDay === 'Tue' ? "Founding and Early Republic" :
                                 selectedDay === 'Wed' ? "The Roman Republic" :
                                 selectedDay === 'Thu' ? "The Roman Empire" :
                                 selectedDay === 'Fri' ? "Decline and Fall" :
                                 "Today's Email"}
                              </h3>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="space-y-6 relative">
                              {/* Dynamic content based on selected day */}
                              {selectedDay === 'Tue' && (
                                <>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                      <div className="absolute top-3 left-1.5 w-0.5 h-20 bg-white"></div>
                                    </div>
                                    <div className="ml-6 pb-6">
                                      <p className="text-white/60 text-sm">
                                      The Legend of Romulus and Remus
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                      <div className="absolute top-3 left-1.5 w-0.5 h-20 bg-white"></div>
                                    </div>
                                    <div className="ml-6 pb-6">
                                      <p className="text-white/60 text-sm">
                                      Establishment of the Roman Republic
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                      <div className="absolute top-3 left-1.5 w-0.5 h-16 bg-white"></div>
                                    </div>
                                    <div className="ml-6 pb-6">
                                      <p className="text-white/60 text-sm">
                                      The Twelve Tables and Early Roman Law
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                    <div className="ml-6">
                                      <p className="text-white/60 text-sm">
                                      Expansion in the Italian Peninsula
                                      </p>
                                    </div>
                                  </div>
                                </>
                              )}

                              {selectedDay === 'Wed' && (
                                <>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                      <div className="absolute top-3 left-1.5 w-0.5 h-20 bg-white"></div>
                                    </div>
                                    <div className="ml-6 pb-6">
                                      <p className="text-white/60 text-sm">
                                      The Punic Wars and Carthage
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                      <div className="absolute top-3 left-1.5 w-0.5 h-20 bg-white"></div>
                                    </div>
                                    <div className="ml-6 pb-6">
                                      <p className="text-white/60 text-sm">
                                      The Gracchi Brothers and Social Reforms
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                      <div className="absolute top-3 left-1.5 w-0.5 h-16 bg-white"></div>
                                    </div>
                                    <div className="ml-6 pb-6">
                                      <p className="text-white/60 text-sm">
                                      The Rise of Julius Caesar
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                    <div className="ml-6">
                                      <p className="text-white/60 text-sm">
                                      The Fall of the Republic and Civil Wars
                                      </p>
                                    </div>
                                  </div>
                                </>
                              )}

                              {selectedDay === 'Thu' && (
                                <>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                      <div className="absolute top-3 left-1.5 w-0.5 h-20 bg-white"></div>
                                    </div>
                                    <div className="ml-6 pb-6">
                                      <p className="text-white/60 text-sm">
                                      The Reign of Augustus and the Pax Romana
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                      <div className="absolute top-3 left-1.5 w-0.5 h-20 bg-white"></div>
                                    </div>
                                    <div className="ml-6 pb-6">
                                      <p className="text-white/60 text-sm">
                                      The Julio-Claudian Dynasty
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                      <div className="absolute top-3 left-1.5 w-0.5 h-16 bg-white"></div>
                                    </div>
                                    <div className="ml-6 pb-6">
                                      <p className="text-white/60 text-sm">
                                      The Five Good Emperors
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                    <div className="ml-6">
                                      <p className="text-white/60 text-sm">
                                      Crisis of the Third Century
                                      </p>
                                    </div>
                                  </div>
                                </>
                              )}

                              {selectedDay === 'Fri' && (
                                <>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                      <div className="absolute top-3 left-1.5 w-0.5 h-20 bg-white"></div>
                                    </div>
                                    <div className="ml-6 pb-6">
                                      <p className="text-white/60 text-sm">
                                      The Division of the Empire
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                      <div className="absolute top-3 left-1.5 w-0.5 h-20 bg-white"></div>
                                    </div>
                                    <div className="ml-6 pb-6">
                                      <p className="text-white/60 text-sm">
                                      The Rise of Christianity
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                      <div className="absolute top-3 left-1.5 w-0.5 h-16 bg-white"></div>
                                    </div>
                                    <div className="ml-6 pb-6">
                                      <p className="text-white/60 text-sm">
                                      Barbarian Invasions
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                    <div className="ml-6">
                                      <p className="text-white/60 text-sm">
                                      The Fall of the Western Roman Empire
                                      </p>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {
                        colorMap[selectedDay] === 'yellow' && (
                          <div className="mt-4">
                            <p className="text-white/80 text-sm mb-4">
                              You will get highlights you favorited. Curate your favorites that inspires you and get them every day.
                            </p>
                          </div>
                        )
                      }

                        {
                            colorMap[selectedDay] === 'green' && (
                                <div className="mt-4">
                          <p className="text-white/80 text-sm mb-4">
                            You will get 5 random highlights from your books and notes
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              
                              className="bg-white/20 hover:bg-white/30 text-white w-8 h-8 rounded-full"
                              
                            >
                              -
                            </button>
                            <span className="text-white font-medium">5</span>
                            <button
                              
                              className="bg-white/20 hover:bg-white/30 text-white w-8 h-8 rounded-full"
                              
                            >
                              +
                            </button>
                          </div>
                        </div>
                            )
                        }
                       
                        {colorMap[selectedDay] === 'blue' && (
                        <div className="mt-4">
                          <p className="text-white/80 text-sm mb-4">
                            Every week you will get deep into one of your books/notes with takeaways
                          </p>
                          <p className="text-white/60 text-sm mb-2">Current book:</p>
                          <div className="bg-white/10 p-3 rounded-lg">
                              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                               
                                  <button
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                                  >
                                    <div className="relative w-12 h-16 flex-shrink-0">
                                      <img
                                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5qcmy62N6gLb08y6YeeZGNOXuuLoTiO303w&s"
                                        
                                        fill
                                        className="rounded object-cover"
                                      />
                                    </div>
                                    <div className="text-left">
                                      <p className="text-white text-xs font-medium truncate">Happy Odyssey</p>
                                      <p className="text-white/60 text-xs truncate">Adrian Carton de Wiart</p>
                                    </div>
                                  </button>
                            
                                </div>
                              </div>
                            

                              <div className="mt-4">
                                <p className="text-white/60 text-sm border-t border-gray-500 pt-4">
                                <>
                                      With 15 highlights per day, it will take you{' '}
                                      <span className="text-white">
                                        3 days
                                      </span>{' '}
                                      to go through all{' '}
                                      <span className="text-white">
                                       15 highlights
                                      </span>
                                      
                                    </>
                                </p>
                              </div>
                            
                        </div>
                      )}
                        
                      </div>
                      
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="text-center mt-12">
                    <Link 
                      href="/learn"
                      className="inline-flex items-center gap-2 px-8 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
                    >
                      Start Your Learning Journey
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                  <div className="bg-[#1e1f23] p-6 rounded-xl">
                    
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Learning</h3>
                    <p className="text-gray-400">
                      Do you want to learn about American History, AI, Mindfulness, Cooking, and more? Let AI create a personalized course just for you.
                    </p>
                  </div>

                  <div className="bg-[#1e1f23] p-6 rounded-xl">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 id="about" className="text-xl font-semibold text-white mb-2">Old Wisdom</h3>
                    <p className="text-gray-400">
                      Upload your book highlights, notes, and quotes to revisit them and remember them forever.
                    </p>
                  </div>

                  <div className="bg-[#1e1f23] p-6 rounded-xl">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Email automation</h3>
                    <p className="text-gray-400">
                      Get daily emails with new and old knowledge: AI courses by chapters, random highlights from your highlights/notes, deep learning from your favorite books.
                    </p>
                  </div>
                </div>

                {/* Calendar Section */}
                
              </div>

              {/* What You Can Learn Section */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                    Learn <span className="text-blue-500">Anything</span>
                  </h2>
                  <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                    Choose from endless possibilities. Our AI creates personalized courses 
                    tailored to your learning style and goals
                  </p>
                </div>

                {/* Topics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Ancient History */}
                  <div className="group relative overflow-hidden rounded-2xl bg-[#1e1f23] hover:bg-[#23242a] transition-all duration-300 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e1f23] via-black/50 to-transparent z-10"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=2070"
                      alt="Ancient History" 
                      className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                      <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Ancient History</h3>
                      <p className="text-gray-300 text-base leading-relaxed">
                        Explore civilizations, empires, and the foundations of human society
                      </p>
                    </div>
                  </div>

                  {/* Mindfulness */}
                  <div className="group relative overflow-hidden rounded-2xl bg-[#1e1f23] hover:bg-[#23242a] transition-all duration-300 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e1f23] via-black/50 to-transparent z-10"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070" 
                      alt="Mindfulness" 
                      className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                      <div className="bg-purple-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Mindfulness</h3>
                      <p className="text-gray-300 text-base leading-relaxed">
                        Learn meditation, stress management, and mental wellness techniques
                      </p>
                    </div>
                  </div>

                  {/* Cooking */}
                  <div className="group relative overflow-hidden rounded-2xl bg-[#1e1f23] hover:bg-[#23242a] transition-all duration-300 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e1f23] via-black/50 to-transparent z-10"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070" 
                      alt="Cooking" 
                      className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                      <div className="bg-green-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Cooking</h3>
                      <p className="text-gray-300 text-base leading-relaxed">
                        Master culinary techniques, recipes, and food science
                      </p>
                    </div>
                  </div>

                  {/* Continue with other cards using the same enhanced styling */}
                </div>

                {/* Enhanced CTA Button */}
                <div className="text-center mt-16">
                  <Link 
                    href="/learn"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                  >
                    Start Your Learning Journey
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              {/* Revisit Highlights Section */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
                <div className="text-center mb-16">
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                    Revisit <span className="text-purple-500">Highlights</span>
                  </h2>
                  <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                    Never forget what you've read. Get your favorite highlights delivered to your inbox 
                    at the perfect time for maximum retention
                  </p>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Atomic Habits */}
                  <div className="group bg-[#1e1f23] rounded-2xl p-6 hover:bg-[#23242a] transition-all duration-300 shadow-xl border border-white/5">
                    <div className="flex items-start gap-4 mb-6">
                      <img 
                        src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1974" 
                        alt="Atomic Habits" 
                        className="w-16 h-24 object-cover rounded-lg shadow-lg"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Atomic Habits</h3>
                        <p className="text-gray-400 text-sm">James Clear</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
                        <p className="text-gray-300 text-sm leading-relaxed">
                          "You do not rise to the level of your goals. You fall to the level of your systems."
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">Last revisited 3 days ago</p>
                    </div>
                  </div>

                  {/* Meditations */}
                  <div className="group bg-[#1e1f23] rounded-2xl p-6 hover:bg-[#23242a] transition-all duration-300 shadow-xl border border-white/5">
                    <div className="flex items-start gap-4 mb-6">
                      <img 
                        src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2068" 
                        alt="Meditations" 
                        className="w-16 h-24 object-cover rounded-lg shadow-lg"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Meditations</h3>
                        <p className="text-gray-400 text-sm">Marcus Aurelius</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
                        <p className="text-gray-300 text-sm leading-relaxed">
                          "Very little is needed to make a happy life; it is all within yourself, in your way of thinking."
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">Last revisited 1 week ago</p>
                    </div>
                  </div>

                  {/* Think and Grow Rich */}
                  <div className="group bg-[#1e1f23] rounded-2xl p-6 hover:bg-[#23242a] transition-all duration-300 shadow-xl border border-white/5">
                    <div className="flex items-start gap-4 mb-6">
                      <img 
                        src="https://images.unsplash.com/photo-1592496431122-2349e0fbc666?q=80&w=2068" 
                        alt="Think and Grow Rich" 
                        className="w-16 h-24 object-cover rounded-lg shadow-lg"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Think and Grow Rich</h3>
                        <p className="text-gray-400 text-sm">Napoleon Hill</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
                        <p className="text-gray-300 text-sm leading-relaxed">
                          "Whatever the mind can conceive and believe, it can achieve."
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">Last revisited 2 weeks ago</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="text-center mt-12">
                  <Link 
                    href="/learn"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 group"
                  >
                    <span>Start Saving Highlights</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <p className="text-gray-400 text-sm mt-4">
                    Join thousands of readers building their second brain
                  </p>
                </div>
              </div>

              {/* Testimonials Section */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
                <div className="text-center mb-16">
                  <span className="text-blue-500 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mt-4 mb-6">
                    Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Learners</span>
                  </h2>
                  <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                    Join thousands of people who are transforming their learning journey with AI-powered education
                  </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Testimonial 1 */}
                  <div className="group relative">
                    {/* Decorative Elements */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
                    
                    <div className="relative bg-[#1e1f23] p-8 rounded-2xl hover:bg-[#23242a] transition-all duration-300">
                      <div className="flex items-center gap-4 mb-6">
                        <img 
                          src="https://i.pravatar.cc/150?img=32" 
                          alt="Sarah Johnson" 
                          className="w-12 h-12 rounded-full border-2 border-blue-500/20"
                        />
                        <div>
                          <h3 className="text-white font-semibold">Sarah Johnson</h3>
                          <p className="text-gray-400 text-sm">Product Designer</p>
                        </div>
                      </div>
                      <div className="mb-6">
                        <div className="flex gap-1 text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        "This platform has completely transformed how I learn. The AI-curated content 
                        and spaced repetition of my book highlights have helped me retain information 
                        better than ever before. It's like having a personal learning assistant!"
                      </p>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
                    
                    <div className="relative bg-[#1e1f23] p-8 rounded-2xl hover:bg-[#23242a] transition-all duration-300">
                      <div className="flex items-center gap-4 mb-6">
                        <img 
                          src="https://i.pravatar.cc/150?img=11" 
                          alt="Michael Chen" 
                          className="w-12 h-12 rounded-full border-2 border-purple-500/20"
                        />
                        <div>
                          <h3 className="text-white font-semibold">Michael Chen</h3>
                          <p className="text-gray-400 text-sm">Software Engineer</p>
                        </div>
                      </div>
                      <div className="mb-6">
                        <div className="flex gap-1 text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        "The daily emails with my book highlights keep me engaged with what I've read. 
                        The AI-generated courses are incredibly well-structured and the learning experience 
                        is seamless. Highly recommend!"
                      </p>
                    </div>
                  </div>

                  {/* Testimonial 3 */}
                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
                    
                    <div className="relative bg-[#1e1f23] p-8 rounded-2xl hover:bg-[#23242a] transition-all duration-300">
                      <div className="flex items-center gap-4 mb-6">
                        <img 
                          src="https://i.pravatar.cc/150?img=44" 
                          alt="Emily Rodriguez" 
                          className="w-12 h-12 rounded-full border-2 border-blue-500/20"
                        />
                        <div>
                          <h3 className="text-white font-semibold">Emily Rodriguez</h3>
                          <p className="text-gray-400 text-sm">Marketing Director</p>
                        </div>
                      </div>
                      <div className="mb-6">
                        <div className="flex gap-1 text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        "As a busy professional, this platform has been a game-changer. The personalized 
                        learning paths and bite-sized content make it easy to stay consistent with my 
                        learning goals. The UI is beautiful and intuitive!"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
                  <div className="text-center">
                    <h4 className="text-3xl font-bold text-white mb-2">10k+</h4>
                    <p className="text-gray-400 text-sm">Active Learners</p>
                  </div>
                  <div className="text-center">
                    <h4 className="text-3xl font-bold text-white mb-2">50k+</h4>
                    <p className="text-gray-400 text-sm">Book Highlights</p>
                  </div>
                  <div className="text-center">
                    <h4 className="text-3xl font-bold text-white mb-2">100+</h4>
                    <p className="text-gray-400 text-sm">AI Courses</p>
                  </div>
                  <div className="text-center">
                    <h4 className="text-3xl font-bold text-white mb-2">4.9</h4>
                    <p className="text-gray-400 text-sm">Average Rating</p>
                  </div>
                </div>

                {/* Final CTA */}
                <div className="text-center mt-20">
                  <Link 
                    href="/learn"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-xl font-medium transition-all duration-500 shadow-lg hover:shadow-blue-500/20 group"
                  >
                    <span>Join Our Community</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <p className="text-gray-400 text-sm mt-4">
                    Start your learning journey today
                  </p>
                </div>
              </div>

              {/* Footer */}
              <footer className="border-t border-gray-800 mt-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <p className="text-center text-gray-400 text-sm">
                    © 2024 Your Learning Platform. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    
  )
}