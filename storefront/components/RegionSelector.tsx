'use client';

import { Fragment, useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { GlobeEuropeAfricaIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
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
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <GlobeEuropeAfricaIcon className="w-5 h-5 mr-2 text-gray-400" aria-hidden="true" />
          <span>{currentRegionObj.name}</span>
          <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {SUPPORTED_REGIONS.map((region) => (
              <Menu.Item key={region.code}>
                {({ active }: { active: boolean }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } ${
                      currentRegion === region.code ? 'bg-gray-50' : ''
                    } group flex items-center px-4 py-2 text-sm w-full text-left`}
                    onClick={() => handleRegionChange(region.code)}
                  >
                    <span className="flex-grow">{region.name}</span>
                    {currentRegion === region.code && (
                      <CheckIcon className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
