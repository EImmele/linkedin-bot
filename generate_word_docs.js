const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

const outputDir = "D:\\IA projects";

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const postsData = [
    {
        filename: "Post_01_Gestao_de_Riscos_GRC_ISACA.docx",
        title: "Post 01 - Gestão de Riscos (GRC & ISACA Risk IT)",
        target: "Perfil Pessoal ou Empresa (Português)",
        content: `Como é feita a tradução dos riscos de TI para a linguagem de negócios na sua organização?

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
    {
        filename: "Post_02_Continuidade_de_Negocios_BCM_AuditChain.docx",
        title: "Post 02 - Continuidade de Negócios & BIA (COBIT 2019 DSS04)",
        target: "Publicado na Página Audit Chain (urn:li:organization:122274764)",
        content: `Sua empresa saberia exatamente qual sistema restaurar primeiro se a operação inteira caísse agora?

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

Quando o BIA orienta a Continuidade de Negócios, a TI deixa de adivinhar prioridades e passa a proteger a sobrevivência do negócio.`
    },
    {
        filename: "Post_03_Seguranca_da_Informacao_ErikImmele.docx",
        title: "Post 03 - Segurança da Informação como Business Enabler (CISM & ISACA)",
        target: "Publicado no Perfil Pessoal Erik Immele (urn:li:person:58-ptj8JVY)",
        content: `A Segurança da Informação da sua empresa é vista como uma habilitadora de negócios ou como a "polícia que diz não"?

Durante anos, a Segurança foi tratada como um centro de custo burocrático, cuja função principal era impor restrições, bloquear ferramentas e desacelerar a operação em nome da proteção.

Segundo a visão de governança da ISACA (fundamentada na certificação CISM e no COBIT 2019), a Segurança da Informação moderna só é eficiente quando atua como Business Enabler (Habilitadora do Negócio).

Para migrar do modelo punitivo para o modelo estratégico, o CISM/ISACA orienta três mudanças fundamentais de maturidade:

1. Alinhamento com os Objetivos de Negócio
Segurança não existe para proteger a tecnologia por si só, mas para proteger os objetivos estratégicos da organização. Se um controle de segurança impede a empresa de inovar ou fechar um contrato relevante, o controle está mal desenhado.

2. Matriz de Controles proporcional ao Risco
Aplicar o mesmo nível de rigidez para todos os processos gera atrito desnecessário. A governança da ISACA exige que os controles sejam calibrados de acordo com a criticidade real de cada ativo e a tolerância a perdas da organização.

3. Indicadores de Valor e Resiliência
Em vez de medir apenas o número de ataques bloqueados (métrica operacional), a liderança de segurança deve reportar a velocidade de recuperação de incidentes, o índice de maturidade da cultura de segurança dos colaboradores e a redução do risco residual.

Quando a Segurança da Informação é gerida com foco em governança, ela deixa de ser uma barreira e passa a ser um diferencial competitivo que gera confiança no mercado.`
    },
    {
        filename: "Post_04_Gestao_de_Riscos_em_Terceiros_TPRM_Bilingue.docx",
        title: "Post 04 - Gestão de Riscos em Terceiros / TPRM (ISACA Risk IT)",
        target: "Versão Português (Perfil) & Versão Inglês (Audit Chain Global)",
        content: `=== VERSÃO EM PORTUGUÊS (Perfil Pessoal / Brasil) ===

Como a sua organização garante a segurança dos dados quando um fornecedor crítico é comprometido?

O vazamento de dados de um fornecedor estratégico é, hoje, uma das maiores causas de incidentes graves em grandes empresas.

Segundo o Risk IT Framework da ISACA, o gerenciamento de riscos de terceiros (TPRM) não se resume a enviar um questionário genérico de conformidade uma vez por ano.

Para que a Gestão de Riscos em Terceiros funcione na prática, a ISACA orienta três etapas essenciais:

1. Classificação de Criticidade dos Fornecedores
Nem todo fornecedor requer o mesmo nível de auditoria. A profundidade da avaliação deve ser proporcional ao nível de acesso que o terceiro possui aos dados e sistemas críticos da empresa.

2. Requisitos de Continuidade e Segurança em Contrato
Exigir SLA de notificação de incidentes, planos de resposta a crises e cláusulas de auditoria antes da assinatura do contrato.

3. Monitoramento Contínuo de KRIs
Avaliar continuamente os indicadores de risco de segurança e conformidade do fornecedor durante todo o ciclo de vida da parceria, e não apenas no onboarding.

Quando a governança de terceiros é integrada à gestão de riscos da empresa, a cadeia de suprimentos deixa de ser um ponto cego.


=== ENGLISH VERSION (Audit Chain Global Page) ===

How does your organization ensure data security when a critical third-party vendor is compromised?

Third-party data breaches are currently one of the leading causes of major security incidents in enterprise organizations.

According to the ISACA Risk IT Framework, Third-Party Risk Management (TPRM) is far more than sending a generic annual compliance questionnaire.

To make Third-Party Risk Management effective in practice, ISACA highlights three core pillars:

1. Vendor Criticality Classification
Not all vendors require the same audit depth. Security assessments must be proportional to the vendor's level of access to critical systems and sensitive data.

2. Contractual Security & Continuity Requirements
Mandate incident notification SLAs, crisis response requirements, and right-to-audit clauses before signing vendor contracts.

3. Continuous KRI Monitoring
Continuously track security and compliance risk indicators throughout the vendor lifecycle, rather than relying solely on onboarding checks.

When third-party governance is embedded into enterprise risk management, the supply chain ceases to be a strategic blind spot.`
    }
];

async function createDocx(post) {
    const lines = post.content.split('\n');
    const paragraphs = [
        new Paragraph({
            text: post.title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
            children: [
                new TextRun({ text: `Canal / Status: `, bold: true }),
                new TextRun({ text: post.target, italic: true })
            ]
        }),
        new Paragraph({ text: "" })
    ];

    for (const line of lines) {
        paragraphs.push(new Paragraph({
            children: [new TextRun({ text: line, size: 24 })]
        }));
    }

    const doc = new Document({
        sections: [{
            properties: {},
            children: paragraphs,
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    const filePath = path.join(outputDir, post.filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved: ${filePath}`);
}

async function main() {
    console.log("Generating Word (.docx) documents in D:\\IA projects...");
    for (const post of postsData) {
        await createDocx(post);
    }
    console.log("All Word documents generated successfully!");
}

main();
