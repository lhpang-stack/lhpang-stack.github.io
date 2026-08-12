# 独立个人学术主页

这是一个完全静态、自动发布的单页个人主页。它采用简洁的学术主页布局：左侧个人资料，右侧教育、研究兴趣、项目、荣誉和技能。

成品不调用 OpenAI、ChatGPT、外部字体、远程脚本、数据库或第三方图片服务。

## 你的主要编辑手柄：`content.json`

日常修改只需要打开仓库根目录的 `content.json`。其中各区块的作用如下：

| 区块 | 控制内容 |
| --- | --- |
| `site` | 浏览器标题、网页简介和语言 |
| `theme` | 主色、文字颜色、分隔线、内容宽度和侧栏宽度 |
| `profile` | 姓名、学生身份、学校、城市、邮箱和照片 |
| `navigation` | 顶部导航的名称、顺序和跳转位置 |
| `links` | Email、GitHub、个人简历等链接 |
| `sectionTitles` | 各栏目的显示名称 |
| `about` | 页面最上方的个人介绍 |
| `news` | 近期动态 |
| `education` | 教育背景 |
| `researchInterests` | 研究兴趣 |
| `projects` | 项目经历 |
| `honors` | 荣誉与奖项 |
| `skillGroups` | 技能分组 |
| `footer` | 页尾文字 |

`links` 中 Email 和电话的 `href` 分别使用 `$email`、`$phone`，它们会自动读取 `profile.email`、`profile.phone`，因此联系方式只需要修改一处。

修改方法：在 GitHub 中打开 `content.json` → 点击右上角铅笔图标 → 修改 → 点击 **Commit changes**。提交到 `main` 分支后，网站会自动重新生成并上线。

### 增加、删除和调整顺序

- 增加一项：复制同一列表中的一个完整 `{ ... }` 对象，注意对象之间保留英文逗号。
- 删除一项：删除对应的整个 `{ ... }` 对象。
- 调整顺序：在列表中上下移动完整对象。
- 隐藏栏目：把对应列表改成空数组 `[]`，页面会自动隐藏该栏目。
- JSON 必须使用英文双引号 `"`、英文冒号 `:` 和英文逗号 `,`。

## 替换照片

1. 在仓库的 `assets` 文件夹上传照片，例如 `profile.jpg`。
2. 打开 `content.json`。
3. 把 `profile.photo` 改成 `assets/profile.jpg`。
4. 提交修改。

建议使用竖版证件照或半身照，比例约为 3:4，文件大小控制在 1 MB 以内。

## 添加个人简历 PDF

1. 把 PDF 上传到 `assets`，例如 `assets/cv.pdf`。
2. 在 `content.json` 的 `links` 中找到“个人简历”。
3. 把它的 `href` 从空字符串改成 `assets/cv.pdf`。

链接为空时不会显示，因此还没准备好的链接可以保留为空。

## 修改配色和宽度

这些也在 `content.json` 的 `theme` 中：

- `accentColor`：链接和强调文字颜色。
- `textColor`：主要文字颜色。
- `mutedColor`：日期、说明文字颜色。
- `lineColor`：分隔线颜色。
- `contentWidth`：整个页面的最大宽度。
- `sidebarWidth`：桌面端左侧资料栏宽度。

颜色使用六位十六进制格式，例如 `#2f6288`；宽度使用像素，例如 `1180px`。

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
- 内容：全部保存在 `content.json` 和仓库内的 `assets`。
- 迁移：`npm run build` 生成的 `dist` 文件夹可以直接部署到任何静态服务器。
