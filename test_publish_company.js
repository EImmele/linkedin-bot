const { Composio } = require('@composio/core');
const composio = new Composio({ apiKey: "ak_3BPACosEfxI3fgs-0i_Q" });

const CONNECTED_ACCOUNT_ID = "ca_JGuOK7B9opjF";
const ORG_URN = "urn:li:organization:122274764";

const fixedCismMessage = `Olá pessoal, Como parte da minha preparação para o exame de certificação CISM da ISACA, estou compartilhando reflexões práticas (e reais) que conectam minha experiência no mercado com o conhecimento adquirido nesta jornada.`;

const postText = `Como a sua organização garante a segurança dos dados quando um fornecedor crítico é comprometido?

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

Quando a governança de terceiros é integrada à gestão de riscos da empresa, a cadeia de suprimentos deixa de ser um ponto cego.`;

async function publishToCompanyPage() {
    console.log("🚀 Executing live test: Publishing Post 4 to Audit Chain Company Page...");
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
                author: ORG_URN,
                lifecycleState: "PUBLISHED",
                specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": { "text": postText },
                        "shareMediaCategory": "NONE"
                    }
                },
                visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
            }
        });

        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.error("Error publishing to company page:", e);
    }
}

publishToCompanyPage();
