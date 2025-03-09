'use client'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { X, Camera, ChevronLeft, ChevronRight, Plus, Calendar, BookOpen, Library, Settings, Home, Star, Clock, LogOut } from 'lucide-react'
import { auth, googleProvider, db } from '../../firebase'
import { signInWithPopup, signOut } from 'firebase/auth'
import { collection, addDoc, setDoc, doc, serverTimestamp, query, getDocs, getDoc, deleteDoc } from 'firebase/firestore'
import Tesseract from 'tesseract.js'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [activeGenre, setActiveGenre] = useState('Self-Help')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newText, setNewText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [userBooks, setUserBooks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [selectedText, setSelectedText] = useState('')
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState(null)
  const [selectionEnd, setSelectionEnd] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [weekdayColors, setWeekdayColors] = useState({
    Mon: 'green',
    Tue: 'blue',
    Wed: 'blue',
    Thu: 'blue',
    Fri: 'blue',
    Sat: 'blue',
    Sun: 'yellow'
  })
  const [colorsLoaded, setColorsLoaded] = useState(false)
  const [savedHighlightsCount, setSavedHighlightsCount] = useState(5)
  const [savedCategory, setSavedCategory] = useState(null)
  const [randomHighlightsCount, setRandomHighlightsCount] = useState(savedHighlightsCount || 5)
  const [randomBook, setRandomBook] = useState(null)
  const [isEditingBook, setIsEditingBook] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showHighlightsModal, setShowHighlightsModal] = useState(false)
  const [selectedBookHighlights, setSelectedBookHighlights] = useState(null)
  const [bookHighlights, setBookHighlights] = useState([])
  const [learningPlan, setLearningPlan] = useState([]);
  const [userLearningPlans, setUserLearningPlans] = useState([]);
  const [selectedDaySubsections, setSelectedDaySubsections] = useState([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false)
  const [selectedHighlights, setSelectedHighlights] = useState(new Set())
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [customType, setCustomType] = useState('custom')
  const [customText, setCustomText] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiType, setAiType] = useState('motivation')
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [highlightToDelete, setHighlightToDelete] = useState(null);
  const [showLearnModal, setShowLearnModal] = useState(false)
  const [learningTopic, setLearningTopic] = useState('')
  const [isLearningLoading, setIsLearningLoading] = useState(false);
  const [isLearningComplete, setIsLearningComplete] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState(0);
  const [activeSection, setActiveSection] = useState('home')
  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const searchBooks = async (query) => {
      if (!query.trim()) {
        setSearchResults([])
        return
      }
  
      setIsSearching(true)
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`
        )
        const data = await response.json()
        
        const formattedResults = data.items?.map(book => ({
          id: book.id,
          title: book.volumeInfo.title,
          author: book.volumeInfo.authors?.[0] || null,
          cover: book.volumeInfo.imageLinks?.thumbnail || '/placeholder-cover.jpg'
        })) || []
        
        setSearchResults(formattedResults)
      } catch (error) {
        console.error('Error searching books:', error)
      } finally {
        setIsSearching(false)
      }
    }

    if (showAddModal && searchQuery) {
      const timer = setTimeout(() => {
        searchBooks(searchQuery)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchQuery, showAddModal])

  // Fetch user's books when user is authenticated
  useEffect(() => {
    const fetchUserBooks = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const userBooksRef = collection(db, 'users', user.uid, 'books');
        const q = query(userBooksRef);
        const querySnapshot = await getDocs(q);
        
        const books = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setUserBooks(books);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBooks();
  }, [user]);

  useEffect(() => {
    const fetchWeekdayColors = async () => {
      if (user) {
        try {
          const weekdayColorsRef = doc(db, 'users', user.uid, 'settings', 'weekdayColors');
          const weekdayColorsDoc = await getDoc(weekdayColorsRef);
          
          if (weekdayColorsDoc.exists()) {
            const colors = weekdayColorsDoc.data();
            console.log('Colors fetched from Firebase:', colors);
            setWeekdayColors(colors);
            console.log('Weekday colors set:', weekdayColors);
          } else {
            // Initialize default colors in Firebase
            const defaultColors = {
              Mon: 'green',
              Tue: 'blue',
              Wed: 'blue',
              Thu: 'blue',
              Fri: 'blue',
              Sat: 'blue',
              Sun: 'yellow'
            };
            await setDoc(weekdayColorsRef, defaultColors);
            setWeekdayColors(defaultColors);
            console.log('Default colors initialized in Firebase:', defaultColors);
            console.log('Weekday initialized in Firebase:', weekdayColors);
          }
          setColorsLoaded(true);
        } catch (error) {
          console.error('Error fetching weekday colors:', error);
        }
      }
    };

    fetchWeekdayColors();
  }, [user]);

  const initializeWeekdayColors = async (userId) => {
    try {
      const userWeekdayColorsRef = doc(db, 'users', userId, 'settings', 'weekdayColors');
      await setDoc(userWeekdayColorsRef, {
        Mon: 'green',
        Tue: 'blue',
        Wed: 'blue',
        Thu: 'blue',
        Fri: 'blue',
        Sat: 'blue',
        Sun: 'yellow'
      });
    } catch (error) {
      console.error('Error initializing weekday colors:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if weekday colors exist for the user
      const weekdayColorsRef = doc(db, 'users', user.uid, 'settings', 'weekdayColors');
      const weekdayColorsDoc = await getDoc(weekdayColorsRef);
      
      // If colors don't exist, initialize them
      if (!weekdayColorsDoc.exists()) {
        await initializeWeekdayColors(user.uid);
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleAddText = async () => {
    // Check for empty text
    if (!newText.trim()) {
      toast.error('Please enter some text');
      return;
    }

    // Check for empty book selection
    if (!selectedBook && !searchQuery.trim()) {
      toast.error('Please select a book or enter a name for the folder');
      return;
    }

    try {
      // Reference to the user's books collection
      const userBooksRef = collection(db, 'users', user.uid, 'books');
      
      let bookRef;
      if (selectedBook) {
        // If a book is selected, use its ID
        bookRef = doc(userBooksRef, selectedBook.id);
        
        // Save book data
        await setDoc(bookRef, {
          title: selectedBook.title,
          author: selectedBook.author,
          cover: selectedBook.cover,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        // If no book is selected, create a new folder
        const newBookRef = doc(userBooksRef);
        bookRef = newBookRef;
        
        await setDoc(bookRef, {
          title: searchQuery.trim(),
          author: 'Folder of your highlights', // Set default author for folders
          cover: '',
          updatedAt: serverTimestamp(),
        });
      }

      // Add highlight to the book
      const highlightsRef = collection(bookRef, 'highlights');
      await addDoc(highlightsRef, {
        text: newText,
        timestamp: serverTimestamp(),
      });

      // Reset form
      setNewText('');
      setSearchQuery('');
      setShowAddModal(false);
      
      toast.success('Highlight added successfully');
    } catch (error) {
      console.error('Error adding text:', error);
      toast.error('Failed to add highlight');
    }
  };

  const genres = [
    { id: 1, name: 'Novel', icon: '📚' },
    { id: 2, name: 'Self-Help', icon: '⚡' },
    { id: 3, name: 'Fantasy', icon: '🧙' },
    { id: 4, name: 'True Crime', icon: '🔍' },
    { id: 5, name: 'Science Fiction', icon: '🚀' },
  ]

  const books = [
    {
      id: 1,
      title: 'Happy Odyssey',
      author: 'Adrian Carton de Wiart',
      rating: 4.9,
      cover: 'https://m.media-amazon.com/images/I/71IPv04-KoL._AC_UF1000,1000_QL80_.jpg'
    },
  ]

  const handlePhotoCapture = () => {
    setShowInstructionModal(true);
  };

  // Helper function to detect iOS
  const isIOS = () => {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  };

  const handleImageTextSelection = async (imageUrl) => {
    try {
      // Show some loading state
      setSelectedText('Recognizing text...');
      
      const result = await Tesseract.recognize(
        imageUrl,
        'eng', // language
        { logger: m => console.log(m) } // optional logger
      );
      
      const recognizedText = result.data.text;
      setSelectedText(recognizedText);
      setNewText(recognizedText); // This will update the textarea
      setShowCamera(false);
      
    } catch (error) {
      console.error('Error processing image:', error);
      setSelectedText('Error recognizing text');
    }
  };

  const handleSelectionComplete = () => {
    // Implementation of handleSelectionComplete
  };

  const renderCameraView = () => (
    <div className="fixed inset-0 bg-[#1a1b1e] z-50 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Capture Text</h2>
        <button 
          onClick={() => {
            setShowCamera(false)
            setCapturedImage(null)
          }}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <button
              onClick={captureImage}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4"
            >
              <Camera className="w-6 h-6 text-black" />
            </button>
          </>
        ) : (
          <div className="relative h-full">
            <div 
              className="relative"
              onTouchStart={(e) => {
                if (isSelecting) {
                  const touch = e.touches[0]
                  setSelectionStart({ x: touch.clientX, y: touch.clientY })
                }
              }}
              onTouchMove={(e) => {
                if (isSelecting && selectionStart) {
                  const touch = e.touches[0]
                  setSelectionEnd({ x: touch.clientX, y: touch.clientY })
                }
              }}
              onTouchEnd={() => {
                if (isSelecting) {
                  // Extract selected text here
                  handleSelectionComplete()
                }
              }}
            >
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-contain"
              />
              {selectionStart && selectionEnd && (
                <div
                  className="absolute bg-blue-500/30 border-2 border-blue-500"
                  style={{
                    left: Math.min(selectionStart.x, selectionEnd.x),
                    top: Math.min(selectionStart.y, selectionEnd.y),
                    width: Math.abs(selectionEnd.x - selectionStart.x),
                    height: Math.abs(selectionEnd.y - selectionStart.y),
                  }}
                />
              )}
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={() => {
                  setCapturedImage(null)
                }}
                className="bg-[#1e1f23] text-white px-4 py-2 rounded-lg"
              >
                Retake
              </button>
              <button
                onClick={() => setIsSelecting(!isSelecting)}
                className={`px-4 py-2 rounded-lg ${
                  isSelecting ? 'bg-blue-500 text-white' : 'bg-[#1e1f23] text-white'
                }`}
              >
                {isSelecting ? 'Selecting...' : 'Select Text'}
              </button>
              <button
                onClick={() => handleImageTextSelection(capturedImage)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Use Text
              </button>
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const getColorClasses = (day) => {
    if (!colorsLoaded) return 'text-gray-300 border-2 border-gray-500 bg-gray-500/20';
    
    const color = weekdayColors[day];
    const isSelected = selectedDay === day;

    // Create color mapping for backgrounds with proper opacity
    const colorMapping = {
      green: {
        selected: 'bg-green-500 text-white border-2 border-green-500',
        default: 'text-gray-300 border-2 border-green-500 bg-green-500/10 hover:bg-green-500/20'
      },
      blue: {
        selected: 'bg-blue-500 text-white border-2 border-blue-500',
        default: 'text-gray-300 border-2 border-blue-500 bg-blue-500/10 hover:bg-blue-500/20'
      },
      yellow: {
        selected: 'bg-yellow-500 text-white border-2 border-yellow-500',
        default: 'text-gray-300 border-2 border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20'
      },
      purple: {
        selected: 'bg-purple-500 text-white border-2 border-purple-500',
        default: 'text-gray-300 border-2 border-purple-500 bg-purple-500/10 hover:bg-purple-500/20'
      }
    };

    return isSelected 
      ? colorMapping[color].selected 
      : colorMapping[color].default;
  };

  // Add this new function for the learning calendar
  const getLearningColorClasses = (day) => {
    if (!colorsLoaded) return 'text-gray-300 border-2 border-gray-500 bg-gray-500/20';
    
    const isSelected = selectedDay === day;
    
    return isSelected 
      ? 'bg-purple-500 text-white border-2 border-purple-500' 
      : 'text-gray-300 border-2 border-purple-500 bg-purple-500/10 hover:bg-purple-500/20';
  };

  // Update the getTextForColor function
  const getTextForColor = (color) => {
    switch (color) {
      case 'blue':
        return 'Deep Learning';
      case 'green':
        return 'Random highlights';
      case 'yellow':
        return 'Favorites';
      case 'purple':
        return 'Your course schedule';
      default:
        return '';
    }
  };

  // Update the changeWeekdayColor function
  const changeWeekdayColor = async () => {
    if (!selectedDay || !user) return;
    
    try {
      const weekdayColorsRef = doc(db, 'users', user.uid, 'settings', 'weekdayColors');
      const currentColor = weekdayColors[selectedDay];
      
      // Rotate through colors: green -> blue -> yellow -> purple -> green
      const nextColor = 
        currentColor === 'green' ? 'blue' :
        currentColor === 'blue' ? 'yellow' :
        currentColor === 'yellow' ? 'purple' : 'green';
      
      // Update color in Firebase
      await setDoc(weekdayColorsRef, {
        ...weekdayColors,
        [selectedDay]: nextColor
      });
      
      // Update local state
      setWeekdayColors(prev => ({
        ...prev,
        [selectedDay]: nextColor
      }));
    } catch (error) {
      console.error('Error changing color:', error);
    }
  };

  const getRandomBook = () => {
    if (userBooks.length > 0) {
      const randomIndex = Math.floor(Math.random() * userBooks.length);
      return userBooks[randomIndex];
    }
    return null;
  };

  useEffect(() => {
    if (showEmailModal) {
      setRandomBook(getRandomBook());
    }
  }, [showEmailModal, userBooks]);

  // Add this function to filter genres
  const filteredGenres = genres.filter(genre => 
    genre.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Add this useEffect to load saved settings when modal opens
  useEffect(() => {
    const loadUserSettings = async () => {
      if (user && showEmailModal) {
        try {
          const settingsRef = doc(db, 'users', user.uid, 'settings', 'emailPreferences');
          const settingsDoc = await getDoc(settingsRef);
          
          if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            if (data.randomHighlightsCount) {
              setRandomHighlightsCount(data.randomHighlightsCount);
              setSavedHighlightsCount(data.randomHighlightsCount);
            }
            if (data.selectedCategory) {
              setSelectedCategory(data.selectedCategory);
              setSavedCategory(data.selectedCategory);
            }
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
    };

    loadUserSettings();
  }, [user, showEmailModal]);

  // Update the save function
  const saveSchedule = async () => {
    if (!user) return;

    try {
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'emailPreferences');
      
      await setDoc(settingsRef, {
        randomHighlightsCount: randomHighlightsCount,
        selectedCategory: selectedCategory
      }, { merge: true });

      setSavedHighlightsCount(randomHighlightsCount);
      setSavedCategory(selectedCategory);
      setShowEmailModal(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleOpenHighlights = async (book) => {
    setSelectedBookHighlights(book)
    setShowHighlightsModal(true)
    setIsLoadingHighlights(true)
    
    try {
      const highlightsRef = collection(db, 'users', user.uid, 'books', book.id, 'highlights')
      const highlightsSnapshot = await getDocs(highlightsRef)
      
      const highlights = highlightsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }))
      
      // Sort highlights by timestamp, newest first
      highlights.sort((a, b) => b.timestamp - a.timestamp)
      
      setBookHighlights(highlights)
    } catch (error) {
      console.error('Error fetching highlights:', error)
    } finally {
      setIsLoadingHighlights(false)
    }
  }

  const toggleHighlightSelection = (highlightId) => {
    setSelectedHighlights(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(highlightId)) {
        newSelection.delete(highlightId)
      } else {
        newSelection.add(highlightId)
      }
      return newSelection
    })
  }

  const handleKindleImport = () => {
    // Amazon OAuth configuration
    const AMAZON_CLIENT_ID = process.env.NEXT_PUBLIC_AMAZON_CLIENT_ID;
    const REDIRECT_URI = encodeURIComponent(`${window.location.origin}/api/kindle/callback`);
    const AMAZON_AUTH_URL = 'https://www.amazon.com/ap/oa';
    
    // Required scopes for Kindle access
    const SCOPES = encodeURIComponent('kindle_access');
    
    // Construct the Amazon OAuth URL
    const authUrl = `${AMAZON_AUTH_URL}?client_id=${AMAZON_CLIENT_ID}&scope=${SCOPES}&response_type=code&redirect_uri=${REDIRECT_URI}`;
    
    // Redirect to Amazon login
    window.location.href = authUrl;
  };

  const speakHighlights = async (book) => {
    if (!window.speechSynthesis) {
      alert("Sorry, your browser doesn't support text-to-speech!");
      return;
    }

    try {
      // If already playing, stop
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        return;
      }

      // Fetch highlights if not already loaded
      const highlightsRef = collection(db, 'users', user.uid, 'books', book.id, 'highlights');
      const highlightsSnapshot = await getDocs(highlightsRef);
      const highlights = highlightsSnapshot.docs.map(doc => doc.data().text);

      if (highlights.length === 0) {
        alert("No highlights found for this book!");
        return;
      }

      setIsPlaying(true);

      // Create utterance queue
      const speakHighlight = (index) => {
        if (index >= highlights.length) {
          setIsPlaying(false);
          setCurrentHighlightIndex(0);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(highlights[index]);
        
        utterance.onend = () => {
          setCurrentHighlightIndex(index + 1);
          speakHighlight(index + 1);
        };

        utterance.onerror = () => {
          console.error('Speech synthesis error');
          setIsPlaying(false);
        };

        window.speechSynthesis.speak(utterance);
      };

      speakHighlight(0);

    } catch (error) {
      console.error('Error fetching highlights for speech:', error);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Add this function to fetch highlights count
  const fetchHighlightsCount = async (bookId) => {
    if (!user || !bookId) return 0;
    try {
      const highlightsRef = collection(db, 'users', user.uid, 'books', bookId, 'highlights');
      const highlightsSnapshot = await getDocs(highlightsRef);
      return highlightsSnapshot.size;
    } catch (error) {
      console.error('Error fetching highlights count:', error);
      return 0;
    }
  };

  // Update the useEffect where randomBook is initially set
  useEffect(() => {
    const getRandomBookWithHighlights = async () => {
      if (!userBooks.length || !user) return;
      
      const randomIndex = Math.floor(Math.random() * userBooks.length);
      const selectedBook = userBooks[randomIndex];
      
      // Fetch highlights count
      const highlightsRef = collection(db, 'users', user.uid, 'books', selectedBook.id, 'highlights');
      const highlightsSnapshot = await getDocs(highlightsRef);
      
      // Set random book with highlights count
      setRandomBook({
        ...selectedBook,
        highlightsCount: highlightsSnapshot.size
      });
    };

    if (showEmailModal) {
      getRandomBookWithHighlights();
    }
  }, [showEmailModal, userBooks, user]);

  // Add this useEffect to handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSearchResults(false);
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchLearningPlans = async () => {
      if (!user) return;
      
      try {
        const learningPlansRef = collection(db, 'users', user.uid, 'learningPlans');
        const learningPlansSnapshot = await getDocs(learningPlansRef);
        
        const plans = await Promise.all(learningPlansSnapshot.docs.map(async (doc) => {
          const planData = doc.data();
          
          // Get sections count
          const sectionsRef = collection(doc.ref, 'sections');
          const sectionsSnapshot = await getDocs(sectionsRef);
          const sectionsCount = sectionsSnapshot.size;
          
          // Get total subsections count
          let subsectionsCount = 0;
          for (const sectionDoc of sectionsSnapshot.docs) {
            const subsectionsRef = collection(sectionDoc.ref, 'subsections');
            const subsectionsSnapshot = await getDocs(subsectionsRef);
            subsectionsCount += subsectionsSnapshot.size;
          }
          
          return {
            id: doc.id,
            ...planData,
            sectionsCount,
            subsectionsCount
          };
        }));
        
        setUserLearningPlans(plans);
      } catch (error) {
        console.error('Error fetching learning plans:', error);
      }
    };

    fetchLearningPlans();
  }, [user]);

  useEffect(() => {
    const fetchSubsections = async () => {
      if (!user || !selectedDay) return;

      try {
        // Get the most recent learning plan
        const learningPlansRef = collection(db, 'users', user.uid, 'learningPlans');
        const learningPlansSnapshot = await getDocs(learningPlansRef);
        
        const plans = learningPlansSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        const mostRecentPlan = plans.sort((a, b) => 
          b.createdAt?.toMillis() - a.createdAt?.toMillis()
        )[0];

        if (mostRecentPlan) {
          // Get sections for this plan
          const sectionsRef = collection(db, 'users', user.uid, 'learningPlans', mostRecentPlan.id, 'sections');
          const sectionsSnapshot = await getDocs(sectionsRef);
          
          // Find the section that matches the selected day
          const sections = sectionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Find the section for the selected day
          const dayMapping = {
            'Mon': 'Monday',
            'Tue': 'Tuesday', 
            'Wed': 'Wednesday',
            'Thu': 'Thursday',
            'Fri': 'Friday',
            'Sat': 'Saturday', 
            'Sun': 'Sunday'
          };

          const selectedSection = sections.find(section => 
            section.day === dayMapping[selectedDay] || 
            section.order === ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(selectedDay)
          );

          if (selectedSection) {
            // Get subsections for the selected section
            const subsectionsRef = collection(
              db, 
              'users', 
              user.uid, 
              'learningPlans', 
              mostRecentPlan.id, 
              'sections', 
              selectedSection.id, 
              'subsections'
            );
            const subsectionsSnapshot = await getDocs(subsectionsRef);
            
            const subsections = subsectionsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            // Sort subsections by order
            const sortedSubsections = subsections.sort((a, b) => a.order - b.order);
            setSelectedDaySubsections(sortedSubsections);
          }
        }
      } catch (error) {
        console.error('Error fetching subsections:', error);
      }
    };

    fetchSubsections();
  }, [user, selectedDay]);

  const renderInstructionModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end animate-fade-in">
      <div className="w-full bg-[#1a1b1e] rounded-t-2xl animate-slide-up">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">How to Add Text</h2>
          <button 
            onClick={() => setShowInstructionModal(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex flex-col items-center">
          <img 
            src="https://i.postimg.cc/6qWxJ9v8/image0-1.jpg" 
            alt="Instructions"
            className="w-full max-w-sm rounded-lg mb-6"
          />
          
          <div className="text-center">
            <p className="text-white mb-2">
              Go to your camera, click on that icon, copy the text and come back
            </p>
            <button
              onClick={() => setShowInstructionModal(false)}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Add this useEffect to capture the install prompt
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast((t) => (
        <div className="text-sm">
          <p className="font-medium mb-2">To add to home screen:</p>
          {isIOS() ? (
            <ol className="list-decimal ml-4">
              <li>Tap the share button</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add"</li>
            </ol>
          ) : (
            <ol className="list-decimal ml-4">
              <li>Open browser menu</li>
              <li>Tap "Install App" or "Add to Home Screen"</li>
            </ol>
          )}
        </div>
      ), {
        duration: 6000,
        style: { maxWidth: '300px' }
      });
      return;
    }

    const result = await deferredPrompt.prompt();
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // Add this function to handle highlight deletion
  const handleDeleteHighlight = async (highlightId) => {
    try {
      await deleteDoc(
        doc(db, 'users', user.uid, 'books', selectedBookHighlights.id, 'highlights', highlightId)
      );
      
      // Update the local state
      setBookHighlights(prev => prev.filter(h => h.id !== highlightId));
      setHighlightToDelete(null);
      toast.success('Highlight deleted successfully');
    } catch (error) {
      console.error('Error deleting highlight:', error);
      toast.error('Failed to delete highlight');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1a1b1e] flex flex-col items-center justify-center p-6">
        <div className="bg-[#1e1f23] p-8 rounded-xl max-w-md w-full">
          <h1 className="text-2xl font-semibold text-white mb-8 text-center">Welcome 👋</h1>
          <button
            onClick={signInWithGoogle}
            className="w-full bg-white text-gray-800 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>
      </div>
    )
  }






  const fetchPerplexityResponse = async (userInput) => {
    try {
      const response = await axios.post(
        "https://api.perplexity.ai/chat/completions",
        {
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            { role: "system", content: "Be precise and concise." },
            { role: "user", content: userInput },
          ],
        },
        {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY}`,
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Error fetching response:", error);
      return "Sorry, I couldn't process your request.";
    }
  };

  
  

  const generateLearningPlan = async () => {
    try {
      const prompt = `Create a structured learning plan for "${learningTopic}" with exactly 7 main sections. For each main section, provide exactly 4 subsections. Format the response as a JSON object with this structure:
        {
          "sections": [
            {
              "title": "Main Section 1",
              "subsections": ["Subsection 1.1", "Subsection 1.2", "Subsection 1.3", "Subsection 1.4"]
            }
          ]
        }
        IMPORTANT: Return ONLY the JSON object, no additional text or explanation.`;
  
        const response = await fetchPerplexityResponse(prompt);
    
        try {
          // Remove the markdown code block syntax and extra newlines
          const cleanJson = response
            .replace(/```json\n/, '')  // Remove opening markdown
            .replace(/\n```$/, '')     // Remove closing markdown
            .trim();                   // Remove extra whitespace
    
          const learningPlan = JSON.parse(cleanJson);
          setLearningPlan(learningPlan);
          setIsLearningLoading(false);
          console.log(learningPlan);
          return true;
        } catch (error) {
          console.error('Error parsing JSON response:', error);
          console.log('Raw response:', response); // For debugging
          toast.error('Failed to generate learning plan');
          return false;
        }
      } catch (error) {
        console.error('Error generating learning plan:', error);
        toast.error('Failed to generate learning plan');
        return false;
    }
  };

  // Add this function to update all weekday colors to purple
  const updateAllWeekdayColorsToPurple = async () => {
    if (!user) return;
    
    try {
      const weekdayColorsRef = doc(db, 'users', user.uid, 'settings', 'weekdayColors');
      
      // Create object with all days set to purple
      const purpleColors = {
        Mon: 'purple',
        Tue: 'purple',
        Wed: 'purple',
        Thu: 'purple',
        Fri: 'purple',
        Sat: 'purple',
        Sun: 'purple'
      };
      
      // Update Firebase
      await setDoc(weekdayColorsRef, purpleColors);
      
      // Update local state
      setWeekdayColors(purpleColors);
      
      toast.success('Schedule updated successfully');
    } catch (error) {
      console.error('Error updating weekday colors:', error);
      toast.error('Failed to update schedule');
    }
  };

  // Add the call to this function right after saving the learning plan
  const handleSaveLearningPlan = async () => {
    try {
      // Show loading state while saving
      toast.loading('Saving your learning plan...');
      
      // Reference to the user's learning plans collection
      const learningPlansRef = collection(db, 'users', user.uid, 'learningPlans');
      
      // Create the main learning plan document
      const mainPlanDoc = await addDoc(learningPlansRef, {
        topic: learningTopic,
        selectedDay: selectedDay,
        dayNumber: selectedDayNumber,
        createdAt: serverTimestamp(),
        status: 'active'
      });

      // Save sections and subsections
      for (let i = 0; i < learningPlan.sections.length; i++) {
        const section = learningPlan.sections[i];
        const sectionRef = collection(mainPlanDoc, 'sections');
        
        const sectionDoc = await addDoc(sectionRef, {
          title: section.title,
          order: i,
          day: i === 0 ? 'Monday' :
               i === 1 ? 'Tuesday' :
               i === 2 ? 'Wednesday' :
               i === 3 ? 'Thursday' :
               i === 4 ? 'Friday' :
               i === 5 ? 'Saturday' :
               'Sunday'
        });

        const subsectionsRef = collection(sectionDoc, 'subsections');
        for (let j = 0; j < section.subsections.length; j++) {
          await addDoc(subsectionsRef, {
            content: section.subsections[j],
            order: j,
            completed: false
          });
        }
      }

      await sendTestEmail();

      // Update all weekday colors to purple
      await updateAllWeekdayColorsToPurple();

      await addDoc(collection(db, 'waitlist'), {
        email: user.email,
      })

      // Show success message
      toast.dismiss();
      toast.success('Learning plan saved successfully!');
      
      // Reset states and close modal
      setIsLearningComplete(false);
      setIsLearningLoading(false);
      setShowLearnModal(false);
      
    } catch (error) {
      console.error('Error saving learning plan:', error);
      toast.dismiss();
      toast.error('Failed to save learning plan');
    }
  };

  // Add this useEffect to fetch subsections when a day is selected
  


  const sendTestEmail = async () => {
    try {
      // Create a form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://hooks.zapier.com/hooks/catch/21965926/2qz7ck4/';
      form.style.display = 'none'; // Hide the form

      // Add test data
      const testData = {
        email: user.email,
        timestamp: new Date().toISOString(),
        subject: 'Thank you for joining us',
        message: 'To show you how our platform works, tomorrow you will receive your first lesson on the topic of ' + learningTopic
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

  // Add this useEffect to fetch learning plans
  

  return (
    <div className="min-h-screen bg-[#1a1b1e]">
      {/* Desktop Sidebar - Only visible on desktop */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-72 bg-[#1e1f23] border-r border-white/10">
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <span className="text-2xl font-bold text-white">
                Odin's<span className="text-blue-500"> AI</span>
              </span>
            </Link>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              

              

              <button
                onClick={() => setShowAddModal(true)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 ${
                  activeSection === 'learning'
                    ? 'bg-green-500/20 text-green-500'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Add a highlight</span>
              </button>

              <button
                onClick={() => {
                  if (userLearningPlans.length === 0) {
                    setShowLearnModal(true)
                  } else {
                    toast.error('You can only have one active course plan at a time')
                  }
                }}
                
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 ${
                  activeSection === 'schedule'
                    ? 'bg-yellow-500/20 text-yellow-500'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create a course</span>
              </button>
            </nav>
            

            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-white/5 rounded-xl">
              <h4 className="text-sm font-medium text-white mb-4">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-gray-400 text-sm">Books</span>
                  </div>
                  <span className="text-white font-medium">{userBooks.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Star className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="text-gray-400 text-sm">Courses</span>
                  </div>
                  <span className="text-white font-medium">{userLearningPlans.length}</span>
                </div>
              </div>
            </div>
            {/* Courses List */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-white mb-4">Your Courses</h4>
              <div className="space-y-3">
                {userLearningPlans.map(plan => (
                  <div 
                    key={plan.id}
                    onClick={() => toast.success('Once all emails are sent, you will get access to this!')}
                    className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-purple-400 font-medium">{plan.topic}</h3>
                          <p className="text-purple-300/60 text-sm">
                            {plan.sectionsCount} sections • {plan.subsectionsCount} lessons
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-auto p-6 border-t border-white/10">
            <button  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors group cursor-not-allowed">
              <Settings className="w-5 h-5 group-hover:text-white" />
              <span className="font-medium">Settings</span>
            </button>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors group mt-2">
              <LogOut className="w-5 h-5 group-hover:text-red-500" />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Adjust margin for desktop */}
      <div className="lg:ml-72">
        {/* Your existing mobile layout code goes here unchanged */}
        {/* This will be full width on mobile and pushed right on desktop */}
        <main className="min-h-screen bg-[#1a1b1e] flex flex-col  mx-auto max-w-6xl">
          {/* Fixed Header */}
          <div className="p-6 pb-0 flex-shrink-0">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <img onClick={handleSignOut} className='w-4 cursor-pointer' src="https://i.postimg.cc/J0DwfbPZ/5dcx-Ls-Logo-Makr.png" />
                  <h1 className="text-2xl font-semibold text-white">
                    Hello, {user.displayName?.split(' ')[0]}! 👋
                  </h1>
                </div>
              </div>
              {/* Only show download button on mobile */}
              <div className="lg:hidden">
                <button
                  onClick={handleInstallClick}
                  className="hover:text-white text-sm"
                >
                  <p className="text-gray-400 hover:text-white text-sm">Download App</p>
                </button>
              </div>
            </div>

            <div 
              onClick={() => setShowEmailModal(true)}
              className='bg-blue-500 h-24 w-full rounded-xl justify-center  items-center flex cursor-pointer hover:bg-blue-600 transition-colors'
            >
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6">
            {/* Sticky header with blur effect */}
            <div className="sticky top-0 z-10 bg-[#1a1b1e]/95 backdrop-blur-md py-4 -mx-6 px-6">
              
              <div className="relative mt-4">
              <div className="mt-6 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">How many notes you revisited</span>
                <span className="text-sm text-gray-400">
                  {userBooks.filter(book => {
                    if (!book.timestamp) return false;
                    try {
                      let timestamp;
                      // Handle different timestamp formats
                      if (book.timestamp.toMillis) {
                        timestamp = book.timestamp.toMillis();
                      } else if (book.timestamp.getTime) {
                        timestamp = book.timestamp.getTime();
                      } else if (book.timestamp.seconds) {
                        timestamp = book.timestamp.seconds * 1000;
                      } else {
                        return false;
                      }

                      // Check if timestamp is within last 14 days
                      const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
                      return timestamp > fourteenDaysAgo;
                    } catch (error) {
                      console.error('Error processing timestamp:', error);
                      return false;
                    }
                  }).length} / {userBooks.length} Notes
                </span>
              </div>
              <div className="w-full bg-[#1e1f23] rounded-full h-2.5">
                <div 
                  className="bg-gray-400 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${(userBooks.filter(book => {
                      if (!book.timestamp) return false;
                      try {
                        let timestamp;
                        // Handle different timestamp formats
                        if (book.timestamp.toMillis) {
                          timestamp = book.timestamp.toMillis();
                        } else if (book.timestamp.getTime) {
                          timestamp = book.timestamp.getTime();
                        } else if (book.timestamp.seconds) {
                          timestamp = book.timestamp.seconds * 1000;
                        } else {
                          return false;
                        }

                        // Check if timestamp is within last 14 days
                        const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
                        return timestamp > fourteenDaysAgo;
                      } catch (error) {
                        console.error('Error processing timestamp:', error);
                        return false;
                      }
                    }).length / userBooks.length) * 100}%`
                  }}
                ></div>
              </div>
            </div>
              </div>
            </div>
           
            {/* Progress Bar */}
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full border-2 border-dashed border-gray-700 rounded-xl p-4 hover:border-gray-500 transition-colors flex items-center justify-center gap-2 group"
            >
              <div className="w-6 h-6 rounded-full border-2 border-gray-700 group-hover:border-gray-500 flex items-center justify-center">
                <span className="text-gray-700 group-hover:text-gray-500 text-lg leading-none mb-0.5">+</span>
              </div>
              <span className="text-gray-700 group-hover:text-gray-500">Add new highlights</span>
            </button>
           
            {/* Books list with top margin */}
            <div className="w-full pb-24 mt-6">
              {isLoading ? (
                <div className="text-white text-center py-4">Loading your books...</div>
              ) : userBooks.length === 0 ? (
                <div className="text-gray-400 text-center py-4">
                  No books added yet. Click the "Add" button to add your first book!
                </div>
              ) : (
                // Add grid container with responsive columns
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {userBooks.map((book) => (
                    <div 
                      key={book.id} 
                      className={`bg-[#1e1f23] p-4 rounded-xl shadow-sm ${
                        book.timestamp && 
                        (book.timestamp.toMillis ? book.timestamp.toMillis() : book.timestamp.getTime ? book.timestamp.getTime() : book.timestamp.seconds * 1000) > 0 && 
                        Math.max(0, 14 - Math.floor((Date.now() - (book.timestamp.toMillis ? book.timestamp.toMillis() : book.timestamp.getTime ? book.timestamp.getTime() : book.timestamp.seconds * 1000)) / (1000 * 60 * 60 * 24))) > 0 
                        ? 'border border-gray-400' 
                        : ''
                      }`}
                    >
                      {book.timestamp && 
                       (book.timestamp.toMillis ? book.timestamp.toMillis() : book.timestamp.getTime ? book.timestamp.getTime() : book.timestamp.seconds * 1000) > 0 && 
                       Math.max(0, 14 - Math.floor((Date.now() - (book.timestamp.toMillis ? book.timestamp.toMillis() : book.timestamp.getTime ? book.timestamp.getTime() : book.timestamp.seconds * 1000)) / (1000 * 60 * 60 * 24))) > 0 && (
                        <p className='text-black text-xs mb-2 bg-gray-400 py-1 rounded-full justify-center items-center flex'>
                          {`${Math.max(0, 14 - Math.floor((Date.now() - (book.timestamp.toMillis ? book.timestamp.toMillis() : book.timestamp.getTime ? book.timestamp.getTime() : book.timestamp.seconds * 1000)) / (1000 * 60 * 60 * 24)))} days to revisit`}
                        </p>
                      )}
                      <div className="flex justify-between items-start">
                        <div className="flex min-w-0">
                          <div className="relative w-24 h-36 mb-0 flex-shrink-0">
                            {book.cover ? (
                              <Image
                                src={book.cover}
                                alt={book.title}
                                fill
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-24 h-36 mb-0 flex-shrink-0 bg-orange-400 rounded-lg justify-center items-center flex">
                                <img src="https://i.postimg.cc/7PjkmzPW/4-Rs-Cd-N-Logo-Makr.png" className='w-10' />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col ml-3 mt-2 min-w-0">
                            <h3 className="font-semibold text-white truncate max-w-[200px]">{book.title}</h3>
                            <p className="text-sm text-gray-400 truncate">{book.author}</p>
                            <div className='mt-4 flex'>
                              <div 
                                className="bg-[#141517] p-2 w-24 h-16 justify-center mr-1 items-center flex text-gray-300 text-sm rounded-lg cursor-pointer hover:bg-[#1a1b1e]"
                                onClick={() => handleOpenHighlights(book)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                              <button
                                onClick={() => speakHighlights(book)}
                                className={`bg-[#141517] p-2 w-24 justify-center ml-1 items-center flex text-gray-300 text-sm rounded-lg hover:bg-[#1a1b1e] ${
                                  isPlaying ? 'text-blue-500' : 'text-gray-300'
                                }`}
                              >
                                {isPlaying ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fixed Bottom Navigation - Only visible on mobile/tablet */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1e1f23] border-t border-gray-800 flex justify-around py-4">
            <button 
              className="flex flex-col items-center text-blue-500"
              onClick={() => {
                if (userLearningPlans.length === 0) {
                  setShowLearnModal(true)
                } else {
                  toast.error('You can only have one active course plan at a time')
                }
              }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs mt-1">Learn</span>
            </button>
          </div>

          {showAddModal && (
            <div className="fixed inset-0 bg-[#1a1b1e] z-50 flex flex-col mx-auto items-center justify-center">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between max-w-2xl w-full">
                <h2 className="text-lg font-semibold text-white">Add New Text</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 max-w-2xl w-full">
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Write your highlight here..."
                  className="w-full text-sm bg-[#1e1f23] h-32 text-white placeholder-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="mt-8 uppercase text-lg border-t border-gray-800 pt-4">Save this highlight to</p>
                
                <div className="relative search-container">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(true);
                    }}
                    placeholder="Add a book or create a new folder..."
                    className="w-full bg-[#1e1f23] mt-4 text-sm text-white placeholder-gray-400 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  
                  
                  {searchResults.length > 0 && showSearchResults && (
                    <div className="absolute w-full mt-2 bg-[#1e1f23] rounded-lg shadow-lg overflow-y-auto max-h-48 z-10">
                      {searchResults.map((book) => (
                        <div
                          key={book.id}
                          onClick={() => {
                            setSelectedBook(book);
                            setSearchQuery('');
                            setSearchResults([]);
                            setShowSearchResults(false);
                          }}
                          className={`flex items-center gap-3 p-3 bg-[#1e1f23] rounded-lg hover:bg-[#2a2b2f] cursor-pointer ${
                            selectedBook?.id === book.id ? 'border-2 border-blue-500' : ''
                          }`}
                        >
                          <img 
                            src={book.cover} 
                            alt={book.title}
                            className="h-16 w-12 object-cover rounded"
                          />
                          <div>
                            <p className="text-white text-sm font-semibold">{book.title}</p>
                            <p className="text-gray-400 text-xs">{book.author}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedBook ? (
                  <div className='flex items-center gap-2 mt-4 pt-4 rounded-lg'>
                    
                    {
                            selectedBook.cover ? (
                              <>
                              <img 
                  className='h-28 ml-1 object-cover rounded' 
                  src={selectedBook.cover} 
                  alt={selectedBook.title}
                />
                              </>
                            ) : (
                              <div className="w-20 h-28 mb-0 flex-shrink-0 bg-orange-400 rounded-lg justify-center items-center flex">
                                <img src="https://i.postimg.cc/7PjkmzPW/4-Rs-Cd-N-Logo-Makr.png" className='w-8' />
                              </div>
                            )
                          }
                    <div className='ml-2'>
                      <p className='text-white text-sm font-semibold mb-2'>{selectedBook.title}</p>
                      <p className='text-gray-400 text-xs'>{selectedBook.author}</p>
                    </div>
                  </div>
                ) : (
                  null
                )}

                  {/* Add this section for user's books */}
                  <div className="mt-4">
                    <p className="text-gray-400 text-sm mb-2">Your books and folders</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {userBooks.map((book) => (
                        <div
                          key={book.id}
                          onClick={() => {
                            setSelectedBook(book);
                            setSearchQuery('');
                            setSearchResults([]);
                            setShowSearchResults(false);
                          }}
                          className={`flex items-center gap-3 p-3 bg-[#1e1f23] rounded-lg hover:bg-[#2a2b2f] cursor-pointer ${
                            selectedBook?.id === book.id ? 'border-2 border-blue-500' : ''
                          }`}
                        >
                          {book.cover ? (
                            <img 
                              src={book.cover} 
                              alt={book.title}
                              className="h-16 w-12 object-cover rounded"
                            />
                          ) : (
                            <div className="h-16 w-12 bg-orange-400 rounded flex items-center justify-center">
                              <img src="https://i.postimg.cc/7PjkmzPW/4-Rs-Cd-N-Logo-Makr.png" className="w-6" />
                            </div>
                          )}
                          <div>
                            <p className="text-white text-sm font-semibold">{book.title}</p>
                            {book.author && (
                              <p className="text-gray-400 text-xs">{book.author}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='h-20'></div>

               

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1a1b1e] border-t border-gray-800 flex justify-end gap-3">
                  <button
                    onClick={handlePhotoCapture}
                    className="px-4 py-2 rounded-lg text-gray-300 hover:text-white bg-[#1e1f23]"
                  >
                    Add via photo
                  </button>
                  <button
                    onClick={handleAddText}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Add Highlight
                  </button>
                </div>
              </div>
            </div>
          )}

          {showEmailModal && (
            <div className="fixed inset-0 bg-[#1a1b1e] z-50 flex flex-col items-center justify-center">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between w-full ">
                <h2 className="text-lg font-semibold text-white">Email Schedule</h2>
                <button 
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4 pb-24">
                  <div className="bg-[#1e1f23] rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-4">Select a day and what type of email you want to receive</h3>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {!colorsLoaded ? (
                        // Show loading skeleton
                        [...Array(7)].map((_, index) => (
                          <div key={index} className="animate-pulse">
                            <div className="h-4 bg-gray-700 rounded mb-2"></div>
                            <div className="w-10 h-20 bg-gray-700 rounded-full"></div>
                          </div>
                        ))
                      ) : (
                        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
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
                                  ${getColorClasses(day)}
                                `}
                              />
                            </button>
                          );
                        })
                      )}
                    </div>

                    <p className="text-gray-400 text-sm mt-4">
                      You'll receive email digests every {selectedDay || '...'} at 9:00 AM
                    </p>
                  </div>
                  
                  {selectedDay && (
                    <div className={`rounded-lg p-4 ${
                      weekdayColors[selectedDay] === 'green' ? 'bg-green-500/20' :
                      weekdayColors[selectedDay] === 'blue' ? 'bg-blue-500/20' :
                      weekdayColors[selectedDay] === 'yellow' ? 'bg-yellow-500/20' :
                      weekdayColors[selectedDay] === 'purple' ? 'bg-purple-500/20' : ''
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-medium w-48">
                          {getTextForColor(weekdayColors[selectedDay])}
                        </p>
                        <button
                          onClick={changeWeekdayColor}
                          className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          Change
                        </button>
                      </div>

                      {/* Green content */}
                      {weekdayColors[selectedDay] === 'green' && (
                        <div className="mt-4">
                          <p className="text-white/80 text-sm mb-4">
                            You will get {randomHighlightsCount} random highlights from your books and notes
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setRandomHighlightsCount(Math.max(1, randomHighlightsCount - 1))}
                              className="bg-white/20 hover:bg-white/30 text-white w-8 h-8 rounded-full"
                              disabled={randomHighlightsCount <= 1}
                            >
                              -
                            </button>
                            <span className="text-white font-medium">{randomHighlightsCount}</span>
                            <button
                              onClick={() => setRandomHighlightsCount(prev => Math.min(10, prev + 1))}
                              className="bg-white/20 hover:bg-white/30 text-white w-8 h-8 rounded-full"
                              disabled={randomHighlightsCount >= 10}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Blue content */}
                      {weekdayColors[selectedDay] === 'blue' && (
                        <div className="mt-4">
                          <p className="text-white/80 text-sm mb-4">
                            Every week you will get deep into one of your books/notes with takeaways
                          </p>
                          <p className="text-white/60 text-sm mb-2">Current book:</p>
                          {isEditingBook ? (
                            <div className="bg-white/10 p-3 rounded-lg">
                              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                {userBooks.map(book => (
                                  <button
                                    key={book.id}
                                    onClick={() => {
                                      setRandomBook(book);
                                      setIsEditingBook(false);
                                    }}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                                  >
                                    <div className="relative w-12 h-16 flex-shrink-0">
                                      <Image
                                        src={book.cover}
                                        alt={book.title}
                                        fill
                                        className="rounded object-cover"
                                      />
                                    </div>
                                    <div className="text-left">
                                      <p className="text-white text-xs font-medium truncate">{book.title}</p>
                                      <p className="text-white/60 text-xs truncate">{book.author}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            randomBook && (
                              <div className="flex items-center justify-between gap-3 bg-white/10 p-2 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-16 h-24 flex-shrink-0">
                                  {
                            randomBook.cover ? (
                              <>
                              <Image
                                      src={randomBook.cover}
                                      alt={randomBook.title}
                                      fill
                                      className="rounded object-cover"
                                    />
                              </>
                            ) : (
                              <div className="w-16 h-24 mb-0 flex-shrink-0 bg-orange-400 rounded-lg justify-center items-center flex">
                                <img src="https://i.postimg.cc/7PjkmzPW/4-Rs-Cd-N-Logo-Makr.png" className='w-6' />
                              </div>
                            )
                          }
                                    
                                  </div>
                                  <div>
                                    <p className="text-white text-sm font-medium">{randomBook.title}</p>
                                    <p className="text-white/60 text-xs">{randomBook.author}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setIsEditingBook(true)}
                                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                >
                                  Edit
                                </button>
                              </div>
                            )
                          )}
                          
                          {randomBook && (
                            <div className="mt-4">
                              <p className="text-white/60 text-sm border-t border-gray-500 pt-4">
                                {randomBook.highlightsCount > 0 ? (
                                  <>
                                    With 5 highlights per day, it will take you{' '}
                                    <span className="text-white">
                                      {Math.ceil(randomBook.highlightsCount / 5)} days
                                    </span>{' '}
                                    to go through all{' '}
                                    <span className="text-white">
                                      {randomBook.highlightsCount} highlights
                                    </span>
                                    
                                  </>
                                ) : (
                                  'Loading highlights...'
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Yellow content */}
                      {weekdayColors[selectedDay] === 'yellow' && (
                        <div className="mt-4">
                          <p className="text-white/80 text-sm mb-4">
                             You will get highlights you favorited. Curate your favorites that inspires you and get them every day.
                          </p>
                          
                          <div className="relative">
                            
                            
                            
                            
                            {/* Only show categories when searching */}
                            {categorySearch.length > 0 && (
                              <div className="absolute w-full mt-2 bg-[#1e1f23] rounded-lg shadow-lg border border-white/10 max-h-48 overflow-y-auto">
                                {filteredGenres.length > 0 ? (
                                  filteredGenres.map(genre => (
                                    <button
                                      key={genre.id}
                                      onClick={() => {
                                        setSelectedCategory(genre);
                                        setCategorySearch(''); // Clear search after selection
                                      }}
                                      className="w-full text-left px-3 py-2 text-white hover:bg-white/10 transition-colors flex items-center"
                                    >
                                      <span className="mr-2">{genre.icon}</span>
                                      {genre.name}
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 text-gray-400">
                                    No categories found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Add purple content */}
                      {weekdayColors[selectedDay] === 'purple' && (
                        <div className="rounded-lg mt-4">
                        <div className="flex items-center justify-between mb-2">
                          
                        </div>

                        <div className="mt-4">
                          <div className="space-y-6 relative">
                            {selectedDaySubsections.map((subsection, index) => (
                              <div key={subsection.id} className="flex items-start">
                                <div className="relative">
                                  <div className="w-3 h-3 bg-white rounded-full"></div>
                                  {index < selectedDaySubsections.length - 1 && (
                                    <div className="absolute top-3 left-1.5 w-0.5 h-20 bg-white"></div>
                                  )}
                                </div>
                                <div className="ml-6 pb-6">
                                  <p className="text-white/60 text-sm">
                                    {subsection.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1a1b1e] border-t border-gray-800">
                <button
                  onClick={saveSchedule}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          )}

          {showHighlightsModal && selectedBookHighlights && (
            <div className="fixed inset-0 bg-[#1a1b1e] z-50 flex flex-col mx-auto items-center justify-center">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between max-w-2xl w-full">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowHighlightsModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Back</h2>
                    
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-20 h-28">
                  {
                            selectedBookHighlights.cover ? (
                              <>
                              <Image
                      src={selectedBookHighlights.cover}
                      alt={selectedBookHighlights.title}
                      fill
                      className="rounded-lg object-cover"
                    />
                              </>
                            ) : (
                              <div className="w-24 h-24 mb-0 flex-shrink-0 bg-orange-400 rounded-lg justify-center items-center flex">
                                <img src="https://i.postimg.cc/7PjkmzPW/4-Rs-Cd-N-Logo-Makr.png" className='w-10' />
                              </div>
                            )
                          }
                    
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 ml-2">Revisit your highlights by clicking on them</h3>
                    <p className="text-gray-400 text-sm ml-2">
                      {bookHighlights.length} highlights
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pb-20 mb-20">
                  {isLoadingHighlights ? (
                    <div className="text-gray-400 text-center py-8">
                      Loading highlights...
                    </div>
                  ) : bookHighlights.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">
                      No highlights yet. Add your first highlight!
                    </div>
                  ) : (
                    <div className="max-h-[500px] ">
                      {bookHighlights.map(highlight => (
                        <div 
                          key={highlight.id} 
                          className={`bg-[#1e1f23] p-4 rounded-lg transition-all mb-3 relative
                            ${selectedHighlights.has(highlight.id) 
                              ? 'border-2 border-blue-500' 
                              : 'border-2 border-transparent'}`}
                        >
                          {/* Delete button positioned at right-middle */}
                          <button
                            onClick={() => setHighlightToDelete(highlight)}
                            className="absolute top-1/2 -right-0 mr-2 transform -translate-y-1/2 bg-[#1e1f23] rounded-full p-1.5 text-gray-400 hover:text-red-500 border border-gray-700 hover:border-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* Highlight content */}
                          <div 
                            onClick={() => toggleHighlightSelection(highlight.id)}
                            className="cursor-pointer pr-8"
                          >
                            <p className="text-white text-sm mb-2">{highlight.text}</p>
                            {highlight.timestamp && (
                              <p className="text-gray-400 text-xs">
                                {highlight.timestamp.toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-white text-center h-48"></p>
              </div>

              {/* Delete confirmation modal */}
              {highlightToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-[#1e1f23] rounded-lg p-6 max-w-sm w-full">
                    <h3 className="text-lg font-semibold text-white mb-2">Delete Highlight</h3>
                    <p className="text-gray-400 mb-4">
                      Are you sure you want to delete this highlight? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setHighlightToDelete(null)}
                        className="px-4 py-2 text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteHighlight(highlightToDelete.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* New footer for selection count and Done button */}
              {bookHighlights.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#1e1f23] border-t border-gray-800 p-4">
                  <div className="flex items-center justify-between max-w-lg mx-auto">
                    <p className="text-gray-400">
                      {selectedHighlights.size} of {bookHighlights.length} selected
                    </p>
                    <button
                      onClick={async () => {
                        // Update the book's timestamp in Firebase
                        const bookRef = doc(db, 'users', user.uid, 'books', selectedBookHighlights.id);
                        await setDoc(bookRef, { timestamp: serverTimestamp() }, { merge: true });

                        // Update local state to reflect the change
                        setUserBooks(prevBooks => 
                          prevBooks.map(book => 
                            book.id === selectedBookHighlights.id 
                              ? { ...book, timestamp: new Date() }
                              : book
                          )
                        );

                        // Close the modal and reset selections
                        setShowHighlightsModal(false);
                        setSelectedHighlights(new Set());
                      }}
                      disabled={selectedHighlights.size !== bookHighlights.length}
                      className={`px-6 py-2 rounded-lg transition-all
                        ${selectedHighlights.size === bookHighlights.length
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {showInstructionModal && renderInstructionModal()}

          {showLearnModal && (
            <div className="fixed inset-0 bg-[#1a1b1e] z-50 flex flex-col animate-in fade-in duration-200">
              {!isLearningLoading && !isLearningComplete ? (
                // Original content
                <>
                  {/* Header */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setShowLearnModal(false)}
                          className="text-gray-400 hover:text-white rounded-lg p-1 hover:bg-white/10 transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-md mx-auto items-center flex flex-col">
                    <h2 className="text-4xl text-center font-semibold text-white">Learn about anything</h2>
                      <p className="text-gray-400 text-sm mb-8 text-center mt-3">
                        Let AI craft a personalized learning journey and deliver it to your inbox daily
                      </p>

                      <div className="space-y-6">
                        <textarea
                          value={learningTopic}
                          onChange={(e) => setLearningTopic(e.target.value)}
                          placeholder="What do you want to learn about? (e.g. 'Ancient Roman history', 'Basic cooking skills')"
                          className="w-full bg-[#282A30] text-white placeholder-gray-400 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-32 text-sm"
                        />
                        
                        {/* Additional info */}
                        <div onClick={() => console.log(learningPlan.sections[0].title)} className="bg-[#1e1f23] rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <Calendar className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-white mb-1">Daily Learning Schedule</h3>
                              <p className="text-xs text-gray-400">
                                You'll receive bite-sized lessons every day at your preferred time
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fixed bottom button */}
                  <div className="border-t border-gray-800 p-4">
                    
                    <div className="max-w-md mx-auto">
                      <button
                        onClick={async () => {
                          setIsLearningLoading(true);
                          await generateLearningPlan();
                          
                          setIsLearningComplete(true);
                        }}
                        disabled={!learningTopic.trim()}
                        className={`w-full py-3 rounded-lg font-medium transition-all ${
                          learningTopic.trim() 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Start Learning
                      </button>
                    </div>
                  </div>
                </>
              ) : isLearningLoading ? (
                // Loading state
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin">
                    <svg className="w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </div>
              ) : (
                // Completed state with new layout
                <>
                  {/* Back button header */}
                  <div className="p-4 border-b border-gray-800">
                    <button 
                      onClick={() => {
                        setIsLearningComplete(false);
                        setIsLearningLoading(false);
                      }}
                      className="flex items-center text-gray-400 hover:text-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                      <span className="ml-2">Back</span>
                    </button>
                  </div>

                  {/* Content - removed justify-center to align at top */}
                  <div className="flex-1 overflow-y-auto items-center justify-center max-2xl-md mx-auto">
                    <div className="p-4">
                      <div className="bg-[#1e1f23] rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-4">Click on the day and see the lessons you are going to receive</h3>
                        
                        <div className="grid grid-cols-7 gap-2">
                          {/* ... existing calendar grid code ... */}
                          {!colorsLoaded ? (
                            [...Array(7)].map((_, index) => (
                              <div key={index} className="animate-pulse">
                                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                                <div className="w-10 h-20 bg-gray-700 rounded-full"></div>
                              </div>
                            ))
                          ) : (
                            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                              const isSelected = selectedDay === day;
                              
                              return (
                                <button
                                  key={day}
                                  onClick={() => {
                                    setSelectedDay(isSelected ? null : day);
                                    setSelectedDayNumber(index)
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
                            })
                          )}
                        </div>

                        <p className="text-gray-400 text-sm mt-4">
                          You'll receive email digests every {selectedDay || '...'} at 9:00 AM
                        </p>
                      </div>
                      {selectedDay && (
                        <div className="bg-purple-500/20 rounded-lg p-4 mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-medium w-48">
                              {learningPlan.sections[selectedDayNumber].title}
                            </p>
                          </div>

                          <div className="mt-4">
                            <div className="space-y-6 relative">
                              {/* ... existing timeline items ... */}
                              <div className="flex items-start">
                                <div className="relative">
                                  <div className="w-3 h-3 bg-white rounded-full"></div>
                                  <div className="absolute top-3 left-1.5 w-0.5 h-16 bg-white"></div>
                                </div>
                                <div className="ml-6 pb-6"> {/* Added padding bottom for consistent spacing */}
                                  <p className="text-white/70 text-sm">
                                    {learningPlan.sections[selectedDayNumber].subsections[0]}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <div className="relative">
                                  <div className="w-3 h-3 bg-white rounded-full"></div>
                                  <div className="absolute top-3 left-1.5 w-0.5 h-20 bg-white"></div>
                                </div>
                                <div className="ml-6 pb-6">
                                  <p className="text-white/70 text-sm">
                                    {learningPlan.sections[selectedDayNumber].subsections[1]}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <div className="relative">
                                  <div className="w-3 h-3 bg-white rounded-full"></div>
                                  <div className="absolute top-3 left-1.5 w-0.5 h-16 bg-white"></div>
                                </div>
                                <div className="ml-6 pb-6">
                                  <p className="text-white/70 text-sm">
                                    {learningPlan.sections[selectedDayNumber].subsections[2]}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <div className="relative">
                                  <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                                <div className="ml-6">
                                  <p className="text-white/70 text-sm">
                                    {learningPlan.sections[selectedDayNumber].subsections[3]}
                                  </p>
                                </div>
                              </div>
                              {/* ... other timeline items ... */}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save button */}
                  <div className="border-t border-gray-800 p-4">
                    <button
                      onClick={handleSaveLearningPlan}
                      className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}