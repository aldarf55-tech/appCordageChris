# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # CordageChris

  Application React, TypeScript et Vite de suivi des travaux de cordage. Les données sont stockées localement avec IndexedDB (Dexie), puis synchronisées avec Supabase lorsque le réseau est disponible.

  ## Démarrage

  ```sh
  npm install
  npm run dev
  ```

  ## Configuration Supabase

  Créer un fichier `.env.local` à la racine avec les variables suivantes :

  ```env
  VITE_SUPABASE_URL=https://<projet>.supabase.co
  VITE_SUPABASE_ANON_KEY=<cle-publique-anon>
  ```

  La clé `anon` est publique et doit être protégée par les politiques RLS Supabase adaptées. Ne jamais placer une clé `service_role` dans une variable `VITE_*`.

  La colonne `stringingJobs.clientId` doit accepter `NULL` (et sa clé étrangère devrait utiliser `ON DELETE SET NULL`) : lors de la suppression d'un client, ses prises en charge sont conservées et dissociées de lui.

  ## Vérifications

  ```sh
  npm run lint
  npm run build
  ```

  Les services de données se trouvent dans `src/services`, les modèles partagés dans `src/types` et le schéma IndexedDB dans `src/db/database.ts`.
// eslint.config.js
