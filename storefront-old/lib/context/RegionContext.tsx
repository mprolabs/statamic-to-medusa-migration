'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Region = {
  id: string;
  name: string;
  code: string;
  domain: string;
  currency: string;
  channelId: string;
  defaultLanguage: string;
  availableLanguages: string[];
};

// Available regions
const REGIONS: Region[] = [
  {
    id: 'nl',
    name: 'Netherlands',
    code: 'NL',
    domain: 'nl.domain.com',
    currency: 'EUR',
    channelId: 'netherlands-channel',
    defaultLanguage: 'nl',
    availableLanguages: ['nl', 'en'],
  },
  {
    id: 'be',
    name: 'Belgium',
    code: 'BE',
    domain: 'be.domain.com',
    currency: 'EUR',
    channelId: 'belgium-channel',
    defaultLanguage: 'nl',
    availableLanguages: ['nl', 'fr', 'en'],
  },
  {
    id: 'de',
    name: 'Germany',
    code: 'DE',
    domain: 'de.domain.com',
    currency: 'EUR',
    channelId: 'germany-channel',
    defaultLanguage: 'de',
    availableLanguages: ['de', 'en'],
  },
];

interface RegionContextType {
  currentRegion: Region;
  regions: Region[];
  setRegion: (regionId: string) => void;
  getRegionByHostname: (hostname: string) => Region;
}

const defaultRegion = REGIONS[0];

const RegionContext = createContext<RegionContextType>({
  currentRegion: defaultRegion,
  regions: REGIONS,
  setRegion: () => {},
  getRegionByHostname: () => defaultRegion,
});

export const useRegion = () => useContext(RegionContext);

export const RegionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRegion, setCurrentRegion] = useState<Region>(defaultRegion);

  const getRegionByHostname = (hostname: string): Region => {
    // Strip port number if present
    const host = hostname.split(':')[0];
    const foundRegion = REGIONS.find((region) => host === region.domain);
    return foundRegion || defaultRegion;
  };

  useEffect(() => {
    // Detect region from hostname when running in browser
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const detectedRegion = getRegionByHostname(hostname);
      setCurrentRegion(detectedRegion);
    }
  }, []);

  const setRegion = (regionId: string) => {
    const newRegion = REGIONS.find((r) => r.id === regionId);
    if (newRegion) {
      setCurrentRegion(newRegion);
      
      // In a real app, we would redirect to the region's domain 
      // or set a cookie to remember the user's region preference
      // window.location.href = `https://${newRegion.domain}${window.location.pathname}`;
    }
  };

  return (
    <RegionContext.Provider
      value={{
        currentRegion,
        regions: REGIONS,
        setRegion,
        getRegionByHostname,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}; 