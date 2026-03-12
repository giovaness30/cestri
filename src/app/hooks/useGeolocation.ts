'use client'

import { useState, useCallback } from "react";
import type { LocationInfo } from "../types/default";

interface GeolocationState {
  location: LocationInfo | null;
  isLoading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    isLoading: false,
    error: null,
  });

  const getCurrentLocation = useCallback(async (): Promise<LocationInfo | null> => {
    setState({ location: null, isLoading: true, error: null });

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setState({
        location: null,
        isLoading: false,
        error: "Geolocalização não é suportada pelo seu navegador",
      });
      return null;
    }

    try {
      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocoding using Nominatim (OpenStreetMap)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "pt-BR",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          // Try to get a meaningful name for the location
          const address = data.address || {};
          const locationName = 
            address.shop ||
            address.supermarket ||
            address.retail ||
            address.building ||
            address.amenity ||
            address.road ||
            "Local atual";
          
          const fullAddress = [
            address.road,
            address.house_number,
            address.suburb || address.neighbourhood,
            address.city || address.town || address.village,
          ]
            .filter(Boolean)
            .join(", ");

          const locationInfo: LocationInfo = {
            name: locationName,
            address: fullAddress || data.display_name,
            lat: latitude,
            lng: longitude,
          };

          setState({ location: locationInfo, isLoading: false, error: null });
          return locationInfo;
        }
      } catch {
        // If reverse geocoding fails, still return coordinates
        const locationInfo: LocationInfo = {
          name: "Local atual",
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          lat: latitude,
          lng: longitude,
        };

        setState({ location: locationInfo, isLoading: false, error: null });
        return locationInfo;
      }

      // Fallback if reverse geocoding response is not ok
      const locationInfo: LocationInfo = {
        name: "Local atual",
        lat: latitude,
        lng: longitude,
      };

      setState({ location: locationInfo, isLoading: false, error: null });
      return locationInfo;

    } catch (err) {
      const error = err as GeolocationPositionError;
      let errorMessage: string;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Permissão de localização negada";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Localização indisponível";
          break;
        case error.TIMEOUT:
          errorMessage = "Tempo esgotado ao obter localização";
          break;
        default:
          errorMessage = "Erro ao obter localização";
      }

      setState({ location: null, isLoading: false, error: errorMessage });
      return null;
    }
  }, []);

  const clearLocation = useCallback(() => {
    setState({ location: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    getCurrentLocation,
    clearLocation,
  };
}
