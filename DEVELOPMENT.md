# Guia de Desenvolvimento - OLLO App

Este guia fornece instruções para configurar e executar o ambiente de desenvolvimento do OLLO App.

## Configuração Inicial

1. Instale as dependências:
   ```
   npm install
   ```

2. Configure as variáveis de ambiente (consulte a equipe para obter os valores corretos).

## Modos de Execução

O OLLO App suporta diferentes modos de execução:

### Desenvolvimento Padrão

```
npm run dev
```

Este comando inicia o servidor de desenvolvimento Vite e conecta-se aos serviços Firebase de produção.

### Desenvolvimento com Emuladores

Para desenvolvimento local completo com emuladores Firebase:

```
npm run dev:full
```

Este comando inicia simultaneamente:
- Emuladores Firebase (Auth, Firestore, Storage, Functions)
- Servidor de desenvolvimento Vite configurado para usar os emuladores

### Emuladores Apenas

Se você precisar apenas dos emuladores Firebase:

```
npm run emulators
```

### Cliente com Emuladores

Se os emuladores já estiverem em execução e você quiser conectar o cliente a eles:

```
npm run dev:emulator
```

## Alternando Entre Modos

O aplicativo possui um seletor de modo Firebase no canto inferior direito da tela (visível apenas em desenvolvimento):

- **Produção**: Conecta-se aos serviços Firebase de produção
- **Emulador**: Conecta-se aos emuladores Firebase locais

⚠️ **Importante**: Ao alternar para o modo Emulador, certifique-se de que os emuladores estejam em execução com `npm run emulators`.

## Observações Importantes

- As alterações no modo Firebase exigem uma recarga da página para serem aplicadas
- Os dados dos emuladores são temporários e serão perdidos ao reiniciar os emuladores
- O Firebase Authentication tem limitações com CORS em ambiente de desenvolvimento
- Use a funcionalidade de alternância de modo para testar em ambos os ambientes

## Solução de Problemas

### Erros de CORS

Se encontrar erros de CORS no console, verifique:
1. Está usando o modo Emulador sem os emuladores em execução
2. O arquivo `cors.json` está configurado corretamente
3. As regras de segurança do Firestore/Storage permitem as operações

### Problemas de Autenticação

Se a autenticação falhar:
1. Verifique se está no modo correto (Produção/Emulador)
2. Verifique o console para erros específicos
3. Tente limpar o localStorage e os cookies do navegador
