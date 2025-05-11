'use client'
import { useState, useEffect } from 'react'
import { ChevronRight, Calendar, BookOpen, Star, Brain, Sparkles, Mail, Plus } from 'lucide-react'
import Link from 'next/link'
import { auth, googleProvider, db } from '../firebase'// Make sure the path is correct
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'react-hot-toast'  // For notifications
import axios from "axios";
import Image from 'next/image'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function Main() {
  const [email, setEmail] = useState('')
  const [selectedDay, setSelectedDay] = useState("Tue")
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
    Tue: 'green',
    Wed: 'green',
    Thu: 'green',
    Fri: 'green',
    Sat: 'purple',
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

  const calculateMasteryPercentage = (revisitCount) => {
    const targetRevisits = 5; // Number of revisits needed for mastery
    return Math.min((revisitCount / targetRevisits) * 100, 100);
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
        <div className="absolute top-[10%] left-20 animate-float-slow">
          <div className="w-40 h-56 bg-[#1e1f23] rounded-lg shadow-xl transform rotate-6 flex flex-col items-center justify-center p-4">
            <BookOpen className="w-8 h-8 text-blue-500 mb-2" />
            <div className="w-20 h-2 bg-blue-500/20 rounded mb-2"></div>
            <div className="w-16 h-2 bg-blue-500/20 rounded"></div>
          </div>
        </div>

        <div className="absolute top-[15%] right-24 animate-float-normal">
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
                <span className="text-2xl font-black text-white tracking-wide font-['Inter']">
                  Odin's<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600"> AI</span>
                </span>
              </div>
              
              <div className="flex items-center gap-4">
               
                
                {showModal && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-[#1a1b1e] to-[#252629] p-8 rounded-2xl max-w-md w-full mx-4 border border-white/10 shadow-xl shadow-black/20">
                      <div className="relative z-10">
                        {/* Decorative elements */}
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -z-10"></div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl -z-10"></div>
                        
                        <h3 className="text-2xl font-bold text-white mb-2 relative">Get Access for Free</h3>
                        <p className="text-gray-400 mb-8">While our premium platform will cost at launch, waitlist members will receive lifetime free access. Join now to lock in this exclusive offer!</p>
                        
                        <div className="relative mb-6">
                          <input
                            type="email" 
                            placeholder="Enter your email"
                            value={waitlistEmail}
                            onChange={(e) => setWaitlistEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 text-white placeholder-gray-400 rounded-xl border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/5 rounded-xl pointer-events-none"></div>
                        </div>

                        <div className="flex justify-start gap-4 relative z-20">
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
            <div className="text-center">
                <h1 id="learn" className="text-4xl sm:text-6xl font-bold text-white mb-6 mt-10">
                  
                  Turn Bookmarks <span className="text-blue-500">into Mastery</span>
                </h1>
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Capture ideas, links, articles, and highlights in one click. Revisit them through smart, personalized email automation—delivered right to your inbox.
                </p>
                
                {/* Add relative positioning and z-index to ensure button is clickable */}
                <div className="text-center">
                  <button
                    onClick={() => setShowModal(true)}
                    className="relative z-20 inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-xl font-medium transition-all duration-500 shadow-lg hover:shadow-blue-500/20 group"
                  >
                    <span className="flex items-center gap-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/800px-Google_Chrome_icon_%28February_2022%29.svg.png" className="w-5 h-5" />
                      Download Extension
                    </span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-0">
                  
                  
                </div>

                {/* Video Section */}
                <div className="relative w-full max-w-4xl mx-auto mb-20">
                  {/* Animated gradient border */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-2xl blur-sm animate-gradient-xy"></div>
                  
                  {/* Glow effects */}
                  <div className="absolute -inset-2">
                    <div className="w-full h-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
                  </div>

                  {/* Corner accents */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-blue-500/50 rounded-tl-lg"></div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-purple-500/50 rounded-tr-lg"></div>
                  <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-purple-500/50 rounded-bl-lg"></div>
                  <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-blue-500/50 rounded-br-lg"></div>

                  {/* Video container */}
                  <div className="relative bg-[#1e1f23] rounded-2xl overflow-hidden shadow-2xl">
                    <div className="aspect-w-16 aspect-h-9">
                      <video 
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                        preload="auto"
                      >
                        <source src="/video/presentatio.mov" type="video/mp4" />
                        <p>
                          Your browser doesn't support HTML5 video. Here is a 
                          <a href="/video/demo.mp4">link to the video</a> instead.
                        </p>
                      </video>
                    </div>

                    {/* Play button overlay (shows before video starts) */}
                    <div className="absolute inset-0 flex items-center justify-center group cursor-pointer">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-blue-500 border-b-8 border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    </div>

                    {/* Floating particles */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-blue-500/20 rounded-full animate-float-particle"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${15 + Math.random() * 10}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Example Progress Cards */}
                
              </div>
            
            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-32">
                {/* How It Works Section */}
                <div className="text-center mb-16">
                 
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mt-4 mb-6">
                    How it <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Works</span>
                    <div className="flex justify-center mt-4">
                      <ChevronRight className="w-6 h-6 text-blue-500 transform rotate-90" />
                    </div>
                  </h2>
                
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                  {/* Step 1 */}
                  <div className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition-opacity"></div>
                    
                    <div className="relative bg-[#1e1f23] p-8 rounded-2xl h-full">
                      <div className="bg-blue-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                        <span className="text-2xl font-bold text-blue-500">1</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">One Click to Save Anything</h3>
                      <p className="text-gray-400 leading-relaxed">
                      Highlight text, save links, or capture YouTube timestamps right from your browser. Just click the extension, pick a folder, and it's saved—organized and ready to revisit.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition-opacity"></div>
                    
                    <div className="relative bg-[#1e1f23] p-8 rounded-2xl h-full">
                      <div className="bg-purple-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                        <span className="text-2xl font-bold text-purple-500">2</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">Receive it in your email</h3>
                      <p className="text-gray-400 leading-relaxed">
                      Choose what you want to remember—by topic, folder, or random. Get it delivered to your inbox on your schedule, so nothing valuable gets lost or forgotten.
                      </p>
                    </div>
                  </div>
                </div>
              

              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#1e1f23] rounded-xl mt-32">
                <div className="text-center mb-12">
                  <h2 id="schedule" className="text-3xl font-bold text-white mb-4 max-w-[600px] mx-auto px-4 sm:px-0">
                    Refresh knowledge of your favorite highlights, blog links, articles, tweets, videos, ...
                  </h2>
                  
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
                          {colorMap[selectedDay] === 'blue' ? "Check it later" :
                           colorMap[selectedDay] === 'purple' ? "Business content" :
                           colorMap[selectedDay] === 'green' ? "Random" :
                           colorMap[selectedDay] === 'yellow' ? "Quotes" :
                           "Today's Email"}
                        </h3>
                      </div>

                      {colorMap[selectedDay] === 'purple' && (
                        <div className="mt-4">
                        <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-white/80 text-sm">
                            Refresh your saved business content
                            </p>
                            
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-purple-400/80">
                            <Mail className="w-4 h-4" />
                            <span>Next email scheduled for tomorrow at 9:00 AM</span>
                          </div>
                          
                        </div>
                       
                      </div>
                      )}

                      {
                        colorMap[selectedDay] === 'yellow' && (
                          <div className="mt-4">
                          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-white/80 text-sm">
                              Revisit your favorite quotes and inspirational content
                              </p>
                              
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-yellow-400/80">
                              <Mail className="w-4 h-4" />
                              <span>Next email scheduled for tomorrow at 9:00 AM</span>
                            </div>
                            
                          </div>
                         
                        </div>
                        )
                      }

                        {
                            colorMap[selectedDay] === 'green' && (
                                <div className="mt-4">
                          <p className="text-white/80 text-sm mb-4">
                          Get random highlights from your collection to your email to refresh your memory.
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
                          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-white/80 text-sm">
                                Get emails of content you saved and want to check out later
                              </p>
                              
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-blue-400/80">
                              <Mail className="w-4 h-4" />
                              <span>Next email scheduled for tomorrow at 9:00 AM</span>
                            </div>
                            
                          </div>
                         
                        </div>
                      )}
                        
                      </div>
                      
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setShowModal(true)}
                      className="relative z-20 inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-xl font-medium transition-all duration-500 shadow-lg hover:shadow-blue-500/20 group"
                    >
                      <span className="flex items-center gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/800px-Google_Chrome_icon_%28February_2022%29.svg.png" className="w-5 h-5" />
                        Download Extension
                      </span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                  {/* AI-Powered Learning */}
                 
                    {/* Gradient border effect */}
                   
                    
                  
                      {/* Image with overlay */}
                      

                      {/* Icon */}
                      
                </div>

                {/* Calendar Section */}
                
              </div>

              {/* What You Can Learn Section */}
              

              {/* Revisit Highlights Section */}
              

                {/* CTA Button */}
           

              {/* Testimonials Section */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
                <div className="text-center mb-16">
                  <span className="text-blue-500 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mt-4 mb-6">
                    Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Learners</span>
                  </h2>
                  <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                    Join 1000+ of people who are transforming their learning journey with Daily Odin
                  </p>
                </div>

                {/* Scrollable Testimonials Container */}
                <div className="relative">
                  {/* Gradient Masks */}
                  <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#1a1b1e] to-transparent z-10"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#1a1b1e] to-transparent z-10"></div>

                  {/* Scroll Container */}
                  <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex gap-6 pb-4 min-w-max px-4">
                      {/* Testimonial 1 */}
                      <div className="group relative w-[400px] flex-shrink-0">
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
                              <p className="text-gray-400 text-sm">Content Creator</p>
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
                            "Finally found a solution to my 'bookmark and forget' problem! The daily emails with my saved content 
                            keep me engaged with what I've bookmarked. Love how I can highlight key parts of articles and 
                            revisit them later. It's like having a second brain!"
                          </p>
                        </div>
                      </div>

                      {/* Testimonial 2 */}
                      <div className="group relative w-[400px] flex-shrink-0">
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
                              <p className="text-gray-400 text-sm">Research Analyst</p>
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
                            "The Chrome extension is a game-changer! One click to save interesting content, 
                            and the scheduled email reminders help me actually revisit what I've saved. 
                            Perfect for someone who reads a lot of articles and wants to retain the knowledge."
                          </p>
                        </div>
                      </div>

                      {/* Testimonial 3 */}
                      <div className="group relative w-[400px] flex-shrink-0">
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
                              <p className="text-gray-400 text-sm">Digital Marketer</p>
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
                            "As someone who's always finding inspiring content online, this tool is invaluable. 
                            I can quickly save quotes, tweets, and article highlights, and the email reminders 
                            ensure I actually review and use what I've saved. It's transformed how I learn from online content!"
                          </p>
                        </div>
                      </div>

                      {/* Additional Testimonials */}
                      <div className="group relative w-[400px] flex-shrink-0">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
                        <div className="relative bg-[#1e1f23] p-8 rounded-2xl hover:bg-[#23242a] transition-all duration-300">
                          <div className="flex items-center gap-4 mb-6">
                            <img 
                              src="https://i.pravatar.cc/150?img=68" 
                              alt="David Kim" 
                              className="w-12 h-12 rounded-full border-2 border-purple-500/20"
                            />
                            <div>
                              <h3 className="text-white font-semibold">David Kim</h3>
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
                            "The spaced repetition feature is brilliant! I use it to review programming concepts 
                            and best practices. The ability to customize email schedules helps me maintain a 
                            steady learning pace without feeling overwhelmed."
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scroll Indicators */}
                  <div className="flex justify-center gap-2 mt-8">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="w-2 h-2 rounded-full bg-white/20"></div>
                    <div className="w-2 h-2 rounded-full bg-white/20"></div>
                    <div className="w-2 h-2 rounded-full bg-white/20"></div>
                  </div>
                </div>
              </div>

              {/* Mastery Progress Section */}
              

              {/* Footer */}
              <footer className="border-t border-gray-800 mt-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <p className="text-center text-gray-400 text-sm">
                    © 2024 Daily Odin. All rights reserved ❤️
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    
  )
}