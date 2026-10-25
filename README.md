# 一张图

安卓 Chrome 极简图片 PWA：首次打开从相册选图，之后直接铺满显示。

- 图片按比例居中铺满，比例不同时裁剪边缘，不拉伸。
- 双击图片可以更换；取消选图会保留原图。
- 图片仅保存在当前浏览器、当前站点的 IndexedDB，不上传服务器。
- 使用 standalone 模式保留系统状态栏，根据图片顶部取色更新 theme-color。实际融合效果取决于 Android / Chrome 版本和实验设置。
- Service Worker 缓存应用文件；成功缓存后可以离线打开。

## 使用与部署

无需安装依赖或构建，直接以 HTTPS 静态托管仓库根目录。在安卓 Chrome 菜单中选择「安装应用／添加到主屏幕」，从桌面打开后选图。

本仓库不会自动开启 GitHub Pages，也不包含原 Sites 私有网站的访问配置。换设备、浏览器或域名时需要重新选图；清除站点数据会删除保存的图片。

## 文件与修改

- index.html：选图页面、图片展示和布局
- app.js：本地保存、换图和顶部取色
- manifest.webmanifest：名称、图标、安装和窗口模式
- sw.js：离线缓存
- icon-192.png / icon-512.png：临时默认图标

修改 manifest.webmanifest 中的 name、short_name 可以更名，同时修改 index.html 的标题。替换两个 PNG 文件可修改图标。更新应用文件时，修改 sw.js 的缓存版本，例如 one-picture-v1 改为 one-picture-v2。

## 本地预览与验证

在仓库目录执行 `python3 -m http.server 8000`，访问 http://localhost:8000。手机安装请通过 HTTPS 部署测试。

已通过 JavaScript 语法和图标／清单检查，并在桌面浏览器验证选图、刷新后恢复、图片铺满。安卓安装与 Chrome 实验性状态栏融合仍需实机验证。
