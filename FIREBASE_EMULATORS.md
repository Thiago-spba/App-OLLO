# Desenvolvimento Firebase com Emuladores

## Visão Geral

Este documento explica como utilizar o ambiente de desenvolvimento com Firebase em seu projeto OLLO.

## Problema de CORS no Desenvolvimento

Ao desenvolver localmente com Firebase Authentication, você pode encontrar erros de CORS como os que estão aparecendo no seu console:

```
Erro de CORS detectado no Firebase Auth
```

Isso ocorre porque o Firebase Authentication bloqueia solicitações de domínios não autorizados (como localhost:5173) por motivos de segurança.

## Soluções Implementadas

Para resolver este problema, implementamos três abordagens:

### 1. Emuladores Firebase Locais

Os emuladores Firebase permitem desenvolver localmente sem enfrentar problemas de CORS ou afetar dados de produção. Esta é a **solução recomendada**.

### 2. FirebaseAuthenticator

Uma classe robusta para gerenciar autenticação que:
- Detecta erros de CORS automaticamente
- Tenta diferentes estratégias de autenticação
- Conecta-se aos emuladores quando necessário
- Fornece mensagens de erro úteis

### 3. DevModeSelector

Um componente de interface para alternar facilmente entre:
- Produção Firebase (precisa de domínios autorizados)
- Emuladores locais (sem problemas de CORS)

## Como Acessar/Usar

### Opção 1: Iniciar com Emuladores (Recomendado)

1. **Inicie os emuladores e o app juntos**:
   ```
   npm run dev:full
   ```
   
   Este comando inicia tanto os emuladores Firebase quanto o servidor de desenvolvimento.

2. **Ou inicie separadamente**:

   Em um terminal:
   ```
   npm run emulators
   ```

   Em outro terminal:
   ```
   npm run dev:emulator
   ```

3. **Acesse o app**: Abra seu navegador em `http://localhost:5173`

### Opção 2: Usando o Seletor de Modo

1. Inicie o app normalmente:
   ```
   npm run dev
   ```

2. No canto inferior direito da tela, você verá um ícone de ferramentas de desenvolvimento
   ![DevTools Icon](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAAsTAAALEwEAmpwYAAAApklEQVR4nO3SMQrCQBCF4Q+DCpYWHsFjeAXBxlN4AcFeEGy9gZcQLGwsPIBgaSOWqW3EbWZhA4KFCDrww8LAY5l5GW45pQQrpBjii4QVonjBhwfecIY8YBQtynHBHSW6uCNLxUULm6KGA01Ex0RQF7doYZ47zpagMiXu0McA20RYHQNrYoYlxl/PW+M4wfwPVL2PFS4YoVf795Z9zFDg+Qf8+0mtUEJnKqkZBzoAAAAASUVORK5CYII=)

3. Clique no ícone para abrir o painel de desenvolvimento

4. Ative a opção "Emuladores Firebase Local" e aguarde a página recarregar:
   ![Seletor de Modo](data:image/png;base64,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)

5. Se os emuladores não estiverem em execução, inicie-os:
   ```
   npm run emulators
   ```

### Opção 3: Autorizar seu domínio no Firebase

Se preferir usar o Firebase de produção:

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Vá para seu projeto > Authentication > Settings > Authorized Domains
3. Adicione `localhost:5173` como um domínio autorizado

## Solução de Problemas

Se você ainda estiver tendo problemas de autenticação:

1. **Verifique se os emuladores estão em execução**
   - Execute `npm run emulators` e certifique-se de que iniciam sem erros
   - Você deve ver uma mensagem "Emulators Started" no console

2. **Verifique a seleção de modo**
   - Use o DevModeSelector (ícone no canto inferior direito) para garantir que o modo correto esteja ativado

3. **Limpe o cache e os cookies**
   - O armazenamento do navegador pode interferir nas configurações
   - Tente limpar cookies e cache ou use uma janela anônima/privativa

4. **Reinicie o servidor de desenvolvimento**
   - Às vezes, parar e reiniciar o servidor de desenvolvimento resolve problemas

5. **Verifique o console do navegador**
   - As mensagens de erro podem fornecer pistas sobre o problema
