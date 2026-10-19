# dsh-tavern-shortcut

**Tavern Shortcut** —— 将酒馆页面分离成两个窗口。

插件第一次加载时会在桌面生成一个酒馆图标。点这个图标打开酒馆，点 DSH 图标默认进入 DSH 工作页面。之后启动 DSH 不会再创建快捷方式，也不会自动启动酒馆服务。

<img width="1419" height="827" alt="dsh-tavern-shortcut" src="https://github.com/user-attachments/assets/a3b1f73a-aaf3-4249-8b25-fb73caa41d9c" />

## 功能

- 第一次加载时创建桌面快捷方式 `DSH 酒馆.lnk`。
- 快捷方式指向 `D:\DSH\tavern-launcher\launch-tavern.vbs`，点击后启动独立的酒馆页面。
- 如果快捷方式已经存在，插件不会覆盖，只记录一个“已完成”标记。
- 后续启动 DSH 时插件直接返回，不重复创建，也不会启动酒馆服务。
- 不改变 DSH 的默认启动目标，官方 DSH 图标仍然进入 DSH 主界面。
- 所有异常只写日志，不会中断 DSH 启动。

## 安装前提

插件本身只负责创建快捷方式，酒馆启动器需要已经存在：

```text
D:\DSH\tavern-launcher\launch-tavern.vbs
D:\DSH\tavern-launcher\tavern.ico
```

如果启动器不在默认位置，可以在安装前设置环境变量：

```powershell
$env:DSH_TAVERN_LAUNCHER = 'D:\path\to\tavern-launcher'
```

## 安装

```powershell
git clone https://github.com/DrifterJD/dsh-tavern-shortcut.git
dsh plugin --profile desktop add link:<本仓库绝对路径>
```

例如：

```powershell
dsh plugin --profile desktop add link:D:\DSH\plugins\dsh-tavern-shortcut
```

安装后重启一次 DSH，让插件加载。第一次加载时，如果桌面快捷方式不存在，插件会创建；如果已经存在，则只记录“已完成”标记。

## 行为细节

- 标记文件：`%USERPROFILE%\.dsh\.tavern-shortcut-created.json`
- 快捷方式：`%USERPROFILE%\Desktop\DSH 酒馆.lnk`
- 目标：`wscript.exe "D:\DSH\tavern-launcher\launch-tavern.vbs"`
- 图标：`D:\DSH\tavern-launcher\tavern.ico`
- 如果启动器目录不存在，插件只写日志，不会报错中断 DSH。
- 如果快捷方式已存在，插件不会覆盖它。
- 删除标记文件后，下次启动会重新检查并创建（如果快捷方式也不存在）。

## 目录结构

```text
dsh-tavern-shortcut/
├─ package.json
├─ cordis.patch.yml
├─ lib/index.js
├─ scripts/create-shortcut.ps1
└─ README.md
```

## 卸载

```powershell
dsh plugin --profile desktop remove dsh-tavern-shortcut
```

卸载不会删除桌面快捷方式；需要时手动删除即可。

## License

MIT
