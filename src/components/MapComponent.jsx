import React, { useRef, useState, useEffect } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import Papa from "papaparse";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const COLORS = ["#0088FE", "#FF8042"];

const MapComponent = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [solarData, setSolarData] = useState([]);
  const [matchedData, setMatchedData] = useState(null);
  const autocompleteRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "your_api_key",
    libraries: ["places"],
  });

  useEffect(() => {
    fetch("/data/chicago_data.csv")
      .then((res) => res.text())
      .then((text) =>
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          complete: (results) => setSolarData(results.data),
        })
      );
  }, []);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      const loc = place.geometry.location;
      const regionName = place.address_components?.find((c) =>
        c.types.includes("locality")
      )?.long_name;

      setSelectedPlace({
        name: place.name || "No name",
        address: place.formatted_address || "No address",
        coordinates: {
          lat: loc.lat(),
          lng: loc.lng(),
        },
      });

      setMarkerPosition({ lat: loc.lat(), lng: loc.lng() });

      const match = solarData.find(
        (entry) =>
          entry.region_name?.toLowerCase() === regionName?.toLowerCase()
      );
      setMatchedData(match || null);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div
      style={{
        height: selectedPlace ? "auto" : "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Map Section */}
      <div
        style={{
          height: selectedPlace ? "70vh" : "100vh",
          position: "relative",
        }}
      >
        <GoogleMap
          center={markerPosition || { lat: 41.8781, lng: -87.6298 }}
          zoom={12}
          mapContainerStyle={{ width: "100%", height: "100%" }}
        >
          {markerPosition && <Marker position={markerPosition} />}
        </GoogleMap>

        {/* Search Input */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "80px",
            zIndex: 10,
          }}
        >
          <Autocomplete
            onLoad={(auto) => (autocompleteRef.current = auto)}
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

        {/* Location Info Card */}
        {selectedPlace && (
          <div
            style={{
              position: "absolute",
              bottom: "30px",
              left: "30px",
              background: "rgba(0, 0, 0, 0.85)",
              color: "#fff",
              padding: "15px",
              borderRadius: "10px",
              maxWidth: "280px",
              fontSize: "14px",
              zIndex: 10,
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
              Selected Place
            </h3>
            <p>
              <strong>Name:</strong> {selectedPlace.name}
            </p>
            <p>
              <strong>Address:</strong> {selectedPlace.address}
            </p>
            <p>
              <strong>Coordinates:</strong>{" "}
              {selectedPlace.coordinates.lat.toFixed(4)},{" "}
              {selectedPlace.coordinates.lng.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      {/* Visualization Section */}
      {matchedData && (
        <div style={{ background: "#f9f9f9", color: "#222", padding: "20px" }}>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Estimated Solar Installation Potential
          </h2>

          {/* Summary Stats with Icons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            {/* Left Column */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px" }}>✅</div>
                <div>
                  <strong>Qualified Roofs</strong>
                  <br />
                  {Number(matchedData.percent_qualified).toFixed(2)}%
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px" }}>🏠</div>
                <div>
                  <strong>Total Roofs</strong>
                  <br />
                  {Number(matchedData.count_qualified).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px" }}>📐</div>
                <div>
                  <strong>Roof Space</strong>
                  <br />
                  {(matchedData.total_area_sqft / 1e6).toFixed(2)}M sq ft
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px" }}>⚡</div>
                <div>
                  <strong>Capacity</strong>
                  <br />
                  {(matchedData.kw_total / 1000).toFixed(2)} MW DC
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px" }}>🔌</div>
                <div>
                  <strong>Electricity</strong>
                  <br />
                  {(matchedData.yearly_sunlight_kwh_total / 1000).toFixed(
                    2
                  )}{" "}
                  MWh/yr
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px" }}>🌱</div>
                <div>
                  <strong>Carbon Offset</strong>
                  <br />
                  {Number(matchedData.carbon_offset_metric_tons).toFixed(
                    2
                  )}{" "}
                  metric tons
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: "60px",
              gap: "40px",
            }}
          >
            {/* Pie Chart */}
            <div style={{ flex: 1, minWidth: "300px", height: "300px" }}>
              <h4 style={{ textAlign: "center" }}>Roof Qualification</h4>
              <ResponsiveContainer width="100%" height="100%">
                {" "}
                <PieChart>
                  {" "}
                  <Pie
                    dataKey="value"
                    data={[
                      {
                        name: "Qualified",
                        value: Number(matchedData.percent_qualified),
                      },
                      {
                        name: "Not Qualified",
                        value: 100 - Number(matchedData.percent_qualified),
                      },
                    ]}
                    outerRadius={85}
                    label={({ name, value }) => `${name}: ${value.toFixed(2)}%`}
                  >
                    {" "}
                    {COLORS.map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}{" "}
                  </Pie>{" "}
                  <Tooltip
                    formatter={(value) => `${Number(value).toFixed(2)}%`}
                  />{" "}
                </PieChart>{" "}
              </ResponsiveContainer>
            </div>

            {/* Orientation Bar Chart */}
            <div style={{ flex: 1, minWidth: "300px", height: "300px" }}>
              <h4 style={{ textAlign: "center" }}>
                Total Installation Size by Roof Orientation
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Flat",
                      value: (matchedData.yearly_sunlight_kwh_f / 1e6).toFixed(
                        2
                      ),
                    },
                    {
                      name: "South",
                      value: (matchedData.yearly_sunlight_kwh_s / 1e6).toFixed(
                        2
                      ),
                    },
                    {
                      name: "West",
                      value: (matchedData.yearly_sunlight_kwh_w / 1e6).toFixed(
                        2
                      ),
                    },
                    {
                      name: "East",
                      value: (matchedData.yearly_sunlight_kwh_e / 1e6).toFixed(
                        2
                      ),
                    },
                    {
                      name: "North",
                      value: (matchedData.yearly_sunlight_kwh_n / 1e6).toFixed(
                        2
                      ),
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    label={{
                      value: "Roof Orientation",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    label={{
                      value: "MWh/year",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f9a825" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Install Size Histogram */}
            {matchedData.install_size_kw_buckets_json && (
              <div
                style={{
                  width: "100%",
                  height: "300px",
                  paddingBottom: "20px",
                  marginTop: "60px",
                }}
              >
                <h4 style={{ textAlign: "center" }}>
                  Rooftop Solar Capacity Distribution (&lt; 50kW)
                </h4>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={JSON.parse(
                      matchedData.install_size_kw_buckets_json
                    ).map(([bucket, count]) => ({
                      name: `${bucket}–${bucket + 5}`,
                      value: Number(count).toFixed(2),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      label={{
                        value: "Installation Size (kW)",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      label={{
                        value: "Number of Roofs",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip />
                    <Bar dataKey="value" fill="#fbc02d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
