const post1Text = `Como é feita a tradução dos riscos de TI para a linguagem de negócios na sua organização?

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

Quando a Gestão de Riscos deixa de ser um checklist burocrático e passa a traduzir ameaças técnicas em linguagem financeira e estratégica, a governança ganha assento definitivo na tomada de decisão.`;

async function publish() {
    try {
        console.log("Publishing Post 1 via direct fetch to Composio...");
        const response = await fetch("https://backend.composio.dev/api/v3.1/tools/execute/LINKEDIN_CREATE_ARTICLE_OR_URL_SHARE", {
            method: "POST",
            headers: {
                "x-api-key": "ak_3BPACosEfxI3fgs-0i_Q",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                connected_account_id: "ca_JGuOK7B9opjF",
                arguments: {
                    author: "urn:li:person:58-ptj8JVY",
                    visibility: {
                        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                    },
                    lifecycleState: "PUBLISHED",
                    specificContent: {
                        "com.linkedin.ugc.ShareContent": {
                            "shareCommentary": {
                                "text": post1Text
                            },
                            "shareMediaCategory": "NONE",
                            "media": []
                        }
                    }
                }
            })
        });

        const resData = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(resData, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

publish();
