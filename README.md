# OLLO 🦉

![Status](https://img.shields.io/badge/status-EM_DESENVOLVIMENTO-yellow?style=for-the-badge)
![Versão](https://img.shields.io/badge/versão-Frontend_Protótipo-blue?style=for-the-badge)
![Tecnologia](https://img.shields.io/badge/tecnologia-React_/_Tailwind_-005A4B?logo=react&style=for-the-badge)

<p align="center">
  <img src="https://raw.githubusercontent.com/Thiago-spba/App-OLLO/main/public/images/logo_ollo.jpeg" width="180" alt="OLLO Logo" style="border-radius: 20px; box-shadow: 0 2px 8px #ccc;"/>
</p>

> *Sua nova janela para o mundo digital, com um toque de cultura galega.*

---

## 🌟 **O que é o OLLO?**

OLLO é um protótipo de aplicação web interativa, moderna e fluida com funcionalidades de mídia social.  
Nosso objetivo é criar uma plataforma *“galega”* onde usuários compartilham conteúdo, interagem e constroem conexões em um ambiente visualmente atrativo e **altamente responsivo**.

---

## 🧬 **Identidade OLLO**

> “Ollo”, em galego, significa **olho** — e também transmite as ideias de **atenção** e **cuidado**.

- **Dar un ollo:** Navegue o feed, descubra novidades.
- **Ollo á xente:** Explore e siga pessoas, ampliando sua rede.
- **Ollo co que fas!:** Crie posts, lembrando de compartilhar com consciência.

> <p align="center"><img src="https://media.giphy.com/media/jdPMeyv9rn0hZHh8n9/giphy.gif" width="80" alt="Olho animado"/></p>

---

## ✨ **Principais Funcionalidades Implementadas**

| 🚀 Experiência do Usuário | 🛡️ Segurança & Performance | ⚙️ Desenvolvimento |
|--------------------------|----------------------------|--------------------|
| Navegação lateral fluida e responsiva <br/> Temas claro/escuro (com animação de transição)<br/> Feedback visual em todas as interações <br/> Efeitos de glassmorphism e gradientes modernos | Acesso seguro ao `localStorage`<br/> Componentes protegidos contra erros de carregamento de imagem<br/> Organização modular e fácil de manter | Vite build ultrarrápido<br/> ESLint e padronização de código<br/> Deploy integrado com Firebase Hosting<br/> Histórico de commits claro e profissional |

- **Barra de navegação animada** com destaque ativo (transições Tailwind)
- **Tema escuro/claro** com seleção automática (e salva com segurança)
- **Criação e exibição de posts**, com botão flutuante animado
- **Feed com "Continuar lendo..."** para UX fluida
- **Comentários aninhados**, reações e notificações interativas
- **Perfil de usuário com abas, edição e visual moderno**
- **Placeholder animado para imagens indisponíveis**
- **Design “Ollo” marcante**, com gradientes, sombra e ícones customizados

---

## 🔒 **Melhorias Recentes & Boas Práticas**

- **Proteção total contra falhas no localStorage:**  
  - App nunca mais trava com tela branca em nenhum navegador ou dispositivo.
  - Verificação e fallback automático.
- **SafeImage refatorado:**  
  - Imagens quebradas mostram placeholder elegante, evitando impacto visual.
- **Limpeza do repositório:**  
  - Pasta `dist/` agora ignorada via `.gitignore` — só código-fonte versionado!
- **Fluxo profissional de build e deploy:**  
  - Commits claros, versionamento limpo, deploy automatizado para Firebase.
- **Documentação detalhada:**  
  - Orientação clara para futuros desenvolvedores.

---

## 🛠️ **Tecnologias Utilizadas**

- ![React](https://img.shields.io/badge/React-18+-61dafb?logo=react)  
- ![Vite](https://img.shields.io/badge/Vite-6.x-646cff?logo=vite)  
- ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38bdf8?logo=tailwindcss)
- ![Firebase](https://img.shields.io/badge/Firebase-Hosting/Firestore-ffca28?logo=firebase)
- ![Heroicons](https://img.shields.io/badge/Heroicons-SVG-6366f1?logo=heroicons)
- ESLint, Git, GitHub

---

## 📝 **Resumo do Histórico de Alterações Recentes**

- [x] **Aprimoramento do acesso ao localStorage (seguro e robusto)**
- [x] **SafeImage agora oculta imagens quebradas e aceita placeholder**
- [x] **Remoção e proteção da pasta dist/** do versionamento
- [x] **Padronização dos commits e do fluxo de deploy**
- [x] **Ajuste de temas para mobile, incluindo bugfix em Android**
- [x] **Otimização do carregamento (lazy loading, split de código sugerido)**
- [x] **Documentação expandida para time e onboarding**
- [x] **Setup de ambiente automatizado**

---

## 🚦 **Como rodar o projeto**

```bash
# Clone o repositório
git clone https://github.com/Thiago-spba/App-OLLO.git

# Acesse a pasta do projeto
cd App-OLLO

# Instale as dependências
npm install

# Rode em modo desenvolvimento
npm run dev

# Gere build de produção
npm run build

# Deploy no Firebase Hosting
firebase deploy
