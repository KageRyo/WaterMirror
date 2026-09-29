import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Dimensions, Button } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';

import { apiClient } from '@/utils/apiClient';

const {
  getCategoryColor,
  getCategoryTranslationKey,
  normalizeResultPayload,
  parseStoredResult,
  getModelTypeLabel,
} = require('./utils/resultHelpers.cjs');

// 結果畫面
export default function ResultScreen({ navigation, route }) {
  const { t } = useTranslation();
  const initialResult = useMemo(
    () => normalizeResultPayload(route.params?.result || route.params),
    [route.params]
  );
  // 百分位數狀態
  const [percentile, setPercentile] = useState(null);
  // 分類資料狀態
  const [categoryData, setCategoryData] = useState([]);
  const [result, setResult] = useState(initialResult);
  // 載入狀態
  const [isReady, setIsReady] = useState(false);

  // 圖表設定
  const chartConfig = useMemo(() => ({
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  }), []);

  // 使用 useFocusEffect 確保每次進入畫面都檢查資料
  useFocusEffect(
    React.useCallback(() => {
      if (initialResult) {
        setResult(initialResult);
        setIsReady(true);
        fetchPercentile(initialResult.score);
      } else {
        const loadStoredResult = async () => {
          try {
            const storedResult = await AsyncStorage.getItem('waterQualityResult');

            const parsedResult = parseStoredResult(storedResult);
            if (!parsedResult) {
              Alert.alert(t('alerts.notice'), t('alerts.pleaseInputData'));
              navigation.goBack();
              return;
            }
            setResult(parsedResult);
            setIsReady(true);
            fetchPercentile(parsedResult.score);
          } catch (error) {
            Alert.alert(t('alerts.notice'), t('alerts.pleaseInputData'));
            navigation.goBack();
          }
        };
        loadStoredResult();
      }
    }, [initialResult, navigation, t])
  );

  // 獲取百分位數和相關類別資料
  const fetchPercentile = (score) => {
    apiClient.getPercentile(score)
      .then(response => response.json())
      .then(data => {
        if (data.percentile !== undefined) {
          setPercentile(data.percentile);
          fetchCategories();
        } else {
          throw new Error('無法獲取百分位數');
        }
      })
      .catch(error => {
        console.error('Error fetching percentile data:', error);
        Alert.alert(t('alerts.error'), t('alerts.serverErrors.percentileData'));
      });
  };

  const fetchCategories = () => {
    apiClient.getCategories()
      .then(response => response.json())
      .then(data => {
        const totalSamples = data.data.reduce((acc, item) => acc + item.rating, 0);
        const categories = data.data.map(item => {
          const percentage = (item.rating / totalSamples * 100).toFixed(2);
          const translationKey = getCategoryTranslationKey(item.category);
          const translatedCategory = t(`result.waterQuality.${translationKey}`);
          return {
            name: `% ${translatedCategory}`,
            value: parseFloat(percentage),
            color: getCategoryColor(item.category),
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
          };
        });
        setCategoryData(categories);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        Alert.alert(t('alerts.error'), t('alerts.serverErrors.categoryData'));
      });
  };

  const categoryKey = result ? getCategoryTranslationKey(result.category) : null;
  const rating = categoryKey ? t(`result.waterQuality.${categoryKey}`) : t('result.unknownStatus');
  const comment = categoryKey ? t(`result.comments.${categoryKey}`) : t('result.noValidData');
  const barChartData = useMemo(() => {
    if (percentile === null) {
      return null;
    }

    return {
      labels: [
        t('result.chart.improvementSpace'),
        t('result.chart.betterThan')
      ],
      datasets: [{
        data: [100 - percentile, percentile],
        colors: [
          (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
          (opacity = 1) => `rgba(75, 192, 192, ${opacity})`
        ]
      }]
    };
  }, [percentile, t]);

  // 資料尚未準備好時顯示載入中
  if (!isReady || !result) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={{ fontSize: 16, color: '#666' }}>{t('result.loading', 'Loading...')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.score}>{`${t('result.score')}：${result.score.toFixed(2)}`}</Text>
        <Text style={[styles.rating, { color: getCategoryColor(result.category) }]}>{rating}</Text>
      </View>

      <Text style={styles.comment}>{comment}</Text>
      {result.rating_range ? <Text style={styles.range}>{result.rating_range}</Text> : null}
      <Text style={styles.meta}>{`${getModelTypeLabel(result.model_type, t)} · ${result.latency_ms.toFixed(2)} ms`}</Text>
      {result.warnings?.length ? (
        <View style={styles.warningPanel}>
          {result.warnings.map((warning) => (
            <Text key={warning} style={styles.warningItem}>{warning}</Text>
          ))}
        </View>
      ) : null}

      {percentile !== null && barChartData && (
        <View style={styles.chartContainer}>
          <BarChart
            data={barChartData}
            width={Dimensions.get('window').width - 30}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            fromZero={true}
            withCustomBarColorFromData={true}
            showBarTops={true}
            showValuesOnTopOfBars={true}
            formatYLabel={(yValue) => `${yValue}%`}
            style={styles.barChart}
          />
          <Text style={styles.percentile}>
            {t('result.percentileText', { percentile: percentile.toFixed(2) })}
          </Text>
          <PieChart
            data={categoryData}
            width={Dimensions.get('window').width - 16}
            height={220}
            chartConfig={chartConfig}
            accessor={"value"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute={true}
            style={styles.pieChart}
          />
          <Text style={styles.percentileNote}>
            {t('result.chart.status')}
            <Text style={{ color: getCategoryColor(result.category) }}>⬤</Text>
            {t('result.chart.statusIs')}
            <Text style={[styles.rating, { color: getCategoryColor(result.category) }]}>{rating}</Text>
          </Text>
        </View>
      )}

      <View style={styles.btnContainer}>
        <Button 
          title={t('result.buttons.reenterData')} 
          onPress={() => navigation.navigate('Calc')} 
        />
        <Button 
          title={t('result.buttons.viewSuggestions')} 
          onPress={() => navigation.navigate('Suggestions', { assessment: result.assessment })}
        />
      </View>

      <View style={styles.warningContainer}>
        <TouchableOpacity onPress={() => Alert.alert(
          t('alerts.notice'),
          t('alerts.disclaimer'),
          [{ text: t('alerts.iUnderstand') }]
        )}>
          <Text style={styles.warningText}>
            {t('alerts.warning')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  score: {
    fontSize: 18,
    marginRight: 10,
  },
  rating: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  comment: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  range: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  meta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  chartContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  barChart: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  percentile: {
    fontSize: 16,
    color: 'blue',
    textAlign: 'center',
    marginBottom: 10,
  },
  pieChart: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  percentileNote: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
    marginTop: 10,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
  },
  warningContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  warningPanel: {
    width: '90%',
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  warningItem: {
    color: '#a94442',
    marginBottom: 4,
    fontSize: 12,
  },
  warningText: {
    fontSize: 14,
    color: 'red',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    fontSize: 18,
  }
});
