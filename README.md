# 个人创意网站项目 (Personal Creative Website)

这是一个基于 WebGL (Three.js) 的创意个人网站模板，灵感来源于 `2016.makemepulse.com`。它包含了一个互动的开场动画（长按进入）和极简风格的个人展示页面。

## 项目结构

- `index.html`: 网站的主入口文件。
- `css/style.css`: 样式表，控制布局和 UI 元素。
- `js/main.js`: 核心逻辑，包含 Three.js 场景、粒子效果和交互逻辑。
- `assets/`: 存放图片、字体等资源（可选）。

## 如何运行

1. **本地预览**:
   如果你安装了 Python，可以在终端运行：
   ```bash
   python -m http.server 8000
   ```
   然后访问 `http://localhost:8000`。

   或者使用 VS Code 的 "Live Server" 插件。

## 如何自定义

1. **修改个人信息**:
   打开 `index.html`，找到 `<div id="content">` 部分，修改 `<h1>` 和 `<p>` 标签中的文字。

2. **调整粒子效果**:
   打开 `js/main.js`，你可以修改 `createParticles` 函数中的参数，例如粒子数量 (`particleCount`)、颜色 (`color.setHSL`) 或形状分布。

3. **修改样式**:
   在 `css/style.css` 中可以调整字体、颜色和布局。

## 技术栈

- **HTML5**: 语义化标签。
- **CSS3**: 动画、Flexbox 布局。
- **JavaScript (ES6+)**: 逻辑控制。
- **Three.js**: 3D 渲染引擎 (通过 CDN 引入)。

## 交互说明

- **长按 (Click & Hold)**: 在屏幕任意位置长按鼠标或触摸屏幕，触发粒子加速和聚集效果。
- **释放**: 如果未达到进度条满值，粒子会减速并恢复原状。
- **完成**: 进度条满后，触发“爆炸”转场，显示个人内容。
