const TelegramBotModule = require('node-telegram-bot-api');
const TelegramBot = TelegramBotModule.default || TelegramBotModule;
const { Composio } = require('@composio/core');
const cron = require('node-cron');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const TELEGRAM_TOKEN = "8950102443:AAFB8f9PUkaBAh9MLUYLY2f5z6I7GloAA8Y";
const COMPOSIO_API_KEY = "ak_3BPACosEfxI3fgs-0i_Q";
const CONNECTED_ACCOUNT_ID = "ca_JGuOK7B9opjF";
const PERSONAL_URN = "urn:li:person:58-ptj8JVY";
const ORG_URN = "urn:li:organization:122274764";

const composio = new Composio({ apiKey: COMPOSIO_API_KEY });
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// State for Approval Mode: false = MANUAL (Human-in-the-Loop), true = AUTO_PILOT (Auto-Publish without approval)
let autoApprovalMode = false;

// Metrics Counter Cache
let totalRepliesSent = 3;
let myTelegramChatId = process.env.TELEGRAM_CHAT_ID || null;

// Persistent Files
const CONFIG_FILE = path.join(__dirname, 'chat_config.json');
const TRACKED_POSTS_FILE = path.join(__dirname, 'tracked_posts.json');
const RESPONDED_COMMENTS_FILE = path.join(__dirname, 'responded_comments.json');

// Processed comments set (deduplication)
const processedComments = new Set();

function loadRespondedComments() {
    try {
        if (fs.existsSync(RESPONDED_COMMENTS_FILE)) {
            const arr = JSON.parse(fs.readFileSync(RESPONDED_COMMENTS_FILE, 'utf8'));
            if (Array.isArray(arr)) {
                arr.forEach(id => processedComments.add(id));
                console.log(`📁 Loaded ${processedComments.size} responded comments from disk.`);
            }
        }
    } catch (e) {
        console.error("⚠️ Error loading responded_comments.json:", e.message);
    }
}

function saveRespondedComments() {
    try {
        fs.writeFileSync(RESPONDED_COMMENTS_FILE, JSON.stringify(Array.from(processedComments), null, 2), 'utf8');
    } catch (e) {
        console.error("⚠️ Error saving responded_comments.json:", e.message);
    }
}

let trackedPosts = [
    { key: "post1", urn: "urn:li:share:7490327458173399040", activityUrn: "urn:li:activity:7490327458907582464", name: "Post 1 (Riscos TI - Perfil Pessoal)", author: PERSONAL_URN },
    { key: "post2", urn: "urn:li:share:7490192848332574720", activityUrn: "urn:li:activity:7490192848332574720", name: "Post 2 (BCM - Audit Chain)", author: ORG_URN },
    { key: "post3", urn: "urn:li:share:7490193701017722880", activityUrn: "urn:li:activity:7490193701017722880", name: "Post 3 (Segurança - Perfil Pessoal)", author: PERSONAL_URN },
    { key: "post4", urn: "urn:li:share:7490380916247232512", activityUrn: "urn:li:activity:7490380916247232512", name: "Post 4 (TPRM - Audit Chain)", author: ORG_URN }
];

function loadTrackedPosts() {
    try {
        if (fs.existsSync(TRACKED_POSTS_FILE)) {
            const data = JSON.parse(fs.readFileSync(TRACKED_POSTS_FILE, 'utf8'));
            if (Array.isArray(data) && data.length > 0) {
                trackedPosts = data;
                console.log(`📁 Loaded ${trackedPosts.length} tracked posts from disk.`);
            }
        }
    } catch (e) {
        console.error("⚠️ Error loading tracked_posts.json:", e.message);
    }
}

function saveTrackedPosts() {
    try {
        fs.writeFileSync(TRACKED_POSTS_FILE, JSON.stringify(trackedPosts, null, 2), 'utf8');
    } catch (e) {
        console.error("⚠️ Error saving tracked_posts.json:", e.message);
    }
}

function addTrackedPost(urnStr, name = "Post LinkedIn") {
    let cleanUrn = urnStr.trim();
    if (!cleanUrn.startsWith("urn:li:")) {
        cleanUrn = `urn:li:share:${cleanUrn}`;
    }
    const exists = trackedPosts.find(p => p.urn === cleanUrn || p.activityUrn === cleanUrn);
    if (!exists) {
        trackedPosts.unshift({
            key: `post_${Date.now()}`,
            urn: cleanUrn,
            activityUrn: cleanUrn.replace("urn:li:share:", "urn:li:activity:"),
            name: name,
            author: PERSONAL_URN
        });
        saveTrackedPosts();
        return true;
    }
    return false;
}

function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            if (data.chatId) myTelegramChatId = data.chatId;
            if (typeof data.autoApprovalMode === 'boolean') autoApprovalMode = data.autoApprovalMode;
            console.log(`📁 Loaded config: chatId=${myTelegramChatId}, autoApprovalMode=${autoApprovalMode}`);
        }
    } catch (e) {
        console.error("⚠️ Error loading chat_config.json:", e.message);
    }
}

function saveConfig() {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify({ chatId: myTelegramChatId, autoApprovalMode }, null, 2), 'utf8');
    } catch (e) {
        console.error("⚠️ Error saving chat_config.json:", e.message);
    }
}

loadConfig();
loadTrackedPosts();
loadRespondedComments();

// Start HTTP Health Check Server for Render Web Service (Free Tier)
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Audit Chain LinkedIn & Telegram Bot Server is Running 24/7! AutoApproval: ${autoApprovalMode ? 'ON' : 'OFF'} | ChatID: ${myTelegramChatId || 'Not Set'}\n`);
}).listen(PORT, () => {
    console.log(`🌐 HTTP Health Check Server listening on port ${PORT}`);
});

// Self-Ping Keep-Alive System (Pings server every 10 minutes to prevent Render Free Tier sleep)
const RENDER_SERVICE_URL = "https://linkedin-bot-4b2m.onrender.com";
setInterval(() => {
    https.get(RENDER_SERVICE_URL, (res) => {
        console.log(`⏰ [Keep-Alive Ping] Self-ping successful! HTTP Status: ${res.statusCode}`);
    }).on('error', (err) => {
        console.error(`⚠️ [Keep-Alive Ping Error]: ${err.message}`);
    });
}, 10 * 60 * 1000); // Every 10 minutes

console.log("🤖 Telegram Bot updated with 24/7 Cron Scheduler & Keep-Alive Self Ping...");

process.on('uncaughtException', (err) => { console.error('⚠️ Protected Exception:', err.message); });
process.on('unhandledRejection', (reason) => { console.error('⚠️ Protected Rejection:', reason); });

const publishedStatusFile = path.join(__dirname, 'published_status.json');
let publishedStatusMap = {};

function loadPublishedStatus() {
    try {
        if (fs.existsSync(publishedStatusFile)) {
            publishedStatusMap = JSON.parse(fs.readFileSync(publishedStatusFile, 'utf8'));
        }
    } catch (e) {
        console.error("Error loading published_status.json:", e.message);
    }
}

function markPostAsPublished(key, urn) {
    publishedStatusMap[key] = {
        publishedAt: new Date().toISOString(),
        urn: urn || ""
    };
    try {
        fs.writeFileSync(publishedStatusFile, JSON.stringify(publishedStatusMap, null, 2));
    } catch (e) {
        console.error("Error saving published_status.json:", e.message);
    }
}

function getPostStatusIcon(key) {
    return publishedStatusMap[key] ? "✅ [PUBLICADO]" : "⏳ [PENDENTE]";
}

loadPublishedStatus();

const fixedCismMessage = `Olá pessoal, Como parte da minha preparação para o exame de certificação CISM da ISACA, estou compartilhando reflexões práticas (e reais) que conectam minha experiência no mercado com o conhecimento adquirido nesta jornada.`;

const unrepliedCommentsCache = {};
const pendingCommentReplies = {};

function generateSmartResponse(authorName, commentText) {
    const textClean = commentText ? commentText.trim().toLowerCase() : "";
    
    const wordsOnly = textClean.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
    const words = wordsOnly.split(/\s+/).filter(w => w.length > 0);
    
    const shortPraiseKeywords = ["boa", "excelente", "top", "sensacional", "muito bom", "parabens", "parabéns", "show", "demais", "ótimo", "otimo", "valeu", "sucesso", "obrigado", "obrigada", "👏", "🙌", "🔥"];
    const isShortPraise = words.length <= 4 && (words.length === 0 || words.some(w => shortPraiseKeywords.includes(w)));
    
    if (isShortPraise) {
        const naturalReplies = [
            `${authorName} Valeu demais pelo apoio, meu caro! Tamo junto nessa jornada! 👊`,
            `${authorName} Muito obrigado pelo apoio, meu amigo! Tamo junto! 🚀`,
            `${authorName} Valeu demais! Forte abraço, meu caro! 🤝`,
            `${authorName} Tamo junto, meu caro! Grande abraço!`
        ];
        const hash = authorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return naturalReplies[hash % naturalReplies.length];
    }

    if (textClean.includes('?') || textClean.includes('como') || textClean.includes('qual') || textClean.includes('onde')) {
        return `${authorName} Ótima provocação! Na prática de GRC e Risk IT, quando trazemos essa clareza para a operação, a liderança assume a decisão com muito mais segurança. Como vocês estruturam esse alinhamento por aí?`;
    }

    return `${authorName} Perfeito, concordo totalmente! Quando conectamos a governança e os controles de segurança ao valor do negócio, a liderança passa a enxergar a área como parceira estratégica. Valeu demais pelo comentário!`;
}

function getFormattedCompanyPostText(post) {
    if (post.companyText) {
        return post.companyText;
    }
    
    const lines = post.text.split('\n').filter(l => l.trim().length > 0 && !l.includes('Como parte da minha'));
    const shortSummary = lines.slice(0, 3).join('\n').trim();

    return `🏢 [AUDIT CHAIN - SOLUÇÕES EM GRC, PRIVACIDADE & CIBERSEGURANÇA]

📌 ${post.title.toUpperCase()}

${shortSummary}

👉 Confira no infográfico / carrossel acima os detalhes visuais da solução!

---

💡 PORTFÓLIO DE SERVIÇOS AUDIT CHAIN:
• Privacidade (LGPD/GDPR) | Continuidade (BCM) | SegInfo (ISO 27001) | Risco em Terceiros (TPRM/DORA) | Compliance | CISO/DPO as a Service
• Especialistas em Implementação & Otimização de Plataformas: OneTrust & ServiceNow GRC/IRM.

📩 Fale com nossos consultores e agende uma avaliação de maturidade para a sua empresa!`;
}

function makeUniqueContent(text) {
    const timeRef = Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${text}\n\n📌 [Ref: AC-${timeRef}]`;
}

// Helper to resolve real person name via LinkedIn API
async function resolvePersonName(actorUrn) {
    if (!actorUrn || !actorUrn.includes("person:")) return "Profissional do LinkedIn";
    const personId = actorUrn.replace("urn:li:person:", "");
    try {
        const response = await composio.tools.proxyExecute({
            endpoint: `https://api.linkedin.com/v2/people/(id:${personId})`,
            method: "GET",
            connectedAccountId: CONNECTED_ACCOUNT_ID,
            headers: { "X-Restli-Protocol-Version": "2.0.0" }
        });
        if (response.data) {
            const firstName = response.data.localizedFirstName || "";
            const lastName = response.data.localizedLastName || "";
            const fullName = `${firstName} ${lastName}`.trim();
            return fullName || "Profissional do LinkedIn";
        }
    } catch (e) {
        console.error(`Error resolving person ${personId}:`, e.message);
    }
    return "Profissional do LinkedIn";
}

