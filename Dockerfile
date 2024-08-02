FROM node:20

# 安裝必要的工具
RUN apt-get update && apt-get install -y \
    git \
    curl

# 安裝 Expo CLI
RUN npm install -g expo-cli

# 設置工作目錄
WORKDIR /workspace

# 複製 package.json 和 package-lock.json
COPY ./WaterMirror/package*.json ./

# 安裝專案依賴
COPY . .
RUN npm install

# 設置環境變數
ENV REACT_NATIVE_PACKAGER_HOSTNAME="0.0.0.0"