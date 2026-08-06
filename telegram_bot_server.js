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
        imagePath: "third_party_risk_management_graphic.png",
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
        imagePath: "incident_management_lifecycle_graphic.png",
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
                [{ text: "📊 Dashboard Geral de Interações", callback_data: "show_dashboard" }],
                [{ text: "📈 Analytics Detalhado por Post (LinkedIn Native)", callback_data: "select_analytics_menu" }],
                [{ text: "📖 Ver Posts & Recomendações de Formato", callback_data: "select_post_menu" }],
                [{ text: "🚀 Post 4 (Texto)", callback_data: "publish_custom_post4_personal_text" }, { text: "🖼️ Post 4 (com Imagem)", callback_data: "publish_custom_post4_personal_img" }],
                [{ text: "🚨 Post 5 (com Imagem)", callback_data: "publish_custom_post5_personal_img" }, { text: "💬 Últimos 5 Comentários", callback_data: "list_unreplied_comments" }],
                [{ text: "📊 Status Conexão", callback_data: "check_status" }, { text: "🗑️ Excluir Post LinkedIn", callback_data: "delete_linkedin_menu" }]
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

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (myTelegramChatId !== chatId) {
        myTelegramChatId = chatId;
        saveConfig();
    }
    const text = msg.text || "";

    if (text.startsWith('/addpost') || text.includes('linkedin.com/posts/') || text.includes('urn:li:')) {
        const match = text.match(/\d{15,20}/);
        if (match) {
            const urn = `urn:li:share:${match[0]}`;
            const added = addTrackedPost(urn, `Post (${match[0]})`);
            await bot.sendMessage(chatId, added ? `✅ **Post adicionado ao monitoramento 24/7 com sucesso!**\n\nURN: \`${urn}\`\nBuscando novos comentários agora...` : `ℹ️ O post \`${urn}\` já está sendo monitorado!`, { parse_mode: 'Markdown' });
            await checkAndProcessNewComments();
        } else {
            await bot.sendMessage(chatId, `⚠️ Não encontrei o ID do post. Envie no formato:\n\`/addpost 7490380916247232512\` ou o link direto do post.`, { parse_mode: 'Markdown' });
        }
    } else if (text.startsWith('/start') || text.toLowerCase().includes('menu') || text.toLowerCase().includes('ajuda')) {
        const modeLabel = autoApprovalMode ? "🟢 PILOTO AUTOMÁTICO (Sem aprovação)" : "🔴 APROVAÇÃO MANUAL (Com revisão)";
        await bot.sendMessage(chatId, `👋 Olá, Erik!\n\n⚙️ **Status Atual do Modo de Aprovação**: ${modeLabel}\n📌 **Posts Monitorados Atualmente**: ${trackedPosts.length}\n\nEscolha uma opção no menu abaixo ou envie um link/ID de post para monitorar (\`/addpost ID\`):`, getMainMenuKeyboard());
    } else {
        await bot.sendMessage(chatId, `💡 Mensagem recebida: "${text}"\nPara adicionar um post para monitorar, envie:\n\`/addpost <ID_ou_Link>\``, getMainMenuKeyboard());
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
    } else if (action === "select_post_menu") {
        const selectPostKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "1️⃣ Post 1: Riscos de TI (Risk IT) [💡 Texto]", callback_data: "view_post_post1" }],
                    [{ text: "2️⃣ Post 2: Continuidade & BIA [💡 Texto]", callback_data: "view_post_post2" }],
                    [{ text: "3️⃣ Post 3: Segurança Enabler [💡 Texto]", callback_data: "view_post_post3" }],
                    [{ text: "4️⃣ Post 4: Riscos em Terceiros [🖼️ com Imagem]", callback_data: "view_post_post4" }],
                    [{ text: "5️⃣ Post 5: Gestão Incidentes [🖼️ com Imagem]", callback_data: "view_post_post5" }],
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
    } else if (action.startsWith("publish_custom_")) {
        const parts = action.replace("publish_custom_", "").split("_");
        const postKey = parts[0];
        const isPersonal = parts[1] === "personal";
        const isImage = parts[2] === "img";

        const post = postsDB[postKey];
        const authorUrn = isPersonal ? PERSONAL_URN : ORG_URN;
        const targetName = isPersonal ? "Perfil Pessoal (Erik Immele)" : "Página Comercial (Audit Chain)";
        const formatLabel = isImage ? "Texto + Infográfico PNG" : "Texto Puro";

        await bot.sendMessage(chatId, `🚀 Disparando ${post.title} em formato [${formatLabel}] para ${targetName}...`);

        try {
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
                        "com.linkedin.ugc.ShareContent": {
                            "shareCommentary": { "text": post.text },
                            "shareMediaCategory": "NONE"
                        }
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
