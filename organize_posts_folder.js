const fs = require('fs');
const path = require('path');

const projectDir = "D:\\IA projects\\Linkedin Bot";
const postsDir = "D:\\IA projects\\Linkedin Bot\\Posts";

if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
    console.log(`📁 Created dedicated Posts folder: ${postsDir}`);
}

if (fs.existsSync(projectDir)) {
    const files = fs.readdirSync(projectDir);
    for (const file of files) {
        const fullPath = path.join(projectDir, file);
        const destPath = path.join(postsDir, file);

        // Move post docx files and PNG graphics to Posts directory
        if (fs.statSync(fullPath).isFile()) {
            if (file.toLowerCase().startsWith("post_") || file.toLowerCase().endsWith(".png") || file.toLowerCase().includes("graphic")) {
                fs.copyFileSync(fullPath, destPath);
                fs.unlinkSync(fullPath);
                console.log(`📦 Moved to Posts: ${file} -> D:\\IA projects\\Linkedin Bot\\Posts\\${file}`);
            }
        }
    }
}

console.log("✅ All posts and graphics organized into D:\\IA projects\\Linkedin Bot\\Posts\\!");
