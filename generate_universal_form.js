const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } = require('docx');

const outputDir = "D:\\IA projects\\Linkedin Bot\\Comercial";
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function createUniversalMasterOnboardingDoc() {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: "FORMULÁRIO MESTRE UNIVERSAL DE ONBOARDING & SETUP DE IA",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    text: "Executive Authority Engine - Aplicável a Qualquer Nicho de Mercado",
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "" }),

                new Paragraph({ text: "1. DADOS DO CLIENTE & INDÚSTRIA", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "• Nome Completo do Profissional / Executivo: ______________________________________" }),
                new Paragraph({ text: "• Cargo / Posição: ___________________________________________________________" }),
                new Paragraph({ text: "• Nome da Empresa / Consultoria / Escritório: ____________________________________" }),
                new Paragraph({ text: "• Área / Indústria de Atuação: (  ) Direito  (  ) Medicina/Saúde  (  ) Finanças/CFO  (  ) TI/Cibersegurança  (  ) Engenharia/Imobiliário  (  ) Marketing/Vendas  (  ) Outro: _________________" }),
                new Paragraph({ text: "• Principais Títulos / Credenciais / Registros (ex: OAB, CRM, MBA, PhD, Certificações): __________________________________________________________________________" }),
                new Paragraph({ text: "• Link do Perfil do LinkedIn: __________________________________________________" }),
                new Paragraph({ text: "• Link da Página Comercial no LinkedIn (opcional): _______________________________" }),
                new Paragraph({ text: "" }),

                new Paragraph({ text: "2. CONFIGURAÇÃO DO AGENTE ESPECIALISTA DO SEU NICHO", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "• Quais são as principais leis, normas, metodologias ou autores de referência da sua área que a IA deve usar como base?" }),
                new Paragraph({ text: "  __________________________________________________________________________" }),
                new Paragraph({ text: "• Qual o nível de profundidade técnica desejado para os posts? (1 a 5)" }),
                new Paragraph({ text: "  (  ) 1 - Linguagem simples e acessível para o público geral" }),
                new Paragraph({ text: "  (  ) 3 - Linguagem executiva equilibrada (Recomendado)" }),
                new Paragraph({ text: "  (  ) 5 - Ultra-técnico e especializado para pares da mesma profissão" }),
                new Paragraph({ text: "" }),

                new Paragraph({ text: "3. CONFIGURAÇÃO DO AGENTE COPYWRITER & TOM DE VOZ", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "• Qual o tom de voz predominante que reflete sua personalidade?" }),
                new Paragraph({ text: "  (  ) Provocativo & Estratégico (Desafia consensos do mercado)" }),
                new Paragraph({ text: "  (  ) Pragmático & Orientado a Resultados (Direto ao ponto com números)" }),
                new Paragraph({ text: "  (  ) Educacional & Didático (Explica conceitos complexos com clareza)" }),
                new Paragraph({ text: "  (  ) Inspirador & Humanizado (Conta histórias de carreira e aprendizados)" }),
                new Paragraph({ text: "• Idioma dos posts: (  ) Português  (  ) Inglês  (  ) Ambos" }),
                new Paragraph({ text: "" }),

                new Paragraph({ text: "4. CONFIGURAÇÃO DO AGENTE DESIGNER (INFOGRÁFICOS EM PNG)", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "• Cores da sua Marca Pessoal ou Empresa:" }),
                new Paragraph({ text: "  - Cor Principal: ___________________  - Cor de Destaque: ___________________" }),
                new Paragraph({ text: "• Estilo Visual Desejado:" }),
                new Paragraph({ text: "  (  ) Dark Mode Premium & Sofisticado" }),
                new Paragraph({ text: "  (  ) Clean & Corporativo (Fundo Claro)" }),
                new Paragraph({ text: "  (  ) Minimalista & Elegante" }),
                new Paragraph({ text: "" }),

                new Paragraph({ text: "5. CONFIGURAÇÃO DA PERSONA DE ENGAJAMENTO (COMENTÁRIOS)", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "• Regra de Ouro: A IA responderá comentários estritamente na 1ª pessoa no seu estilo." }),
                new Paragraph({ text: "• Ativação de @Mention em Azul: Ativada por padrão para marcar quem comentou." }),
                new Paragraph({ text: "• Objetivo ao responder comentários:" }),
                new Paragraph({ text: "  (  ) Estimular o debate fazendo uma nova pergunta de volta ao leitor" }),
                new Paragraph({ text: "  (  ) Agradecer e validar a opinião de forma cordial e executiva" }),
                new Paragraph({ text: "" }),

                new Paragraph({ text: "6. DEFINIÇÃO DOS 4 PILARES DE CONTEÚDO DO SEU NICHO", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "Escreva os 4 assuntos principais que você deseja que a IA aborde nas suas redes:" }),
                new Paragraph({ text: "1. Pilar 1: __________________________________________________________________" }),
                new Paragraph({ text: "2. Pilar 2: __________________________________________________________________" }),
                new Paragraph({ text: "3. Pilar 3: __________________________________________________________________" }),
                new Paragraph({ text: "4. Pilar 4: __________________________________________________________________" }),
                new Paragraph({ text: "" }),

                new Paragraph({ text: "7. FREQUÊNCIA, HORÁRIOS & CANAIS DE DISPARO", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "• Frequência semanal: (  ) 2x por semana  (  ) 3x por semana  (  ) 5x por semana" }),
                new Paragraph({ text: "• Dias preferenciais: (  ) Terça  (  ) Quarta  (  ) Quinta  (  ) Sexta" }),
                new Paragraph({ text: "• Horário de publicação: (  ) 08:30  (  ) 09:45  (  ) 11:30  (  ) 17:30" }),
                new Paragraph({ text: "• @username do Telegram (para aprovações móveis em 1 clique): ____________________" })
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(outputDir, "Formulario_Mestre_UNIVERSAL_Multi_Nicho.docx"), buffer);
    console.log("✅ Formulário Mestre UNIVERSAL Word gerado em D:\\IA projects\\Linkedin Bot\\Comercial\\Formulario_Mestre_UNIVERSAL_Multi_Nicho.docx");
}

createUniversalMasterOnboardingDoc();
