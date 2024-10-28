import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Dimensions, Button } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';

import config from '@/config.json';

// 結果畫面
export default function ResultScreen({ navigation, route }) {
  const { t } = useTranslation();
  // 從 Route 中取得資料
  const { data, assessment } = route.params ?? {};
  // 百分位數狀態
  const [percentile, setPercentile] = useState(null);
  // 分類資料狀態
  const [categoryData, setCategoryData] = useState([]);
  // 綜合評分狀態
  const [score, setScore] = useState(null);
  // 類別狀態
  const [category, setCategory] = useState('');

  // 圖表設定
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  // 使用 useFocusEffect 確保每次進入畫面都檢查資料
  useFocusEffect(
    React.useCallback(() => {
      if (!data || !assessment) {
        const checkStoredData = async () => {
          try {
            const storedData = await AsyncStorage.getItem('waterQualityData');
            const storedAssessment = await AsyncStorage.getItem('waterQualityAssessment');
            
            if (!storedData || !storedAssessment) {
              Alert.alert(t('alerts.notice'), t('alerts.pleaseInputData'));
              navigation.goBack();  // 使用 goBack 而不是 navigate
              return;  // 立即返回，不執行後續代碼
            }
            
            const parsedData = JSON.parse(storedData);
            setScore(parsedData);
            fetchPercentile(parsedData);
          } catch (error) {
            Alert.alert(t('alerts.notice'), t('alerts.pleaseInputData'));
            navigation.goBack();
          }
        };
        checkStoredData();
      } else {
        setScore(parseFloat(data));  // 確保 data 是數字
        fetchPercentile(data);
      }
    }, [data, assessment, navigation, t])
  );

  // 獲取百分位數和相關類別資料
  const fetchPercentile = (score) => {
    fetch(`${config.api_url}:${config.port}/percentile?score=${score}`)
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

  // 獲取類別資料的函式
  const fetchCategories = () => {
    fetch(`${config.api_url}:${config.port}/categories/`)
      .then(response => response.json())
      .then(data => {
        // 使用 reduce 函數計算總樣本數
        const totalSamples = data.data.reduce((acc, item) => acc + item.rating, 0);
        const categories = data.data.map(item => {
          // 提前計算百分比
          const percentage = (item.rating / totalSamples * 100).toFixed(2);
          return {
            name: `% ${item.category}`,
            value: parseFloat(percentage),
            color: getColor(item.category),
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
          };
        });
        setCategoryData(categories);
        determineCategory(data.data);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        Alert.alert(t('alerts.error'), t('alerts.serverErrors.categoryData'));
      });
  };

  // 根據類別獲取顏色
  const getColor = (category) => {
    const colors = {
      '優良': 'green',
      '良好': 'blue',
      '中等': 'gold',
      '不良': 'orange',
      '糟糕': 'red',
      '惡劣': 'brown'
    };
    return colors[category] || '#ccc';
  };

  // 計算水質狀態
  const countWaterQuality = (wqi5) => {
    if (wqi5 > 100) return {
      rating: t('result.waterQuality.inputError'),
      comment: t('result.comments.checkData')
    };
    if (wqi5 > 85) return {
      rating: t('result.waterQuality.excellent'),
      comment: t('result.comments.excellent')
    };
    if (wqi5 > 70) return {
      rating: t('result.waterQuality.good'),
      comment: t('result.comments.good')
    };
    if (wqi5 > 50) return {
      rating: t('result.waterQuality.fair'),
      comment: t('result.comments.fair')
    };
    if (wqi5 > 30) return {
      rating: t('result.waterQuality.poor'),
      comment: t('result.comments.poor')
    };
    if (wqi5 > 15) return {
      rating: t('result.waterQuality.bad'),
      comment: t('result.comments.bad')
    };
    if (wqi5 > 0) return {
      rating: t('result.waterQuality.terrible'),
      comment: t('result.comments.terrible')
    };
    return {
      rating: t('result.waterQuality.error'),
      comment: t('result.comments.error')
    };
  };

  // 確定類別
  const determineCategory = (categories) => {
    const category = categories.find(category => category.rating >= data);
    setCategory(category ? category.category : '未知');
  };

  // 獲取經 WQI5 評估後的水質狀態資訊
  const { rating, comment } = score !== null ? countWaterQuality(score) : { rating: '未知', comment: '無有效水質資料，請返回並重新輸入資料。' };

  // 顯示查看改善建議
  const showMoreAlert = () => {
    const assessmentEntries = Object.entries(assessment);
    const badValues = assessmentEntries.filter(([, value]) => 
      value === t('result.waterQuality.poor') || value === t('result.waterQuality.error')
    );

    Alert.alert(
      t('result.improvement.title'),
      `${t('result.improvement.parameters')}\n\n${assessmentEntries.map(([key, value]) => {
        return `${t(`result.improvement.parameters.${key}`)}：${value}`;
      }).join('\n')}\n`,
      badValues.length === 0
        ? [{ text: t('result.buttons.iKnow') }]
        : [
            { text: t('result.buttons.iKnow') },
            { text: t('result.buttons.next'), onPress: () => showBadValues(badValues) }
          ]
    );
  };

// 顯示不良水質項目的改善建議
const showBadValues = (badValues) => {
  // 使用已經在組件頂層定義的 t 函數
  let suggestions = '';
  badValues.forEach(([key, value], index) => {
    if (value === t('result.waterQuality.poor') || value === t('result.waterQuality.error')) {
      switch (key) {
        case 'DO':
          if (value === t('result.waterQuality.error')) {
            suggestions += t('result.improvement.suggestions.DO.error');
          } else if (value === t('result.waterQuality.poor')) {
            suggestions += t('result.improvement.suggestions.DO.poor');
          }
          break;
        case 'BOD':
          if (value === t('result.waterQuality.error')) {
            suggestions += t('result.improvement.suggestions.BOD.error');
          } else if (value === t('result.waterQuality.poor')) {
            suggestions += t('result.improvement.suggestions.BOD.poor');
          }
          break;
        case 'NH3N':
          if (value === t('result.waterQuality.error')) {
            suggestions += t('result.improvement.suggestions.NH3N.error');
          } else if (value === t('result.waterQuality.poor')) {
            suggestions += t('result.improvement.suggestions.NH3N.poor');
          }
          break;
        case 'EC':
          if (value === t('result.waterQuality.error')) {
            suggestions += t('result.improvement.suggestions.EC.error');
          } else if (value === t('result.waterQuality.poor')) {
            suggestions += t('result.improvement.suggestions.EC.poor');
          }
          break;
        case 'SS':
          if (value === t('result.waterQuality.error')) {
            suggestions += t('result.improvement.suggestions.SS.error');
          } else if (value === t('result.waterQuality.poor')) {
            suggestions += t('result.improvement.suggestions.SS.poor');
          }
          break;
        default:
          suggestions += `${key} ${t('result.improvement.title')}：\n`;
      }
    }
    if (index !== badValues.length - 1) {
      suggestions += '\n\n';
    }
  });

  Alert.alert(
    t('result.improvement.title'),
    suggestions,
    [{ text: t('result.buttons.iKnow') }]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.score}>{`${t('result.score')}：${score}`}</Text>
        <Text style={[styles.rating, { color: getColor(rating) }]}>{rating}</Text>
      </View>

      <Text style={styles.comment}>{comment}</Text>

      {percentile !== null && (
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: [
                t('result.chart.improvementSpace'),
                t('result.chart.betterThan')
              ],
              datasets: [{
                data: [(100 - percentile).toFixed(2), percentile.toFixed(2)],
                colors: [
                  (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                  (opacity = 1) => `rgba(75, 192, 192, ${opacity})`
                ]
              }]
            }}
            width={Dimensions.get('window').width - 30}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={{
              ...chartConfig,
              decimalPlaces: 0,
            }}
            verticalLabelRotation={0}
            fromZero={true}
            withCustomBarColorFromData={true}
            showBarTops={true}
            showValuesOnTopOfBars={true}
            formatYLabel={(yValue) => `${yValue}%`}
            style={styles.barChart}
          />
          <Text style={styles.percentile}>您的水質狀況優於了 {percentile.toFixed(2)}% 的水質資料！</Text>
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
            <Text style={{ color: getColor(rating) }}>⬤</Text>
            {t('result.chart.statusIs')}
            <Text style={[styles.rating, { color: getColor(rating) }]}>{rating}</Text>
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
          onPress={showMoreAlert}
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
