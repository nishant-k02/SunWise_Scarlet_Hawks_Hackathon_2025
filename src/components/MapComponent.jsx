import React, { useRef, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";

const MapComponent = () => {
  const [selectedPlace, setSelectedPlace] = useState(null); // Store selected place details
  const [markerPosition, setMarkerPosition] = useState(null); // Store marker position on the map
  const autocompleteRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCY5PAe4wMyAN86NzsQTvcJIoeiu6AvAhk", // Replace with your API key
    libraries: ["places"], // Ensure the places library is included
  });

  // Handle place selection from Autocomplete
  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      const location = place.geometry.location;
      setSelectedPlace({
        name: place.name || "No name available",
        address: place.formatted_address || "No address available",
        coordinates: {
          lat: location.lat(),
          lng: location.lng(),
        },
      });
      setMarkerPosition({
        lat: location.lat(),
        lng: location.lng(),
      });
    }
  };

  // Only render once the Google Maps API is loaded
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <GoogleMap
        center={markerPosition || { lat: 41.8781, lng: -87.6298 }} // Default to Chicago
        zoom={12}
        mapContainerStyle={{ width: "100%", height: "100%" }}
        options={{
          mapTypeControl: true, // Enable map/satellite toggle by default
        }}
      >
        {/* Add a marker at the selected place */}
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>

      {/* Autocomplete search bar */}
      <div
        style={{ position: "absolute", top: "80px", left: "80px", zIndex: 10 }}
      >
        <Autocomplete
          onLoad={(autocomplete) => {
            autocompleteRef.current = autocomplete; // Store the autocomplete object
          }}
          onPlaceChanged={handlePlaceChanged}
        >
          <input
            type="text"
            placeholder="Search for a place"
            style={{
              width: "300px",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "5px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          />
        </Autocomplete>
      </div>

      {/* Full-screen toggle button */}
      <div>
        <button
          onClick={() => document.documentElement.requestFullscreen()}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "white",
            borderRadius: "5px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
          }}
        ></button>
      </div>

      {/* Display selected place details near the marker */}
      {selectedPlace && markerPosition && (
        <div
          style={{
            position: "absolute",
            bottom: "120px", // Position above the marker
            left: "50%", // Center horizontally
            transform: "translateX(-50%)", // Ensure centering
            background: "rgba(0, 0, 0, 0.7)", // Dark background for better contrast
            color: "white",
            padding: "15px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
            fontWeight: "bold",
            fontSize: "16px",
            maxWidth: "300px",
            zIndex: 10,
          }}
        >
          <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "bold" }}>
            Selected Place
          </h3>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>
            <strong>Name:</strong> {selectedPlace.name}
          </p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>
            <strong>Address:</strong> {selectedPlace.address}
          </p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>
            <strong>Coordinates:</strong> Lat: {selectedPlace.coordinates.lat},
            Lng: {selectedPlace.coordinates.lng}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
