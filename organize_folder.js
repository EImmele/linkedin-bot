const fs = require('fs');
const path = require('path');

const parentDir = "D:\\IA projects";
const projectDir = "D:\\IA projects\\Linkedin Bot";

if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
    console.log(`📁 Created dedicated project folder: ${projectDir}`);
}

if (fs.existsSync(parentDir)) {
    const files = fs.readdirSync(parentDir);
    for (const file of files) {
        const fullPath = path.join(parentDir, file);
        const destPath = path.join(projectDir, file);

        // Move only files directly in D:\IA projects (not subdirectories)
        if (fs.statSync(fullPath).isFile()) {
            fs.copyFileSync(fullPath, destPath);
            fs.unlinkSync(fullPath);
            console.log(`📦 Moved ${file} -> D:\\IA projects\\Linkedin Bot\\${file}`);
        }
    }
}

console.log("✅ All project files organized into D:\\IA projects\\Linkedin Bot\\!");
