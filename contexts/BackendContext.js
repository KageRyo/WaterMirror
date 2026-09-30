import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { backendUrlStore } from '../src/utils/apiClient';

const BackendContext = createContext();

export function BackendProvider({ children }) {
  const [url, setUrl] = useState(backendUrlStore.getUrl());
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    backendUrlStore.load().then((saved) => {
      if (active) setUrl(saved);
    }).catch(() => {
      if (active) setLoadFailed(true);
    }).finally(() => {
      if (active) setLoaded(true);
    });
    return () => { active = false; };
  }, []);

  async function saveUrl(value) {
    const saved = await backendUrlStore.save(value);
    setUrl(saved);
    setLoadFailed(false);
  }

  if (!loaded) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  return <BackendContext.Provider value={{ url, saveUrl, loadFailed }}>{children}</BackendContext.Provider>;
}

export const useBackend = () => useContext(BackendContext);
