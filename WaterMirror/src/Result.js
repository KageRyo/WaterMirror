import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ResultScreen({ route }) {
  // 從 route.params 中取得 data 的值，若無則設為 null
  const { data } = route.params ?? {};

  // 判斷 data 是否為數字，若是則設為 dataValue，否則設為 null
  const dataValue = typeof data === 'number' ? data : null;
  const content = dataValue !== null ? `${dataValue}` : '請先至「輸入資料」頁面輸入您的水質資料';

  // 根據 WQI5 判斷水質評級和評論
  const countWaterQuality = (wqi5) => {
    let rating = '';
    let comment = '';

    if (wqi5 > 100) {
      rating = '輸入的資料可能有誤';
      comment = '請檢查並重新輸入正確的數據。';
    } else if (wqi5 > 85) {
      rating = '優良';
      comment = '您的水質狀況優良，可做各種用途，加氯消毒可直接飲用。';
    } else if (wqi5 > 70) {
      rating = '良好';
      comment = '您的水質狀況良好，可做為自來水水源、水產、工業、遊樂及灌溉用途。';
    } else if (wqi5 > 50) {
      rating = '中等';
      comment = '您的水質狀況尚可，可做為自來水水源，但需經特別處理，可養殖粗魚，可供工業，遊憩及灌溉用水。';
    } else if (wqi5 > 30) {
      rating = '不良';
      comment = '您的水質狀況屬於中下等，僅適合做灌溉或工業冷卻。';
    } else if (wqi5 > 15) {
      rating = '糟糕';
      comment = '您的水質狀況不佳，但仍不會引起厭惡，可作環境保育之用。';
    } else if (wqi5 > 0) {
      rating = '惡劣';
      comment = '您的水質狀況惡劣，可能發生臭味。';
    } else {
      rating = '無效數值';
      comment = '此數值無法進行分析，請檢查後再試。';
    }
    return { rating, comment };
  };

  // 使用countWaterQuality函數獲得水質評級和評論
  const { rating, comment } = dataValue !== null ? countWaterQuality(dataValue) : { rating: '', comment: '這樣 WaterMirror 才能為您進行分析' };

  // 元件樣式
  return (
    <View style={styles.container}>
      <Text>{content}</Text>
      <Text>{rating}</Text>
      <Text>{comment}</Text>
    </View>
  );
}

// 主樣式表
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
