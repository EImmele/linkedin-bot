const { Composio } = require('@composio/core');
const composio = new Composio({ apiKey: "ak_3BPACosEfxI3fgs-0i_Q" });

const postText = `Sua empresa saberia exatamente qual sistema restaurar primeiro se a operação inteira caísse agora?

Na maioria dos incidentes graves, o desastre não é a falha tecnológica em si, mas a falta de priorização sobre o que deve voltar a funcionar primeiro.

Segundo a ISACA (framework COBIT 2019 - DSS04), o coração da Continuidade de Negócios não é a tecnologia do backup, mas o BIA (Business Impact Analysis).

Sem um BIA bem executado, ocorrem dois erros extremamente caros:

1. Tentar restaurar tudo ao mesmo tempo
Isso sobrecarrega as equipes de TI, gera caos de comunicação e estende o tempo de indisponibilidade das áreas que realmente faturam.

2. Definir prioridades com base em "quem grita mais alto"
Em uma crise, cada departamento acha que o seu sistema é o mais importante. O BIA substitui a opinião pelo impacto financeiro e operacional real.

Para estruturar um plano de continuidade eficaz sob a ótica de GRC, a ISACA orienta três etapas fundamentais:

• Mapear Processos Críticos x Dependências de TI: Saber exatamente quais sistemas sustentam a entrega de valor vital da organização.
• Estabelecer RTO e RPO Reais com o Negócio: Definir quanto tempo de parada a empresa tolera (RTO) e quanta perda de dados é aceitável (RPO) antes de sofrer prejuízos irreversíveis.
• Testar Cenários de Desastre sob Pressão: Um plano de continuidade que nunca foi testado na prática é apenas um documento teórico.

Quando o BIA orienta a Continuidade de Negócios, a TI deixa de adivinhar prioridades e passa a proteger a sobrevivência do negócio.`;

async function main() {
    try {
        console.log("Fetching account credentials from Composio...");
        const acc = await composio.connectedAccounts.get("ca_JGuOK7B9opjF");
        const accessToken = acc.data.access_token;
        console.log("Access Token retrieved successfully!");

        const payload = {
            author: "urn:li:organization:122274764",
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": postText
                    },
                    "shareMediaCategory": "NONE"
                }
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        };

        console.log("Sending POST to LinkedIn API (https://api.linkedin.com/v2/ugcPosts)...");
        const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0"
            },
            body: JSON.stringify(payload)
        });

        const resText = await res.text();
        console.log("LinkedIn API Status:", res.status);
        console.log("LinkedIn API Response:", resText);
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
