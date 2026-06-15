# HENSY 腾讯云服务器上线说明

这个项目的前台页面和后台管理都由 `server.js` 提供。上线到腾讯云服务器时，推荐用 `Node.js + PM2` 运行服务，再用 `Nginx` 反向代理到域名。

下面假设项目部署在：

```bash
/www/wwwroot/hensy-website
```

服务端口使用：

```bash
3000
```

## 1. 上传项目

把当前项目上传到服务器：

```bash
scp -r HENSY-web-online.zip root@你的服务器IP:/www/wwwroot/
```

登录服务器后解压：

```bash
cd /www/wwwroot
unzip HENSY-web-online.zip
mv HENSY-web-online hensy-website
cd hensy-website
```

如果你用 GitHub 拉取，也可以：

```bash
cd /www/wwwroot
git clone https://github.com/msg65605984-lab/hensy-website.git hensy-website
cd hensy-website
```

## 2. 安装 Node.js 和 PM2

服务器需要 Node.js 18 或更高版本。

```bash
node -v
npm -v
```

如果没有安装，建议用腾讯云面板、宝塔面板，或服务器包管理器安装 Node.js 18+。

安装 PM2：

```bash
npm install -g pm2
```

## 3. 配置环境变量

创建 `.env`：

```bash
cat > .env <<'EOF'
NODE_ENV=production
PORT=3000
ADMIN_PASSWORD=换成你的后台强密码
DATA_DIR=/www/wwwroot/hensy-website/data
UPLOAD_DIR=/www/wwwroot/hensy-website/uploads
EOF
```

不要把 `.env` 提交到 Git，它里面有后台密码。

## 4. 启动后台服务

使用 PM2 启动：

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

检查运行状态：

```bash
pm2 status
pm2 logs hensy-website
```

本机测试：

```bash
curl http://127.0.0.1:3000/admin.html
```

## 5. 配置 Nginx

把域名解析到腾讯云服务器 IP 后，在 Nginx 里添加站点配置：

```nginx
server {
    listen 80;
    server_name 你的域名.com www.你的域名.com;

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

重载 Nginx：

```bash
nginx -t
systemctl reload nginx
```

如果你用宝塔面板，可以创建 Node 项目或创建普通网站后添加反向代理到：

```bash
http://127.0.0.1:3000
```

## 6. 开启 HTTPS

在腾讯云 SSL 或宝塔面板里申请免费证书，然后给域名开启 HTTPS。

后台地址：

```bash
https://你的域名.com/admin.html
```

## 7. 日常更新

如果用 zip 上传：

```bash
cd /www/wwwroot
cp -r hensy-website/uploads /tmp/hensy-uploads-backup
cp hensy-website/data/content.json /tmp/hensy-content.json
rm -rf hensy-website
unzip HENSY-web-online.zip
mv HENSY-web-online hensy-website
cp -r /tmp/hensy-uploads-backup/* hensy-website/uploads/
cp /tmp/hensy-content.json hensy-website/data/content.json
cd hensy-website
pm2 restart hensy-website
```

如果用 Git 更新：

```bash
cd /www/wwwroot/hensy-website
git pull
pm2 restart hensy-website
```

## 8. 访问地址

- 官网首页：`https://你的域名.com/`
- 后台：`https://你的域名.com/admin.html`

