import React, { useState } from 'react';
import { Button, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, Alert } from 'react-native';

export default function CalcScreen() {
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
    const filledData = Object.keys(waterQualityData).filter(key => waterQualityData[key] !== '');
    if (filledData.length > 0) {
      const message = `已送出${filledData.join(', ')}資料`;
      Alert.alert('提示', message, [{ text: '確定' }]);
      console.log('客戶端傳送了水質資料', waterQualityData)
    } else {
      Alert.alert('提示', '請填寫水質資料', [{ text: '確定' }]);
      console.log('客戶端未填寫水質資料')
    }
    // 清空水質資料
    setWaterQualityData({ DO: '', BOD: '', NH3N: '', EC: '', SS: '' });
    // 隱藏鍵盤
    Keyboard.dismiss();
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
          placeholder="溶氧量（DO, mg/L）"
          keyboardType="numeric"
          value={waterQualityData.DO}
          onChangeText={text => handleInputChange('DO', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="生物需氧量（BOD, mg/L）"
          keyboardType="numeric"
          value={waterQualityData.BOD}
          onChangeText={text => handleInputChange('BOD', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="懸浮固體（SS, mg/L）"
          keyboardType="numeric"
          value={waterQualityData.SS}
          onChangeText={text => handleInputChange('SS', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="氨氮（NH3-N, mg/L）"
          keyboardType="numeric"
          value={waterQualityData.NH3N}
          onChangeText={text => handleInputChange('NH3-N', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="導電度（EC, μS/cm）"
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
