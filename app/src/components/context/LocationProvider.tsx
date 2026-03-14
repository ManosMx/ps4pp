"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Location = {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
};

type LocationContextType = {
  action: "create" | "view" | "edit";
  location: Location | null;
  setLocation: ({
    location,
    action,
  }: {
    location: Location;
    action?: "create" | "view" | "edit";
  }) => void;
  clearLocation: () => void;
};

const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    location: Location | null;
    action: "create" | "view" | "edit";
  }>({ location: null, action: "view" });

  const setLocation = ({
    location,
    action,
  }: {
    location: Location;
    action?: "create" | "view" | "edit";
  }) => {
    setState({ location, action: action ?? "view" });
  };

  const clearLocation = () => {
    setState({ location: null, action: "view" });
  };

  return (
    <LocationContext.Provider value={{ setLocation, clearLocation, ...state }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
}