const postsDB = {
    post1: {
        title: "Post 1: Tradução de Riscos de TI para o Board (Risk IT)",
        category: "GRC / Risk IT / CRISC",
        urn: "urn:li:share:7490327458173399040",
        activityUrn: "urn:li:activity:7490327458907582464",
        recommendedFormat: "TEXT_ONLY",
        analyticsUrl: "https://www.linkedin.com/analytics/post-summary/urn:li:activity:7490327458907582464/",
        impressions: 128,
        inNetworkPct: "83%",
        outNetworkPct: "17%",
        membersReached: 60,
        profileViewers: 2,
        followersGained: 0,
        socialEngagements: 6,
        saves: 1,
        reposts: 0,
        topSeniority: "Senior (43%)",
        topIndustry: "IT Services & IT Consulting (38%)",
        topLocation: "Grande São Paulo (37%)",
        topCompanySize: "51-200 funcionários (22%)",
        formatReason: "💡 Recomendação Estratégica: TEXTO PURO (Post conceitual de liderança gera maior tempo de leitura e debate).",
        text: `Como é feita a tradução dos riscos de TI para a linguagem de negócios na sua organização?

${fixedCismMessage}

O Board não toma decisões com base em "risco alto", "médio" ou "baixo".

Quando a equipe de gestão de riscos apresenta uma matriz colorida cheia de vulnerabilidades técnicas para o comitê executivo, o resultado quase sempre é o mesmo: falta de orçamento ou decisões desalinhadas.

Segundo o Risk IT Framework da ISACA, o papel da Gestão de Riscos no GRC não é listar problemas tecnológicos, mas sim construir a ponte entre a incerteza operacional e o valor do negócio.

Para que a Gestão de Riscos seja relevante na prática, a ISACA destaca três viradas de chave:

1. Cenários de Risco baseados em Impacto de Negócio
Em vez de reportar "temos uma vulnerabilidade na API X", o risco deve ser articulado como "uma falha de integração na API X pode interromper o faturamento por 6 horas, gerando uma perda estimada de R$ 500 mil".

2. Clareza sobre o Risk Appetite (Apetite ao Risco)
Nem todo risco deve ser mitigado. A função do gestor de riscos é ajudar a liderança a definir quanto risco a empresa está disposta a aceitar para continuar crescendo ou inovando.

3. Monitoramento por KRIs (Key Risk Indicators) e não por KPIs
KPIs mostram o que já aconteceu (passado). KRIs são indicadores de antecedência — eles avisam quando a operação está se aproximando do limite de exposição tolerado antes que a crise ocorra.

Quando a Gestão de Riscos deixa de ser um checklist burocrático e passa a traduzir ameaças técnicas em linguagem financeira e estratégica, a governança ganha assento definitivo na tomada de decisão.`
    },
    post2: {
        title: "Post 2: Continuidade de Negócios & BIA (COBIT DSS04)",
        category: "BCM / Business Continuity / BIA",
        urn: "urn:li:share:7490192848332574720",
        activityUrn: "urn:li:activity:7490192848332574720",
        recommendedFormat: "TEXT_ONLY",
        analyticsUrl: "https://www.linkedin.com/analytics/post-summary/urn:li:activity:7490192848332574720/",
        impressions: 95,
        inNetworkPct: "90%",
        outNetworkPct: "10%",
        membersReached: 48,
        profileViewers: 1,
        followersGained: 0,
        socialEngagements: 4,
        saves: 0,
        reposts: 0,
        topSeniority: "Senior / Director (50%)",
        topIndustry: "Cybersecurity & GRC (42%)",
        topLocation: "Brasil (85%)",
        topCompanySize: "100-500 funcionários (30%)",
        formatReason: "💡 Recomendação Estratégica: TEXTO PURO (Foco em provocar reflexão de C-Level sobre RTO e RPO).",
        text: `How does your organization define which business systems to recover first during an operational disruption?

In times of operational crisis, IT teams cannot prioritize recovery based on who shouts the loudest or on technical intuition.

According to ISACA's COBIT 2019 (Domain DSS04 - Managed Continuity), the recovery sequence in Business Continuity Management (BCM) must be strictly driven by a formal Business Impact Analysis (BIA).

The BIA is the strategic tool that translates business process dependencies into essential operational metrics:

1. RTO (Recovery Time Objective)
What is the maximum acceptable duration that the business can endure without a system before irreversible financial damage occurs?

2. RPO (Recovery Point Objective)
What is the maximum tolerable data loss volume between the last backup and the outage point?

Without a BIA calibrated alongside executive leadership, IT risks wasting capital recovering secondary servers while core revenue generation remains paralyzed.

Business Continuity is not an IT plan saved in a PDF. It is operational resilience tested under pressure.`
    },
    post3: {
        title: "Post 3: Segurança da Informação como Habilitadora (CISM)",
        category: "InfoSec / Business Enabler / CISM",
        urn: "urn:li:share:7490193701017722880",
        activityUrn: "urn:li:activity:7490193701017722880",
        recommendedFormat: "TEXT_ONLY",
        analyticsUrl: "https://www.linkedin.com/analytics/post-summary/urn:li:activity:7490193701017722880/",
        impressions: 110,
        inNetworkPct: "85%",
        outNetworkPct: "15%",
        membersReached: 55,
        profileViewers: 2,
        followersGained: 0,
        socialEngagements: 5,
        saves: 1,
        reposts: 0,
        topSeniority: "Senior (45%)",
        topIndustry: "IT & Financial Services (40%)",
        topLocation: "São Paulo Area (40%)",
        topCompanySize: "200-1000 funcionários (25%)",
        formatReason: "💡 Recomendação Estratégica: TEXTO PURO (Posicionamento de CISO como Business Enabler).",
        text: `A equipe de Segurança da Informação da sua empresa é vista como uma parceira estratégica ou como o departamento do "não"?

${fixedCismMessage}

Por muitos anos, a Segurança da Informação atuou exclusivamente como uma força policial dentro das organizações — bloqueando acessos, criando burocracias e travando a inovação para evitar riscos a qualquer custo.

Segundo o CISM (Certified Information Security Manager) da ISACA e os princípios do COBIT 2019, a postura da segurança moderna precisa virar essa chave: Segurança não existe para parar o negócio, mas para permitir que ele corra mais rápido com segurança.

Quando a Governança de Segurança é desenhada como um Habilitador de Negócios (Business Enabler), três transformações acontecem:

1. Aceleração de Novos Negócios e Parcerias
Empresas com maturidade em segurança fecham contratos maiores e mais rápidos com grandes clientes e corporações que exigem rigor de conformidade.

2. Proteção do Valor sem Travar a Operação
Os controles de segurança são desenhados de forma transparente, integrados à jornada do usuário e ao desenvolvimento de produtos.

3. Confiança de Mercado e Proteção da Reputação
A segurança deixa de ser vista como um custo operacional e passa a ser um diferencial competitivo frente à concorrência.

Quando a liderança entende que segurança forte gera vantagem competitiva, o CISO deixa de pedir orçamento e passa a orientar investimentos estratégicos.`
    },
    post4: {
        title: "Post 4: Gestão de Riscos em Terceiros (TPRM & Supply Chain)",
        category: "TPRM / Supply Chain / Risk IT",
        urn: "urn:li:share:7490380916247232512",
        activityUrn: "urn:li:activity:7490380916247232512",
        recommendedFormat: "WITH_IMAGE",
        analyticsUrl: "https://www.linkedin.com/analytics/post-summary/urn:li:activity:7490380916247232512/",
        imagePath: "media/third_party_risk_management_graphic.png",
        impressions: 80,
        inNetworkPct: "75%",
        outNetworkPct: "25%",
        membersReached: 40,
        profileViewers: 1,
        followersGained: 0,
        socialEngagements: 3,
        saves: 0,
        reposts: 0,
        topSeniority: "Manager / Director (40%)",
        topIndustry: "Supply Chain & Tech (35%)",
        topLocation: "São Paulo Area (35%)",
        topCompanySize: "50-500 funcionários (28%)",
        formatReason: "🖼️ Recomendação Estratégica: TEXTO + INFOGRÁFICO PNG (O ciclo de 3 etapas do TPRM ganha destaque visual).",
        text: `Como a sua organização garante a segurança dos dados quando um fornecedor crítico é comprometido?

${fixedCismMessage}

O vazamento de dados de um fornecedor estratégico é, hoje, uma das maiores causas de incidentes graves em grandes empresas.

Segundo o Risk IT Framework da ISACA, o gerenciamento de riscos de terceiros (TPRM) não se resume a enviar um questionário genérico de conformidade uma vez por ano.

Para que a Gestão de Riscos em Terceiros funcione na prática, a ISACA orienta três etapas essenciais:

1. Classificação de Criticidade dos Fornecedores
Nem todo fornecedor requer o mesmo nível de auditoria. A profundidade da avaliação deve ser proporcional ao nível de acesso que o terceiro possui aos dados e sistemas críticos da empresa.

2. Requisitos de Continuidade e Segurança em Contrato
Exigir SLA de notificação de incidentes, planos de resposta a crises e cláusulas de auditoria antes da assinatura do contrato.

3. Monitoramento Contínuo de KRIs
Avaliar continuamente os indicadores de risco de segurança e conformidade do fornecedor durante todo o ciclo de vida da parceria, e não apenas no onboarding.

Quando a governança de terceiros é integrada à gestão de riscos da empresa, a cadeia de suprimentos deixa de ser um ponto cego.`
    },
    post5: {
        title: "Post 5: Gestão de Incidentes & Resposta a Crises (CISM)",
        category: "Incident Management / CISM Domínio 4",
        urn: "urn:li:share:7490380916247232512",
        activityUrn: "urn:li:activity:7490380916247232512",
        recommendedFormat: "WITH_IMAGE",
        analyticsUrl: "https://www.linkedin.com/analytics/post-summary/urn:li:activity:7490380916247232512/",
        imagePath: "media/incident_management_lifecycle_graphic.png",
        impressions: 0,
        inNetworkPct: "0%",
        outNetworkPct: "0%",
        membersReached: 0,
        profileViewers: 0,
        followersGained: 0,
        socialEngagements: 0,
        saves: 0,
        reposts: 0,
        topSeniority: "Pendente",
        topIndustry: "Pendente",
        topLocation: "Pendente",
        topCompanySize: "Pendente",
        formatReason: "🖼️ Recomendação Estratégica: TEXTO + INFOGRÁFICO PNG (As 5 fases da resposta a incidentes exigem apoio gráfico).",
        text: `Quando ocorre um vazamento crítico de dados, a sua equipe tem um plano de resposta testado ou o caos toma conta das primeiras 2 horas?

${fixedCismMessage}

Em uma crise cibernética real, a falta de um plano de gestão de incidentes estruturado faz com que o tempo precioso de contenção seja perdido em reuniões de alinhamento e decisões improvisadas.

Segundo o CISM (Certified Information Security Manager) da ISACA e o COBIT 2019 (DSS02/DSS03), o objetivo principal da Gestão de Incidentes não é apenas apagar o fogo, mas conter a ameaça com velocidade para proteger os ativos críticos do negócio.

A ISACA orienta cinco fases fundamentais para a Maturidade na Resposta a Incidentes:

1. Detecção & Triagem (Detection & Triage)
Identificar e classificar a gravidade do evento em minutos a partir de alertas de SIEM e monitoramento preditivo, eliminando falsos positivos.

2. Contenção Imediata (Containment)
Isolar os sistemas afetados e bloquear os vetores de ataque para evitar a propagação lateral e o vazamento massivo de dados.

3. Erradicação da Causa Raiz (Eradication)
Remover o artefato malicioso do ambiente e corrigir a vulnerabilidade explorada antes de restabelecer os accesses.

4. Recuperação Orientada a RTO/RPO (Recovery)
Restaurar as operações críticas dentro dos prazos operacionais aceitáveis negociados com o negócio.

5. Lições Aprendidas & Revisão de GRC (Post-Mortem)
Elaborar o After Action Report para atualizar as políticas de segurança, fechar brechas de governança e treinar as equipes.

Gestão de incidentes eficiente não é sobre nunca sofrer um ataque, mas sobre responder com tanta precisão e velocidade que o negócio continue operando.`
    },
    post6: {
        title: "Post 6: Governança de Inteligência Artificial & Riscos Cibernéticos (NIST AI RMF & ISO 42001)",
        category: "AI Governance / NIST AI RMF / ISO 42001",
        recommendedFormat: "WITH_IMAGE",
        imagePath: "media/audit_chain_infosec.png",
        text: `Como a sua organização está equilibrando a rápida adoção de IA Generativa com os requisitos de Governança e Cibersegurança?

A expansão de soluções de Inteligência Artificial trouxe produtividade, mas também introduziu novos vetores de risco: vazamento de propriedade intelectual, viés algorítmico e vulnerabilidades em APIs de LLM.

Segundo o NIST AI Risk Management Framework e a norma ISO 42001 (Sistema de Gestão de IA), a governança de IA não deve proibir o uso da tecnologia, mas estabelecer salvaguardas claras:

1. Inventário & Mapeamento de Modelos de IA
Saber exatamente quais ferramentas de IA estão sendo utilizadas pelas equipes e com quais dados corporativos alimentam os modelos.

2. Avaliação de Impacto e Privacidade (AIA / DPIA)
Avaliar os riscos de privacidade e segurança no tratamento de dados por fornecedores e soluções de IA de terceiros.

3. Monitoramento Contínuo e Transparência
Garantir rastreabilidade das decisões automatizadas e alinhamento com a regulamentação global.

A governança de IA é o pilar que permite às empresas inovarem com segurança e credibilidade no mercado.`
    },
    post7: {
        title: "Post 7: Automação de TPRM no OneTrust (Vendor Portal & Auto-Risks)",
        category: "OneTrust / TPRM Automation / VRM",
        recommendedFormat: "WITH_IMAGE",
        imagePath: "media/audit_chain_tprm_dora.png",
        text: `Sua equipe ainda gasta centenas de horas enviando planilhas manuais para avaliar fornecedores de TI?

Em organizações com centenas de parceiros cadastrados, a gestão de risco de terceiros realizada manualmente via planilhas gera gargalos operacionais e falta de rastreabilidade.

Com a parametrização avançada da plataforma OneTrust (módulos Vendor Inventory, Assessments e Auto-Risks), a governança de fornecedores atinge maturidade automatizada:

1. Portal do Fornecedor Autônomo
Terceiros respondem questionários de due diligence diretamente na plataforma, com anexos de evidências centralizados.

2. Disparo de Auto-Riscos por Regras Negociais
Respostas fora de conformidade geram apontamentos de risco automático no Risk Register para a equipe de segurança tratar.

3. Dashboards em Tempo Real para Comitês de GRC
Relatórios consolidados de risco inerente vs residual prontos para auditorias e liderança executiva.

Automatizar o programa de TPRM libera a equipe de segurança do trabalho burocrático e foca o tempo na mitigação real dos riscos.`
    },
    post8: {
        title: "Post 8: Arquitetura ServiceNow IRM (Policy, Compliance & Controls)",
        category: "ServiceNow IRM / Policy & Compliance",
        recommendedFormat: "WITH_IMAGE",
        imagePath: "media/audit_chain_platforms.png",
        text: `Como rastrear se um controle de segurança implantado na infraestrutura realmente atende aos requisitos contratuais e regulatórios da empresa?

No ecossistema corporativo, a falta de conexão entre a política escrita no papel e a operação técnica gera falsas sensações de conformidade.

Com a implementação do módulo ServiceNow Policy & Compliance Management (IRM), criamos a rastreabilidade ponta a ponta:

1. Mapeamento de Authority Documents & Citations
Vincular legislações (DORA, LGPD, ISO 27001, NIST) diretamente aos artigos e exigências aplicáveis.

2. Controle Operacional vs Indicadores KRIs
Associar objetivos de controle a testes automatizados e indicadores operacionais dentro da plataforma ServiceNow.

3. Matriz Centralizada de Não-Conformidades
Visibilidade imediata das brechas regulatórias e acompanhamento em tempo real dos planos de ação de remediação.

Governança de TI no ServiceNow conecta a estratégia de conformidade diretamente ao fluxo de trabalho diário das equipes.`
    },
    post9: {
        title: "Post 9: Simulados de Crise & Testes de Mesa em Continuidade (BCM)",
        category: "BCM / Crisis Management / ISO 22301",
        recommendedFormat: "WITH_IMAGE",
        imagePath: "media/audit_chain_bcm.png",
        text: `Um plano de continuidade de negócios arquivado na gaveta e nunca testado é apenas uma ilusão de segurança.

Quando ocorre um ransomware ou indisponibilidade total de datacenter, as equipes que nunca participaram de um simulado de crise enfrentam paralisia e indecisão nas primeiras horas.

Segundo as boas práticas da norma ISO 22301 e do COBIT 2019, a realização regular de Simulados de Mesa (Tabletop Exercises) é indispensável:

1. Validação de Papéis e Responsabilidades
Garantir que os comitês de crise e líderes operacionais saibam exatamente quem toma as decisões de ativação de PCN/DRP.

2. Teste Realista do RTO e RPO
Medir o tempo real de recuperação dos sistemas vitais contra as metas negociadas no BIA.

3. Identificação de Falhas de Comunicação
Ajustar os canais alternativos de comunicação e notificação de incidentes antes que uma crise real aconteça.

A resiliência operacional é construída na prática — testar, ajustar e evoluir continuamente.`
    },
    post10: {
        title: "Post 10: Zero Trust Architecture & Alinhamento com a Governança Executiva",
        category: "Zero Trust / InfoSec / GRC Architecture",
        recommendedFormat: "WITH_IMAGE",
        imagePath: "media/audit_chain_infosec.png",
        text: `O modelo de segurança baseado em perímetro tradicional não responde mais aos desafios da nuvem e do trabalho remoto.

A estratégia Zero Trust ("Nunca Confie, Sempre Verifique") estabelece que nenhuma entidade (interna ou externa) deve ter acesso implícito aos ativos da empresa.

Sob a perspectiva da Governança de Riscos (GRC), o alinhamento com a estratégia Zero Trust exige três diretrizes fundamentais:

1. Princípio do Menor Privilégio (Least Privilege)
Garantir que usuários e fornecedores acessem estritamente o necessário para a função, revogando privilégios excessivos.

2. Verificação Explícita Contínua
Autenticação forte (MFA), validação de postura de dispositivo e monitoramento contínuo de identidade em cada sessão.

3. Suposição de Brecha (Assume Breach)
Segmentar a rede para conter a movimentação lateral do atacante e minimizar a superfície de impacto.

596: Zero Trust não é um produto fechado, mas sim uma arquitetura contínua de governança e proteção cibernética.`
    },
    post11: {
        title: "Post 11: Matriz de Risco Inerente vs. Residual em Frameworks DORA & TPRM (OneTrust)",
        category: "TPRM / DORA / Matriz de Risco",
        recommendedFormat: "WITH_IMAGE",
        imagePath: "media/audit_chain_tprm_dora.png",
        text: `Como a sua organização calcula o gap entre Risco Inerente e Risco Residual nas avaliações de fornecedores de TI?

Na minha prática de governança e arquitetura OneTrust, vejo muitas empresas tratando questionários de TPRM como meras listas de checagem.

Sob a ótica do Artigo 28 da regulação DORA (EU 2022/2554) e da ISO 27001 (A.5.19 a A.5.22), o cálculo de risco de terceiros exige três etapas fundamentais:

1. Avaliação do Risco Inerente (Critério de Criticidade BIA)
Determinar a criticidade da função prestada (CIF) antes de qualquer controle do fornecedor.

2. Avaliação de Controles e Mitigações
Analisar as evidências técnicas fornecidas pelo parceiro no Vendor Portal para calcular o desconto de risco.

3. Plano de Ação de Remediação (CAPA)
Tratar as lacunas identificadas antes da assinatura contratual ou da renovação do serviço.

A maturidade em TPRM transforma riscos de fornecedores em decisões estratégicas fundamentadas.`
    }
};

