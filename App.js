import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableWithoutFeedback,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, setDoc, doc, serverTimestamp, query, getDocs } from 'firebase/firestore';
import { Vision } from '@react-native-firebase/ml-kit';

const App = () => {
  // States
  const [user, setUser] = useState(null);
  const [activeGenre, setActiveGenre] = useState('Self-Help');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newText, setNewText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [userBooks, setUserBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [recognizedTexts, setRecognizedTexts] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  
  const cameraRef = useRef(null);

  // Check camera permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Fetch user's books
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

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        
        // Process the image with ML Kit Vision
        const result = await Vision().textRecognizer().processImage(photo.uri);
        
        // Transform the result into tappable text blocks
        const textBlocks = result.blocks.map(block => ({
          id: Math.random().toString(),
          text: block.text,
          bounds: block.bounds, // Contains x, y, width, height
          selected: false
        }));
        
        setRecognizedTexts(textBlocks);
        setShowTextSelection(true); // New state to show text selection screen
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
  };

  // Render login screen
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Welcome to BookApp</Text>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => {/* Implement Google Sign In */}}
          >
            <Text style={styles.buttonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render camera screen
  if (showCamera) {
    return (
      <View style={styles.container}>
        <Camera style={styles.camera} ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <Text style={styles.captureButtonText}>Take Picture</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }

  // Add the text selection screen
  const renderTextSelectionScreen = () => (
    <View style={styles.container}>
      <Image
        source={{ uri: capturedImage }}
        style={styles.capturedImage}
      />
      {recognizedTexts.map(block => (
        <TouchableWithoutFeedback
          key={block.id}
          onPress={() => {
            setSelectedText(block.text);
            setNewText(block.text);
            setShowTextSelection(false);
            setShowAddModal(true);
          }}
        >
          <View
            style={[
              styles.textOverlay,
              {
                position: 'absolute',
                left: block.bounds.left,
                top: block.bounds.top,
                width: block.bounds.width,
                height: block.bounds.height,
              },
              block.selected && styles.selectedText
            ]}
          >
            <Text style={styles.overlayText}>{block.text}</Text>
          </View>
        </TouchableWithoutFeedback>
      ))}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={() => {
            setShowTextSelection(false);
            setShowCamera(true);
          }}
        >
          <Text style={styles.buttonText}>Retake</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Main app render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hello, {user?.displayName?.split(' ')[0]}! 👋
        </Text>
        <TouchableOpacity onPress={() => signOut(auth)}>
          <Text style={styles.signOut}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* Books List */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Your Books</Text>
        
        {userBooks.map((book) => (
          <View key={book.id} style={styles.bookCard}>
            <Image
              source={{ uri: book.cover }}
              style={styles.bookCover}
            />
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookAuthor}>{book.author}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b1e',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  bookCard: {
    backgroundColor: '#1e1f23',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  bookInfo: {
    marginLeft: 16,
    flex: 1,
  },
  bookTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookAuthor: {
    color: '#9ca3af',
    fontSize: 14,
  },
  // ... more styles
  capturedImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 4,
  },
  selectedText: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: '#3b82f6',
    borderWidth: 1,
  },
  overlayText: {
    color: 'transparent', // Makes the text invisible but still tappable
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  }
});

export default App; 