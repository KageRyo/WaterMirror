import React, { useState, useEffect } from 'react';
import { Alert, Button, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import config from './config.json';

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
  const [connectionStatus, setConnectionStatus] = useState('與MPR水質分析伺服器連線中...');

  // 元件載入時執行
  useEffect(() => {
    requestStoragePermission();
    const intervalId = setInterval(() => checkConnection(config.api_url), 5000);
    return () => clearInterval(intervalId);
  }, []);

  // 請求存儲權限的函式
  async function requestStoragePermission() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('需要權限以訪問您的媒體庫！');
    }
  }

  // 檢查與伺服器的連線
  const checkConnection = async (apiUrl) => {
    try {
      const response = await fetch(`${apiUrl}/`);
      const jsonResponse = await response.json();
      if (jsonResponse.message === '成功與 API 連線!') {
        setConnectionStatus('已連線到MPR水質分析模型');
      } else {
        setConnectionStatus('與MPR水質分析模型連線失敗');
      }
    } catch (error) {
      console.error('連線錯誤:', error);
      setConnectionStatus('MPR水質分析伺服器未開啟');
    }
  };

  // 更新輸入資料
  const updateInput = (key, value) => {
    setData({ ...data, [key]: value });
  };

  // 選擇CSV檔案
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.cancelled) {
        const pickedFile = result.assets[0];
        const formData = new FormData();
        formData.append('file', {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType
        });

        const response = await fetch(`${config.api_url}/score/all/`, {  // Use API URL from config
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const responseData = await response.json();
        if (response.ok) {
          Alert.alert('上傳成功', `分析結果: ${JSON.stringify(responseData)}`, [{ text: 'OK' }]);
        } else {
          throw new Error('Network response was not ok');
        }
      } else {
        Alert.alert('取消操作', '您沒有選擇任何檔案。', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      Alert.alert('上傳失敗', `無法上傳資料至伺服器。請檢查您的網絡連接。錯誤信息：${error}`, [{ text: '確定' }]);
    }
  };

  // 送出資料
  const handleSubmit = async () => {
    const filledData = Object.keys(data).filter(key => data[key] !== '');
    if (filledData.length > 0) {
      Alert.alert('提示', `正在處理資料並建立CSV檔案`, [{ text: '確定' }]);
      const csvData = `DO,BOD,NH3N,EC,SS\n${data.DO},${data.BOD},${data.NH3N},${data.EC},${data.SS}`;
      const fileName = `${FileSystem.cacheDirectory}water_quality_data.csv`;
      await FileSystem.writeAsStringAsync(fileName, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const formData = new FormData();
      formData.append('file', {
        uri: fileName,
        name: 'water_quality_data.csv',
        type: 'text/csv',
      });

      fetch(`${config.api_url}/score/all/`, {  // Use API URL from config
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      }).then(data => {
        Alert.alert('上傳成功', `分析結果: ${JSON.stringify(data)}`, [{ text: 'OK' }]);
      }).catch((error) => {
        console.error('Error:', error);
        Alert.alert('上傳失敗', '無法上傳資料至伺服器。請檢查您的網絡連接。', [{ text: '確定' }]);
      });
    } else {
      Alert.alert('提示', '請填寫水質資料', [{ text: '確定' }]);
    }
    clearInput();
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
          <Text style={[styles.connectionStatus,
          connectionStatus === '已連線到MPR水質分析模型' ? styles.connected : styles.notConnected]}>
            連線狀況: {connectionStatus}
          </Text>
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
          <Button title="上傳水質資料檔案" onPress={handleFileUpload} />
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
  connected: {
    color: 'green', // 連線成功顯示綠色
  },
  notConnected: {
    color: 'red', // 連線失敗或錯誤顯示紅色
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