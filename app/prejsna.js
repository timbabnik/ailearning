"use client"

import Image from "next/image";
import { useState } from "react";
import Autosuggest from "react-autosuggest";
import { useRouter } from "next/navigation";


export default function Home() {

    const router = useRouter();

    
        const getUserLocation = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                  () => {
                    // Redirect on success
                    router.push("/uitwo");
                  },
                  (error) => {
                    console.error("Location permission denied or unavailable:", error);
                    // Redirect on error (optional)
                    router.push("/error-page");
                  }
                );
              } else {
                alert("Geolocation is not supported by this browser.");
                // Optional: Redirect for unsupported browsers
                router.push("/unsupported-browser");
              }
          };
          
      


      const nextPage = () => {
        router.push('/uitwo');
      }

    
      const [value, setValue] = useState(""); // Input value
      const [suggestions, setSuggestions] = useState([]); // Suggestions list
    
      // Function to fetch suggestions based on input
      const getSuggestions = (input) => {
        const inputValue = input.trim().toLowerCase();
        return locations.filter((location) =>
          location.toLowerCase().startsWith(inputValue)
        );
      };
    
      // Autosuggest methods
      const onSuggestionsFetchRequested = ({ value }) => {
        setSuggestions(getSuggestions(value));
      };
    
      const onSuggestionsClearRequested = () => {
        setSuggestions([]);
      };
    
      const onChange = (event, { newValue }) => {
        setValue(newValue);
      };
    
      const inputProps = {
        placeholder: "Search your destination",
        value,
        onChange,
        className:
          "bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none w-full px-4 py-2",
      };



      const locations = [
        
        "Mali",
        "Malawi",
        "Madagascar",
        "Madeira",
        "Malaysia",
        "Sweden",
        "Switzerland",
        "Singapore",
        "Spain",
        "South Africa",
        "Sri Lanka",
        "San Francisco",
        "Seoul",
        "Sydney",
      ];
      

      const onSuggestionSelected = (event, { suggestion }) => {
        setValue(suggestion);
        router.push(`/travel?location=${encodeURIComponent(suggestion)}`);
    };
    
    

  return (
    <div className="bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative h-screen">
        <Image
          src="https://i.postimg.cc/y69zPkVc/Screenshot-2025-01-07-at-19-07-47.png"
          alt="Portugal"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-8">
        <div className="bg-gray-800 bg-opacity-70 px-4 py-2 rounded-full w-max flex items-center space-x-1">
  {/* 5 Yellow Stars */}
  {[...Array(5)].map((_, index) => (
    <svg
      key={index}
      xmlns="http://www.w3.org/2000/svg"
      fill="yellow"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      />
    </svg>
  ))}
  <p className="pl-2 font-semibold">2.1M+ users</p>
</div>

          <h1 className="text-4xl font-bold mt-4">
            The Search for the Most Interesting Places and Stories
          </h1>
          <button onClick={getUserLocation} className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg">
            Let's try!
          </button>
          <div className="flex items-center mt-4">
              <div className="w-1/2 border-gray-300 border"></div>
              <div className="ml-3 mr-3 text-sm text-gray-300">or</div>
              <div className="w-1/2 border-gray-300 border"></div>
          </div>
          <div className="relative flex items-start bg-white rounded-lg mt-4 shadow-lg px-4 py-2">
        {/* Search Icon */}
        <img src="https://static-00.iconduck.com/assets.00/search-icon-2048x2048-cmujl7en.png" className="h-4 mt-3" />

        {/* Autosuggest Input */}
        



<Autosuggest
  suggestions={suggestions}
  onSuggestionsFetchRequested={onSuggestionsFetchRequested}
  onSuggestionsClearRequested={onSuggestionsClearRequested}
  getSuggestionValue={(suggestion) => suggestion}
  onSuggestionSelected={onSuggestionSelected}
  renderSuggestion={(suggestion) => (
    <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black">
      {suggestion}
    </div>
  )}
  inputProps={inputProps}
/>

      </div>
        </div>
       
      </section>

      {/* Search & Categories Section */}
      
    </div>
  );
}
