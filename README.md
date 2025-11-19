# Fast Gemini

现在的仓库只是一个极简的 Next.js 外壳，用来快速托管交互 Demo。你只需要把每个 Demo 当成一个独立的 App Router 路由，就能立即在本地或 Vercel 上访问，首页会自动列出所有 Demo。

## 本地开发

```bash
pnpm install
pnpm dev
```

然后打开 [http://localhost:3000](http://localhost:3000) 查看首页，以及当前维护的 Demo 链接。

## 如何添加新的 Demo

1. 在 `src/app` 下创建一个目录，例如 `src/app/my-demo`。
2. 将 `src/app/poetry/page.tsx` 复制过去并替换内容，或直接编写一个新的 `page.tsx`。如果组件使用了 `useState/useEffect` 等客户端特性，文件头部加上 `'use client';`。
3. 在目录里新建 `demo.json`，填入在首页展示用的元数据，例如：
   ```json
   {
     "title": "My Demo",
     "description": "一句话描述，展示在首页"
   }
   ```
4. 访问 `/my-demo` 验证效果。首页会自动扫描 `src/app/*/demo.json` 并列出所有 Demo 卡片。
5. 提交后部署即可上线。

## 目录结构

```
src/app/
  page.tsx           # 首页，自动列出 Demo
  poetry/
    page.tsx        # 示例：枫桥夜泊交互诗词卡片
    demo.json       # 首页展示用的标题和描述
```

欢迎在此基础上扩展更多页面，或加入 Storybook、MDX 等工具来管理 Demo 资产。README 只保留最小必要步骤，方便快速复制粘贴投入使用。
