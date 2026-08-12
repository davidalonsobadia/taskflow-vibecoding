// Side-effect-only module: loads ".env.local" into process.env.
//
// Why this needs to be its own module instead of a plain `config(...)` call
// inlined in the caller: `import` declarations are hoisted above ordinary
// statements when tsx/esbuild compiles this to CommonJS, so a bare
// `config({ path: ".env.local" })` call sitting between two `import` lines
// still runs *after* every import in the file -- including imports (like
// "./index") that read `process.env.DATABASE_URL` at module-load time.
// Wrapping the call in its own module and importing *that* first works
// because the relative order between import declarations IS preserved by
// hoisting, so this module's top-level code (this call) finishes before the
// next import is evaluated.
import { config } from "dotenv";

config({ path: ".env.local" });
