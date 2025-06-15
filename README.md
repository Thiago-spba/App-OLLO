# OLLO 🦉

![Status](https://img.shields.io/badge/status-em_desenvolvimento-yellow)
![Versão](https://img.shields.io/badge/versão-frontend_protótipo-blue)
![Tecnologia](https://img.shields.io/badge/tecnologia-React_/_Tailwind-_005A4B?logo=react)

*Sua nova janela para o mundo digital, com um toque de cultura galega.*

OLLO é um protótipo de aplicação web interativa com funcionalidades de mídia social. O objetivo é criar uma plataforma moderna, fluida e visualmente atraente onde usuários possam compartilhar conteúdo, interagir e construir uma rede de conexões.

---

### A Identidade "Ollo"

"Ollo", em galego, significa "olho", mas a expressão vai além, traduzindo-se como "atenção" ou "cuidado". Essa dualidade inspira a navegação e as interações na plataforma:

* **Dar un ollo**: A ação de explorar o feed, "dar uma olhada" no que há de novo.
* **Ollo á xente**: A seção para encontrar e seguir pessoas, lembrando de "prestar atenção nas pessoas" que você adiciona à sua rede.
* **Ollo co que fas!**: O botão para criar um novo post, um lembrete para ser cuidadoso e "prestar atenção no que você faz" e compartilha.

---

### ✨ Funcionalidades Implementadas (Protótipo Frontend)

* **Estrutura e Navegação:**
    * [x] Layout principal responsivo com barra de navegação lateral.
    * [x] Roteamento de páginas com React Router DOM v6.
    * [x] Design adaptável para diferentes tamanhos de tela.

* **Sistema de Temas:**
    * [x] Tema claro e escuro implementado em toda a aplicação.
    * [x] Preferência de tema salva no `localStorage` do navegador.

* **Interação com Conteúdo:**
    * [x] Criação de posts (simulada, via estado local).
    * [x] Feed de posts com scroll.
    * [x] Funcionalidade "Continuar Lendo..." para posts longos.
    * [x] Sistema de "Gostar" em posts.
    * [x] Seção de comentários em cada post.
    * [x] Sistema de "Gostar" e "Não Gostar" em comentários individuais.

* **Páginas e Componentes:**
    * [x] **Página Inicial:** Exibe o feed principal e a caixa de criação de post.
    * [x] **Página Explorar:** Grade de posts com placeholders para filtros.
    * [x] **Página de Notificações:** Timeline de notificações com interatividade (marcar como lida) e navegação.
    * [x] **Página de Perfil:** Estrutura com abas (Posts, Comentários, Curtidas) e edição de perfil (simulada).
    * [x] **Design Visual "Ollo":** Paleta de cores customizada, gradientes e efeitos de "glassmorphism" no tema claro.

---

### 🛠️ Tecnologias Utilizadas

* **Frontend:**
    * **React (v18+)**: Biblioteca para construção de interfaces.
    * **Vite**: Ferramenta de build e desenvolvimento ultrarrápida.
    * **Tailwind CSS (v3)**: Framework CSS utility-first para estilização ágil.
    * **React Router DOM (v6)**: Gerenciamento de rotas.
* **Ícones e Ferramentas:**
    * **Heroicons**: Biblioteca de ícones SVG.
    * **ESLint**: Linter para manter a qualidade e o padrão do código.
    * **Git & GitHub**: Versionamento e hospedagem do código.

---

### 🚀 Como Rodar o Projeto Localmente

Para executar uma cópia deste projeto em seu ambiente de desenvolvimento, siga os passos abaixo.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/Thiago-spba/App-OLLO.git](https://github.com/Thiago-spba/App-OLLO.git)
    ```
2.  **Navegue até a pasta do projeto:**
    ```bash
    cd App-OLLO
    ```
3.  **Instale as dependências:**
    ```bash
    npm install
    ```
4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
5.  Abra [http://localhost:5173](http://localhost:5173) (ou o endereço que aparecer no seu terminal) no seu navegador para ver a aplicação.

---

### 🛣️ Próximos Passos

* [ ] Integração com Backend (Firebase/Supabase).
* [ ] Sistema de autenticação de usuários.
* [ ] Upload real de mídias (imagens, vídeos).
* [ ] Funcionalidade de "Seguir" usuários.
* [ ] Implementação de busca funcional.

---

### 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE.txt` para mais informações.
---
Teste de deploy automático.