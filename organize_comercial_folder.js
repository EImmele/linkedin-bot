const fs = require('fs');
const path = require('path');

const projectDir = "D:\\IA projects\\Linkedin Bot";
const comercialDir = "D:\\IA projects\\Linkedin Bot\\Comercial";

if (!fs.existsSync(comercialDir)) {
    fs.mkdirSync(comercialDir, { recursive: true });
    console.log(`📁 Created dedicated Comercial folder: ${comercialDir}`);
}

if (fs.existsSync(projectDir)) {
    const files = fs.readdirSync(projectDir);
    for (const file of files) {
        const fullPath = path.join(projectDir, file);
        const destPath = path.join(comercialDir, file);

        // Move commercial files to Comercial subfolder
        if (fs.statSync(fullPath).isFile()) {
            const lower = file.toLowerCase();
            if (lower.includes("proposta") || lower.includes("script") || lower.includes("formulario") || lower.includes("onboarding") || lower.includes("vendas")) {
                fs.copyFileSync(fullPath, destPath);
                fs.unlinkSync(fullPath);
                console.log(`📦 Moved to Comercial: ${file} -> D:\\IA projects\\Linkedin Bot\\Comercial\\${file}`);
            }
        }
    }
}

console.log("✅ All commercial files organized into D:\\IA projects\\Linkedin Bot\\Comercial\\!");