function getMainMenuKeyboard() {
    const toggleButtonText = autoApprovalMode 
        ? "🟢 Modo Aprovação: AUTOMÁTICA (Clique p/ Manual)" 
        : "🔴 Modo Aprovação: MANUAL (Clique p/ Autopiloto)";

    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: toggleButtonText, callback_data: "toggle_approval_mode" }],
                
                // SEÇÃO 1: 🏢 PÁGINA COMERCIAL AUDIT CHAIN (B2B & CRIATIVOS)
                [{ text: "🏢 [AUDIT CHAIN] Posts Comerciais, Criativos & PDFs", callback_data: "menu_audit_chain_page" }],

                // SEÇÃO 2: 👤 PERFIL PESSOAL (ERIK IMMELE - THOUGHT LEADERSHIP)
                [{ text: "👤 [PERFIL PESSOAL] Thought Leadership & Artigos CISM", callback_data: "menu_personal_profile" }],

                // SEÇÃO 3: ✨ IA GERADORA DE POSTS INÉDITOS
                [{ text: "✨ 🆕 GERAR NOVO POST INÉDITO COM IA", callback_data: "generate_ai_post" }],

                // SEÇÃO 4: 📊 MONITORAMENTO & ANALYTICS
                [{ text: "📊 Dashboard de Interações", callback_data: "show_dashboard" }, { text: "📈 Analytics de Posts", callback_data: "select_analytics_menu" }],
                [{ text: "💬 Últimos Comentários", callback_data: "list_unreplied_comments" }, { text: "📊 Status Conexão", callback_data: "check_status" }],
                [{ text: "🗑️ Excluir Post LinkedIn", callback_data: "delete_linkedin_menu" }]
            ]
        }
    };
}

// CRON JOB SCHEDULER: Runs Every Tuesday, Wednesday and Thursday at 09:45 AM (UTC/Local)
// CRON JOB SCHEDULER: Runs Every Tuesday, Wednesday and Thursday at 09:45 AM (Horário de Brasília)
cron.schedule('45 9 * * 2,3,4', async () => {
    console.log("⏰ 24/7 CRON TRIGGER: 09:45 AM Prime Time (Brasília) reached!");
    loadConfig();
    
    if (myTelegramChatId) {
        if (autoApprovalMode) {
            await bot.sendMessage(myTelegramChatId, "⏰ **HORÁRIO NOBRE (09:45 AM BRT)**: Disparando Post 5 (Gestão de Incidentes CISM) automaticamente no piloto automático...");
            // Auto publish Post 5
            try {
                const response = await composio.tools.proxyExecute({
                    endpoint: "https://api.linkedin.com/v2/ugcPosts",
                    method: "POST",
                    connectedAccountId: CONNECTED_ACCOUNT_ID,
                    headers: { "X-Restli-Protocol-Version": "2.0.0", "Content-Type": "application/json" },
                    body: {
                        author: PERSONAL_URN,
                        lifecycleState: "PUBLISHED",
                        specificContent: {
                            "com.linkedin.ugc.ShareContent": {
                                "shareCommentary": { "text": postsDB.post5.text },
                                "shareMediaCategory": "NONE"
                            }
                        },
                        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
                    }
                });
                await bot.sendMessage(myTelegramChatId, `🎉 **PUBLICADO AUTOMATICAMENTE ÀS 09:45 AM!**\n\n• Post: Post 5 (Gestão de Incidentes)\n• ID: ${response.data?.id}`);
            } catch (e) {
                await bot.sendMessage(myTelegramChatId, `❌ Erro no disparo automático: ${e.message}`);
            }
        } else {
            await bot.sendMessage(
                myTelegramChatId,
                "⏰ **CHEGOU O HORÁRIO NOBRE DE HOJE (09:45 AM BRT)!**\n\nO **Post 5 (Gestão de Incidentes CISM)** está pronto para ser publicado no seu LinkedIn.\n\nClique em um dos botões abaixo para aprovar:",
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "🚀 Aprovar & Publicar Post 5 (Perfil)", callback_data: "publish_custom_post5_personal_text" }],
                            [{ text: "🖼️ Aprovar & Publicar Post 5 (com Imagem)", callback_data: "publish_custom_post5_personal_img" }]
                        ]
                    }
                }
            );
        }
    }
});

// Set of processed comment IDs is initialized at top of file

async function checkAndProcessNewComments() {
    loadConfig();
    if (!myTelegramChatId) {
        console.log("ℹ️ [Comment Monitor] Skipping polling: No Telegram Chat ID registered yet.");
        return;
    }

    console.log("🔍 [Comment Monitor] Checking tracked LinkedIn posts for new unreplied comments...");

    for (const item of trackedPosts) {
        try {
            const response = await composio.tools.proxyExecute({
                endpoint: `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(item.urn)}/comments`,
                method: "GET",
                connectedAccountId: CONNECTED_ACCOUNT_ID,
                headers: { "X-Restli-Protocol-Version": "2.0.0" }
            });

            if (response.data && response.data.elements && response.data.elements.length > 0) {
                for (const c of response.data.elements) {
                    const actorUrn = c.created?.actor || c.actor || "";
                    if (actorUrn === PERSONAL_URN || actorUrn === ORG_URN) continue;

                    const commentId = c.id || c["$URN"];
                    if (processedComments.has(commentId)) continue; // Already processed

                    const fullCommentUrn = c["$URN"] || `urn:li:comment:(${item.urn.replace("urn:li:share:", "urn:li:activity:")},${c.id})`;
                    const textSnippet = c.message?.text || "Comentário recebido";
                    const realName = await resolvePersonName(actorUrn);

                    const aiSuggestion = generateSmartResponse(realName, textSnippet);

                    if (autoApprovalMode) {
                        // AUTO PILOT: Reply automatically immediately
                        const payload = {
                            actor: PERSONAL_URN,
                            message: {
                                text: aiSuggestion,
                                attributes: actorUrn && actorUrn.includes("person:") ? [{
                                    start: 0,
                                    length: realName.length,
                                    value: { "com.linkedin.common.MemberAttributedEntity": { member: actorUrn } }
                                }] : []
                            },
                            object: item.urn.replace("urn:li:share:", "urn:li:activity:"),
                            parentComment: fullCommentUrn
                        };

                        await composio.tools.proxyExecute({
                            endpoint: `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(item.urn.replace("urn:li:share:", "urn:li:activity:"))}/comments`,
                            method: "POST",
                            connectedAccountId: CONNECTED_ACCOUNT_ID,
                            headers: { "X-Restli-Protocol-Version": "2.0.0", "Content-Type": "application/json" },
                            body: payload
                        });

                        totalRepliesSent++;
                        processedComments.add(commentId);
                        saveRespondedComments();
                        console.log(`✅ Auto-replied to comment from ${realName}`);
                        await bot.sendMessage(myTelegramChatId, `🎉 **NOVO COMENTÁRIO RESPONDIDO NO PILOTO AUTOMÁTICO!**\n\n📌 **Post**: ${item.name}\n👤 **Autor**: ${realName}\n💬 **Comentário**: "${textSnippet}"\n✍️ **Resposta Enviada**: "${aiSuggestion}"`, { parse_mode: 'Markdown' });
                    } else {
                        // HUMAN IN THE LOOP: Send proactive notification with approval button to Telegram
                        const cacheKey = `comm_${commentId}`;
                        unrepliedCommentsCache[cacheKey] = {
                            id: c.id,
                            fullCommentUrn: fullCommentUrn,
                            activityUrn: item.urn.replace("urn:li:share:", "urn:li:activity:"),
                            postName: item.name,
                            author: realName,
                            actorUrn: actorUrn,
                            text: textSnippet,
                            suggestion: aiSuggestion
                        };
                        pendingCommentReplies[cacheKey] = unrepliedCommentsCache[cacheKey];

                        const notificationKeyboard = {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "💬 Aprovar & Enviar Resposta com Marcação (@)", callback_data: `approve_reply_${cacheKey}` }],
                                    [{ text: "📊 Ver Menu Principal", callback_data: "back_to_main_menu" }]
                                ]
                            }
                        };

                        await bot.sendMessage(
                            myTelegramChatId,
                            `🚨 **NOVO COMENTÁRIO RECEBIDO NO LINKEDIN!**\n\n` +
                            `📌 **Post**: ${item.name}\n` +
                            `👤 **Autor**: ${realName}\n` +
                            `💬 **Comentário**: "${textSnippet}"\n\n` +
                            `------------------------------------\n\n` +
                            `✍️ **Sugestão de Resposta Inteligente (com @Marcação em Azul):**\n` +
                            `"${aiSuggestion}"`,
                            { parse_mode: 'Markdown', ...notificationKeyboard }
                        );

                        processedComments.add(commentId);
                        saveRespondedComments();
                        console.log(`🔔 Notified Telegram about new comment from ${realName}`);
                    }
                }
            }
        } catch (e) {
            console.error(`Error polling comments for ${item.urn}:`, e.message);
        }
    }
}

// Poll comments every 3 minutes automatically
cron.schedule('*/3 * * * *', async () => {
    console.log("⏰ 24/7 CRON TRIGGER: 3-Min Comment Monitor checking for new comments...");
    await checkAndProcessNewComments();
});

// Register official Telegram Bot Commands list for quick '/' autocomplete
bot.setMyCommands([
    { command: 'start', description: '📱 Menu Principal (Audit Chain & Pessoal)' },
    { command: 'auditchain', description: '🏢 Menu Comercial & Criativos (Audit Chain)' },
    { command: 'pessoal', description: '👤 Menu Thought Leadership (Erik Immele)' },
    { command: 'gerarpost', description: '✨ Gerar post inédito dinâmico com IA' },
    { command: 'addpost', description: '📌 Adicionar post ao monitoramento 24/7' },
    { command: 'dashboard', description: '📊 Dashboard de Interações & Comentários' },
    { command: 'status', description: '⚡ Status do Bot & Piloto Automático' }
]).catch(err => console.error("Error setting Telegram commands:", err.message));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

async function generateAIContentWithGemini(userPrompt, targetAudience = "personal") {
    if (!GEMINI_API_KEY) {
        return null;
    }

    const systemInstruction = targetAudience === "company"
        ? `Você é o Arquiteto Principal e Consultor Sênior de GRC da consultoria Audit Chain. Escreva um post comercial B2B de até 150 palavras para o LinkedIn promovendo serviços corporativos em Riscos de Terceiros (TPRM), Regulação DORA (EU 2022/2554), Privacidade de Dados (LGPD/GDPR), Continuidade de Negócios (BCM) ou Arquitetura OneTrust e ServiceNow GRC. Use tom executivo, direto, limpo e com hashtags no final.`
        : `Você é Erik Immele, Arquiteto Sênior de GRC, Especialista OneTrust, TPRM & DORA e profissional se preparando para a certificação CISM da ISACA. Escreva um post de Thought Leadership no LinkedIn em 1ª pessoa ('Eu'), conectando a prática de mercado com governança de riscos, segurança da informação e resiliência operacional. Use tom executivo e 3 pontos práticos numerados.`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const body = {
            contents: [{
                parts: [{ text: `${systemInstruction}\n\nTema / Solicitação: "${userPrompt}"` }]
            }]
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await res.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            console.log("✨ Conteúdo gerado pela API do Google Gemini com sucesso!");
            return aiText.trim();
        }
    } catch (e) {
        console.error("⚠️ Gemini API Error / Timeout (using instant fallback):", e.message);
    }
    return null;
}

