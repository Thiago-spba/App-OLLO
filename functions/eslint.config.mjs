export default [
  {
    ignores: ["lib/**"], // Ignora a pasta de build do TypeScript
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script", // CommonJS
      globals: {
        require: "readonly",
        exports: "readonly",
        module: "readonly",
        process: "readonly",
        __dirname: "readonly",
        console: "readonly",
        // Adicione outros globais de Node/ES2021 se precisar!
      },
    },
    rules: {
      // Personalize como quiser
    },
  },
];
