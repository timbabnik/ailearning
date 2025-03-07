'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import axios from 'axios'

function Test() {
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [map, setMap] = useState(null)
  const [countryHistory, setCountryHistory] = useState(null)
  const [currentCountry, setCurrentCountry] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const [periodLocations, setPeriodLocations] = useState([])

  // Define Ljubljana landmarks with their coordinates
  const ljubljanaLandmarks = [
    {
      id: 1,
      name: "Dragon Bridge",
      position: { lat: 46.0514, lng: 14.5068 },
      description: "Famous Art Nouveau bridge with dragon statues",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Dragon_bridge_%28Ljubljana%29.jpg/1200px-Dragon_bridge_%28Ljubljana%29.jpg"
    },
    {
      id: 2,
      name: "Ljubljana Castle",
      position: { lat: 46.0489, lng: 14.5089 },
      description: "Medieval castle overlooking the city",
      image: "https://www.ljubljanskigrad.si/assets/images/_watermark/20190724_ljubljanski-grad_foto-andrej-peunik_1.jpg"
    },
    {
      id: 3,
      name: "Ljubljana Castle",
      position: { lat: 46.0489, lng: 14.5089 },
      description: "Medieval castle overlooking the city",
      image: "https://www.ljubljanskigrad.si/assets/images/_watermark/20190724_ljubljanski-grad_foto-andrej-peunik_1.jpg"
    },
    {
      id: 4,
      name: "Town Hall",
      position: { lat: 46.0516, lng: 14.5060 },
      description: "Historic seat of city government",
      image: "https://www.ljubljana.si/assets/Uploads/_resampled/FillWyIxMjAwIiwiNjMwIl0/Ljubljana-City-Hall-B-Jakše-and-S-Jeršič.jpg"
    },
    
  ]

  const handleLandmarkClick = (landmark) => {
    setSelectedPlace(landmark)
    if (map) {
      map.panTo(landmark.position)
      map.setZoom(16)
    }
  }

  const onLoad = useCallback((map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Get country name from coordinates
  const getCountryFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDIFhpQ9Gsg7ywcBF3Occx6jo5NxQ-781g`
      )
      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        const countryComponent = data.results[0].address_components.find(
          component => component.types.includes('country')
        )
        if (countryComponent && currentCountry !== countryComponent.long_name) {
          setCurrentCountry(countryComponent.long_name)
          getCountryHistory(countryComponent.long_name)
        }
      }
    } catch (error) {
      console.error('Error getting country:', error)
    }
  }

  // Get country history from Perplexity API
  const getCountryHistory = async (countryName) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.post(
        "https://api.perplexity.ai/chat/completions",
        {
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            { 
              role: "system", 
              content: "Focus on broad historical periods rather than specific events. Include approximate date ranges for each period."
            },
            { 
              role: "user", 
              content: `List the main historical periods of ${countryName}. Format as bullet points starting with •, including the period name and approximate date range (using BC/AD where applicable). For each period, add a very brief description of its key characteristics.` 
            },
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

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      const content = response.data.choices[0].message.content;
      
      // Clean up reference numbers and keep the bullet points
      const cleanContent = content
        .replace(/\[\d+\]/g, '') // Remove reference numbers like [1] or [42]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');

      setCountryHistory(cleanContent);

    } catch (error) {
      console.error("Detailed error:", error);
      setError(error.message || "Failed to get historical periods");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get initial country from map center
    getCountryFromCoordinates(46.0569, 14.5058)
  }, [])

  const mapStyles = {
    height: '40vh',
    width: '100%'
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

  // Update the getPeriodLocations function
  const getPeriodLocations = async (period, country) => {
    setIsLoading(true)
    try {
      const response = await axios.post(
        "https://api.perplexity.ai/chat/completions",
        {
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            { 
              role: "system", 
              content: "You are a historical tourism expert. You must respond with valid JSON only, no additional text."
            },
            { 
              role: "user", 
              content: `Return a JSON object containing exactly 5 historical locations in ${country} from the ${period} period. Each location must include exact coordinates and a brief description. Use this exact format without any additional text:
              {
                "locations": [
                  {
                    "name": "Location Name",
                    "coordinates": {
                      "lat": 46.0569,
                      "lng": 14.5058
                    },
                    "description": "Brief historical description"
                  }
                ]
              }` 
            },
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

      const content = response.data.choices[0].message.content;
      
      // Clean and parse the JSON response
      try {
        // Remove any potential markdown code block markers
        const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim();
        const locationData = JSON.parse(cleanJson);
        
        if (!locationData.locations || !Array.isArray(locationData.locations)) {
          throw new Error('Invalid response format');
        }
        
        setPeriodLocations(locationData.locations);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Raw content:', content);
        setError("Failed to parse location data");
      }
    } catch (error) {
      console.error("Error getting period locations:", error);
      setError("Failed to get locations for this period");
    } finally {
      setIsLoading(false);
    }
  };

  // Update the period card click handler
  const handlePeriodClick = async (period) => {
    if (selectedPeriod === period) {
      setSelectedPeriod(null);
      setPeriodLocations([]);
    } else {
      setSelectedPeriod(period);
      await getPeriodLocations(period, currentCountry);
      // Center map on the country
      if (map && periodLocations.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        periodLocations.forEach(location => {
          bounds.extend(location.coordinates);
        });
        map.fitBounds(bounds);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Fixed Map Section */}
      <div className="fixed top-0 left-0 right-0 h-[40vh] z-0">
        <LoadScript 
          googleMapsApiKey="AIzaSyDIFhpQ9Gsg7ywcBF3Occx6jo5NxQ-781g"
          libraries={['places']}
        >
          <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={14}
            center={{ lat: 46.0569, lng: 14.5058 }}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {/* Period Location Markers */}
            {periodLocations.map((location, index) => (
              <Marker
                key={index}
                position={location.coordinates}
                onClick={() => setSelectedPlace(location)}
              />
            ))}

            {/* Info Window */}
            {selectedPlace && (
              <InfoWindow
                position={selectedPlace.coordinates || selectedPlace.position}
                onCloseClick={() => setSelectedPlace(null)}
              >
                <div className="p-2">
                  <h3 className="font-bold text-black">{selectedPlace.name}</h3>
                  <p className="text-sm">{selectedPlace.description}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Content Section */}
      <div className="absolute top-[33vh] inset-x-0 min-h-[67vh] bg-white rounded-t-[40px] shadow-xl z-10 overflow-y-auto">
        <div className="h-full">
          {/* Country History Section */}
          {currentCountry && (
            <div className="p-8">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-black mb-6">
                  Historical Periods of {currentCountry}
                </h2>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <p className="text-red-700">{error}</p>
                  </div>
                ) : countryHistory ? (
                  <div className="relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-blue-200"></div>
                    
                    {/* Timeline Events */}
                    <div className="space-y-6">
                      {countryHistory.split('\n').map((line, index) => {
                        if (line.trim().startsWith('•')) {
                          const cleanLine = line.replace(/\*/g, '').substring(1).trim()
                          
                          let period, dateRange, description
                          
                          // Match pattern: Period Name (Date Range): Description
                          const match = cleanLine.match(/^(.*?)\s*\((.*?)\)(?:\s*[:|-])?\s*(.*)/)
                          
                          if (match) {
                            period = match[1].trim()
                            dateRange = match[2].trim()
                            description = match[3].trim().replace(/^[:|-]\s*/, '')
                          } else {
                            return null
                          }
                          
                          return (
                            <div key={index} className="relative pl-10 ml-4">
                              {/* Timeline Dot */}
                              <div className="absolute left-[-20px] w-[12px] h-[12px] rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                              
                              {/* Content */}
                              <div 
                                onClick={() => handlePeriodClick(period)}
                                className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer ${
                                  selectedPeriod === period ? 'ring-2 ring-blue-500' : ''
                                }`}
                              >
                                <div className="text-xl font-bold text-blue-600 mb-1">
                                  {period}
                                </div>
                                <div className="text-sm text-blue-400 mb-2">
                                  {dateRange}
                                </div>
                                <div className="text-gray-700">
                                  {description}
                                </div>
                                
                                {/* Period Locations */}
                                {selectedPeriod === period && periodLocations.length > 0 && (
                                  <div className="mt-4 border-t pt-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                      Notable Locations from this Period:
                                    </h4>
                                    <div className="space-y-2">
                                      {periodLocations.map((location, idx) => (
                                        <div 
                                          key={idx}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPlace(location);
                                            map?.panTo(location.coordinates);
                                            map?.setZoom(15);
                                          }}
                                          className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                                        >
                                          <div className="font-medium text-blue-600">{location.name}</div>
                                          <div className="text-sm text-gray-600">{location.description}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Test