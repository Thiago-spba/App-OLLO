# Política de Segurança da OLLO

A segurança dos dados e a integridade da plataforma são pilares fundamentais da OLLO. Entendemos que a segurança é um processo contínuo e valorizamos a contribuição da comunidade de pesquisa para tornar nosso ambiente mais seguro, sem comprometer a experiência dos nossos usuários.

## 📦 Versões Suportadas

Como operamos em modelo SaaS (Software as a Service) com implantação contínua, apenas a versão mais recente em produção é suportada.

| Versão | Status | Definição |
| ------- | ------------------ | --- |
| **Produção (Latest)** | :white_check_mark: Suportada | A versão acessível publicamente no domínio oficial da OLLO. |
| Versões Anteriores | :x: Descontinuada | Versões antigas são substituídas imediatamente após novos deploys. |

## 🛡️ Processo de Divulgação Responsável

Se você acredita ter encontrado uma vulnerabilidade na OLLO, pedimos que siga este processo para garantir a segurança de todos.

### Canal de Denúncia

Envie os detalhes da vulnerabilidade para:
📧 **thiago.rpba@gmail.com**

Por favor, inclua no e-mail:
1.  **Descrição:** O tipo de falha encontrada.
2.  **Passos para Reprodução (PoC):** Como podemos replicar o erro (screenshots ou vídeo ajudam muito).
3.  **Impacto Estimado:** Qual o risco para os usuários ou para a plataforma?

### Nossa Promessa (SLA)

* **Confirmação:** Tentaremos confirmar o recebimento do seu reporte em até 48 horas.
* **Avaliação:** Analisaremos a validade e a severidade da falha.
* **Correção:** Priorizaremos a correção de falhas críticas.
* **Não-Retaliação (Porto Seguro):** Se você agir de boa fé e seguir as regras abaixo, não tomaremos medidas legais contra você.

## ⛔ Regras de Engajamento

Para garantir que seus testes **não impeçam a funcionalidade do site** nem prejudiquem usuários reais, você deve seguir estritamente estas regras:

**✅ O que você PODE fazer:**
* Criar suas próprias contas de teste para investigar vulnerabilidades.
* Testar falhas de injeção, XSS, autenticação e controle de acesso (nas suas contas).
* Verificar configurações incorretas de segurança.

**❌ O que é ESTRITAMENTE PROIBIDO:**
* **Negação de Serviço (DoS/DDoS):** Nunca realize testes que sobrecarreguem nossos servidores ou deixem o site lento para outros usuários.
* **Acesso a Dados de Terceiros:** Não tente acessar, modificar ou destruir dados que não pertençam às suas contas de teste.
* **Engenharia Social:** Não envie phishing ou spam para usuários ou colaboradores da OLLO.
* **Destruição de Dados:** Se encontrar uma falha que permita deletar dados, pare imediatamente e reporte. Não execute a deleção.

## 🎯 Escopo Técnico

**No Escopo:**
* Frontend (React/Vite).
* Regras de Segurança do Firestore e Storage.
* Cloud Functions (Node.js).
* Fluxos de Autenticação (Firebase Auth).

**Fora do Escopo:**
* Infraestrutura física do Google Cloud Platform (reportar ao Google).
* Bugs de UI/UX que não afetam a segurança.

---
Obrigado por ajudar a manter a OLLO segura!
