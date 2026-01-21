# Frontend
[Download Node.js](https://nodejs.org/en/download), you will have `nvm`, `npm`, `node` installed.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

```
npx create-next-app@latest frontend --typescript --tailwind --eslint --src-dir
```
```sh
✔ Would you like to use React Compiler? … Yes
✔ Would you like to use App Router? (recommended) … Yes
✔ Would you like to customize the import alias (`@/*` by default)? … No
```
file tree
```
frontend/
├── node_modules/         # (Auto-generated) Installed libraries (don't touch)
├── public/               # Static files like images or icons
├── src/
│   └── app/              # The "App Router" - where your logic lives
│       ├── layout.tsx    # The "Shell": Defines <html>, <body>, and fonts for all pages
│       ├── page.tsx      # The "Content": This is YOUR code (replace this!)
│       └── globals.css   # Global styles: Where Tailwind is initialized
├── next.config.mjs       # Next.js settings (Rename .ts to .mjs for Docker!)
├── package.json          # Project manifest: Lists scripts (dev, build) and dependencies
├── tsconfig.json         # TypeScript config: Rules for how TS code is checked
├── tailwind.config.ts    # Tailwind CSS config: Define colors and themes
└── Dockerfile            # Your Docker instructions
```
`next.config.mjs`
```mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 在這裡放入你原本的設定 */
  reactCompiler: true,
  reactStrictMode: true,
};

export default nextConfig;
```
```
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
