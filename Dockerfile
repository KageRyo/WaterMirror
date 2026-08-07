FROM node:20

# 安裝必要的工具
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        curl \
    && rm -rf /var/lib/apt/lists/*

# 設置工作目錄
WORKDIR /workspace

# 複製 package.json 和 package-lock.json
COPY package*.json ./
RUN npm ci

# 安裝專案依賴
COPY . .

# 設置環境變數
ENV PATH="/workspace/node_modules/.bin:${PATH}"
ENV REACT_NATIVE_PACKAGER_HOSTNAME="0.0.0.0"
