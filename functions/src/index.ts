import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Limite global de instâncias (boa prática para controle de custos)
setGlobalOptions({ maxInstances: 10 });

// Exemplo de Cloud Function HTTP para teste
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});
