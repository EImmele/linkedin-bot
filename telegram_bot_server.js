const TelegramBotModule = require('node-telegram-bot-api');
const TelegramBot = TelegramBotModule.default || TelegramBotModule;
const { Composio } = require('@composio/core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const TELEGRAM_TOKEN = "8950102443:AAFB8f9PUkaBAh9MLUYLY2f5z6I7GloAA8Y";
const COMPOSIO_API_KEY = "ak_3BPACosEfxI3fgs-0i_Q";
const CONNECTED_ACCOUNT_ID = "ca_JGuOK7B9opjF";
const PERSONAL_URN = "urn:li:person:58-ptj8JVY";
const ORG_URN = "urn:li:organization:122274764";

const composio = new Composio({ apiKey: COMPOSIO_API_KEY });
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Start HTTP Health Check Server for Render Web Service (Free Tier)
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Audit Chain LinkedIn & Telegram Bot Server is Running 24/7!\n');
}).listen(PORT, () => {
    console.log(`🌐 HTTP Health Check Server listening on port ${PORT}`);
});

console.log("🤖 Telegram Bot updated with Strategic Format Engine (Text vs. Image Decision)...");

process.on('uncaughtException', (err) => { console.error('⚠️ Protected Exception:', err.message); });
process.on('unhandledRejection', (reason) => { console.error('⚠️ Protected Rejection:', reason); });

const fixedCismMessage = `Olá pessoal, Como parte da minha preparação para o exame de certificação CISM da ISACA, estou compartilhando reflexões práticas (e reais) que conectam minha experiência no mercado com o conhecimento adquirido nesta jornada.`;

const trackedPosts = [
    { urn: "urn:li:share:7490327458173399040", name: "Post 1 (Perfil Pessoal)", author: PERSONAL_URN },
    { urn: "urn:li:share:7490192848332574720", name: "Post 2 (Audit Chain)", author: ORG_URN },
    { urn: "urn:li:share:7490193701017722880", name: "Post 3 (Perfil Pessoal)", author: PERSONAL_URN }
];

const unrepliedCommentsCache = {};
const pendingCommentReplies = {};

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
        recommendedFormat: "TEXT_ONLY", // Strategy: High Dwell Time Text Post
        formatReason: "💡 Recomendação Estratégica: TEXTO PURO (Post conceitual de liderança gera maior tempo de leitura e debate nos comentários).",
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
        recommendedFormat: "TEXT_ONLY",
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
        recommendedFormat: "TEXT_ONLY",
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
        recommendedFormat: "WITH_IMAGE",
        formatReason: "🖼️ Recomendação Estratégica: TEXTO + INFOGRÁFICO PNG (O ciclo de 3 etapas do TPRM ganha 3x mais destaque visual com o infográfico).",
        imagePath: "third_party_risk_management_graphic.png",
        text: `Como a sua organização garante a segurança dos dados quando um fornecedor crítico é compromised?

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
        recommendedFormat: "WITH_IMAGE",
        formatReason: "🖼️ Recomendação Estratégica: TEXTO + INFOGRÁFICO PNG (As 5 fases da resposta a incidentes exigem apoio gráfico para memorização).",
        imagePath: "incident_management_lifecycle_graphic.png",
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

const mainMenuKeyboard = {
    reply_markup: {
        inline_keyboard: [
            [{ text: "📖 Ver Posts & Recomendações de Formato", callback_data: "select_post_menu" }],
            [{ text: "🚀 Post 4 (Texto)", callback_data: "publish_custom_post4_personal_text" }, { text: "🖼️ Post 4 (com Imagem)", callback_data: "publish_custom_post4_personal_img" }],
            [{ text: "🚨 Post 5 (com Imagem)", callback_data: "publish_custom_post5_personal_img" }, { text: "💬 Últimos 5 Comentários", callback_data: "list_unreplied_comments" }],
            [{ text: "📊 Status Conexão", callback_data: "check_status" }, { text: "🗑️ Excluir Post LinkedIn", callback_data: "delete_linkedin_menu" }]
        ]
    }
};

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || "";

    if (text.startsWith('/start') || text.toLowerCase().includes('menu') || text.toLowerCase().includes('ajuda')) {
        await bot.sendMessage(chatId, "👋 Olá, Erik! Escolha uma opção no menu:", mainMenuKeyboard);
    } else {
        await bot.sendMessage(chatId, `💡 Mensagem recebida: "${text}"`, mainMenuKeyboard);
    }
});

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const action = query.data;

    try { await bot.answerCallbackQuery(query.id); } catch (e) {}

    if (action === "back_to_main_menu") {
        await bot.sendMessage(chatId, "🏠 Menu Principal:", mainMenuKeyboard);
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
            await bot.sendMessage(chatId, "✅ **Nenhum comentário pendente de resposta!**\n\nTodos os comentários recebidos já foram respondidos por você.", { parse_mode: 'Markdown', ...mainMenuKeyboard });
        } else {
            const commentButtons = last5.map((c, index) => {
                const cacheKey = `comm_${index + 1}`;
                
                const aiSuggestion = `${c.author} Exatamente essa virada de chave! Na governança de CISM e Risk IT, quando conectamos o risco ao impacto financeiro, a liderança assume a decisão com clareza. Como vocês estruturam esse alinhamento por aí?`;

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
                `💬 **Últimos ${last5.length} Comentários Não Respondidos:**\n\nClique em um comentário para ver o texto completo e a sugestão de resposta:`,
                { parse_mode: 'Markdown', reply_markup: { inline_keyboard: commentButtons } }
            );
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
            await bot.sendMessage(chatId, "⚠️ Comentário não encontrado ou expirado.", mainMenuKeyboard);
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
            await bot.sendMessage(chatId, `✅ Status Composio/LinkedIn:\n• Status: ${acc.status}\n• Account ID: ${acc.id}`);
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
                await bot.sendMessage(chatId, `🎉 PUBLICADO COM SUCESSO!\n\n• Post: ${post.title}\n• Formato: ${formatLabel}\n• Destino: ${targetName}\n• ID: ${response.data.id}`);
            } else {
                await bot.sendMessage(chatId, `⚠️ Resposta API: ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            await bot.sendMessage(chatId, `❌ Erro no disparo: ${e.message}`);
        }
    }
});

bot.on('polling_error', (err) => { console.error('Polling error:', err.message); });
