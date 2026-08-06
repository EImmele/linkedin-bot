const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const mediaDir = path.join(__dirname, 'media');
if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
}

function createExecutiveCarouselPDF(fileName, slidesData) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(mediaDir, fileName);
        // LinkedIn portrait slides standard size: 1080 x 1350 px (using 540 x 675 pt for PDF)
        const doc = new PDFDocument({
            size: [540, 675],
            margin: 0
        });

        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        slidesData.forEach((slide, index) => {
            if (index > 0) {
                doc.addPage({ size: [540, 675], margin: 0 });
            }

            // Executive Light Background
            doc.rect(0, 0, 540, 675).fill('#F8FAFC');

            // Top Header Accent Bar
            doc.rect(0, 0, 540, 16).fill('#0A192F');

            // Brand Header: AUDIT CHAIN
            doc.fillColor('#0A192F')
               .fontSize(16)
               .font('Helvetica-Bold')
               .text('AUDIT CHAIN', 40, 45);

            doc.fillColor('#64748B')
               .fontSize(10)
               .font('Helvetica')
               .text('GRC, PRIVACIDADE & RESILIÊNCIA OPERACIONAL', 40, 65);

            // Subtle Horizontal Separator Line
            doc.moveTo(40, 85).lineTo(500, 85).lineWidth(1).stroke('#E2E8F0');

            // Slide Tag / Category
            doc.rect(40, 105, slide.categoryWidth || 180, 24).fill('#EFF6FF');
            doc.fillColor('#1D4ED8')
               .fontSize(9)
               .font('Helvetica-Bold')
               .text(slide.category.toUpperCase(), 48, 112);

            // Main Slide Title
            doc.fillColor('#0F172A')
               .fontSize(22)
               .font('Helvetica-Bold')
               .text(slide.title, 40, 145, { width: 460, lineGap: 6 });

            // Subtitle / Intro
            if (slide.subtitle) {
                doc.fillColor('#334155')
                   .fontSize(12)
                   .font('Helvetica')
                   .text(slide.subtitle, 40, 215, { width: 460, lineGap: 4 });
            }

            // Main Content Box Container
            let currentY = slide.subtitle ? 260 : 220;
            if (slide.bullets && slide.bullets.length > 0) {
                slide.bullets.forEach((b, i) => {
                    const boxHeight = b.desc ? 75 : 55;
                    
                    // Executive Card Box Background
                    doc.roundedRect(40, currentY, 460, boxHeight, 8)
                       .fillAndStroke('#FFFFFF', '#CBD5E1');

                    // Left Accent Pill
                    doc.roundedRect(40, currentY, 6, boxHeight, 3)
                       .fill('#1E3A8A');

                    // Bullet Title
                    doc.fillColor('#0F172A')
                       .fontSize(12)
                       .font('Helvetica-Bold')
                       .text(`${i + 1}. ${b.title}`, 60, currentY + 12, { width: 420 });

                    // Bullet Description
                    if (b.desc) {
                        doc.fillColor('#475569')
                           .fontSize(10)
                           .font('Helvetica')
                           .text(b.desc, 60, currentY + 30, { width: 420, lineGap: 2 });
                    }

                    currentY += boxHeight + 12;
                });
            }

            // Call to Action Box on Slide 5
            if (slide.cta) {
                doc.roundedRect(40, 480, 460, 110, 10).fill('#0A192F');
                doc.fillColor('#38BDF8')
                   .fontSize(14)
                   .font('Helvetica-Bold')
                   .text(slide.cta.title, 60, 500, { width: 420, align: 'center' });

                doc.fillColor('#F8FAFC')
                   .fontSize(11)
                   .font('Helvetica')
                   .text(slide.cta.desc, 60, 528, { width: 420, align: 'center', lineGap: 3 });

                doc.fillColor('#F59E0B')
                   .fontSize(11)
                   .font('Helvetica-Bold')
                   .text(slide.cta.button, 60, 562, { width: 420, align: 'center' });
            }

            // Footer Slide Counter
            doc.moveTo(40, 620).lineTo(500, 620).lineWidth(1).stroke('#E2E8F0');
            doc.fillColor('#94A3B8')
               .fontSize(9)
               .font('Helvetica')
               .text(`Slide ${index + 1} de ${slidesData.length}  |  Audit Chain Consulting`, 40, 635);

            doc.fillColor('#64748B')
               .fontSize(9)
               .font('Helvetica-Bold')
               .text('www.auditchain.com.br', 380, 635, { align: 'right' });
        });

        doc.end();

        writeStream.on('finish', () => {
            console.log(`✅ PDF Criado: ${fileName}`);
            resolve(filePath);
        });

        writeStream.on('error', (err) => reject(err));
    });
}

