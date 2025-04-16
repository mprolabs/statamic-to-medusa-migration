'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRegion } from './RegionContext';

export type ChannelData = {
  id: string;
  slug: string;
  name: string;
  currencyCode: string;
  isActive: boolean;
  defaultCountry?: string;
};

interface ChannelContextType {
  currentChannel: ChannelData | null;
  availableChannels: ChannelData[];
  setChannel: (channelId: string) => void;
  isLoading: boolean;
  error: string | null;
}

// Initial empty state
const initialState: ChannelContextType = {
  currentChannel: null,
  availableChannels: [],
  setChannel: () => {},
  isLoading: true,
  error: null,
};

// Create context
const ChannelContext = createContext<ChannelContextType>(initialState);

// Hook for consuming the context
export const useChannel = () => useContext(ChannelContext);

export const ChannelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentRegion } = useRegion();
  const [currentChannel, setCurrentChannel] = useState<ChannelData | null>(null);
  const [availableChannels, setAvailableChannels] = useState<ChannelData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock fetchChannels function (replace with actual GraphQL query in production)
  const fetchChannels = async (): Promise<ChannelData[]> => {
    try {
      // In a real implementation, this would be a GraphQL query to Saleor API
      // For now, we're returning mock data
      return [
        {
          id: 'netherlands-channel',
          slug: 'netherlands',
          name: 'Netherlands Channel',
          currencyCode: 'EUR',
          isActive: true,
          defaultCountry: 'NL',
        },
        {
          id: 'belgium-channel',
          slug: 'belgium',
          name: 'Belgium Channel',
          currencyCode: 'EUR',
          isActive: true,
          defaultCountry: 'BE',
        },
        {
          id: 'germany-channel',
          slug: 'germany',
          name: 'Germany Channel',
          currencyCode: 'EUR',
          isActive: true,
          defaultCountry: 'DE',
        },
      ];
    } catch (error) {
      console.error('Error fetching channels:', error);
      throw new Error('Failed to fetch channels from Saleor API');
    }
  };

  // Function to set the active channel based on channel ID
  const setChannel = (channelId: string) => {
    const channel = availableChannels.find((ch: ChannelData) => ch.id === channelId);
    if (channel) {
      setCurrentChannel(channel);
      // In a real implementation, you might want to store this preference
      // in localStorage or cookies
      localStorage.setItem('selectedChannelId', channelId);
    } else {
      console.error(`Channel with ID ${channelId} not found`);
    }
  };

  // Effect to load channels and set the initial channel based on region
  useEffect(() => {
    const initializeChannels = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const channels = await fetchChannels();
        setAvailableChannels(channels);
        
        // Find the channel that matches the current region's channelId
        if (currentRegion && currentRegion.channelId) {
          const regionChannel = channels.find(
            (ch: ChannelData) => ch.id === currentRegion.channelId
          );
          
          if (regionChannel) {
            setCurrentChannel(regionChannel);
          } else {
            // Fallback to first active channel if region channel not found
            const firstActiveChannel = channels.find((ch: ChannelData) => ch.isActive);
            if (firstActiveChannel) {
              setCurrentChannel(firstActiveChannel);
            } else {
              setError('No active channels available');
            }
          }
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load channels';
        setError(errorMessage);
        console.error('Channel initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChannels();
  }, [currentRegion]);

  return (
    <ChannelContext.Provider
      value={{
        currentChannel,
        availableChannels,
        setChannel,
        isLoading,
        error,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
};

export default ChannelContext; 