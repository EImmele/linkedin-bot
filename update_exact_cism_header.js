const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

const outputDir = "D:\\IA projects";

const fixedCismMessage = `Olá pessoal, Como parte da minha preparação para o exame de certificação CISM da ISACA, estou compartilhando reflexões práticas (e reais) que conectam minha experiência no mercado com o conhecimento adquirido nesta jornada.`;

const updatedPosts = {
    post1: {
        filename: "Post_01_Gestao_de_Riscos_GRC_ISACA.docx",
        title: "Post 01 - Gestão de Riscos (Risk IT / ISACA)",
        question: "Como é feita a tradução dos riscos de TI para a linguagem de negócios na sua organização?",
        body: `O Board não toma decisões com base em "risco alto", "médio" ou "baixo".

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
    post3: {
        filename: "Post_03_Seguranca_da_Informacao_ErikImmele.docx",
        title: "Post 03 - Segurança como Habilitadora (CISM)",
        question: "A equipe de Segurança da Informação da sua empresa é vista como uma parceira estratégica ou como o departamento do \"não\"?",
        body: `Por muitos anos, a Segurança da Informação atuou exclusivamente como uma força policial dentro das organizações — bloqueando acessos, criando burocracias e travando a inovação para evitar riscos a qualquer custo.

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
        filename: "Post_04_Gestao_de_Riscos_em_Terceiros_TPRM_Bilingue.docx",
        title: "Post 04 - Riscos em Terceiros (TPRM)",
        question: "Como a sua organização garante a segurança dos dados quando um fornecedor crítico é comprometido?",
        body: `O vazamento de dados de um fornecedor estratégico é, hoje, uma das maiores causas de incidentes graves em grandes empresas.

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
        filename: "Post_05_Gestao_de_Incidentes_CISM_ISACA.docx",
        title: "Post 05 - Gestão de Incidentes (CISM Domínio 4)",
        question: "Quando ocorre um vazamento crítico de dados, a sua equipe tem um plano de resposta testado ou o caos toma conta das primeiras 2 horas?",
        body: `Em uma crise cibernética real, a falta de um plano de gestão de incidentes estruturado faz com que o tempo precioso de contenção seja perdido em reuniões de alinhamento e decisões improvisadas.

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

async function main() {
    for (const key of Object.keys(updatedPosts)) {
        const item = updatedPosts[key];
        const fullPostText = `${item.question}\n\n${fixedCismMessage}\n\n${item.body}`;

        const paragraphs = [
            new Paragraph({
                text: item.title,
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.LEFT,
            }),
            new Paragraph({ text: "" })
        ];

        for (const line of fullPostText.split('\n')) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: line, size: 24 })]
            }));
        }

        const doc = new Document({
            sections: [{ properties: {}, children: paragraphs }],
        });

        const filePath = path.join(outputDir, item.filename);
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(filePath, buffer);
        console.log(`Updated Word doc with exact ordering: ${filePath}`);
    }
}

main();
