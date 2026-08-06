const fs = require('fs');
const path = require('path');

const mediaDir = path.join(__dirname, 'media');
if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
}

// Copy fallback aliases for postsDB items
const mappings = [
    { src: "media/audit_chain_tprm_dora.png", dest: "media/third_party_risk_management_graphic.png" },
    { src: "media/audit_chain_infosec.png", dest: "media/incident_management_lifecycle_graphic.png" },
    { src: "media/audit_chain_bcm.png", dest: "media/bcm_continuity_graphic.png" }
];

mappings.forEach(m => {
    const srcPath = path.join(__dirname, m.src);
    const destPath = path.join(__dirname, m.dest);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Criado alias: ${m.dest}`);
    }
});
