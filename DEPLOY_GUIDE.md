# 部署到 GitHub Pages 指南

## 方法一：使用自动部署脚本（推荐）

1. **确保已安装 Git**
   - 下载地址：https://git-scm.com/download/win
   - 安装时一路点击"Next"即可

2. **在GitHub上创建仓库**
   - 访问 https://github.com/new
   - 仓库名称填写：`personal-website`
   - 选择 "Public"（公开）
   - 点击 "Create repository"

3. **运行部署脚本**
   - 双击运行 `deploy-to-github.bat` 文件
   - 按提示操作即可

4. **启用 GitHub Pages**
   - 访问 `https://github.com/17606524448/personal-website`
   - 点击 "Settings" 标签
   - 左侧菜单找到 "Pages"
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main"，文件夹选择 "/ (root)"
   - 点击 "Save"

5. **等待部署完成**
   - 大约需要 1-2 分钟
   - 访问 `https://17606524448.github.io/personal-website` 查看网站

---

## 方法二：手动部署

如果你熟悉命令行，可以手动执行以下命令：

```bash
# 1. 初始化Git仓库
git init

# 2. 配置用户信息
git config user.email "17606524448hsd@gmail.com"
git config user.name "17606524448"

# 3. 添加所有文件
git add .

# 4. 提交代码
git commit -m "Initial commit: Personal website"

# 5. 添加远程仓库（先在GitHub上创建好仓库）
git remote add origin https://github.com/17606524448/personal-website.git

# 6. 推送到GitHub
git branch -M main
git push -u origin main
```

---

## 部署后访问地址

- **GitHub仓库**: https://github.com/17606524448/personal-website
- **网站地址**: https://17606524448.github.io/personal-website

---

## 常见问题

### Q: 提示 "git 不是内部或外部命令"
A: 需要先安装Git，下载地址：https://git-scm.com/download/win

### Q: 推送时提示需要登录
A: 使用你的GitHub用户名和密码登录。如果启用了双重验证，需要使用Personal Access Token代替密码。

### Q: 网站显示404
A: GitHub Pages部署需要1-2分钟，请稍后再试。确保在Settings > Pages中正确配置了Source。

### Q: 图片无法显示
A: 确保所有图片文件已正确推送到GitHub仓库的images文件夹中。
