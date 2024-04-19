import React, { useState } from 'react';
import { Alert, Button, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

// 水質輸入元件
const Input = ({ label, value, onChangeText }) => (
  <TextInput style={styles.input} placeholder={label} keyboardType="numeric" value={value} onChangeText={onChangeText} />
);

// 補充訊息元件
const AdditionalInfo = ({ onPress }) => (
  <Text style={styles.additionalInfo} onPress={onPress}>
    我找不到我的水質項目
  </Text>
);

// 畫面視窗
export default function CalcScreen() {
  const [data, setData] = useState({
    DO: '',
    BOD: '',
    NH3N: '',
    EC: '',
    SS: '',
  });
  const [selectedModel, setSelectedModel] = useState('');
  const [customModelURL, setCustomModelURL] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('未連線');

  // 更新輸入資料
  const updateInput = (key, value) => {
    setData({ ...data, [key]: value });
  };

  // 送出資料
  const handleSubmit = async () => {
    const filledData = Object.keys(data).filter(key => data[key] !== '');
    if (filledData.length > 0) {
      const message = `已送出${filledData.join(', ')}資料`;
      Alert.alert('提示', message, [{ text: '確定' }]);
      console.log('客戶端傳送了水質資料', data);
      const csvData = `DO,BOD,NH3N,EC,SS\n${data.DO},${data.BOD},${data.NH3N},${data.EC},${data.SS}`;
      console.log(csvData);

      // 上傳CSV檔案到後端
      await uploadCSVFile(csvData);
    } else {
      Alert.alert('提示', '請填寫至少一項水質資料', [{ text: '確定' }]);
      console.log('客戶端未填寫水質資料');
    }
    clearInput();
    dismissKBD();
  };
  
  // 清除輸入資料的函式
  const clearInput = () => {
    setData({ DO: '', BOD: '', NH3N: '', EC: '', SS: '' });
  };

  // 隱藏鍵盤的函式
  const dismissKBD = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKBD}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.connectionStatus}>連線狀況: {connectionStatus}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.inputContainer}>
          <Text style={styles.title}>手動輸入水質資料</Text>
            <Input label="溶氧量（DO, %）" value={data.DO} onChangeText={(text) => updateInput('DO', text)} />
            <Input label="生物需氧量（BOD, mg/L）" value={data.BOD} onChangeText={(text) => updateInput('BOD', text)} />
            <Input label="懸浮固體（SS, mg/L）" value={data.SS} onChangeText={(text) => updateInput('SS', text)} />
            <Input label="氨氮（NH3-N, mg/L）" value={data.NH3N} onChangeText={(text) => updateInput('NH3N', text)} />
            <Input label="導電度（EC, μumho/co）" value={data.EC} onChangeText={(text) => updateInput('EC', text)} />
        </View>

        <View style={styles.dataContainer}>
          <Text style={styles.sectionTitle}>目前輸入的水質資料</Text>
          <Text>
            {data.DO || data.BOD || data.NH3N || data.EC || data.SS ? 
            `DO: ${data.DO}% BOD: ${data.BOD}mg/L SS: ${data.SS}mg/L NH3-N: ${data.NH3N}mg/L EC: ${data.EC}μumho/co` : 
            "請在上方輸入框輸入水質資料或上傳CSV檔案"}
          </Text>
        </View>

        <View style={styles.btnContainer}>
          <Button title="刪除" onPress={clearInput} />
          <Button title="送出" onPress={handleSubmit} />
        </View>

        <View style={styles.separator} />

        <View style={styles.btnContainer}>
          <Button title="上傳水質資料檔案" onPress={() => { }} />
          <Button title="與自動化設備連線" onPress={() => { }} />
        </View>

        <AdditionalInfo onPress={() => { }} />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}


// 主樣式表
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    marginBottom: 10,
  },
  connectionStatus: {
    fontSize: 16,
    padding: 5,
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
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
  },
  separator: {
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    width: '80%',
    marginVertical: 10,
  },
  additionalInfo: {
    marginTop: 20,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});