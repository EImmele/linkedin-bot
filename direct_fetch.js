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

async function publish() {
    try {
        console.log("Calling Composio API directly without connected_account_id...");
        const response = await fetch("https://backend.composio.dev/api/v3.1/tools/execute/LINKEDIN_CREATE_ARTICLE_OR_URL_SHARE", {
            method: "POST",
            headers: {
                "x-api-key": "ak_3BPACosEfxI3fgs-0i_Q",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                entity_id: "default",
                arguments: {
                    author: "urn:li:organization:122274764",
                    visibility: {
                        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                    },
                    lifecycleState: "PUBLISHED",
                    specificContent: {
                        "com.linkedin.ugc.ShareContent": {
                            "shareCommentary": {
                                "text": postText
                            },
                            "shareMediaCategory": "NONE",
                            "media": []
                        }
                    }
                }
            })
        });

        const resData = await response.json();
        console.log("Composio API Response Status:", response.status);
        console.log("Composio API Response Body:", JSON.stringify(resData, null, 2));
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

publish();
