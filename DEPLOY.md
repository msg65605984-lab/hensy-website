# HENSY 官网上线说明

这个项目现在可以连同后台一起上线。前台页面、后台管理页、内容 JSON 和图片上传接口都由 `server.js` 提供，所以线上需要 Node.js 环境，不能只按纯静态站上传。

## 推荐方案：Render

1. 把当前项目推到 GitHub 仓库。
2. 登录 Render，新建 `Web Service`，连接这个仓库。
3. 配置服务：
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. 添加环境变量：
   - `NODE_ENV`: `production`
   - `ADMIN_PASSWORD`: 设置一个强密码，不要使用 `admin123`
   - `DATA_DIR`: `/var/data/data`
   - `UPLOAD_DIR`: `/var/data/uploads`
5. 添加 Persistent Disk：
   - Mount Path: `/var/data`
   - Size: `1GB` 通常够用
6. 部署完成后访问：
   - 官网首页：Render 给你的域名
   - 后台：`https://你的域名/admin.html`

## 必须一起上传的内容

- `data/content.json`：网站内容数据。
- `uploads/`：后台上传过的图片。
- `tu/`、`media/`、`favicon.*`：页面静态素材。
- 所有 `.html`、`.css`、`.js` 文件。
- `server.js`、`package.json`。

不要上传 `data/content.backup-*.json`，这些是后台保存时自动生成的历史备份。

## 本地运行

```bash
npm start
```

默认访问：

- 官网：`http://localhost:3000`
- 后台：`http://localhost:3000/admin.html`

本地默认后台密码是 `admin123`。如果要自定义：

```bash
ADMIN_PASSWORD=你的密码 npm start
```

模拟线上环境时必须设置密码：

```bash
NODE_ENV=production ADMIN_PASSWORD=你的强密码 npm start
```

