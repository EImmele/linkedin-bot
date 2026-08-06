const fs = require('fs');
const path = require('path');

const mediaDir = path.join(__dirname, 'media');
if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
}

const imagesToCopy = [
    {
        src: "C:\\Users\\Erik I\\.gemini\\antigravity-ide\\brain\\f593a16e-d9b7-43db-89f5-bf0c62663f10\\audit_chain_slide1_dora_cover_1786056158919.png",
        dest: path.join(mediaDir, "audit_chain_tprm_dora.png")
    },
    {
        src: "C:\\Users\\Erik I\\.gemini\\antigravity-ide\\brain\\f593a16e-d9b7-43db-89f5-bf0c62663f10\\audit_chain_services_infographic_1786055816314.png",
        dest: path.join(mediaDir, "audit_chain_privacy.png")
    },
    {
        src: "C:\\Users\\Erik I\\.gemini\\antigravity-ide\\brain\\f593a16e-d9b7-43db-89f5-bf0c62663f10\\audit_chain_light_slide2_content_1786055917170.png",
        dest: path.join(mediaDir, "audit_chain_bcm.png")
    },
    {
        src: "C:\\Users\\Erik I\\.gemini\\antigravity-ide\\brain\\f593a16e-d9b7-43db-89f5-bf0c62663f10\\audit_chain_light_slide1_cover_1786055907088.png",
        dest: path.join(mediaDir, "audit_chain_infosec.png")
    },
    {
        src: "C:\\Users\\Erik I\\.gemini\\antigravity-ide\\brain\\f593a16e-d9b7-43db-89f5-bf0c62663f10\\audit_chain_slide3_platforms_1786056176140.png",
        dest: path.join(mediaDir, "audit_chain_platforms.png")
    }
];

imagesToCopy.forEach(item => {
    if (fs.existsSync(item.src)) {
        fs.copyFileSync(item.src, item.dest);
        console.log(`✅ Copiado: ${path.basename(item.dest)}`);
    } else {
        console.error(`❌ Não encontrado: ${item.src}`);
    }
});
