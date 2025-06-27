# OLLO

![Status](https://img.shields.io/badge/status-EM_DESENVOLVIMENTO-yellow?style=for-the-badge)
![Versão](https://img.shields.io/badge/versão-Frontend_Protótipo-blue?style=for-the-badge)
![Tecnologia](https://img.shields.io/badge/tecnologia-React_/_Tailwind_-005A4B?logo=react&style=for-the-badge)

---

> ⚠️ **ATENÇÃO**  
> Este projeto está em evolução contínua!  
> Novas funcionalidades, melhorias de UX/UI e alterações técnicas acontecem com frequência.  
> Consulte sempre o README e a Wiki para informações atualizadas.

---

<p align="center">
  <span style="font-size: 2.2rem; font-weight: bold;">OLLO</span>
</p>
<p align="center"><em>Sua nova janela para o mundo digital, com um toque de cultura galega.</em></p>

---

## 🌟 O que é o OLLO?

OLLO é uma plataforma social moderna e responsiva, em desenvolvimento aberto, que conecta pessoas, ideias e culturas.  
Inspirado pelo termo galego "ollo" (olho, atenção), nosso foco é navegação intuitiva, engajamento real e experiência visual de ponta.

---

## ✨ Funcionalidades já implementadas

- **Feed social dinâmico**: Criação e exibição de posts com texto, imagens e vídeos
- **Comentários e reações em posts**
- **Perfil de usuário com avatar dinâmico, capa, edição e informações públicas/privadas**
- **Upload de múltiplos arquivos (imagem/vídeo)**
- **Tema claro/escuro com preferência salva (safe localStorage, UX sem tela branca)**
- **Notificações visuais, animações de loading, toast de sucesso/erro**
- **Barra lateral responsiva, navegação rápida e design “glassmorphism”**
- **SafeImage: imagens quebradas mostram fallback elegante**
- **Fluxo de cadastro e autenticação robustos (Firebase Auth, Firestore, Storage)**
- **Página de Relatório do Usuário planejada para análise e métricas de engajamento**
- **Responsividade total — desktop, tablet, mobile**
- **Deploy automático no Firebase Hosting**

---

## 🚀 Melhorias técnicas já realizadas

- Proteção total no acesso ao localStorage para evitar tela branca em qualquer dispositivo/navegador
- Componentização do SafeImage para fallback visual de imagens quebradas
- .gitignore ajustado para ignorar dist/ e node_modules/
- Pipeline de build/testes/commit limpo, prático e confiável
- Documentação contínua do histórico de desenvolvimento e decisões técnicas
- Registro dos principais diferenciais implementados (upload múltiplo, avatar automático, modais acessíveis, feedbacks animados)
- Correções e avanços do fluxo de cadastro e edição de perfil: obrigatoriedade e validação de nome/local, upload de imagem com preview, feedback visual de progresso, privacidade customizada por campo, impedimento de navegação sem cadastro mínimo, UX aprimorada e acessibilidade total.

---

## 📊 **Administração & Relatórios**

- **Página de Relatório do Usuário** (_em desenvolvimento_):
  - Métricas de engajamento (posts, curtidas, seguidores, comentários)
  - Visualização gráfica (cards, tabelas, gráficos Chart.js)
  - Expansível para vendas/eventos no futuro
  - Proteção por rota autenticada, expansível para dados reais via Firebase.

- **Checklist já realizado**:
  - Estrutura inicial do projeto com React, Vite, Tailwind, Firebase, Git e Firebase Hosting
  - Feed social funcional integrado ao Firestore
  - Autenticação real e upload de mídia via Storage
  - Responsividade mobile-first, dark/light mode, animações, UX de loading
  - Deploy integrado ao Firebase Hosting
  - Limpeza do repositório, histórico de commits padronizado
  - Planejamento contínuo de features admin e analytics

---

## 🧠 Diferenciais OLLO

- **Cultura galega presente em toda a UI**
- **Experiência do usuário como prioridade máxima**
- **Código limpo, seguro, modular e documentado**
- **Visual marcante, moderno, com gradientes e glass**
- **Planejamento para expansão fácil (stories, analytics, automação, dashboard admin)**
- **Reutilização máxima de componentes**
- **Atenção à performance, acessibilidade e responsividade**

---

## 🛣️ Roadmap (próximas entregas)

- [ ] Página de Relatório do Usuário (dashboard de engajamento)
- [ ] Integração total com backend (autenticação avançada, analytics)
- [ ] Upload e preview de mídias com persistência
- [ ] Filtros de feed e busca global
- [ ] Painel administrativo e dashboard de métricas
- [ ] Automatização de deploy (CI/CD)
- [ ] Sistema completo de seguidores/seguidos

---

## 🛠️ Tecnologias

- React 18+  
- Vite  
- Tailwind CSS 3  
- Firebase (Auth, Firestore, Storage, Hosting)  
- Heroicons  
- Chart.js / React-Chartjs-2  
- ESLint, Git & GitHub  
- Deploy: [https://olloapp.com.br](https://olloapp.com.br)

---

## 👥 **Colabore!**

- Repositório oficial: [github.com/Thiago-spba/App-OLLO](https://github.com/Thiago-spba/App-OLLO)
- Dúvidas, sugestões e bugs: crie uma Issue ou envie para [thiago@olloapp.com.br](mailto:thiago@olloapp.com.br)

---

## 📝 Licença

Distribuído sob licença MIT.  
Veja [LICENSE.txt](LICENSE.txt) para detalhes.

---

<div align="center">
  <img src="https://media.giphy.com/media/26ufnwz3wDUli7GU0/giphy.gif" width="120" alt="Rocket"/>
  <br/>
  <strong>OLLO — Sua visão digital com cultura, tecnologia e inovação!</strong>
</div>
