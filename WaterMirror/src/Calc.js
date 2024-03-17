import React, { useState } from 'react';
import { Button, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, Alert } from 'react-native';

export default function CalcScreen() {
  const [waterQualityData, setWaterQualityData] = useState({
    // 儲存水質資料
    DO: '', BOD: '', NH3N: '', EC: '', SS: '',
  });

  const handleInputChange = (key, value) => {
    // 更新水質資料
    setWaterQualityData({ ...waterQualityData, [key]: value });
  };

  const handleSubmit = () => {
    // 在這裡處理提交操作
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
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <Text style={styles.title}>請填寫水質資料</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="溶氧量（DO, %）"
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
            onChangeText={text => handleInputChange('NH3N', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="導電度（EC, μumho/co）"
            keyboardType="numeric"
            value={waterQualityData.EC}
            onChangeText={text => handleInputChange('EC', text)}
          />
        </View>
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
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  inputContainer: {
    width: '80%',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
