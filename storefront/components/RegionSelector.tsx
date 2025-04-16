'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../packages/ui/src/components/select';
import { SUPPORTED_REGIONS, DEFAULT_REGION, STORAGE_KEYS } from '../lib/constants';
import { setLocale } from '../lib/graphql/client';

export default function RegionSelector() {
  const [currentRegion, setCurrentRegion] = useState(DEFAULT_REGION);

  useEffect(() => {
    // Check for region in localStorage when component mounts
    const storedRegion = typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEYS.REGION)
      : null;

    if (storedRegion) {
      setCurrentRegion(storedRegion);
    }
  }, []);

  const handleRegionChange = (regionCode: string) => {
    // Set the new region in localStorage and update state
    localStorage.setItem(STORAGE_KEYS.REGION, regionCode);
    setCurrentRegion(regionCode);

    // Get current language to pass with the region change
    const currentLanguage = typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEYS.LANGUAGE) || DEFAULT_REGION
      : DEFAULT_REGION;

    // Update the locale in the GraphQL client which will trigger a page reload
    setLocale(regionCode, currentLanguage);
  };

  // Find the current region object
  const currentRegionObj = SUPPORTED_REGIONS.find(region => region.code === currentRegion)
    || SUPPORTED_REGIONS.find(region => region.code === DEFAULT_REGION)
    || SUPPORTED_REGIONS[0];

  return (
    <Select value={currentRegion} onValueChange={handleRegionChange}>
      <SelectTrigger className="w-[130px] bg-white border border-gray-200">
        <span className="flex items-center">
          <Globe className="w-4 h-4 mr-2 text-gray-500" aria-hidden="true" />
          <SelectValue placeholder={currentRegionObj.name} />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Select Region</SelectLabel>
          {SUPPORTED_REGIONS.map((region) => (
            <SelectItem
              key={region.code}
              value={region.code}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <span className="mr-2">{region.flag}</span>
                <span>{region.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
