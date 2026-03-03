# EDI Portal 开机自启说明

本机已配置登录时自动启动前后端服务。

## 当前配置

- **项目路径**: `~/Projects/edi-portal-prototype`（LaunchAgent 使用此路径）
- **后端**: LaunchAgent `com.edi-portal.backend` → http://localhost:8000
- **前端**: LaunchAgent `com.edi-portal.frontend` → http://localhost:3000（若 3000 被占用则使用 3001）

## 启动脚本位置

- `~/bin/edi-portal-start-backend.sh`
- `~/bin/edi-portal-start-frontend.sh`

## 常用命令

```bash
# 查看是否在运行
launchctl list | grep edi-portal

# 停止自启服务
launchctl unload ~/Library/LaunchAgents/com.edi-portal.backend.plist
launchctl unload ~/Library/LaunchAgents/com.edi-portal.frontend.plist

# 重新启用自启
launchctl load ~/Library/LaunchAgents/com.edi-portal.frontend.plist
launchctl load ~/Library/LaunchAgents/com.edi-portal.backend.plist

# 查看日志
tail -f ~/Library/Logs/edi-portal-backend.log
tail -f ~/Library/Logs/edi-portal-frontend.log
```

## 注意

- 若修改项目路径，需同步修改 `~/bin/edi-portal-start-*.sh` 中的 `ROOT` 变量。
- 前端依赖 Node（当前脚本使用 `~/.nvm/versions/node/v22.22.0`），若升级 Node 版本需改 `start-frontend.sh` 中的 `PATH`。
