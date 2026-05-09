import tailwind from "bun-plugin-tailwind";
import { rm, readdir, copyFile } from "node:fs/promises";
import path from "node:path";

const outdir = path.join(process.cwd(), "dist");
await rm(outdir, { recursive: true, force: true });

const entrypoints = [...new Bun.Glob("src/**/*.html").scanSync()];

const result = await Bun.build({
  entrypoints,
  outdir,
  plugins: [tailwind],
  minify: true,
  target: "browser",
  sourcemap: "linked",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

for (const output of result.outputs) {
  console.log(` ${path.relative(process.cwd(), output.path)}  ${(output.size / 1024).toFixed(1)} KB`);
}

const publicDir = path.join(process.cwd(), "public");
const files = await readdir(publicDir);
for (const file of files) {
  const src = path.join(publicDir, file);
  const dest = path.join(outdir, file);
  await copyFile(src, dest);
  console.log(` ${path.relative(process.cwd(), dest)}`);
}
