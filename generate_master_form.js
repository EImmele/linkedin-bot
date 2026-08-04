const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } = require('docx');

const outputDir = "D:\\IA projects";
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function createMasterOnboardingDoc() {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: "FORMULÁRIO MESTRE DE CONFIGURAÇÃO DO SISTEMA & AGENTES DE IA",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    text: "Executive Authority Engine by Audit Chain - Mapeamento Completo de Setup",
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "1. DADOS DO CLIENTE & MARCA PESSOAL",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({ text: "• Nome Completo do Executivo: __________________________________________________" }),
                new Paragraph({ text: "• Cargo / Posição Atual: ______________________________________________________" }),
                new Paragraph({ text: "• Nome da Empresa / Organização: _____________________________________________" }),
                new Paragraph({ text: "• Segmento de Atuação (ex: Cibersegurança, GRC, Finchs, Saúde): __________________" }),
                new Paragraph({ text: "• Certificações a Destacar (ex: CISM, CISSP, CRISC, ISO 27001, COBIT): _____________" }),
                new Paragraph({ text: "• Perfil do LinkedIn (URL): ____________________________________________________" }),
                new Paragraph({ text: "• Página Comercial do LinkedIn (se aplicável): ____________________________________" }),
                new Paragraph({ text: "" }),

                new Paragraph({
                    text: "2. CONFIGURAÇÃO DOS AGENTES DE IA DA ESTEIRA",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "A. Agente CISO & Especialista Técnico (Gerador de Conceito)\n", bold: true }),
                        new TextRun("   - Frameworks e normas a priorizar (ex: ISACA Risk IT, NIST CSF, COBIT 2019, ISO 27001):\n     __________________________________________________________________________\n"),
                        new TextRun("   - Nível de profundidade técnica (1 a 5, onde 5 é ultra-técnico e 1 é executivo/board):\n     __________________________________________________________________________\n")
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "B. Agente Copywriter LinkedIn (Escrita & Dwell Time)\n", bold: true }),
                        new TextRun("   - Tom de Voz (ex: Provocativo e estratégico, pragmático e direto, analítico e formal):\n     __________________________________________________________________________\n"),
                        new TextRun("   - Estilo da 1ª Linha (Pergunta provocativa, estatística impactante ou história real):\n     __________________________________________________________________________\n"),
                        new TextRun("   - Idiomas das publicações (Português, Inglês ou Ambos):\n     __________________________________________________________________________\n")
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "C. Agente Designer & Identidade Visual (Infográficos PNG)\n", bold: true }),
                        new TextRun("   - Cores Principais da Marca Pessoal/Empresa (Hexadecimal ou nomes):\n     __________________________________________________________________________\n"),
                        new TextRun("   - Estilo Visual (Dark Mode elegante, Glassmorphism moderno ou Clean Corporativo):\n     __________________________________________________________________________\n")
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "D. Agente de Resposta a Comentários (Persona Golden Rule)\n", bold: true }),
                        new TextRun("   - Regra de Ouro: Falar 100% na 1ª pessoa do singular (NUNCA admitir ser IA).\n"),
                        new TextRun("   - Marcação em Azul (@Mention): Ativada obrigatoriamente nas respostas.\n"),
                        new TextRun("   - Nível de cordialidade e fechamento (ex: Sempre terminar com uma pergunta de engajamento):\n     __________________________________________________________________________\n")
                    ]
                }),
                new Paragraph({ text: "" }),

                new Paragraph({
                    text: "3. PILARES DE CONTEÚDO & TEMAS CHAVE",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({ text: "Selecione os 4 pilares estratégicos de conteúdo do seu perfil:" }),
                new Paragraph({ text: "[  ] Tradução de Riscos de TI para Linguagem Financeira/Board (Risk IT)" }),
                new Paragraph({ text: "[  ] Continuidade de Negócios & Análise de Impacto (BCM / BIA / RTO / RPO)" }),
                new Paragraph({ text: "[  ] Segurança da Informação como Habilitadora de Negócios (Business Enabler)" }),
                new Paragraph({ text: "[  ] Gestão de Riscos em Terceiros & Cadeia de Suprimentos (TPRM)" }),
                new Paragraph({ text: "[  ] Resposta a Incidentes Cibernéticos & Gestão de Crises" }),
                new Paragraph({ text: "[  ] Governança de Inteligência Artificial & IA Responsável (AI Governance)" }),
                new Paragraph({ text: "[  ] Outros temas customizados: ________________________________________________" }),
                new Paragraph({ text: "" }),

                new Paragraph({
                    text: "4. FREQUÊNCIA & CALENDÁRIO DE DISPAROS",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({ text: "• Frequência semanal desejada: (  ) 2x por semana  (  ) 3x por semana  (  ) 5x por semana" }),
                new Paragraph({ text: "• Dias preferenciais de publicação: (  ) Terça  (  ) Quarta  (  ) Quinta  (  ) Sexta" }),
                new Paragraph({ text: "• Horário de preferência para publicação: (  ) 08:30 AM  (  ) 09:45 AM  (  ) 11:30 AM  (  ) 17:30 PM" }),
                new Paragraph({ text: "" }),

                new Paragraph({
                    text: "5. INTEGRÁVEIS E CANAIS DE CONTROLE",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({ text: "• @Username do Telegram do Executivo (para receber o Bot de Aprovação): _________________" }),
                new Paragraph({ text: "• Autorização de Conexão LinkedIn (Link de 1 clique Composio OAuth enviado após envio): OK" })
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(outputDir, "Formulario_Mestre_Configuracao_Sistema_e_Agentes.docx"), buffer);
    console.log("✅ Formulário Mestre Word gerado em D:\\IA projects\\Formulario_Mestre_Configuracao_Sistema_e_Agentes.docx");
}

createMasterOnboardingDoc();
