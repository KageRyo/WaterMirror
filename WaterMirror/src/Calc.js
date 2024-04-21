import React, { useState, useEffect } from 'react';
import { Alert, Button, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';

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
  const [connectionStatus, setConnectionStatus] = useState('MPR水質分析伺服器未開啟');

  // 元件載入時執行
  useEffect(() => {
    requestStoragePermission();
    const intervalId = setInterval(checkConnection, 5000); // 每5秒檢查一次連線狀態
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
  const checkConnection = async () => {
    try {
      const response = await fetch('http://192.168.10.101:8000/');
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
      // 請求用戶選擇檔案
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      console.log('Document picker result:', result);
  
      if (!result.cancelled) {
        // 確保取得assets陣列中的第一個元素
        const pickedFile = result.assets[0];
        console.log('Picked file URI:', pickedFile.uri);
  
        const formData = new FormData();
        formData.append('file', {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType
        });
        console.log('FormData prepared:', formData);
  
        // 上傳檔案至伺服器
        const response = await fetch('http://192.168.10.101:8000/score/all/', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        // 處理伺服器回應
        const responseData = await response.json();
        console.log('Response from server:', responseData); // 伺服器回應
        if (response.ok) {
          Alert.alert('上傳成功', `分析結果: ${JSON.stringify(responseData)}`, [{ text: 'OK' }]);
        } else {
          throw new Error('Network response was not ok');
        }
      } else {
        console.log('Operation cancelled by the user.'); // 用戶取消操作
        Alert.alert('取消操作', '您沒有選擇任何檔案。', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error during file upload:', error); // 上傳檔案時出錯
      Alert.alert('上傳失敗', `無法上傳資料至伺服器。請檢查您的網絡連接。錯誤信息：${error}`, [{ text: '確定' }]);
    }
  };  

  // 送出資料
  const handleSubmit = async () => {
    const filledData = Object.keys(data).filter(key => data[key] !== '');
    if (filledData.length > 0) {
      Alert.alert('提示', `正在處理資料並建立CSV檔案`, [{ text: '確定' }]);
      const csvData = `DO,BOD,NH3N,EC,SS\n${data.DO},${data.BOD},${data.NH3N},${data.EC},${data.SS}`;
      console.log('客戶端傳送了水質資料:', data);
      console.log('CSV Data:', csvData);

      // 建立CSV檔案
      const fileName = `${FileSystem.cacheDirectory}water_quality_data.csv`;
      await FileSystem.writeAsStringAsync(fileName, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      console.log(`CSV file created at ${fileName}`);

      // 讀取CSV檔案內容
      const fileContent = await FileSystem.readAsStringAsync(fileName, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      console.log('File content:', fileContent);
      Alert.alert('檔案建立', `CSV檔案已建立並暫存於：${fileName}`, [{ text: '確定' }]);

      // 上傳CSV檔案至伺服器
      const formData = new FormData();
      formData.append('file', {
        uri: fileName,
        name: 'water_quality_data.csv',
        type: 'text/csv',
      });
      console.log('Sending data to the server...');
      fetch('http://192.168.10.101:8000/score/all/', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        // 處理伺服器回應
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Success:', data);
          Alert.alert('上傳成功', `分析結果: ${JSON.stringify(data)}`, [{ text: 'OK' }]);
        })
        .catch((error) => {
          console.error('Error:', error);
          Alert.alert('上傳失敗', '無法上傳資料至伺服器。請檢查您的網絡連接。', [{ text: '確定' }]);
        });
    } else {
      // 提示用戶未填寫水質資料
      Alert.alert('提示', '請填寫水質資料', [{ text: '確定' }]);
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