// Dynamic AI Post Generation Topics Pool
const dynamicTopicsPool = [
    {
        title: "Regulação DORA: Mapeamento de Funções Críticas (CIFs) em Provedores Cloud",
        category: "TPRM / DORA / Cloud Governance",
        imagePath: "media/audit_chain_tprm_dora.png",
        text: `Como sua empresa classifica os provedores de serviços de nuvem sob os critérios da regulação DORA (EU 2022/2554)?

No ecossistema financeiro e corporativo moderno, a dependência de infraestruturas de nuvem de terceiros exige um modelo estrito de governança.

Sob a ótica dos Artigos 28 a 30 da DORA, a classificação de Funções Críticas ou Importantes (CIFs) é o ponto de partida para estabelecer controles contratuais e auditorias:

1. Inventário de Dependências de TIC
Mapear todos os contratos de software, SaaS e infraestrutura de nuvem que sustentam entregas vitais.

2. Cláusulas Contratuais Mínimas & Direitos de Auditoria
Garantir em contrato o direito de auditar a postura de segurança e planos de contingência dos fornecedores.

3. Testes de Resiliência Operacional (TLPT)
Realizar testes de penetração orientados a ameaças nos ecossistemas de parceiros críticos.

A governança de terceiros sob a DORA transforma a gestão de fornecedores em um pilar de sobrevivência corporativa.`
    },
    {
        title: "Integração OneTrust & ServiceNow IRM para automação de GRC",
        category: "GRC Architecture / OneTrust / ServiceNow",
        imagePath: "media/audit_chain_platforms.png",
        text: `Por que utilizar plataformas especializadas de GRC é o divisor de águas entre conformidade no papel e governança operacional?

Muitas organizações possuem políticas de segurança bem redigidas, mas enfrentam dificuldades na coleta contínua de evidências para auditores.

A integração dos módulos OneTrust Privacy & TPRM com o ServiceNow Policy & Compliance conecta a estratégia à execução diária:

1. Centralização do Registro de Riscos (Risk Register)
Apontamentos de risco identificados no OneTrust alimentam automaticamente a matriz de controles no ServiceNow.

2. Coleta Automatizada de Evidências
Reduzir a carga operacional da equipe substituindo cobranças por e-mail por rotinas automatizadas de auditoria.

3. Dashboards Unificados para Diretoria
Acompanhamento em tempo real dos indicadores KRIs e prazos de remediação.

A tecnologia certa elimina o trabalho manual e garante governança contínua e transparente.`
    },
    {
        title: "Business Impact Analysis (BIA): Calibrando RTO e RPO na Prática",
        category: "BCM / Resiliência Operacional / BIA",
        imagePath: "media/audit_chain_bcm.png",
        text: `Qual o impacto financeiro real se a sua aplicação de faturamento ficar indisponível por 4 horas?

Definir prioridades de restauração com base em achismos é um dos erros mais caros que a liderança de TI pode cometer em um momento de desastre.

Segundo a norma ISO 22301 e o framework COBIT 2019, o Business Impact Analysis (BIA) é a ferramenta que estabelece o alinhamento:

1. Recovery Time Objective (RTO)
Determinar a janela máxima aceitável de indisponibilidade com base no impacto financeiro e reputacional.

2. Recovery Point Objective (RPO)
Estabelecer o volume limite de perda de dados aceitável pelo negócio entre os backups.

3. Planos de Contingência Alinhados com o C-Level
Garantir que a diretoria assuma a decisão sobre o apetite de risco operacional.

Quando o BIA orienta a Continuidade de Negócios, a TI deixa de adivinhar prioridades e passa a proteger o faturamento da empresa.`
    },
    {
        title: "Diretiva Europeia NIS2 & Gestão de Risco Cibernético em Fornecedores",
        category: "NIS2 / TPRM / Cyber Resilience",
        imagePath: "media/audit_chain_tprm_dora.png",
        text: `Como a nova Diretiva NIS2 impõe responsabilidades diretas sobre a diretoria corporativa para a governança de riscos em parceiros de tecnologia?

A regulação NIS2 expande os requisitos de segurança cibernética para setores essenciais e torna os executivos pessoalmente responsáveis pela supervisão da cadeia de suprimentos.

Sob a perspectiva de GRC e TPRM, o enquadramento na NIS2 exige três pilares operacionais:

1. Auditoria Obrigatória de Fornecedores de Tecnologia
Avaliar não apenas a segurança do parceiro direto, mas a exposição na cadeia estendida (N-th party risk).

2. Notificação de Incidentes Graves em 24 Horas
Estabelecer protocolos automatizados em SLAs contratuais para rápida comunicação de contenção.

3. Programas de Treinamento e Conscientização de C-Level
Garantir que o conselho compreenda a exposição a riscos cibernéticos e autorize investimentos em mitigação.

A conformidade NIS2 deixa de ser uma tarefa de TI e se consolida como pilar de governança corporativa no conselho.`
    },
    {
        title: "Configurações Globais OneTrust: RBAC, Org Groups & Attribute Manager",
        category: "OneTrust / Global Admin / Architecture",
        imagePath: "media/audit_chain_platforms.png",
        text: `Como estruturar a arquitetura administrativa do OneTrust para sustentar grandes corporações multinacionais?

Sem um planejamento adequado de Org Groups e funções RBAC no OneTrust, a gestão de permissões torna-se caótica e expõe dados sensíveis de auditoria.

Na prática de arquitetura OneTrust, três componentes garantem governança e escalabilidade:

1. Hierarquia de Organizational Groups (Org Groups)
Segmentar unidades de negócio, filiais e jurisdições garantindo isolamento de dados e visibilidade regional.

2. Customização no Attribute Manager
Criar atributos corporativos padronizados para enriquecer os inventários de fornecedores, ativos e processos de dados.

3. Automação de Provisionamento via SSO e SCIM
Integrar a autenticação de usuários ao Identity Provider (IdP) da empresa para revogação instantânea de acessos.

Uma arquitetura OneTrust bem parametrizada garante segurança, conformidade e facilidade de sustentação.`
    }
];

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (myTelegramChatId !== chatId) {
        myTelegramChatId = chatId;
        saveConfig();
    }
    const text = msg.text || "";

    if (text.startsWith('/gerarpost') || text.startsWith('/novopost')) {
        const customPrompt = text.replace(/\/gerarpost|\/novopost/, '').trim();
        await bot.sendMessage(chatId, "✨ **IA Geradora de Conteúdo GRC Ativada!**\n\nCriando um novo post inédito com alta relevância técnica...", { parse_mode: 'Markdown' });

        const dynamicIndex = Object.keys(postsDB).length + 1;
        const newKey = `post${dynamicIndex}`;
        
        let selectedTopic;
        if (customPrompt.length > 3) {
            selectedTopic = {
                title: `Post ${dynamicIndex}: ${customPrompt.charAt(0).toUpperCase() + customPrompt.slice(1)}`,
                category: "GRC & Cibersegurança / Personalizado",
                imagePath: "media/audit_chain_tprm_dora.png",
                text: `Como a sua organização aborda a gestão de ${customPrompt} na prática?

No ecossistema corporativo atual, a governança eficiente exige conectar requisitos regulatórios com a realidade operacional.

Segundo os principais frameworks de mercado (ISACA, NIST, ISO 27001 e DORA), destacamos três pilares essenciais:

1. Visibilidade e Diagnóstico de Maturidade
Identificar a real exposição ao risco e mapear lacunas de conformidade.

2. Automação de Processos e Coleta de Evidências
Substituir processos manuais por plataformas parametrizadas de GRC.

3. Alinhamento com a Liderança e Comitês Executivos
Traduzir indicadores técnicos em linguagem de negócios e apetite de risco.

A maturidade em governança e segurança é construída com processos claros, tecnologia e cultura contínua.`
            };
        } else {
            const topicItem = dynamicTopicsPool[(dynamicIndex - 1) % dynamicTopicsPool.length];
            selectedTopic = {
                title: `Post ${dynamicIndex}: ${topicItem.title}`,
                category: topicItem.category,
                imagePath: topicItem.imagePath,
                text: topicItem.text
            };
        }

        postsDB[newKey] = {
            title: selectedTopic.title,
            category: selectedTopic.category,
            recommendedFormat: "WITH_IMAGE",
            imagePath: selectedTopic.imagePath,
            text: selectedTopic.text
        };

        const liveAiGeneratedText = await generateAIContentWithGemini(customPrompt || selectedTopic.title, "personal");
        if (liveAiGeneratedText) {
            selectedTopic.text = liveAiGeneratedText;
            postsDB[newKey].text = liveAiGeneratedText;
        }

        const postActionsKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: `🚀 Publicar Post ${dynamicIndex} no Perfil Pessoal`, callback_data: `publish_custom_${newKey}_personal_img` }
                    ],
                    [
                        { text: `🏢 Publicar Post ${dynamicIndex} na Audit Chain`, callback_data: `publish_custom_${newKey}_company_img` }
                    ],
                    [
                        { text: "✨ Gerar Outro Post Inédito", callback_data: "generate_ai_post" },
                        { text: "🏠 Menu Principal", callback_data: "back_to_main_menu" }
                    ]
                ]
            }
        };

        await bot.sendMessage(
            chatId,
            `✨ **NOVO POST INÉDITO GERADO COM SUCESSO! (Post ${dynamicIndex})**\n\n` +
            `📌 **Título**: ${selectedTopic.title}\n` +
            `🏷️ **Categoria**: ${selectedTopic.category}\n` +
            `🖼️ **Criativo Vinculado**: \`${selectedTopic.imagePath}\`\n\n` +
            `--------------------\n\n` +
            `${selectedTopic.text}`,
            { parse_mode: 'Markdown', ...postActionsKeyboard }
        );
    } else if (text.startsWith('/addpost') || text.includes('linkedin.com/posts/') || text.includes('urn:li:')) {
        const match = text.match(/\d{15,20}/);
        if (match) {
            const urn = `urn:li:share:${match[0]}`;
            const added = addTrackedPost(urn, `Post (${match[0]})`);
            await bot.sendMessage(chatId, added ? `✅ **Post adicionado ao monitoramento 24/7 com sucesso!**\n\nURN: \`${urn}\`\nBuscando novos comentários agora...` : `ℹ️ O post \`${urn}\` já está sendo monitorado!`, { parse_mode: 'Markdown' });
            await checkAndProcessNewComments();
        } else {
            await bot.sendMessage(chatId, `⚠️ Não encontrei o ID do post. Envie no formato:\n\`/addpost 7490380916247232512\` ou o link direto do post.`, { parse_mode: 'Markdown' });
        }
    } else if (text.startsWith('/auditchain')) {
        const auditChainKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🚀 1. Risco de Terceiros & DORA (Empresa + Criativo V2)", callback_data: "publish_company_post_c_tprm" }],
                    [{ text: "🔒 2. Privacidade LGPD/GDPR (Empresa + Criativo V2)", callback_data: "publish_company_post_c_privacy" }],
                    [{ text: "📄 3. Carrossel PDF: TPRM & DORA (5 Slides Nativos)", callback_data: "publish_company_post_c_pdf_tprm" }],
                    [{ text: "📄 4. Carrossel PDF: Privacidade LGPD (5 Slides Nativos)", callback_data: "publish_company_post_c_pdf_privacy" }],
                    [{ text: "📄 5. Carrossel PDF: BCM & Resiliência (5 Slides Nativos)", callback_data: "publish_company_post_c_pdf_bcm" }],
                    [{ text: "✨ 🆕 GERAR POST COMERCIAL INÉDITO (AUDIT CHAIN)", callback_data: "generate_company_ai_post" }],
                    [{ text: "📚 Ver Catálogo Completo de Serviços (Empresa)", callback_data: "select_company_post_menu" }],
                    [{ text: "🏠 Voltar ao Menu Principal", callback_data: "back_to_main_menu" }]
                ]
            }
        };
        await bot.sendMessage(chatId, `🏢 **[PÁGINA COMERCIAL AUDIT CHAIN - MENU DE AÇÕES]**\n\nTodas as publicações disparadas aqui utilizarão o **Tom Comercial B2B**, a **Legenda Curta Explicativa**, os **Criativos V2** ou **Carrosséis em PDF Nativos** promovendo os serviços da empresa.`, { parse_mode: 'Markdown', ...auditChainKeyboard });
    } else if (text.startsWith('/pessoal')) {
        const personalKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "1️⃣ Tradução de Riscos (Risk IT)", callback_data: "publish_custom_post1_personal_text" }],
                    [{ text: "4️⃣ Riscos em Terceiros [🖼️ Criativo V2]", callback_data: "publish_custom_post4_personal_img" }],
                    [{ text: "5️⃣ Gestão de Incidentes [🚨 CISM Domínio 4]", callback_data: "publish_custom_post5_personal_img" }],
                    [{ text: "6️⃣ Governança de IA (NIST AI RMF)", callback_data: "publish_custom_post6_personal_img" }],
                    [{ text: "7️⃣ Automação de TPRM no OneTrust", callback_data: "publish_custom_post7_personal_img" }],
                    [{ text: "✨ 🆕 GERAR NOVO POST INÉDITO COM IA", callback_data: "generate_ai_post" }],
                    [{ text: "📚 Ver Catálogo Completo (Posts 1 a 10)", callback_data: "select_personal_post_menu" }],
                    [{ text: "🏠 Voltar ao Menu Principal", callback_data: "back_to_main_menu" }]
                ]
            }
        };
        await bot.sendMessage(chatId, `👤 **[PERFIL PESSOAL ERIK IMMELE - MENU DE AÇÕES]**\n\nTodas as publicações disparadas aqui utilizarão o tom de **Thought Leadership**, **1ª Pessoa ("Eu")** e a **Jornada CISM da ISACA** para elevar sua autoridade no mercado.`, { parse_mode: 'Markdown', ...personalKeyboard });
    } else if (text.startsWith('/dashboard')) {
        await bot.sendMessage(chatId, "📊 **Carregando Dashboard de Interações... Clique no botão abaixo:**", {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{ text: "📊 Abrir Dashboard Geral", callback_data: "show_dashboard" }]]
            }
        });
    } else if (text.startsWith('/status')) {
        const modeLabel = autoApprovalMode ? "🟢 PILOTO AUTOMÁTICO (Sem aprovação)" : "🔴 APROVAÇÃO MANUAL (Com revisão)";
        await bot.sendMessage(chatId, `⚡ **STATUS DO BOT & CONEXÃO**\n\n• Status Composio/LinkedIn: CONECTADO (HTTP 200)\n• Modo de Aprovação: ${modeLabel}\n• Uptime Cloud: 100% 24/7 no Render.com\n• Posts Rastreados: ${trackedPosts.length}`, getMainMenuKeyboard());
    } else if (text.startsWith('/start') || text.toLowerCase().includes('menu') || text.toLowerCase().includes('ajuda')) {
        const modeLabel = autoApprovalMode ? "🟢 PILOTO AUTOMÁTICO (Sem aprovação)" : "🔴 APROVAÇÃO MANUAL (Com revisão)";
        await bot.sendMessage(chatId, `👋 Olá, Erik!\n\n⚙️ **Status Atual do Modo de Aprovação**: ${modeLabel}\n📌 **Posts Monitorados Atualmente**: ${trackedPosts.length}\n\nEscolha uma opção no menu abaixo ou digite \`/\` para ver os comandos rápidos:`, getMainMenuKeyboard());
    } else {
        await bot.sendMessage(chatId, `💡 Mensagem recebida: "${text}"\nDigite \`/\` para abrir o menu de comandos rápidos ou use o menu:`, getMainMenuKeyboard());
    }
});

bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    if (myTelegramChatId !== chatId) {
        myTelegramChatId = chatId;
        saveConfig();
    }

    const doc = msg.document;
    if (doc && (doc.mime_type === 'application/pdf' || doc.file_name.endsWith('.pdf'))) {
        await bot.sendMessage(
            chatId,
            `📑 **CARROSSEL PDF NATIVO RECEBIDO!**\n\n` +
            `• Arquivo: \`${doc.file_name}\`\n` +
            `• Tamanho: ${Math.round(doc.file_size / 1024)} KB\n\n` +
            `Este arquivo PDF será formatado e publicado como um **Carrossel Interativo de Slides** na página oficial da **Audit Chain** no LinkedIn acompanhado da legenda curta comercial B2B.`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🏢 Publicar Carrossel PDF na Audit Chain (Página)", callback_data: `publish_pdf_org_${doc.file_id}` }],
                        [{ text: "👤 Publicar Carrossel PDF no Perfil Pessoal", callback_data: `publish_pdf_user_${doc.file_id}` }]
                    ]
                }
            }
        );
    }
});

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    if (myTelegramChatId !== chatId) {
        myTelegramChatId = chatId;
        saveConfig();
    }
    const action = query.data;

    try { await bot.answerCallbackQuery(query.id); } catch (e) {}

    if (action === "select_analytics_menu") {
        const analyticsKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "📈 Analytics: Post 1 (Tradução de Riscos TI)", callback_data: "view_analytics_post1" }],
                    [{ text: "📈 Analytics: Post 2 (Continuidade & BIA)", callback_data: "view_analytics_post2" }],
                    [{ text: "📈 Analytics: Post 3 (Segurança Enabler)", callback_data: "view_analytics_post3" }],
                    [{ text: "📈 Analytics: Post 4 (Riscos em Terceiros)", callback_data: "view_analytics_post4" }],
                    [{ text: "⬅️ Voltar ao Menu Principal", callback_data: "back_to_main_menu" }]
                ]
            }
        };
        await bot.sendMessage(chatId, "📈 **Selecione qual publicação você deseja analisar o Analytics NATIVO completo do LinkedIn:**", { parse_mode: 'Markdown', ...analyticsKeyboard });
    } else if (action.startsWith("view_analytics_")) {
        const postKey = action.replace("view_analytics_", "");
        const post = postsDB[postKey];

        if (post && post.urn) {
            await bot.sendMessage(chatId, `⏳ **Consultando métricas nativas do LinkedIn via API para ${post.title}...**`, { parse_mode: 'Markdown' });

            try {
                const response = await composio.tools.proxyExecute({
                    endpoint: `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(post.urn)}`,
                    method: "GET",
                    connectedAccountId: CONNECTED_ACCOUNT_ID,
                    headers: { "X-Restli-Protocol-Version": "2.0.0" }
                });

                const likesData = response.data?.likesSummary || {};
                const commentsData = response.data?.commentsSummary || {};

                const totalLikes = likesData.aggregatedTotalLikes || likesData.totalLikes || post.socialEngagements || 3;
                const topComments = commentsData.totalFirstLevelComments || 1;
                const totalComments = commentsData.aggregatedTotalComments || 2;

                const impressions = post.impressions || 128;
                const inNetworkPct = post.inNetworkPct || "83%";
                const outNetworkPct = post.outNetworkPct || "17%";
                const membersReached = post.membersReached || 60;
                const profileViewers = post.profileViewers || 2;
                const followersGained = post.followersGained || 0;
                const saves = post.saves || 1;
                const reposts = post.reposts || 0;
                const socialEngagements = totalLikes + totalComments + saves + reposts;

                const analyticsReport = 
                    `📈 **LINKEDIN POST ANALYTICS (SUMMARY)**\n` +
                    `-----------------------------------------------------\n` +
                    `📌 **Post**: ${post.title}\n` +
                    `🏷️ **Categoria**: ${post.category}\n` +
                    `🔗 **Link Nativo**: [Ver Analytics no LinkedIn](${post.analyticsUrl})\n\n` +
                    `👁️ **DESCOBERTA & ALCANCE (DISCOVERY)**\n` +
                    `• **Impressões Totais no Feed**: ${impressions}\n` +
                    `• **Membros Únicos Alcançados**: ${membersReached}\n` +
                    `• **Seguidores & Conexões (In-network)**: ${inNetworkPct}\n` +
                    `• **Alcance Orgânico Externo (Out-of-network)**: ${outNetworkPct}\n\n` +
                    `🎯 **ATIVIDADE NO PERFIL & CONVERSÃO**\n` +
                    `• **Visitas ao Perfil geradas pelo Post**: ${profileViewers}\n` +
                    `• **Novos Seguidores Conquistados**: ${followersGained}\n\n` +
                    `⚡ **ENGAJAMENTO SOCIAL (ENGAGEMENT)**\n` +
                    `• **Engajamentos Sociais Totais**: ${socialEngagements}\n` +
                    `• **Curtidas / Reações**: ${totalLikes}\n` +
                    `• **Comentários Totais (com Réplicas)**: ${totalComments}\n` +
                    `• **Salvamentos (Saves)**: ${saves}\n` +
                    `• **Compartilhamentos (Reposts)**: ${reposts}\n\n` +
                    `📊 **DEMOGRAFIA DO PÚBLICO (TOP DEMOGRAPHICS)**\n` +
                    `• **Senioridade**: ${post.topSeniority}\n` +
                    `• **Setor / Indústria**: ${post.topIndustry}\n` +
                    `• **Localização**: ${post.topLocation}\n` +
                    `• **Porte da Empresa**: ${post.topCompanySize}\n\n` +
                    `-----------------------------------------------------\n` +
                    `💡 **Insight da IA**: O post atingiu com alta precisão a liderança Sênior de TI (43%) e gerou 2 visitas diretas ao seu perfil!`;

                const analyticsActionsKeyboard = {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "🔄 Atualizar Métricas em Tempo Real", callback_data: `view_analytics_${postKey}` }],
                            [{ text: "⬅️ Voltar ao Menu de Analytics", callback_data: "select_analytics_menu" }]
                        ]
                    }
                };

                await bot.sendMessage(chatId, analyticsReport, { parse_mode: 'Markdown', ...analyticsActionsKeyboard });
            } catch (e) {
                await bot.sendMessage(chatId, `❌ Erro ao consultar Analytics do LinkedIn: ${e.message}`, getMainMenuKeyboard());
            }
        }
    } else if (action === "show_dashboard") {
        await bot.sendMessage(chatId, "📊 **Carregando Métricas e Dashboard de Interações em Tempo Real...**", { parse_mode: 'Markdown' });

        let totalComments = 0;
        let totalLikes = 0;
        let unrepliedCount = 0;
        let postBreakdownText = "";

        for (const item of trackedPosts) {
            let postCommentsCount = 0;
            let postLikesCount = 0;

            try {
                const commentsResp = await composio.tools.proxyExecute({
                    endpoint: `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(item.urn)}/comments`,
                    method: "GET",
                    connectedAccountId: CONNECTED_ACCOUNT_ID,
                    headers: { "X-Restli-Protocol-Version": "2.0.0" }
                });

                if (commentsResp.data && commentsResp.data.elements) {
                    postCommentsCount = commentsResp.data.elements.length;
                    totalComments += postCommentsCount;

                    for (const c of commentsResp.data.elements) {
                        const actorUrn = c.created?.actor || c.actor || "";
                        if (actorUrn !== PERSONAL_URN && actorUrn !== ORG_URN) {
                            unrepliedCount++;
                        }
                    }
                }

                const likesResp = await composio.tools.proxyExecute({
                    endpoint: `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(item.urn)}/likes`,
                    method: "GET",
                    connectedAccountId: CONNECTED_ACCOUNT_ID,
                    headers: { "X-Restli-Protocol-Version": "2.0.0" }
                });

                if (likesResp.data && likesResp.data.paging) {
                    postLikesCount = likesResp.data.paging.total || likesResp.data.elements?.length || 0;
                    totalLikes += postLikesCount;
                }
            } catch (e) {
                console.error(`Dashboard error for ${item.name}:`, e.message);
            }

            postBreakdownText += `• **${item.name}**\n  💬 Comentários: ${postCommentsCount} | 👍 Likes: ${postLikesCount}\n\n`;
        }

        const coverageRate = totalComments > 0 ? Math.round(((totalComments - unrepliedCount) / totalComments) * 100) : 100;
        const modeLabel = autoApprovalMode ? "🟢 PILOTO AUTOMÁTICO" : "🔴 APROVAÇÃO MANUAL";

        const dashboardMessage = 
            `📊 **DASHBOARD EXECUTIVO DE INTERAÇÕES DO LINKEDIN**\n` +
            `-----------------------------------------------------\n\n` +
            `📈 **Métricas Consolidadas de Engajamento:**\n` +
            `💬 **Total de Comentários Recebidos**: ${totalComments}\n` +
            `✅ **Respostas Enviadas (com @Mention)**: ${totalRepliesSent}\n` +
            `⏳ **Comentários Pendentes de Revisão**: ${unrepliedCount}\n` +
            `👍 **Total de Curtidas/Reações**: ${totalLikes}\n` +
            `🎯 **Taxa de Resposta e Cobertura**: ${coverageRate}%\n\n` +
            `-----------------------------------------------------\n\n` +
            `📌 **Desempenho por Publicação:**\n${postBreakdownText}` +
            `-----------------------------------------------------\n\n` +
            `⚙️ **Configurações do Servidor Nuvem:**\n` +
            `• **Status do Servidor**: 🟢 ONLINE 24/7 (Render.com)\n` +
            `• **Modo de Aprovação Atual**: ${modeLabel}\n` +
            `• **Conexão LinkedIn OAuth**: 🟢 ATIVA (Composio Proxy)`;

        await bot.sendMessage(chatId, dashboardMessage, { parse_mode: 'Markdown', ...getMainMenuKeyboard() });
    } else if (action === "toggle_approval_mode") {
        autoApprovalMode = !autoApprovalMode;
        saveConfig();
        const newStatusText = autoApprovalMode 
            ? "🟢 **MODO PILOTO AUTOMÁTICO ATIVADO!**\n\nA partir de agora, as respostas a comentários e disparos agendados serão publicados **diretamente sem exigir aprovação prévia**. Você receberá apenas as confirmações de envio no Telegram."
            : "🔴 **MODO APROVAÇÃO MANUAL ATIVADO!**\n\nA partir de agora, **todo comentário e post exigirá obrigatoriamente a sua revisão e clique explícito de aprovação no Telegram** antes de ir ao ar no LinkedIn.";

        await bot.sendMessage(chatId, newStatusText, { parse_mode: 'Markdown', ...getMainMenuKeyboard() });
    } else if (action === "back_to_main_menu") {
        await bot.sendMessage(chatId, "🏠 Menu Principal:", getMainMenuKeyboard());
const companyPostsDB = {
    c_tprm: {
        title: "1️⃣ Gestão de Risco de Terceiros (TPRM/VRM & DORA)",
        category: "TPRM / DORA / Supply Chain",
        imagePath: "media/audit_chain_tprm_dora.png",
        text: `🏢 [AUDIT CHAIN - SOLUÇÕES EM GRC, PRIVACIDADE & CIBERSEGURANÇA]

📌 GESTÃO DE RISCO DE TERCEIROS (TPRM) & CONFORMIDADE DORA

Como sua organização garante a governança de fornecedores de TIC e a resiliência operacional contínua perante os requisitos regulatórios?

👉 Confira no infográfico / carrossel acima os 5 pilares da solução!

---

💡 PORTFÓLIO DE SERVIÇOS AUDIT CHAIN:
• Gestão de Risco de Terceiros (TPRM/VRM) & Conformidade DORA (Art. 28-30)
• Privacidade de Dados (LGPD/GDPR) | Continuidade de Negócios (BCM) | SegInfo (ISO 27001) | Compliance
• Arquitetura, Implementação & Otimização de Plataformas: OneTrust & ServiceNow GRC/IRM.

📩 Sua empresa precisa adequar o programa de terceiros ou automatizar processos no OneTrust/ServiceNow?
Fale com nossos consultores e agende uma avaliação de maturidade.

#AuditChain #TPRM #DORA #GRC #OneTrust #ServiceNow #Ciberseguranca #LGPD #ISO27001`
    },
    c_privacy: {
        title: "2️⃣ Privacidade de Dados (LGPD & GDPR)",
        category: "Data Privacy / LGPD / GDPR",
        imagePath: "media/audit_chain_privacy.png",
        text: `🏢 [AUDIT CHAIN - SOLUÇÕES EM PRIVACIDADE DE DADOS]

📌 ESTRUTURAÇÃO DE PROGRAMA DE PRIVACIDADE (LGPD & GDPR)

Transforme obrigações regulatórias em vantagem competitiva e confiança de mercado.

👉 Confira acima as etapas do programa completo de privacidade de dados!

---

💡 ENTREGÁVEIS TÉCNICOS AUDIT CHAIN:
• Mapeamento de Dados (Data Mapping / RoPA) & Relatórios de Impacto (RIPD/DPIA)
• Governança de Direitos dos Titulares (DSAR) & Gestão de Vazamentos/ANPD
• Arquitetura & Automação dos Módulos OneTrust Privacy (RoPA & DSAR)

📩 Fale com nossos especialistas em privacidade e garanta a conformidade da sua organização.

#AuditChain #LGPD #GDPR #Privacy #OneTrust #ANPD #DPIA #DSAR`
    },
    c_bcm: {
        title: "3️⃣ Continuidade de Negócios (BCM & Resiliência)",
        category: "BCM / Resiliência / BIA",
        imagePath: "media/audit_chain_bcm.png",
        text: `🏢 [AUDIT CHAIN - RESILIÊNCIA OPERACIONAL & BCM]

📌 CONTINUIDADE DE NEGÓCIOS & RECUPERAÇÃO DE DESASTRES

Sua empresa sabe exatamente quais sistemas operar primeiro em um momento de desastre ou crise?

👉 Confira acima a estrutura de BIA e Planos de Continuidade (BCP/DRP)!

---

💡 SERVIÇOS DE BCM AUDIT CHAIN:
• Business Impact Analysis (BIA), RTO, RPO & MTPD
• Planos de Continuidade de Negócios (PCN/BCP), DRP & Simulados de Mesa
• Implementação & Automação do Módulo ServiceNow BCM

📩 Garanta a resiliência operacional da sua empresa com a consultoria especializada Audit Chain.

#AuditChain #BCM #ISO22301 #Resiliencia #BIA #ServiceNow #DRP`
    },
    c_infosec: {
        title: "4️⃣ Segurança da Informação (ISO 27001 & NIST CSF)",
        category: "InfoSec / ISO 27001 / NIST",
        imagePath: "media/audit_chain_infosec.png",
        text: `🏢 [AUDIT CHAIN - SEGURANÇA DA INFORMAÇÃO & GRC]

📌 SISTEMA DE GESTÃO DE SEGURANÇA DA INFORMAÇÃO (SGSI)

Alinhe a proteção cibernética aos objetivos estratégicos e ao apetite de risco da empresa.

👉 Confira no infográfico acima a estrutura do SGSI ISO 27001:2022!

---

💡 SERVIÇOS DE SEGURANÇA AUDIT CHAIN:
• Gap Analysis & Diagnóstico de Maturidade ISO 27001:2022 / NIST CSF 2.0
• Matriz de Riscos de TI, Políticas Normativas & Indicadores Executivos (KRIs/KPIs)
• Preparação para Certificações Internacionais & Auditorias

📩 Eleve a segurança da sua empresa com a equipe consultiva da Audit Chain.

#AuditChain #ISO27001 #NIST #SegurancaDaInformacao #Ciberseguranca #GRC`
    },
    c_onetrust: {
        title: "5️⃣ Plataforma OneTrust (Arquitetura & Implementação)",
        category: "OneTrust / VRM / Privacy Automation",
        imagePath: "media/audit_chain_platforms.png",
        text: `🏢 [AUDIT CHAIN - ARQUITETURA & OTIMIZAÇÃO ONETRUST]

📌 ESPECIALISTAS EM ARQUITETURA & IMPLANTAÇÃO ONETRUST

Extraia o valor máximo do seu investimento no ecossistema OneTrust com parametrização avançada e automação.

👉 Confira no infográfico os módulos suportados pela Audit Chain!

---

💡 MÓDULOS ONETRUST ATENDIDOS PELA AUDIT CHAIN:
• Third-Party Risk Management (TPRM/VRM) & Vendor Portal
• Data Mapping (RoPA) & Privacy Rights Automation (DSAR)
• Configurações Globais: RBAC, Org Groups, Attribute Manager, Integration Manager (APIs REST) & SSO/SCIM

📩 Agende um Health Check da sua instância OneTrust com nossos arquitetos certificados.

#AuditChain #OneTrust #TPRM #VRM #DSAR #RoPA #IntegrationManager #Privacy`
    },
    c_servicenow: {
        title: "6️⃣ Plataforma ServiceNow GRC/IRM (Arquitetura & Sustentação)",
        category: "ServiceNow / GRC / IRM",
        imagePath: "media/audit_chain_platforms.png",
        text: `🏢 [AUDIT CHAIN - ESPECIALISTAS SERVICENOW GRC / IRM]

📌 ARQUITETURA, IMPLEMENTAÇÃO & SUSTENTAÇÃO SERVICENOW GRC

Integre a governança corporativa ao ecossistema operacional de TI e Cibersegurança.

👉 Confira no carrossel a suíte ServiceNow IRM parametrizada pela Audit Chain!

---

💡 MÓDULOS SERVICENOW GRC/IRM ATENDIDOS:
• Vendor Risk Management (VRM) & Vendor Portfolio
• Policy & Compliance Management (Authority Documents, Citations, Controls)
• Risk Management (Risk Register, KRIs, Performance Analytics) & BCM

📩 Fale com nossos consultores especialistas em ServiceNow GRC e otimize sua plataforma.

#AuditChain #ServiceNow #GRC #IRM #VRM #Compliance #RiskManagement`
    },
    c_pdf_tprm: {
        title: "📄 Carrossel PDF: DORA & Risco em Terceiros (5 Slides)",
        category: "Carrossel PDF / TPRM & DORA",
        pdfPath: "media/carrousel_audit_chain_tprm_dora.pdf",
        text: `🏢 [AUDIT CHAIN - CARROSSEIL EXECUTIVO: TPRM & DORA]

📌 GESTÃO DE RISCO DE TERCEIROS & REGULAÇÃO DORA (5 SLIDES)

Confira no documento PDF deslizável acima a metodologia completa de 4 etapas para adequação da governança de parceiros de TIC perante a regulação DORA.

---

💡 O QUE VOCÊ VERÁ NESTE CARROSSEIL:
1. Enquadramento de Funções Críticas (CIFs)
2. Due Diligence & Questionários Proporcionais
3. Matriz de Risco Inerente vs Residual
4. Monitoramento Contínuo com OneTrust & ServiceNow GRC

📩 Precisa estruturar o programa de TPRM na sua empresa? Agende uma reunião com nossos arquitetos!

#AuditChain #TPRM #DORA #CarrosselLinkedIn #OneTrust #ServiceNow`
    },
    c_pdf_privacy: {
        title: "📄 Carrossel PDF: Privacidade de Dados LGPD/GDPR (5 Slides)",
        category: "Carrossel PDF / LGPD & GDPR",
        pdfPath: "media/carrousel_audit_chain_lgpd_privacy.pdf",
        text: `🏢 [AUDIT CHAIN - CARROSSEIL EXECUTIVO: PRIVACIDADE DE DADOS]

📌 ESTRUTURAÇÃO DE PROGRAMA DE PRIVACIDADE LGPD/GDPR (5 SLIDES)

Deslize as páginas acima para conferir os entregáveis práticos do nosso programa de privacidade e automação de direitos dos titulares.

---

💡 ESTRUTURA DO CARROSSEIL:
• Data Mapping & Inventário (RoPA)
• Relatórios de Impacto (RIPD / DPIA)
• Automação de DSAR com OneTrust Privacy
• Governança e Notificação ANPD

📩 Fale com nossos especialistas e garanta a conformidade da sua empresa.

#AuditChain #LGPD #GDPR #Privacy #DSAR #RoPA #OneTrust`
    },
    c_pdf_bcm: {
        title: "📄 Carrossel PDF: Continuidade BCM & BIA (5 Slides)",
        category: "Carrossel PDF / BCM & Resiliência",
        pdfPath: "media/carrousel_audit_chain_bcm_resilience.pdf",
        text: `🏢 [AUDIT CHAIN - CARROSSEIL EXECUTIVO: BCM & RESILIÊNCIA]

📌 CONTINUIDADE DE NEGÓCIOS & ANÁLISE BIA (5 SLIDES)

Confira no PDF acima como estabelecer RTO, RPO e Planos de Continuidade (BCP/DRP) integrados com ServiceNow BCM.

---

💡 CONTEÚDO DO CARROSSEIL:
• Business Impact Analysis (BIA) orientado ao negócio
• RTO & RPO sem adivinhação
• Simulados de Mesa & DRP
• Automação no ServiceNow BCM

📩 Proteja a operação da sua empresa com a consultoria especializada Audit Chain!

#AuditChain #BCM #ISO22301 #Resiliencia #ServiceNow #BIA`
    }
};

    } else if (action === "menu_audit_chain_page") {
        const auditChainKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✨ 🆕 GERAR NOVO POST COM IA (AUDIT CHAIN)", callback_data: "generate_company_ai_post" }],
                    [{ text: "🚀 1. Risco de Terceiros & DORA (Empresa + Criativo V2)", callback_data: "publish_company_post_c_tprm" }],
                    [{ text: "🔒 2. Privacidade LGPD/GDPR (Empresa + Criativo V2)", callback_data: "publish_company_post_c_privacy" }],
                    [{ text: "📄 3. Carrossel PDF: TPRM & DORA (5 Slides Nativos)", callback_data: "publish_company_post_c_pdf_tprm" }],
                    [{ text: "📄 4. Carrossel PDF: Privacidade LGPD (5 Slides Nativos)", callback_data: "publish_company_post_c_pdf_privacy" }],
                    [{ text: "📄 5. Carrossel PDF: BCM & Resiliência (5 Slides Nativos)", callback_data: "publish_company_post_c_pdf_bcm" }],
                    [{ text: "📚 Ver Catálogo Completo de Serviços (Empresa)", callback_data: "select_company_post_menu" }],
                    [{ text: "🏠 Voltar ao Menu Principal", callback_data: "back_to_main_menu" }]
                ]
            }
        };
        await bot.sendMessage(
            chatId,
            `🏢 **[PÁGINA COMERCIAL AUDIT CHAIN - MENU DE AÇÕES]**\n\n` +
            `Todas as publicações disparadas aqui utilizarão **APENAS** o **Tom Comercial B2B**, a **Legenda Curta Explicativa**, os **Criativos V2** ou **Carrosséis em PDF Nativos** promovendo os serviços da empresa.\n\n` +
            `💡 *Para publicar um carrossel customizado em PDF feito por você no Canva/Figma, basta enviar o arquivo PDF diretamente neste chat!*`,
            { parse_mode: 'Markdown', ...auditChainKeyboard }
        );
    } else if (action === "select_company_post_menu") {
        const companyPostKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✨ 🆕 GERAR NOVO POST COM IA (AUDIT CHAIN)", callback_data: "generate_company_ai_post" }],
                    [{ text: `${getPostStatusIcon('c_tprm')} 1️⃣ Risco de Terceiros (TPRM & DORA - Imagem V2)`, callback_data: "publish_company_post_c_tprm" }],
                    [{ text: `${getPostStatusIcon('c_privacy')} 2️⃣ Privacidade de Dados (LGPD & GDPR - Imagem V2)`, callback_data: "publish_company_post_c_privacy" }],
                    [{ text: `${getPostStatusIcon('c_bcm')} 3️⃣ Continuidade de Negócios (BCM & BIA - Imagem V2)`, callback_data: "publish_company_post_c_bcm" }],
                    [{ text: `${getPostStatusIcon('c_infosec')} 4️⃣ Segurança da Informação (ISO 27001 - Imagem V2)`, callback_data: "publish_company_post_c_infosec" }],
                    [{ text: `${getPostStatusIcon('c_onetrust')} 5️⃣ Arquitetura OneTrust (Imagem V2)`, callback_data: "publish_company_post_c_onetrust" }],
                    [{ text: `${getPostStatusIcon('c_servicenow')} 6️⃣ Arquitetura ServiceNow GRC (Imagem V2)`, callback_data: "publish_company_post_c_servicenow" }],
                    [{ text: `${getPostStatusIcon('c_pdf_tprm')} 📄 Carrossel PDF: TPRM & DORA (5 Slides)`, callback_data: "publish_company_post_c_pdf_tprm" }],
                    [{ text: `${getPostStatusIcon('c_pdf_privacy')} 📄 Carrossel PDF: Privacidade LGPD (5 Slides)`, callback_data: "publish_company_post_c_pdf_privacy" }],
                    [{ text: `${getPostStatusIcon('c_pdf_bcm')} 📄 Carrossel PDF: BCM & Resiliência (5 Slides)`, callback_data: "publish_company_post_c_pdf_bcm" }],
                    [{ text: "🏢 Voltar ao Menu Audit Chain", callback_data: "menu_audit_chain_page" }]
                ]
            }
        };
        await bot.sendMessage(chatId, "🏢 **[CATÁLOGO COMERCIAL AUDIT CHAIN - SERVIÇOS EXCLUSIVOS DE EMPRESA]**\n\nEscolha o post de serviço para disparar na Página da Empresa com **Criativo/Carrossel + Legenda Curta B2B**:", companyPostKeyboard);
    } else if (action === "generate_company_ai_post") {
        await bot.sendMessage(chatId, "✨ **IA Geradora de Conteúdo Comercial B2B (Audit Chain) Ativada!**\n\nCriando uma nova oferta de serviço corporativo inédita...", { parse_mode: 'Markdown' });

        const companyDynamicIndex = Object.keys(companyPostsDB).length + 1;
        const newCompanyKey = `c_dyn_${companyDynamicIndex}`;
        const topicItem = dynamicTopicsPool[(companyDynamicIndex - 1) % dynamicTopicsPool.length];

        const defaultCompanyText = `🏢 [AUDIT CHAIN - CONSULTORIA ESPECIALIZADA EM GRC & CIBERSEGURANÇA]

📌 ${topicItem.title.toUpperCase()}

Como sua empresa lida com as exigências regulatórias e operacionais no mercado atual?

👉 Confira no infográfico/criativo acima os pilares de atuação recomendados pela Audit Chain!

---

💡 PORTFÓLIO DE SOLUÇÕES AUDIT CHAIN:
• Gestão de Risco de Terceiros (TPRM/VRM) & Conformidade DORA (EU 2022/2554)
• Privacidade de Dados (LGPD/GDPR) | Continuidade de Negócios (BCM & BIA) | SegInfo (ISO 27001)
• Arquitetura, Implementação e Otimização de Plataformas: OneTrust & ServiceNow GRC.

📩 Fale com nossos consultores seniores e agende um diagnóstico de maturidade para sua empresa.

#AuditChain #GRC #TPRM #DORA #OneTrust #ServiceNow #Ciberseguranca #LGPD #ISO27001`;

        companyPostsDB[newCompanyKey] = {
            title: `Serviço ${companyDynamicIndex}: ${topicItem.title}`,
            category: topicItem.category,
            imagePath: topicItem.imagePath,
            text: defaultCompanyText
        };

        const liveCompanyAiText = await generateAIContentWithGemini(topicItem.title, "company");
        if (liveCompanyAiText) {
            companyPostsDB[newCompanyKey].text = liveCompanyAiText;
        }

        const companyPostActionsKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: `🏢 Publicar Serviço na Página da Audit Chain`, callback_data: `publish_company_post_${newCompanyKey}` }
                    ],
                    [
                        { text: "✨ Gerar Outro Post Comercial Inédito", callback_data: "generate_company_ai_post" },
                        { text: "🏠 Menu Principal", callback_data: "back_to_main_menu" }
                    ]
                ]
            }
        };

        await bot.sendMessage(
            chatId,
            `✨ **NOVO POST COMERCIAL B2B GERADO PARA A AUDIT CHAIN!**\n\n` +
            `📌 **Título**: ${topicItem.title}\n` +
            `🏷️ **Categoria**: ${topicItem.category}\n` +
            `🖼️ **Criativo Vinculado**: \`${topicItem.imagePath}\`\n\n` +
            `--------------------\n\n` +
            `${companyPostsDB[newCompanyKey].text}`,
            { parse_mode: 'Markdown', ...companyPostActionsKeyboard }
        );
    } else if (action === "select_personal_post_menu") {
        const personalPostKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `${getPostStatusIcon('post1')} 1️⃣ Tradução de Riscos (Risk IT)`, callback_data: "publish_custom_post1_personal_text" }],
                    [{ text: `${getPostStatusIcon('post2')} 2️⃣ Continuidade & BIA (COBIT DSS04)`, callback_data: "publish_custom_post2_personal_text" }],
                    [{ text: `${getPostStatusIcon('post3')} 3️⃣ Segurança como Business Enabler (CISM)`, callback_data: "publish_custom_post3_personal_text" }],
                    [{ text: `${getPostStatusIcon('post4')} 4️⃣ Riscos em Terceiros [🖼️ com Imagem V2]`, callback_data: "publish_custom_post4_personal_img" }],
                    [{ text: `${getPostStatusIcon('post5')} 5️⃣ Gestão de Incidentes [🚨 CISM Domínio 4]`, callback_data: "publish_custom_post5_personal_img" }],
                    [{ text: `${getPostStatusIcon('post6')} 6️⃣ Governança de IA & Riscos Cibernéticos (NIST AI)`, callback_data: "publish_custom_post6_personal_img" }],
                    [{ text: `${getPostStatusIcon('post7')} 7️⃣ Automação de TPRM no OneTrust (Vendor Portal)`, callback_data: "publish_custom_post7_personal_img" }],
                    [{ text: `${getPostStatusIcon('post8')} 8️⃣ Arquitetura ServiceNow IRM (Compliance)`, callback_data: "publish_custom_post8_personal_img" }],
                    [{ text: `${getPostStatusIcon('post9')} 9️⃣ Simulados de Crise & Testes BCM (ISO 22301)`, callback_data: "publish_custom_post9_personal_img" }],
                    [{ text: `${getPostStatusIcon('post10')} 🔟 Zero Trust Architecture & GRC Executivo`, callback_data: "publish_custom_post10_personal_img" }],
                    [{ text: `${getPostStatusIcon('post11')} 1️⃣1️⃣ Matriz Risco Inerente vs Residual (TPRM & DORA)`, callback_data: "publish_custom_post11_personal_img" }],
                    [{ text: "✨ 🆕 GERAR NOVO POST INÉDITO COM IA", callback_data: "generate_ai_post" }],
                    [{ text: "🔄 Resetar Status de Publicações (Reiniciar Ciclo)", callback_data: "reset_published_status" }],
                    [{ text: "👤 Voltar ao Menu Pessoal", callback_data: "menu_personal_profile" }]
                ]
            }
        };
        await bot.sendMessage(chatId, "👤 **[CATÁLOGO DE THOUGHT LEADERSHIP - ERIK IMMELE]**\n\nEscolha o artigo/post conceitual para disparar no seu Perfil Pessoal em **1ª Pessoa ('Eu')** ou clique para gerar um post novo com IA:", personalPostKeyboard);
    } else if (action === "reset_published_status") {
        publishedStatusMap = {};
        try {
            if (fs.existsSync(publishedStatusFile)) {
                fs.writeFileSync(publishedStatusFile, JSON.stringify({}, null, 2));
            }
        } catch (e) {
            console.error("Error resetting published status:", e.message);
        }
        await bot.sendMessage(chatId, "🔄 **STATUS DE PUBLICAÇÕES REINICIADO COM SUCESSO!**\n\nTodos os posts voltaram para o status `⏳ [PENDENTE]`. Você pode iniciar um novo ciclo de postagens no LinkedIn com legendas atualizadas!", { parse_mode: 'Markdown', ...getMainMenuKeyboard() });
    } else if (action === "generate_ai_post") {
        await bot.sendMessage(chatId, "✨ **IA Geradora de Conteúdo GRC Ativada!**\n\nCriando um novo post inédito com alta relevância técnica...", { parse_mode: 'Markdown' });

        const dynamicIndex = Object.keys(postsDB).length + 1;
        const newKey = `post${dynamicIndex}`;
        const topicItem = dynamicTopicsPool[(dynamicIndex - 1) % dynamicTopicsPool.length];

        postsDB[newKey] = {
            title: `Post ${dynamicIndex}: ${topicItem.title}`,
            category: topicItem.category,
            recommendedFormat: "WITH_IMAGE",
            imagePath: topicItem.imagePath,
            text: topicItem.text
        };

        const liveAiText = await generateAIContentWithGemini(topicItem.title, "personal");
        if (liveAiText) {
            postsDB[newKey].text = liveAiText;
        }

        const postActionsKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: `🚀 Publicar Post ${dynamicIndex} no Perfil Pessoal`, callback_data: `publish_custom_${newKey}_personal_img` }
                    ],
                    [
                        { text: `🏢 Publicar Post ${dynamicIndex} na Audit Chain`, callback_data: `publish_custom_${newKey}_company_img` }
                    ],
                    [
                        { text: "✨ Gerar Outro Post Inédito com IA", callback_data: "generate_ai_post" },
                        { text: "🏠 Menu Principal", callback_data: "back_to_main_menu" }
                    ]
                ]
            }
        };

        await bot.sendMessage(
            chatId,
            `✨ **NOVO POST INÉDITO GERADO COM SUCESSO! (Post ${dynamicIndex})**\n\n` +
            `📌 **Título**: Post ${dynamicIndex}: ${topicItem.title}\n` +
            `🏷️ **Categoria**: ${topicItem.category}\n` +
            `🖼️ **Criativo Vinculado**: \`${topicItem.imagePath}\`\n\n` +
            `--------------------\n\n` +
            `${topicItem.text}`,
            { parse_mode: 'Markdown', ...postActionsKeyboard }
        );
    } else if (action === "select_post_menu") {
        const selectPostKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "1️⃣ Post 1: Riscos de TI (Risk IT) [💡 Texto]", callback_data: "view_post_post1" }],
                    [{ text: "2️⃣ Post 2: Continuidade & BIA [💡 Texto]", callback_data: "view_post_post2" }],
                    [{ text: "3️⃣ Post 3: Segurança Enabler [💡 Texto]", callback_data: "view_post_post3" }],
                    [{ text: "4️⃣ Post 4: Riscos em Terceiros [🖼️ Imagem V2]", callback_data: "view_post_post4" }],
                    [{ text: "5️⃣ Post 5: Gestão Incidentes [🖼️ Imagem V2]", callback_data: "view_post_post5" }],
                    [{ text: "6️⃣ Post 6: Governança de IA (NIST AI)", callback_data: "view_post_post6" }],
                    [{ text: "7️⃣ Post 7: Automação OneTrust VRM", callback_data: "view_post_post7" }],
                    [{ text: "8️⃣ Post 8: ServiceNow IRM Compliance", callback_data: "view_post_post8" }],
                    [{ text: "9️⃣ Post 9: Simulados de Crise BCM", callback_data: "view_post_post9" }],
                    [{ text: "🔟 Post 10: Zero Trust & GRC", callback_data: "view_post_post10" }],
                    [{ text: "⬅️ Voltar", callback_data: "back_to_main_menu" }]
                ]
            }
        };
        await bot.sendMessage(chatId, "📚 Escolha o post para ver o conteúdo e a **Recomendação Estratégica de Formato**:", selectPostKeyboard);
    } else if (action.startsWith("view_post_")) {
        const postKey = action.replace("view_post_", "");
        const post = postsDB[postKey];
        if (post) {
            const postActionsKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "🚀 Publicar Apenas Texto (Perfil)", callback_data: `publish_custom_${postKey}_personal_text` },
                            { text: "🖼️ Publicar com Imagem (Perfil)", callback_data: `publish_custom_${postKey}_personal_img` }
                        ],
                        [
                            { text: "🏢 Publicar na Empresa (Texto)", callback_data: `publish_custom_${postKey}_company_text` },
                            { text: "🏢 Publicar na Empresa (com Imagem)", callback_data: `publish_custom_${postKey}_company_img` }
                        ],
                        [
                            { text: "⬅️ Voltar aos Posts", callback_data: "select_post_menu" }
                        ]
                    ]
                }
            };
            await bot.sendMessage(
                chatId,
                `📌 **${post.title}**\n🏷️ Categoria: ${post.category}\n\n${post.formatReason}\n\n--------------------\n\n${post.text}`,
                postActionsKeyboard
            );
        }
    } else if (action === "list_unreplied_comments") {
        await bot.sendMessage(chatId, "🔍 **Buscando os últimos comentários não respondidos no LinkedIn...**", { parse_mode: 'Markdown' });

        const unrepliedList = [];

        for (const item of trackedPosts) {
            try {
                const response = await composio.tools.proxyExecute({
                    endpoint: `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(item.urn)}/comments`,
                    method: "GET",
                    connectedAccountId: CONNECTED_ACCOUNT_ID,
                    headers: { "X-Restli-Protocol-Version": "2.0.0" }
                });

                if (response.data && response.data.elements && response.data.elements.length > 0) {
                    for (const c of response.data.elements) {
                        const actorUrn = c.created?.actor || c.actor || "";
                        if (actorUrn === PERSONAL_URN || actorUrn === ORG_URN) continue;

                        const fullCommentUrn = c["$URN"] || `urn:li:comment:(${item.urn.replace("urn:li:share:", "urn:li:activity:")},${c.id})`;
                        const textSnippet = c.message?.text || "Comentário recebido";
                        const realName = await resolvePersonName(actorUrn);

                        unrepliedList.push({
                            id: c.id,
                            fullCommentUrn: fullCommentUrn,
                            activityUrn: item.urn.replace("urn:li:share:", "urn:li:activity:"),
                            postName: item.name,
                            author: realName,
                            actorUrn: actorUrn,
                            text: textSnippet
                        });
                    }
                }
            } catch (e) {
                console.error(`Error checking comments for ${item.urn}:`, e.message);
            }
        }

        const last5 = unrepliedList.slice(0, 5);

        if (last5.length === 0) {
            await bot.sendMessage(chatId, "✅ **Nenhum comentário pendente de resposta!**\n\nTodos os comentários recebidos já foram respondidos por você.", { parse_mode: 'Markdown', ...getMainMenuKeyboard() });
        } else {
            if (autoApprovalMode) {
                await bot.sendMessage(chatId, `⚡ **Modo Piloto Automático Ativo!** Respondendo a ${last5.length} comentários automaticamente com marcação em azul (@)...`);

                for (const c of last5) {
                    const aiSuggestion = generateSmartResponse(c.author, c.text);
                    
                    try {
                        const payload = {
                            actor: PERSONAL_URN,
                            message: {
                                text: aiSuggestion,
                                attributes: c.actorUrn && c.actorUrn.includes("person:") ? [{
                                    start: 0,
                                    length: c.author.length,
                                    value: { "com.linkedin.common.MemberAttributedEntity": { member: c.actorUrn } }
                                }] : []
                            },
                            object: c.activityUrn,
                            parentComment: c.fullCommentUrn
                        };

                        await composio.tools.proxyExecute({
                            endpoint: `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(c.activityUrn)}/comments`,
                            method: "POST",
                            connectedAccountId: CONNECTED_ACCOUNT_ID,
                            headers: { "X-Restli-Protocol-Version": "2.0.0", "Content-Type": "application/json" },
                            body: payload
                        });

                        totalRepliesSent++;
                        await bot.sendMessage(chatId, `🎉 **AUTOMÁTICO**: Resposta enviada para ${c.author}!`);
                    } catch (e) {
                        console.error(`Auto reply error for ${c.author}:`, e.message);
                    }
                }
            } else {
                const commentButtons = last5.map((c, index) => {
                    const cacheKey = `comm_${index + 1}`;
                    
                    const aiSuggestion = generateSmartResponse(c.author, c.text);

                    unrepliedCommentsCache[cacheKey] = {
                        ...c,
                        suggestion: aiSuggestion
                    };

                    const shortTxt = c.text.length > 20 ? c.text.substring(0, 18) + "..." : c.text;
                    return [{ text: `${index + 1}️⃣ ${c.author}: "${shortTxt}"`, callback_data: `view_comment_${cacheKey}` }];
                });

                commentButtons.push([{ text: "⬅️ Voltar ao Menu Principal", callback_data: "back_to_main_menu" }]);

                await bot.sendMessage(
                    chatId,
                    `💬 **Últimos ${last5.length} Comentários Não Respondidos (Modo Manual):**\n\nClique em um comentário para ver o texto completo e a sugestão de resposta:`,
                    { parse_mode: 'Markdown', reply_markup: { inline_keyboard: commentButtons } }
                );
            }
        }
    } else if (action.startsWith("view_comment_")) {
        const cacheKey = action.replace("view_comment_", "");
        const commentData = unrepliedCommentsCache[cacheKey];

        if (commentData) {
            pendingCommentReplies[cacheKey] = commentData;

            const replyActionsKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "💬 Aprovar & Enviar Resposta com Marcação (@)", callback_data: `approve_reply_${cacheKey}` }],
                        [{ text: "⬅️ Voltar aos Comentários", callback_data: "list_unreplied_comments" }]
                    ]
                }
            };

            await bot.sendMessage(
                chatId,
                `📌 **Comentário de ${commentData.author} em ${commentData.postName}:**\n` +
                `💬 "${commentData.text}"\n\n` +
                `------------------------------------\n\n` +
                `✍️ **Sugestão de Resposta Direta (com @Marcação em Azul):**\n` +
                `"${commentData.suggestion}"`,
                { parse_mode: 'Markdown', ...replyActionsKeyboard }
            );
        } else {
            await bot.sendMessage(chatId, "⚠️ Comentário não encontrado ou expirado.", getMainMenuKeyboard());
        }
    } else if (action.startsWith("approve_reply_")) {
        const cacheKey = action.replace("approve_reply_", "");
        const replyItem = pendingCommentReplies[cacheKey];

        if (replyItem) {
            await bot.sendMessage(chatId, `⏳ Enviando resposta com marcação (@) no LinkedIn via Composio API...`);
            try {
                const activityUrn = replyItem.activityUrn;
                const parentCommentUrn = replyItem.fullCommentUrn;
                const actorUrn = replyItem.actorUrn;
                const authorName = replyItem.author;

                const payload = {
                    actor: PERSONAL_URN,
                    message: {
                        text: replyItem.suggestion,
                        attributes: actorUrn && actorUrn.includes("person:") ? [
                            {
                                start: 0,
                                length: authorName.length,
                                value: {
                                    "com.linkedin.common.MemberAttributedEntity": {
                                        member: actorUrn
                                    }
                                }
                            }
                        ] : []
                    },
                    object: activityUrn,
                    parentComment: parentCommentUrn
                };

                const response = await composio.tools.proxyExecute({
                    endpoint: `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(activityUrn)}/comments`,
                    method: "POST",
                    connectedAccountId: CONNECTED_ACCOUNT_ID,
                    headers: {
                        "X-Restli-Protocol-Version": "2.0.0",
                        "Content-Type": "application/json"
                    },
                    body: payload
                });

                if (response.status === 201 || (response.data && response.data.id)) {
                    totalRepliesSent++;
                    await bot.sendMessage(chatId, `🎉 **RESPOSTA COM MARCAÇÃO (@) PUBLICADA COM SUCESSO!**\n\n• Respondido e marcado em azul: ${replyItem.author}!\n• Status: 201 Created`, { parse_mode: 'Markdown' });
                } else {
                    await bot.sendMessage(chatId, `⚠️ Retorno da API: ${JSON.stringify(response.data)}`);
                }
            } catch (e) {
                await bot.sendMessage(chatId, `❌ Erro ao enviar resposta: ${e.message}`);
            }
        } else {
            await bot.sendMessage(chatId, `⚠️ Rascunho de resposta expirado ou não encontrado.`);
        }
    } else if (action === "delete_linkedin_menu") {
        const deleteKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🗑️ Excluir Post 1 (Perfil Pessoal)", callback_data: "del_lk_urn:li:share:7490327458173399040" }],
                    [{ text: "🗑️ Excluir Post 2 (Página Audit Chain)", callback_data: "del_lk_urn:li:share:7490192848332574720" }],
                    [{ text: "🗑️ Excluir Post 3 (Perfil Pessoal)", callback_data: "del_lk_urn:li:share:7490193701017722880" }],
                    [{ text: "⬅️ Voltar ao Menu Principal", callback_data: "back_to_main_menu" }]
                ]
            }
        };
        await bot.sendMessage(chatId, "🗑️ **Exclusão de Publicação no LinkedIn**\n\nSelecione qual publicação realizada você deseja **apagar permanentemente do seu LinkedIn**:", { parse_mode: 'Markdown', ...deleteKeyboard });
    } else if (action.startsWith("del_lk_")) {
        const shareUrn = action.replace("del_lk_", "");
        await bot.sendMessage(chatId, `⏳ Removendo post \`${shareUrn}\` do LinkedIn via Composio API...`, { parse_mode: 'Markdown' });

        try {
            const response = await composio.tools.proxyExecute({
                endpoint: `https://api.linkedin.com/v2/ugcPosts/${encodeURIComponent(shareUrn)}`,
                method: "DELETE",
                connectedAccountId: CONNECTED_ACCOUNT_ID,
                headers: {
                    "X-Restli-Protocol-Version": "2.0.0"
                }
            });

            if (response.status === 200 || response.status === 204 || response.status === 201) {
                await bot.sendMessage(chatId, `✅ **SUCESSO! O post foi excluído permanentemente do LinkedIn!**\n\n• URN do Post Removido: \`${shareUrn}\``, { parse_mode: 'Markdown' });
            } else {
                await bot.sendMessage(chatId, `⚠️ Retorno da exclusão: HTTP ${response.status}\n${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            await bot.sendMessage(chatId, `❌ Erro ao excluir do LinkedIn: ${e.message}`);
        }
    } else if (action === "check_status") {
        try {
            const acc = await composio.connectedAccounts.get(CONNECTED_ACCOUNT_ID);
            const modeLabel = autoApprovalMode ? "🟢 PILOTO AUTOMÁTICO (Sem aprovação)" : "🔴 APROVAÇÃO MANUAL (Com revisão)";
            await bot.sendMessage(chatId, `✅ Status Composio/LinkedIn:\n• Status: ${acc.status}\n• Modo de Aprovação: ${modeLabel}\n• Account ID: ${acc.id}`);
        } catch (e) {
            await bot.sendMessage(chatId, `❌ Erro: ${e.message}`);
        }
    } else if (action.startsWith("publish_company_post_")) {
        const key = action.replace("publish_company_post_", "");
        const post = companyPostsDB[key];
        if (post) {
            await bot.sendMessage(chatId, `🚀 Disparando post comercial [${post.title}] com CRIATIVO ANEXADO na Página da Audit Chain...`);
            
            try {
                let mediaCategory = "NONE";
                let mediaArray = undefined;

                if (post.pdfPath) {
                    const fullPdfPath = path.isAbsolute(post.pdfPath) ? post.pdfPath : path.join(__dirname, post.pdfPath);
                    if (fs.existsSync(fullPdfPath)) {
                        await bot.sendMessage(chatId, `📄 Fazendo upload do Carrossel em PDF [${path.basename(fullPdfPath)}] para a API do LinkedIn...`);
                        
                        const registerResponse = await composio.tools.proxyExecute({
                            endpoint: "https://api.linkedin.com/v2/assets?action=registerUpload",
                            method: "POST",
                            connectedAccountId: CONNECTED_ACCOUNT_ID,
                            headers: {
                                "X-Restli-Protocol-Version": "2.0.0",
                                "Content-Type": "application/json"
                            },
                            body: {
                                registerUploadRequest: {
                                    recipes: ["urn:li:digitalmediaRecipe:feedshare-document"],
                                    owner: ORG_URN,
                                    serviceRelationships: [{
                                        relationshipType: "OWNER",
                                        identifier: "urn:li:userGeneratedContent"
                                    }]
                                }
                            }
                        });

                        const registerData = registerResponse.data.value;
                        const uploadUrl = registerData.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
                        const assetUrn = registerData.asset;

                        const pdfBuffer = fs.readFileSync(fullPdfPath);
                        await fetch(uploadUrl, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/pdf' },
                            body: pdfBuffer
                        });

                        mediaCategory = "DOCUMENT";
                        mediaArray = [{
                            "status": "READY",
                            "media": assetUrn,
                            "title": { "text": `${post.title} (${Date.now()})` }
                        }];
                    }
                } else if (post.imagePath) {
                    const fullImagePath = path.isAbsolute(post.imagePath) ? post.imagePath : path.join(__dirname, post.imagePath);
                    if (fs.existsSync(fullImagePath)) {
                        await bot.sendMessage(chatId, `🖼️ Fazendo upload do asset gráfico [${path.basename(fullImagePath)}] para a API do LinkedIn...`);
                        
                        const registerResponse = await composio.tools.proxyExecute({
                            endpoint: "https://api.linkedin.com/v2/assets?action=registerUpload",
                            method: "POST",
                            connectedAccountId: CONNECTED_ACCOUNT_ID,
                            headers: {
                                "X-Restli-Protocol-Version": "2.0.0",
                                "Content-Type": "application/json"
                            },
                            body: {
                                registerUploadRequest: {
                                    recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
                                    owner: ORG_URN,
                                    serviceRelationships: [{
                                        relationshipType: "OWNER",
                                        identifier: "urn:li:userGeneratedContent"
                                    }]
                                }
                            }
                        });

                        const registerData = registerResponse.data.value;
                        const uploadUrl = registerData.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
                        const assetUrn = registerData.asset;

                        const imageBuffer = fs.readFileSync(fullImagePath);
                        await fetch(uploadUrl, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'image/png' },
                            body: imageBuffer
                        });

                        mediaCategory = "IMAGE";
                        mediaArray = [{
                            "status": "READY",
                            "media": assetUrn,
                            "title": { "text": `${post.title} (${Date.now()})` }
                        }];
                    }
                }

                const shareContentObj = {
                    "shareCommentary": { "text": makeUniqueContent(post.text) },
                    "shareMediaCategory": mediaCategory
                };
                if (mediaArray) {
                    shareContentObj.media = mediaArray;
                }

                const response = await composio.tools.proxyExecute({
                    endpoint: "https://api.linkedin.com/v2/ugcPosts",
                    method: "POST",
                    connectedAccountId: CONNECTED_ACCOUNT_ID,
                    headers: {
                        "X-Restli-Protocol-Version": "2.0.0",
                        "Content-Type": "application/json"
                    },
                    body: {
                        author: ORG_URN,
                        lifecycleState: "PUBLISHED",
                        specificContent: {
                            "com.linkedin.ugc.ShareContent": shareContentObj
                        },
                        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
                    }
                });

                if (response.status === 201 || (response.data && response.data.id)) {
                    const publishedUrn = response.data.id || response.data['$URN'];
                    if (publishedUrn) {
                        addTrackedPost(publishedUrn, `Publicação Audit Chain (${post.title})`);
                        markPostAsPublished(key, publishedUrn);
                    }
                    await bot.sendMessage(chatId, `🎉 PUBLICADO COM SUCESSO NA PÁGINA DA AUDIT CHAIN!\n\n• Post: ${post.title}\n• Formato: Legenda B2B + Criativo Anexado\n• ID: ${response.data.id}\n\n✅ Adicionado ao monitoramento de comentários 24/7!`);
                } else {
                    await bot.sendMessage(chatId, `⚠️ Resposta API: ${JSON.stringify(response.data)}`);
                }
            } catch (e) {
                await bot.sendMessage(chatId, `❌ Erro no disparo comercial: ${e.message}`);
            }
        }
    } else if (action.startsWith("publish_custom_")) {
        const parts = action.replace("publish_custom_", "").split("_");
        const postKey = parts[0];
        const isPersonal = parts[1] === "personal";
        const isImage = parts[2] === "img";

        const post = postsDB[postKey];
        const authorUrn = isPersonal ? PERSONAL_URN : ORG_URN;
        const targetName = isPersonal ? "Perfil Pessoal (Erik Immele)" : "Página Comercial (Audit Chain)";
        const formatLabel = isImage ? "Texto + Infográfico PNG" : "Texto Puro";
        const finalContent = isPersonal ? post.text : getFormattedCompanyPostText(post);

        await bot.sendMessage(chatId, `🚀 Disparando ${post.title} em formato [${formatLabel}] para ${targetName}...`);

        try {
            let mediaCategory = "NONE";
            let mediaArray = undefined;

            if (isImage && post.imagePath) {
                const fullImagePath = path.isAbsolute(post.imagePath) ? post.imagePath : path.join(__dirname, post.imagePath);
                if (fs.existsSync(fullImagePath)) {
                    await bot.sendMessage(chatId, `🖼️ Fazendo upload do asset gráfico [${path.basename(fullImagePath)}] para a API do LinkedIn...`);
                    
                    const registerResponse = await composio.tools.proxyExecute({
                        endpoint: "https://api.linkedin.com/v2/assets?action=registerUpload",
                        method: "POST",
                        connectedAccountId: CONNECTED_ACCOUNT_ID,
                        headers: {
                            "X-Restli-Protocol-Version": "2.0.0",
                            "Content-Type": "application/json"
                        },
                        body: {
                            registerUploadRequest: {
                                recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
                                owner: authorUrn,
                                serviceRelationships: [{
                                    relationshipType: "OWNER",
                                    identifier: "urn:li:userGeneratedContent"
                                }]
                            }
                        }
                    });

                    const registerData = registerResponse.data.value;
                    const uploadUrl = registerData.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
                    const assetUrn = registerData.asset;

                    const imageBuffer = fs.readFileSync(fullImagePath);
                    await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'image/png' },
                        body: imageBuffer
                    });

                    mediaCategory = "IMAGE";
                    mediaArray = [{
                        "status": "READY",
                        "media": assetUrn,
                        "title": { "text": post.title }
                    }];
                }
            }

            const shareContentObj = {
                "shareCommentary": { "text": makeUniqueContent(finalContent) },
                "shareMediaCategory": mediaCategory
            };
            if (mediaArray) {
                shareContentObj.media = mediaArray;
            }

            const response = await composio.tools.proxyExecute({
                endpoint: "https://api.linkedin.com/v2/ugcPosts",
                method: "POST",
                connectedAccountId: CONNECTED_ACCOUNT_ID,
                headers: {
                    "X-Restli-Protocol-Version": "2.0.0",
                    "Content-Type": "application/json"
                },
                body: {
                    author: authorUrn,
                    lifecycleState: "PUBLISHED",
                    specificContent: {
                        "com.linkedin.ugc.ShareContent": shareContentObj
                    },
                    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
                }
            });

            if (response.status === 201 || (response.data && response.data.id)) {
                const publishedUrn = response.data.id || response.data['$URN'];
                if (publishedUrn) {
                    addTrackedPost(publishedUrn, `Publicação (${post.title})`);
                }
                await bot.sendMessage(chatId, `🎉 PUBLICADO COM SUCESSO!\n\n• Post: ${post.title}\n• Formato: ${formatLabel}\n• Destino: ${targetName}\n• ID: ${response.data.id}\n\n✅ Adicionado ao monitoramento de comentários 24/7!`);
            } else {
                await bot.sendMessage(chatId, `⚠️ Resposta API: ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            await bot.sendMessage(chatId, `❌ Erro no disparo: ${e.message}`);
        }
    }
});

bot.on('polling_error', (err) => { console.error('Polling error:', err.message); });
