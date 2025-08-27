# Firebase Emulator Setup

Este documento descreve a configuração dos emuladores Firebase usados para desenvolvimento local.

## Portas Padrão dos Emuladores

| Serviço       | Porta  |
|---------------|--------|
| Authentication| 9099   |
| Firestore     | 8080   |
| Storage       | 9199   |
| Functions     | 5001   |
| UI do Emulador| 4000   |

## Comando para Iniciar

```bash
npm run emulators
```

## Conectando o Aplicativo aos Emuladores

```bash
npm run dev:emulator
```

Ou use o seletor de modo Firebase no canto inferior direito da aplicação em ambiente de desenvolvimento.

## Observações

- Os dados dos emuladores são temporários e serão perdidos ao reiniciar
- A autenticação via emulador ignora as verificações CORS que podem ocorrer em desenvolvimento
- Para um ambiente completo, execute `npm run dev:full`

## Mais Informações

Consulte a [documentação oficial do Firebase](https://firebase.google.com/docs/emulator-suite) para mais detalhes.
