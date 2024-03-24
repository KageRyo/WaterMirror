import React, { useState } from 'react';
import { Button, Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, Alert, ScrollView } from 'react-native';

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

  // 更新輸入資料
  const updateInput = (key, value) => {
    setData({ ...data, [key]: value });
  };

  // 送出資料
  const handleSubmit = () => {
    const filledData = Object.keys(data).filter(key => data[key] !== '');
    if (filledData.length > 0) {
      const message = `已送出${filledData.join(', ')}資料`;
      Alert.alert('提示', message, [{ text: '確定' }]);
      console.log('客戶端傳送了水質資料', data);
      const csvData = `DO,BOD,NH3N,EC,SS\n${data.DO},${data.BOD},${data.NH3N},${data.EC},${data.SS}`;
      console.log(csvData);
    } else {
      Alert.alert('提示', '請填寫至少一項水質資料', [{ text: '確定' }]);
      console.log('客戶端未填寫水質資料');
    }
    clearInput();
    dismissKBD();
  };

  // 清除輸入資料
  const clearInput = () => {
    setData({ DO: '', BOD: '', NH3N: '', EC: '', SS: '' });
  };

  // 隱藏鍵盤
  const dismissKBD = () => {
    Keyboard.dismiss();
  };

  // 補充訊息處理
  const handleAdditionalInfo = () => {
    Alert.alert('偷偷和你說', '不同的水質資料項目需要蒐集更多的水質資料，歡迎對此專案進行貢獻。', [{ text: '了解' }]);
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKBD}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.title}>手動輸入水質資料</Text>
          <Input label="溶氧量（DO, %）" value={data.DO} onChangeText={text => updateInput('DO', text)} />
          <Input label="生物需氧量（BOD, mg/L）" value={data.BOD} onChangeText={text => updateInput('BOD', text)} />
          <Input label="懸浮固體（SS, mg/L）" value={data.SS} onChangeText={text => updateInput('SS', text)} />
          <Input label="氨氮（NH3-N, mg/L）" value={data.NH3N} onChangeText={text => updateInput('NH3N', text)} />
          <Input label="導電度（EC, μumho/co）" value={data.EC} onChangeText={text => updateInput('EC', text)} />
        </View>

        <View style={styles.dataContainer}>
          <Text style={styles.sectionTitle}>目前輸入的水質資料</Text>
          {/* 在這裡顯示輸入的水質資料 */}
        </View>

        <View style={styles.btnContainer}>
          <Button title="新增一筆" onPress={() => {}} />
          <Button title="修改" onPress={() => {}} />
          <Button title="刪除" onPress={() => {}} />
          <Button title="送出" onPress={handleSubmit} />
        </View>

        <View style={styles.separator} />

        <View style={styles.btnContainer}>
          <Button title="上傳水質資料檔案" onPress={() => {}} />
          <Button title="與自動化設備連線" onPress={() => {}} />
        </View>

        <AdditionalInfo onPress={handleAdditionalInfo} />
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
    marginVertical: 20,
  },
  additionalInfo: {
    marginTop: 20,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
