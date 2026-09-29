import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const STATUS_KEYS = {
  Good: 'good',
  Fair: 'fair',
  Poor: 'poor',
  OutOfRange: 'error',
};

const STATUS_STYLES = {
  Good: 'good',
  Fair: 'fair',
  Poor: 'poor',
  OutOfRange: 'error',
};

export default function SuggestionsScreen({ route }) {
  const { t } = useTranslation();
  const assessment = route.params?.assessment || {};
  const entries = Object.entries(assessment);
  const recommendations = entries.filter(([, status]) => status === 'Poor' || status === 'OutOfRange');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('result.improvement.title')}</Text>

      {entries.map(([key, status]) => {
        const statusKey = STATUS_KEYS[status] || 'error';
        const statusStyle = styles[STATUS_STYLES[status]] || styles.error;
        const recommendationKey = status === 'OutOfRange' ? 'error' : 'poor';

        return (
          <View key={key} style={styles.card}>
            <View style={styles.statusRow}>
              <Text style={styles.parameter}>{t(`result.improvement.parameters.${key}`)}</Text>
              <Text style={[styles.status, statusStyle]}>
                {t(`result.waterQuality.${statusKey}`)}
              </Text>
            </View>
            {status === 'Poor' || status === 'OutOfRange' ? (
              <Text style={styles.recommendation}>
                {t(`result.improvement.suggestions.${key}.${recommendationKey}`)}
              </Text>
            ) : null}
          </View>
        );
      })}

      {entries.length === 0 ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{t('result.noValidData')}</Text>
        </View>
      ) : null}

      {entries.length > 0 && recommendations.length === 0 ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{t('result.improvement.noRecommendations')}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 16,
    color: '#111',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  parameter: {
    flexShrink: 1,
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  good: {
    color: '#237a3b',
    backgroundColor: '#e6f4ea',
  },
  fair: {
    color: '#826000',
    backgroundColor: '#fff4cc',
  },
  poor: {
    color: '#a34d00',
    backgroundColor: '#ffeddc',
  },
  error: {
    color: '#a12622',
    backgroundColor: '#fde7e7',
  },
  recommendation: {
    marginTop: 12,
    color: '#444',
    fontSize: 14,
    lineHeight: 21,
  },
  notice: {
    marginTop: 4,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#e8f5e9',
  },
  noticeText: {
    color: '#286a36',
    fontSize: 15,
    lineHeight: 22,
  },
});
