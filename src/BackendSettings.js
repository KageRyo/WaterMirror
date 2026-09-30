import React, { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBackend } from '../contexts/BackendContext';
import { fetchWithTimeout } from './utils/apiClient';

const { normalizeBackendUrl } = require('./utils/backendSettings.cjs');
const { getBackendStatus } = require('./utils/apiContract.cjs');
const LAN_BACKEND_EXAMPLE = 'http://192.168.1.20:8001'; // NOSONAR: User-approved HTTP LAN example; the form explains unencrypted transport.

export default function BackendSettingsScreen() {
  const { t } = useTranslation();
  const { url, saveUrl, loadFailed } = useBackend();
  const [draft, setDraft] = useState(url);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function validatedUrl() {
    try { return normalizeBackendUrl(draft); } catch {
      setError(t('backend.invalidUrl'));
      return null;
    }
  }

  async function testConnection() {
    const candidate = validatedUrl();
    if (!candidate) return;
    setBusy(true);
    setStatus('connecting');
    try {
      const result = await getBackendStatus({
        health: () => fetchWithTimeout(`${candidate}/api/v2/health`, {}, 10000),
        ready: () => fetchWithTimeout(`${candidate}/api/v2/ready`, {}, 10000),
      });
      setStatus(result.state);
    } finally { setBusy(false); }
  }

  async function save() {
    const candidate = validatedUrl();
    if (!candidate) return;
    setBusy(true);
    try {
      await saveUrl(candidate);
      setSaved(true);
    } catch {
      setError(t('backend.saveFailed'));
    } finally { setBusy(false); }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>{t('backend.label')}</Text>
      <Text style={styles.hint}>{t('backend.hint')}</Text>
      {loadFailed && <Text style={styles.warning}>{t('backend.loadFailed')}</Text>}
      <TextInput style={styles.input} value={draft} editable={!busy}
        accessibilityLabel={t('backend.label')} autoCapitalize="none" autoCorrect={false}
        keyboardType="url" placeholder={LAN_BACKEND_EXAMPLE}
        onChangeText={(value) => { setDraft(value); setStatus(''); setError(''); setSaved(false); }} />
      {error ? <Text accessibilityRole="alert" style={styles.warning}>{error}</Text> : null}
      <Text style={styles.warning}>{t('backend.httpNotice')}</Text>
      <View style={styles.button}><Button title={t('backend.test')} disabled={busy} onPress={testConnection} /></View>
      {status ? <Text accessibilityLiveRegion="polite">{t(`calc.connection.${status}`)}</Text> : null}
      <View style={styles.button}><Button title={t('backend.save')} disabled={busy} onPress={save} /></View>
      {saved ? <Text accessibilityLiveRegion="polite">{t('backend.saved')}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  label: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  hint: { fontSize: 15, marginVertical: 12 },
  input: { borderWidth: 1, borderColor: '#888', borderRadius: 8, padding: 12, fontSize: 16 },
  warning: { color: '#805300', marginVertical: 12 },
  button: { marginVertical: 12 },
});
