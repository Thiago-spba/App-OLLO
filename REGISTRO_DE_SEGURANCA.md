# Registro de Incidente de Segurança e Auditoria - Projeto OLLO

**Data:** 20 de Agosto de 2025
**Responsáveis:** Thiago Fernando (Proprietário), OLLO (Arquiteto Sênior)
**Status:** Resolvido

## 1. Resumo do Incidente

No início de agosto de 2025, foram detectadas anomalias durante as tentativas de configuração e deploy do projeto `App-OLLO`. Os principais sintomas incluíam:
- A plataforma Vercel sugeria a conexão com uma conta desconhecida do GitHub (`@srividya778`).
- Falhas de deploy automático (CI/CD) com erros de "permissão insuficiente" registrados nos logs da Vercel e do GitHub Actions.
- Falha na inicialização do ambiente de desenvolvimento local devido à ausência de configuração do Firebase.

## 2. Diagnóstico da Causa Raiz

Após investigação e contato com o suporte da Vercel (Caso #00668044), a causa raiz foi identificada como um **acesso não autorizado ao repositório `Thiago-spba/App-OLLO` no GitHub**.

- **Evidência:** Logs da Vercel confirmaram um deploy bem-sucedido realizado pelo usuário do GitHub `@srividya778` em 4 de agosto de 2025.
- **Conclusão:** O problema não era na Vercel, mas sim uma falha de segurança no GitHub que permitiu a um terceiro obter acesso de escrita ao repositório. A subsequente exclusão da conta `@srividya778` pelo GitHub resultou em falhas nos workflows de CI/CD.

## 3. Plano de Ação e Remediação (Ações Executadas)

As seguintes ações foram tomadas para conter a ameaça, remediar as falhas e fortalecer a segurança geral do projeto:

- **[x] Auditoria de Acesso ao Repositório:** Verificada a lista de `Colaboradores` no GitHub. Confirmado que nenhum usuário não autorizado possui acesso direto.
- **[x] Auditoria de Aplicações (GitHub Apps):** Revisada a lista de aplicações com acesso à conta/repositório. Aplicações de deploy redundantes e não utilizadas (`Netlify`, `Render`) foram desinstaladas para minimizar a superfície de ataque.
- **[x] Auditoria de Chaves de Deploy:** Verificada a lista de `Deploy Keys`. Nenhuma chave desconhecida foi encontrada.
- **[x] Fortalecimento de Conta Pessoal:** Ativada a **Autenticação de Dois Fatores (2FA)** na conta GitHub do proprietário (`Thiago-spba`), fortalecendo drasticamente a segurança contra roubo de credenciais.
- **[x] Auditoria de Contas de Serviço (Firebase/GCP):** Chaves de conta de serviço antigas (criadas em 4 e 5 de agosto) foram identificadas e revogadas. Uma nova chave foi gerada para uso exclusivo do CI/CD.
- **[x] Reparo do Pipeline de CI/CD:**
    - Criado um novo Segredo de Repositório no GitHub (`FIREBASE_SERVICE_ACCOUNT`) para armazenar de forma segura a nova chave da conta de serviço.
    - O arquivo de workflow `.github/workflows/firebase-hosting-merge.yml` foi corrigido para usar o segredo correto e o `projectId` correto (`olloapp-egl2025`).
- **[x] Configuração do Ambiente Local:** Implementado o uso de variáveis de ambiente via arquivo `.env.local` para armazenar as chaves do Firebase, garantindo que segredos não sejam enviados para o repositório.

## 4. Estado de Segurança Atual

Após as ações de remediação, o estado de segurança do projeto é considerado **robusto e profissional**.

- **Conta GitHub:** Protegida com 2FA.
- **Repositório `App-OLLO`:** Acesso restrito apenas ao proprietário. Permissões de terceiros foram minimizadas.
- **Deploy (CI/CD):** O processo está automatizado e seguro, usando uma Conta de Serviço dedicada e autenticação via GitHub Secrets.
- **Código-Fonte:** A arquitetura está preparada para não expor segredos, utilizando o padrão `.env.local`.

## 5. Recomendações Contínuas

Para manter e melhorar a postura de segurança do projeto no futuro, as seguintes práticas são recomendadas:
- Implementar Regras de Segurança granulares no Firestore e Storage.
- Realizar validação de todos os inputs de usuário no backend (Cloud Functions).
- Periodicamente executar `npm audit` para monitorar e corrigir vulnerabilidades em dependências de terceiros.

---

## 6. Atualizações de Segurança (27 de Agosto de 2025)

### 6.1 Implementações de CORS e Autenticação

Em resposta a problemas de autenticação relacionados a CORS, foram implementadas as seguintes melhorias de segurança:

#### CORS e Controle de Origens

- **Lista de Domínios Permitidos expandida**: 
  - Produção: `olloapp.com.br`, `olloapp-egl2025.web.app`, `*.olloapp.com.br`
  - Desenvolvimento: `localhost` e `127.0.0.1` em várias portas (`5173`, `5174`, `5175`, `5176`, `5177`)

- **Headers Permitidos**: Expandidos para incluir todos os headers necessários para autenticação segura:
  ```
  Content-Type, Authorization, Content-Length, User-Agent, X-Requested-With,
  Access-Control-Allow-Origin, Access-Control-Allow-Methods,
  Access-Control-Allow-Headers, Access-Control-Allow-Credentials, Accept, Origin
  ```

- **Métodos Permitidos**: Expandidos para incluir `PATCH` além dos métodos padrão.

#### Tratamento de Erros de Autenticação

- Implementado sistema robusto de tratamento de erros de autenticação que:
  - Fornece mensagens amigáveis para o usuário
  - Registra detalhes técnicos apenas em ambiente de desenvolvimento
  - Identifica e sugere soluções para problemas de CORS

#### Emuladores para Desenvolvimento

- Adicionado suporte para emuladores Firebase locais que:
  - Permitem desenvolvimento sem problemas de CORS
  - Protegem o ambiente de produção durante testes
  - Melhoram a velocidade de desenvolvimento

#### Configuração Web Segura

- Adicionado arquivo `.htaccess` com configurações de segurança:
  - Headers de segurança (X-Frame-Options, X-XSS-Protection, X-Content-Type-Options)
  - Política de Segurança de Conteúdo (CSP) básica
  - Configuração CORS segura para servidor web

### 6.2 Registro de Mudanças

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 20/08/2025 | 1.0 | Registro de incidente de segurança | Equipe OLLO |
| 27/08/2025 | 1.1 | Implementação de configurações robustas de CORS | Equipe OLLO |
| 27/08/2025 | 1.2 | Adição de tratamento robusto de erros de autenticação | Equipe OLLO |
| 27/08/2025 | 1.3 | Implementação de emuladores para desenvolvimento | Equipe OLLO |

---

*Este documento deve ser atualizado sempre que houver alterações relacionadas à segurança no projeto OLLO.*