// Data for 3 High-Impact Benchmark Carousels
const carousels = [
    {
        fileName: "carrousel_audit_chain_tprm_dora.pdf",
        slides: [
            {
                category: "TPRM & DORA COMPLIANCE",
                categoryWidth: 165,
                title: "DORA & Gestão de Risco de Terceiros (TPRM)",
                subtitle: "Sua organização garante a governança contínua de fornecedores de TIC perante as novas exigências regulatórias?",
                bullets: [
                    { title: "Pressão Regulatória Crescente", desc: "A regulação DORA (EU 2022/2554) exige controle rígido da cadeia de suprimentos de TI." },
                    { title: "Pontos Cego na Operação", desc: "Vazamentos em parceiros de TIC representam a maior fonte de incidentes graves em 2025/2026." },
                    { title: "Desafio de Escala", desc: "Questionários manuais em planilhas não garantem visibilidade real nem conformidade auditável." }
                ]
            },
            {
                category: "PILAR 1 & 2",
                categoryWidth: 100,
                title: "1. Enquadramento CIF & 2. Due Diligence",
                subtitle: "Duas etapas críticas para calibrar o esforço de governança proporcional ao risco:",
                bullets: [
                    { title: "1. Categorização de Funções Críticas (CIFs)", desc: "Mapear fornecedores de TIC que suportam processos vitais e entregas essenciais ao negócio." },
                    { title: "2. Triagem e Questionários por Risco (Assessments)", desc: "Aplicar due diligence proporcional ao nível de acesso aos dados e sistemas da organização." }
                ]
            },
            {
                category: "PILAR 3 & 4",
                categoryWidth: 100,
                title: "3. Matrix de Risco & 4. Monitoramento",
                subtitle: "Transforme dados de conformidade em inteligência decisória:",
                bullets: [
                    { title: "3. Cálculo de Risco Inerente vs Residual", desc: "Matriz automatizada para mensurar a exposição real antes e depois dos controles aplicados." },
                    { title: "4. Monitoramento Contínuo & KRIs", desc: "Acompanhar indicadores de antecedência ao longo de todo o ciclo de vida do contrato." }
                ]
            },
            {
                category: "TECNOLOGIA & AUTOMAÇÃO",
                categoryWidth: 180,
                title: "Arquitetura OneTrust & ServiceNow GRC",
                subtitle: "Parametrização avançada para automatizar o Registro de Informações exigido pela DORA:",
                bullets: [
                    { title: "OneTrust Third-Party Risk Management", desc: "Módulos de Vendor Inventory, Auto-Risks e Portal do Fornecedor automatizados." },
                    { title: "ServiceNow GRC / Vendor Risk Management", desc: "Integração nativa com Authority Documents, Citations e Controles Operacionais." }
                ]
            },
            {
                category: "PRÓXIMO PASSO ESTRATÉGICO",
                categoryWidth: 200,
                title: "Diagnóstico de Maturidade em TPRM & DORA",
                subtitle: "Garanta a resiliência operacional da sua empresa com a consultoria especializada da Audit Chain.",
                cta: {
                    title: "Sua Empresa Está Pronta para Auditoria?",
                    desc: "Fale com nossos arquitetos de GRC e agende uma avaliação de maturidade completa.",
                    button: "📩 Contato: consultoria@auditchain.com.br"
                }
            }
        ]
    },
    {
        fileName: "carrousel_audit_chain_lgpd_privacy.pdf",
        slides: [
            {
                category: "PRIVACIDADE & GOVERNANÇA",
                categoryWidth: 180,
                title: "Programa de Privacidade de Dados (LGPD & GDPR)",
                subtitle: "Como transformar obrigações regulatórias em vantagem competitiva e confiança de mercado?",
                bullets: [
                    { title: "Governança de Dados Transparente", desc: "Construa programas de privacidade robustos e auditáveis perante a ANPD e GDPR." },
                    { title: "Gestão do Ciclo de Vida dos Dados", desc: "Garanta controle total sobre coleta, armazenamento, compartilhamento e eliminação." }
                ]
            },
            {
                category: "ENTREGÁVEIS TÉCNICOS",
                categoryWidth: 150,
                title: "Mapeamento (RoPA) & Relatórios RIPD/DPIA",
                bullets: [
                    { title: "Data Mapping & Inventário (RoPA)", desc: "Mapear o fluxo de dados em todas as áreas e sistemas da empresa." },
                    { title: "Relatório de Impacto (RIPD / DPIA)", desc: "Avaliar riscos ao titular e definir planos de mitigação técnicos e jurídicos." }
                ]
            },
            {
                category: "DIREITOS DOS TITULARES",
                categoryWidth: 170,
                title: "Automação de DSAR & Gestão de Incidentes",
                bullets: [
                    { title: "Atendimento a Titulares (DSAR)", desc: "Portal automatizado para responder requisições de titulares dentro dos prazos legais." },
                    { title: "Planos de Resposta a Vazamentos", desc: "Protocolo técnico para contenção, avaliação de impacto e notificação à ANPD." }
                ]
            },
            {
                category: "PLATAFORMA ONETRUST",
                categoryWidth: 150,
                title: "Arquitetura dos Módulos OneTrust Privacy",
                bullets: [
                    { title: "OneTrust Data Mapping & Assessment Automation", desc: "Workflow automatizado para atualização contínua do inventário de dados." },
                    { title: "Privacy Rights Automation", desc: "Integração via APIs REST para validação de identidade e extração de dados." }
                ]
            },
            {
                category: "AVALIAÇÃO GRATUITA",
                categoryWidth: 140,
                title: "Adeqüe sua Empresa com a Audit Chain",
                cta: {
                    title: "Precisa Estruturar ou Otimizar seu Programa?",
                    desc: "Consulte nossos especialistas em DPO as a Service e Governança de Privacidade.",
                    button: "📩 Agende uma Reunião: contato@auditchain.com.br"
                }
            }
        ]
    },
    {
        fileName: "carrousel_audit_chain_bcm_resilience.pdf",
        slides: [
            {
                category: "BCM & RESILIÊNCIA OPERACIONAL",
                categoryWidth: 200,
                title: "Continuidade de Negócios & BIA (ISO 22301)",
                subtitle: "Sua empresa saberia exatamente qual sistema restaurar primeiro em um momento de crise?",
                bullets: [
                    { title: "Priorização Baseada em Impacto", desc: "Substitua a opinião pela análise de impacto financeiro e operacional real." },
                    { title: "Proteção da Sobrevivência do Negócio", desc: "Defina sequências de recuperação alinhadas com a diretoria e comitê executivo." }
                ]
            },
            {
                category: "MÉTRICAS CHAVE DE BIA",
                categoryWidth: 160,
                title: "Mapeamento de RTO, RPO & MTPD",
                bullets: [
                    { title: "RTO (Recovery Time Objective)", desc: "Tempo máximo tolerável de paralisação antes que ocorram prejuízos irreversíveis." },
                    { title: "RPO (Recovery Point Objective)", desc: "Volume máximo aceitável de perda de dados entre o último backup e o incidente." }
                ]
            },
            {
                category: "PLANOS DE RESPOSTA",
                categoryWidth: 150,
                title: "Planos BCP, DRP & Simulados de Mesa",
                bullets: [
                    { title: "Planos de Continuidade (PCN / BCP)", desc: "Procedimentos operacionais claros para manter as entregas vitais ativas." },
                    { title: "Simulados Práticos de Crise", desc: "Testar a capacidade de resposta das equipes sob pressão realista." }
                ]
            },
            {
                category: "AUTOMAÇÃO SERVICENOW",
                categoryWidth: 170,
                title: "Implementação ServiceNow BCM Suite",
                bullets: [
                    { title: "Módulo ServiceNow BCM Parametrizado", desc: "Automatizar BIA, planos de continuidade e gestão de incidentes em tempo real." }
                ]
            },
            {
                category: "RESILIÊNCIA GARANTIDA",
                categoryWidth: 170,
                title: "Proteja a Operação da sua Empresa",
                cta: {
                    title: "Sua Empresa Resistiria a uma Crise Hoje?",
                    desc: "Fale com os consultores de BCM da Audit Chain e elabore o seu BIA.",
                    button: "📩 Fale Conosco: bcm@auditchain.com.br"
                }
            }
        ]
    }
];

async function generateAllPDFs() {
    console.log("📄 GERANDO CARROSSEIS EM PDF NATIVOS PARA O BOT DA AUDIT CHAIN...");
    for (const item of carousels) {
        await createExecutiveCarouselPDF(item.fileName, item.slides);
    }
    console.log("🎉 TODOS OS 3 CARROSSEIS EM PDF FORAM GERADOS COM SUCESSO!");
}

generateAllPDFs();
