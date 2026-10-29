const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("[GitHub Pages] Starting build and export...");
execSync("npm run build", { stdio: "inherit" });

const outDir = path.join(__dirname, "..", "out");
const noJekyllPath = path.join(outDir, ".nojekyll");
fs.writeFileSync(noJekyllPath, "# Bypass Jekyll\n");

console.log("[GitHub Pages] Deploying to gh-pages branch...");
process.chdir(outDir);

execSync("git init", { stdio: "inherit" });
execSync("git add -A", { stdio: "inherit" });
try {
  execSync('git commit -m "deploy: update GitHub Pages"', { stdio: "inherit" });
} catch {
  console.log("No changes to commit.");
}
execSync("git branch -M gh-pages", { stdio: "inherit" });
try {
  execSync("git remote add origin https://github.com/cuetolanderjohn-maker/lesson-plan-maker.git", { stdio: "ignore" });
} catch {
  // Remote might already exist
}
execSync("git push -f origin gh-pages", { stdio: "inherit" });
console.log("[GitHub Pages] Successfully deployed to https://cuetolanderjohn-maker.github.io/lesson-plan-maker/");
