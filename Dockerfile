FROM node:22.23.4

# 安裝必要的工具
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        curl \
    && rm -rf /var/lib/apt/lists/*

# 設置工作目錄，並以映像內建的非 root 使用者 node 執行後續步驟
WORKDIR /workspace
RUN chown node:node /workspace
USER node

# 複製 package.json、package-lock.json 與已審查的工具鏈修補
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node scripts/patch-toolchain.cjs ./scripts/
COPY --chown=node:node security/toolchain-patches.json ./security/

# 停用套件生命週期腳本，只執行已審查的工具鏈修補
RUN npm ci --ignore-scripts \
    && node scripts/patch-toolchain.cjs --apply

# 明確列出應用程式來源，避免把本機憑證或環境檔帶入映像；
# 新增執行所需的頂層檔案或目錄時，需同步加入此處。
COPY --chown=node:node App.js app.config.js app.json babel.config.js eas.json ./
COPY --chown=node:node assets ./assets
COPY --chown=node:node contexts ./contexts
COPY --chown=node:node i18n ./i18n
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node security ./security
COPY --chown=node:node src ./src
COPY --chown=node:node tests ./tests

# 設置環境變數
ENV PATH="/workspace/node_modules/.bin:${PATH}"
ENV REACT_NATIVE_PACKAGER_HOSTNAME="0.0.0.0"
