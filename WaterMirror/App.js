import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function App() {
  const [waterQualityData, setWaterQualityData] = useState({
    WT: '',
    DO: '',
    pH: '',
    ORP: '',
    EC: '',
  });

  const handleInputChange = (key, value) => {
    setWaterQualityData({ ...waterQualityData, [key]: value });
  };

  const handleSubmit = () => {
    // 在這裡處理提交操作，您可以將填寫的數據傳遞給下一個步驟或執行其他操作。
    console.log('收到客戶端水質資料:', waterQualityData);
  };

  return (
    <View style={styles.container}>
      <Text>請填寫水質資料</Text>
      <TextInput
        style={styles.input}
        placeholder="水溫(WT, °C)"
        keyboardType="numeric"
        value={waterQualityData.WT}
        onChangeText={text => handleInputChange('WT', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="溶氧量（DO, mg/L）"
        keyboardType="numeric"
        value={waterQualityData.DO}
        onChangeText={text => handleInputChange('DO', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="酸鹼值（pH值）"
        keyboardType="numeric"
        value={waterQualityData.pH}
        onChangeText={text => handleInputChange('pH', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="氧化還原電位（ORP）"
        keyboardType="numeric"
        value={waterQualityData.ORP}
        onChangeText={text => handleInputChange('ORP', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="導電度（EC）"
        keyboardType="numeric"
        value={waterQualityData.EC}
        onChangeText={text => handleInputChange('EC', text)}
      />
      <Button title="送出" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
});
