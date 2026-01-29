# 环境配置说明

## .env 文件配置

本项目需要配置 `.env` 文件来连接到 Flow2API 服务。

### 文件位置
- `.env` 文件应该放在项目根目录（与 `package.json` 同级）

### 必需的环境变量

#### 1. VITE_API_BASE_URL
- **说明**：Flow2API 服务器的完整 URL
- **格式**：`http://服务器IP:端口/` 或 `https://域名/`
- **例子**：
  - `http://38.54.95.180:8080/`
  - `https://api.example.com/`
  - `http://localhost:5000/`
- **必需**：是
- **备注**：末尾必须有斜杠 `/`

#### 2. VITE_API_KEY
- **说明**：Flow2API 的鉴权密钥
- **格式**：通常以 `sk-` 开头的字符串
- **例子**：
  - `sk-123456789abcdef`
  - `sk-flow2api-key`
- **必需**：是
- **备注**：
  - 可以从 Flow2API 的 `docker-compose.yml` 或配置文件中找到
  - 如果没有设置过，询问管理员或检查服务器配置

### 如何配置

1. **复制模板文件**
   ```bash
   cp .env.example .env
   ```

2. **编辑 .env 文件**
   ```ini
   # 填写你的服务器地址和端口
   VITE_API_BASE_URL=http://your-server-ip:8080/
   
   # 填写你的 API 密钥
   VITE_API_KEY=sk-your-api-key
   ```

3. **保存文件后重启开发服务器**
   ```bash
   npm run dev
   ```

### 常见问题

**Q: 如何找到正确的服务器 IP 和端口？**
A: 
- 在运行 Flow2API 的服务器上，检查 `docker-compose.yml` 或容器配置
- 通常的端口是 8080 或 5000
- 确保防火墙允许该端口的访问

**Q: 如何找到 API 密钥？**
A:
- 检查 Flow2API 容器的启动日志
- 查看 `docker-compose.yml` 中的环境变量配置
- 询问项目管理员

**Q: 本地开发和生产环境的 URL 不同怎么办？**
A:
- 创建 `.env.local`（用于本地开发，不会被 git 追踪）
- 创建 `.env.production`（用于生产构建）
- Vite 会自动加载对应环境的文件

### 文件安全

⚠️ **重要**：`.env` 文件已添加到 `.gitignore` 中，不会被提交到版本控制系统。
- 不要将 `.env` 文件提交到 Git
- 在不同环境中使用不同的密钥
- 定期更新和管理 API 密钥

### 验证配置

配置完成后，可以检查浏览器控制台是否有 API 连接错误。正确的配置会允许应用正常调用 Flow2API 服务。
