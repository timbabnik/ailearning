const express = require("express");
const axios = require("axios");
const cors = require("cors");  // Add this line
const app = express();
const port = 5000;

// Enable CORS for all origins
app.use(cors());  // Add this line

app.get("/get-location-photo", async (req, res) => {
  const location = req.query.location;

  if (!location) {
    return res.status(400).send("Location is required");
  }

  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const apiKeyy = 'AIzaSyAyRN9cJu9Q2BCdY7RawtdO-d8sZcFf_EQ'; // Temporarily hardcode the key for debugging


    console.log("API Key:", apiKey);
    console.log("API Keyyyyy:", apiKeyy);

    // Step 1: Find Place from Text
    const placeResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`,
      {
        params: {
          input: location,
          inputtype: "textquery",
          fields: "photos",
          key: apiKeyy,
        },
      }
    );

    console.log("Place response:", placeResponse.data);

    // Step 2: Check if photos are available
    const placeData = placeResponse.data;
    if (placeData.candidates && placeData.candidates.length > 0) {
      const photoReference = placeData.candidates[0].photos[0].photo_reference;
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKeyy}`;
      return res.json({ photoUrl });
    } else {
      return res.status(404).send("No photos found for this location.");
    }
  } catch (error) {
    console.error("Error fetching location photo:", error);
    return res.status(500).send("An error occurred while fetching the photo.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
