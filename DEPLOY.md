# HENSY 官网上线说明

这个项目需要用 Node.js 部署，不能只当普通静态网站上传，否则后台管理页无法保存内容和上传图片。

## 推荐方案：Render

1. 注册并登录 Render。
2. 把当前项目推到 GitHub 仓库。
3. 在 Render 新建 `Web Service`，连接这个 GitHub 仓库。
4. 配置服务：
   - Runtime: `Node`
   - Build Command: 留空或填 `npm install`
   - Start Command: `npm start`
5. 添加环境变量：
   - `ADMIN_PASSWORD`: 改成一个强密码，不要使用默认的 `admin123`
   - `DATA_DIR`: `/var/data/data`
   - `UPLOAD_DIR`: `/var/data/uploads`
6. 添加 Persistent Disk：
   - Mount Path: `/var/data`
   - Size: 1GB 通常够用
7. 部署完成后访问：
   - 官网首页：Render 给你的域名
   - 后台：`https://你的域名/admin.html`

## 首次上线前检查

- `data/content.json` 要一起提交，它是官网内容数据。
- `uploads/` 要一起提交，因为当前内容里有图片引用。
- 不需要提交 `data/content.backup-*.json`，这些是后台保存时产生的备份。
- 不要把真实密码写进代码里，线上只用环境变量 `ADMIN_PASSWORD` 设置。

## 本地运行

如果本机已安装 Node.js：

```bash
npm start
```

如果要自定义后台密码：

```bash
ADMIN_PASSWORD=你的密码 npm start
```

默认访问地址：

- 官网：`http://localhost:3000`
- 后台：`http://localhost:3000/admin.html`

