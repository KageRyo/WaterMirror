import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ResultScreen({ route }) {
  // 確保使用了安全的數據解構，避免undefined的data
  const { data } = route.params ?? {};

  // 檢查data是否為一個有效的對象
  const content = data ? JSON.stringify(data) : '無有效數據';

  return (
    <View style={styles.container}>
      <Text>查閱報表</Text>
      {/* 確保JSON.stringify後的結果被<Text>包裹 */}
      <Text>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
