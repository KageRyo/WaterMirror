import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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

  const saveUrl = useCallback(async (value) => {
    const saved = await backendUrlStore.save(value);
    setUrl(saved);
    setLoadFailed(false);
  }, []);

  const contextValue = useMemo(() => ({ url, saveUrl, loadFailed }), [url, saveUrl, loadFailed]);

  if (!loaded) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  return <BackendContext.Provider value={contextValue}>{children}</BackendContext.Provider>;
}

export const useBackend = () => useContext(BackendContext);
