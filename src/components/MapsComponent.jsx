import React, { useState, useEffect } from "react";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapsComponent = ({ location }) => {
  return (
    <div className="container">
      {location === null ? (
        <p>Loading your location...</p>
      ) : (
        <MapContainer
          center={location}
          zoom={17}
          style={{ height: "50vh", width: "100%", borderRadius: "10px" }}
        >
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
            attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
          />
          <Marker position={location} icon={redIcon}>
            <Popup>You are here!</Popup>
          </Marker>
        </MapContainer>
      )}
    </div>
  );
};

export default MapsComponent;
