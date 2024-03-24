import React, { useState } from 'react';
import { Button, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, Alert, ScrollView } from 'react-native';

// 水質輸入部分組件
const WaterQualityInput = ({ label, value, onChangeText }) => (
  <TextInput style={styles.input} placeholder={label} keyboardType="numeric" value={value} onChangeText={onChangeText} />
);

// 額外信息組件
const AdditionalInfo = ({ onPress }) => (
  <Text style={styles.additionalInfo} onPress={onPress}>
    我找不到我的水質項目
  </Text>
);

export default function CalcScreen() {
  const [waterQualityData, setWaterQualityData] = useState({
    DO: '',
    BOD: '',
    NH3N: '',
    EC: '',
    SS: '',
  });

  const handleInputChange = (key, value) => {
    setWaterQualityData({ ...waterQualityData, [key]: value });
  };

  const handleSubmit = () => {
    // 在這裡處理提交操作
    const filledData = Object.keys(waterQualityData).filter(key => waterQualityData[key] !== '');
    if (filledData.length > 0) {
      const message = `已送出${filledData.join(', ')}資料`;
      Alert.alert('提示', message, [{ text: '確定' }]);
      console.log('客戶端傳送了水質資料', waterQualityData);
      const csvData = `DO,BOD,NH3N,EC,SS\n${waterQualityData.DO},${waterQualityData.BOD},${waterQualityData.NH3N},${waterQualityData.EC},${waterQualityData.SS}`;
      console.log(csvData);
    } else {
      Alert.alert('提示', '請填寫至少一項水質資料', [{ text: '確定' }]);
      console.log('客戶端未填寫水質資料');
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

  const handleAdditionalInfo = () => {
    // 顯示提示信息
    Alert.alert('偷偷和你說', '不同的水質資料項目需要蒐集更多的水質資料，歡迎對此專案進行貢獻。', [{ text: '了解' }]);
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.title}>手動輸入水質資料</Text>
          <WaterQualityInput label="溶氧量（DO, %）" value={waterQualityData.DO} onChangeText={text => handleInputChange('DO', text)} />
          <WaterQualityInput label="生物需氧量（BOD, mg/L）" value={waterQualityData.BOD} onChangeText={text => handleInputChange('BOD', text)} />
          <WaterQualityInput label="懸浮固體（SS, mg/L）" value={waterQualityData.SS} onChangeText={text => handleInputChange('SS', text)} />
          <WaterQualityInput label="氨氮（NH3-N, mg/L）" value={waterQualityData.NH3N} onChangeText={text => handleInputChange('NH3N', text)} />
          <WaterQualityInput label="導電度（EC, μumho/co）" value={waterQualityData.EC} onChangeText={text => handleInputChange('EC', text)} />
        </View>

        <View style={styles.dataContainer}>
          <Text style={styles.sectionTitle}>目前輸入的水質資料</Text>
          {/* 在這裡顯示輸入的水質資料 */}
        </View>

        <View style={styles.buttonContainer}>
          <Button title="新增一筆" onPress={() => {}} />
          <Button title="修改" onPress={() => {}} />
          <Button title="刪除" onPress={() => {}} />
          <Button title="送出" onPress={handleSubmit} />
        </View>

        <View style={styles.separator} />

        <View style={styles.buttonContainer}>
          <Button title="上傳水質資料檔案" onPress={() => {}} />
          <Button title="與自動化設備連線" onPress={() => {}} />
        </View>

        <AdditionalInfo onPress={handleAdditionalInfo} />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
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
  dataContainer: {
    width: '80%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
  },
  separator: {
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    width: '80%',
    marginVertical: 20,
  },
  additionalInfo: {
    marginTop: 20,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});