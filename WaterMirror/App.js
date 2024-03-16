import React, { useState } from 'react';
import { Button, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export default function App() {
  const [waterQualityData, setWaterQualityData] = useState({
    // 儲存水質資料
    WT: '', DO: '', pH: '', ORP: '', EC: '',
  });

  const handleInputChange = (key, value) => {
    // 更新水質資料
    setWaterQualityData({ ...waterQualityData, [key]: value });
  };

  const handleSubmit = () => {
    // 在這裡處理提交操作，您可以將填寫的數據傳遞給下一個步驟或執行其他操作。
    console.log('收到客戶端水質資料:', waterQualityData);
  };

  const dismissKeyboard = () => {
    // 隱藏鍵盤
    Keyboard.dismiss();
  };

  return (
    // 如果用戶點擊輸入框以外的區域，鍵盤將會被隱藏
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      {/* 水質資料填寫表單 */}
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
        {/* 送出按鈕 */}
        <Button title="送出" onPress={handleSubmit} />
      </View>
    </TouchableWithoutFeedback>
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
