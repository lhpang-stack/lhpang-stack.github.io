# 独立个人主页

这是一个完全静态的个人主页项目。成品不调用 OpenAI、ChatGPT、外部字体、远程脚本、数据库或第三方图片服务。

## 最常用的编辑手柄

日常只需要编辑根目录的 `content.json`：

- `profile`：姓名、职业、城市、邮箱、电话、照片
- `facts`：年限、项目数等数据
- `about`：个人介绍
- `experience`：工作经历
- `education`：教育背景
- `skillGroups`：能力清单
- `projects`：代表项目
- `socialLinks`：社交账号
- `footer`：页尾文案

在 GitHub 中打开 `content.json`，点击右上角铅笔图标，修改后点击 **Commit changes**。提交到 `main` 分支后，网站会自动重新生成并上线。

## 替换照片

1. 在仓库中打开 `assets` 文件夹并上传自己的照片，例如 `profile.jpg`。
2. 打开 `content.json`。
3. 把 `profile.photo` 改成 `assets/profile.jpg`。
4. 提交修改。

建议使用竖版照片，比例约为 3:4，文件大小控制在 1 MB 以内。

## 修改主题颜色

打开 `src/styles.css`，修改文件顶部 `:root` 内的变量：

- `--paper`：页面浅色背景
- `--white`：正文区域背景
- `--ink`：主要文字
- `--muted`：次要文字
- `--accent`：强调色
- `--accent-soft`：浅强调色
- `--side-width`：桌面端照片栏宽度

## 自动发布

`.github/workflows/pages.yml` 负责自动发布。每次 `main` 分支发生修改，GitHub Pages 都会运行一次新的发布任务。

查看进度：仓库顶部 **Actions** → **发布个人主页**。

## 在电脑上预览

安装 Node.js 后，在项目目录执行：

```bash
npm run build
npx serve dist
```

## 连接自有域名

购买域名后进入仓库：**Settings → Pages → Custom domain**，填入域名。GitHub 会显示需要添加的 DNS 记录。到域名注册商的 DNS 管理页添加后，等待验证成功并开启 **Enforce HTTPS**。

## 独立性说明

- 源码：属于你的 GitHub 仓库，可以随时下载、迁移或备份。
- 托管：由你的 GitHub Pages 管理，不依赖 ChatGPT Sites。
- 域名：购买后由你的域名注册商账号管理。
- 内容：全部保存在 `content.json` 和本仓库资源中。
- 迁移：`npm run build` 生成的 `dist` 文件夹可以直接部署到任何静态服务器。
