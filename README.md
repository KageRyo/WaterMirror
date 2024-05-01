# WaterMirror 水之鏡
💧Water Mirror: AI-powered Water Quality Analysis
  
### 「水之鏡，山之屏」  
水可以映照出山的形貌，透過 WaterMirror 可以輕鬆反映出各項水質資訊。  
  
## 自行編譯
1. 首先將 WaterMirror 及 [MPR_Model](https://github.com/RotatingPotato/MPR_Model) 儲存庫分別 Clone 至您的環境。
```bash
git clone https://github.com/RotatingPotato/WaterMirror.git
git clone https://github.com/RotatingPotato/MPR_Model.git
```
2. 將 [MPR_Model](https://github.com/RotatingPotato/MPR_Model) 伺服器建立於您的裝置或雲端平臺。
3. 安裝 WaterMirror 所需的函示庫。
```bash
cd WaterMirror
npm install
```
4. 透過以下指令透過 Expo 開啟 WaterMirror，並進入「輸入資料」頁面，應於 5 秒內顯示「連線成功」提示訊息。
```bash
npx expo start
```
> 若未出現「連線成功」訊息，可能是您的 [MPR_Model](https://github.com/RotatingPotato/MPR_Model) 未成功開啟或是權限不足。
  
## 支援類型
目前本程式支援以下水質資料：  
- 溶氧量 DO  
- 生物需氧量 BOD  
- 浮懸固體 SS  
- 氨氮 NH3-N  
- 導電度 EC
  
### 請注意
- 此 README.md 文件皆為預設您將 WaterMirror 搭配 [MPR_Model](https://github.com/RotatingPotato/MPR_Model) 使用。
- 當然，您也可以在不違反 [Apache License 2.0](LICENSE) 的前提下自由修改。
- WaterMirror 將會在您初次使用「輸入資料」功能時向您請求權限，若拒絕權限將無法使用「上傳水質資料檔案」之功能。  
- 「上傳水質資料檔案」功能目前僅限於CSV格式，上傳時請遵循以下格式：  
  
| DO     	| BOD     	| NH3N     	| EC     	| SS     	|
|--------	|---------	|----------	|--------	|--------	|
| DO數值 	| BOD數值 	| NH3N數值 	| EC數值 	| SS數值 	|
| ...    	                                          	|
  
## 語言支援
WaterMirror 支援以下語言：  
- 繁體中文（正體中文）
- 歡迎貢獻 :D

## 貢獻
歡迎貢獻！ 如果您發現任何錯誤或有改進建議，歡迎提出 Issues 或 Pull Requests。  

## LICENSE  
本程式採用 Apache License 2.0 授權 - 有關詳細信息，請參閱 [LICENSE](LICENSE) 文件。  
有任何疑問請洽 kageryo@coderyo.com
