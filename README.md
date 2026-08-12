# TaskFlow — plantilla para estudiantes

¡Bienvenido/a! Esta es una plantilla completa de una app real (un gestor de
listas y tareas) pensada para que aprendas a construir y desplegar tu propio
proyecto full-stack, aunque sea la primera vez que despliegas algo en tu
vida. Tómatelo con calma, ve paso a paso, y no pasa nada si algo falla a la
primera — la sección de "Errores comunes" está para eso.

## Qué es esta plantilla y qué stack usa

Cada pieza del proyecto tiene un trabajo muy concreto:

- **Next.js** — el framework de React que sirve tanto las páginas que ves en
  el navegador como la lógica del servidor, todo en un mismo proyecto.
- **TypeScript** — es JavaScript, pero con un corrector que te avisa de
  muchos errores *antes* de ejecutar el código, mientras escribes.
- **Drizzle** — la librería que traduce entre tu código TypeScript y las
  tablas de la base de datos, para que casi nunca tengas que escribir SQL a
  mano.
- **Neon** — tu base de datos Postgres, pero en la nube: no instalas nada en
  tu ordenador, te creas una cuenta gratis y ya tienes una base de datos
  real.
- **Zod** — valida que los datos que llegan de un formulario tengan la forma
  correcta (por ejemplo, que un email sea realmente un email) antes de
  guardarlos.
- **Tailwind CSS** — pones estilos (colores, espaciados, tamaños) escribiendo
  clases directamente en el HTML/JSX, sin saltar a un archivo `.css` aparte.
- **shadcn/ui** — componentes de interfaz (botones, diálogos, formularios...)
  ya hechos y bonitos, que además puedes editar porque su código vive dentro
  de tu propio proyecto.
- **Auth.js** — gestiona el inicio de sesión: guarda quién eres en una
  cookie segura y te dice, en cualquier página, si hay alguien conectado.
- **Resend** — el servicio que envía los emails reales de la app (verificar
  tu cuenta, recuperar la contraseña).
- **Vercel** — la plataforma donde subes tu proyecto para que cualquiera
  pueda abrirlo en internet, sin que tengas que mantener un servidor tú
  mismo/a.

No hay Docker, ni un backend separado, ni colas de tareas (Celery/Redis): al
ser "serverless", todo esto corre bajo demanda en Vercel y en Neon.

## Cómo ponerlo en marcha en tu ordenador

Necesitas tener [Node.js](https://nodejs.org) instalado (versión 20 o
superior — este proyecto incluye un archivo `.nvmrc` con la versión exacta
recomendada, `20.20.2`, si usas `nvm`).

1. **Clona el repositorio** en tu ordenador:
   ```bash
   git clone https://github.com/davidalonsobadia/taskflow-vibecoding.git
   ```
2. **Entra en la carpeta del proyecto**:
   ```bash
   cd taskflow-vibecoding
   ```
3. **Instala las dependencias**:
   ```bash
   npm install
   ```
4. **Crea una cuenta gratuita en Neon** ([neon.tech](https://neon.tech)) y,
   dentro de tu cuenta, **crea un proyecto nuevo** (será tu base de datos
   Postgres).
5. **Copia la connection string** de tu proyecto de Neon (la encuentras en el
   dashboard de tu proyecto) y pégala en un archivo `.env.local` en la raíz
   del proyecto. Este archivo no existe todavía: cópialo a partir de
   `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   y rellena la línea `DATABASE_URL=` con tu connection string real.
6. **Crea una cuenta en Resend** ([resend.com](https://resend.com)) y copia
   tu API key también a `.env.local`, en la línea `RESEND_API_KEY=`. Para
   probar en local puedes dejar `RESEND_FROM_EMAIL=onboarding@resend.dev`
   tal cual — funciona sin verificar ningún dominio propio.
7. **Genera un `AUTH_SECRET`** (el secreto que usa Auth.js para firmar las
   sesiones) y pégalo también en `.env.local`:
   ```bash
   npx auth secret
   ```
8. **Crea las tablas en Neon** ejecutando:
   ```bash
   npm run db:push
   ```
9. *(Opcional)* **Rellena la base de datos con datos de ejemplo** — listas y
   tareas de mentira, para que la app no se vea vacía la primera vez:
   ```bash
   npm run db:seed
   ```
   Al final te imprimirá un email y contraseña de una cuenta de demo ya
   verificada, para que puedas entrar sin pasar por el email de verificación.
10. **Arranca el servidor de desarrollo**:
    ```bash
    npm run dev
    ```
11. **Abre [http://localhost:3000](http://localhost:3000)** en tu navegador.
    ¡Ya tienes tu propia TaskFlow corriendo en tu ordenador!

## Iniciar sesión con Microsoft (opcional)

Además de email+contraseña, la pantalla de login puede mostrar un botón
"Iniciar sesión con Microsoft" — útil si tu organización usa cuentas de
Microsoft (Entra ID) y no quieres que cada persona tenga que registrarse
con una contraseña nueva.

**No tienes que registrar nada tú en Azure.** Pide a quien administre
Entra ID en tu organización estos 3 valores y pégalos en tu `.env.local`:

```
AUTH_MICROSOFT_ENTRA_ID_ID=...
AUTH_MICROSOFT_ENTRA_ID_SECRET=...
AUTH_MICROSOFT_ENTRA_ID_ISSUER=...
```

El botón aparece solo cuando esos tres valores están rellenos — si los
dejas en blanco, la app funciona exactamente igual que antes, solo con
email+contraseña. (¿Eres tú quien administra Entra ID? La guía para
configurarlo está en
[`docs/microsoft-entra-id-setup.md`](docs/microsoft-entra-id-setup.md).)

## Cómo desplegarlo en Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdavidalonsobadia%2Ftaskflow-vibecoding&project-name=taskflow&env=AUTH_SECRET,RESEND_API_KEY,RESEND_FROM_EMAIL&envDescription=Variables%20de%20entorno%20necesarias%20(DATABASE_URL%20la%20anade%20la%20integracion%20de%20Neon%20automaticamente))

Puedes pulsar el botón de arriba, o seguir los pasos manualmente:

1. **Sube el repositorio a GitHub** si todavía no lo está.
2. **Importa el proyecto** en [vercel.com/new](https://vercel.com/new),
   eligiendo tu repositorio. Vercel detecta automáticamente que es un
   proyecto Next.js — no hay que tocar nada en la configuración de build.
3. **Añade Neon** desde el Marketplace de integraciones de Vercel. Esto
   configura la variable `DATABASE_URL` automáticamente por ti — no hace
   falta que la escribas a mano.
4. **Añade el resto de variables de entorno a mano**: en
   *Project Settings → Environment Variables*, añade `AUTH_SECRET`,
   `RESEND_API_KEY` y `RESEND_FROM_EMAIL` (los mismos valores que ya tienes
   en tu `.env.local`, o unos nuevos para producción).
5. Pulsa **Deploy** y espera a que termine el build.

Nota: `NEXT_PUBLIC_APP_URL` no se necesita en Vercel — el propio código
(`src/lib/email.ts`) detecta automáticamente la URL pública del despliegue a
través de la variable `VERCEL_URL`, que Vercel rellena solo.

## Estructura de carpetas explicada

```
src/
├── app/          # Rutas de la aplicación (App Router de Next.js): cada
│                 # carpeta es una URL. Aquí viven las páginas (page.tsx)
│                 # y el único Route Handler del proyecto
│                 # (api/auth/[...nextauth]/route.ts, exigido por Auth.js).
├── actions/      # Server Actions: toda la lógica que ESCRIBE en la base
│                 # de datos (crear/editar/borrar listas y tareas, login,
│                 # registro...) vive en un archivo por acción.
├── db/           # La definición de las tablas (schema.ts), el cliente de
│                 # Drizzle (index.ts) y el script de datos de ejemplo
│                 # (seed.ts). Aquí es donde le dices a Drizzle qué forma
│                 # tiene tu base de datos.
├── lib/          # Utilidades compartidas: validaciones con Zod
│                 # (validations.ts), envío de emails (email.ts), hashing
│                 # de contraseñas (password.ts) y tipos TypeScript
│                 # compartidos (types.ts).
└── components/   # Piezas de interfaz reutilizables: components/ui/* son
                  # los componentes generados por shadcn/ui (botones,
                  # diálogos...), y components/lists + components/tasks son
                  # los componentes propios de cada funcionalidad.
```

Además, justo dentro de `src/` (sin carpeta propia) hay tres archivos clave
del sistema de autenticación: `auth.ts` (configuración completa de Auth.js,
usada en el servidor), `auth.config.ts` (la parte de esa configuración que
también puede correr en el Edge Runtime, usada por el middleware) y
`middleware.ts` (bloquea el acceso a `/dashboard` si no has iniciado
sesión).

## Cómo añadir una funcionalidad nueva (vibe coding)

Aquí es donde este proyecto se aparta del desarrollo "tradicional": **no vas a
escribir el código de una funcionalidad nueva a mano, archivo por archivo.**
Vas a describírsela a tu asistente de IA (Claude Code, Cursor, o el que
uses, con este repo abierto) y dejar que él haga el cambio de principio a
fin — base de datos, validación, Server Action e interfaz. Eso es "vibe
coding": tú decides *qué* quieres ver funcionando, el asistente decide *cómo*
escribirlo, y tú revisas el resultado.

Dos cosas hacen que esto funcione bien en esta plantilla:

- El archivo [`CLAUDE.md`](CLAUDE.md) documenta las convenciones del
  proyecto (dónde van los esquemas, las Server Actions, cómo se valida con
  Zod, el reparto de `auth.ts`/`auth.config.ts`...). Herramientas como
  Claude Code lo leen automáticamente antes de tocar código, así que no
  tienes que repetir esas reglas en cada prompt.
- Un buen prompt de vibe coding es **concreto**: describe lo que quieres ver
  en la pantalla, dice en qué tabla o página afecta si lo sabes, y pide que
  se compruebe el resultado al final. Un prompt vago ("añade un campo a las
  listas") obliga al asistente a adivinar, y adivinar es donde aparecen los
  errores.

### Ejemplo: añadir un emoji a cada lista

Copia y adapta un prompt como este:

> Quiero añadir un campo opcional de emoji a las listas (por ejemplo 📚 para
> "Estudios"). Debe poder rellenarse al crear o editar una lista, guardarse
> en la base de datos, y mostrarse junto al nombre tanto en la pantalla
> "Mis listas" como en el detalle de una lista. Sigue las convenciones de
> CLAUDE.md. Cuando termines, ejecuta `npm run lint` y `npm run build` y
> arregla lo que falle antes de darlo por terminado.

Con ese prompt, un asistente que conozca el proyecto va a tocar —sin que se
lo tengas que deletrear campo por campo— más o menos esto:

- `src/db/schema.ts`: la columna nueva en la tabla `lists`, y ejecutará
  `npm run db:push` para sincronizarla con Neon.
- `src/lib/validations.ts`: el campo en el esquema de Zod de crear/editar
  lista.
- `src/actions/create-list.ts` / `update-list.ts`: normalmente sin cambios,
  porque ya copian todos los campos que Zod valida.
- `src/components/lists/create-list-dialog.tsx` / `edit-list-dialog.tsx`: el
  input nuevo en el formulario.
- `src/components/lists/list-card.tsx` y
  `src/app/dashboard/lists/[id]/page.tsx`: dónde se muestra el emoji.

No necesitas memorizar esta lista de antemano — te sirve para *revisar*
después el diff que te proponga el asistente y comprobar que no se ha
olvidado ningún sitio, no para ir tú archivo por archivo.

### Cómo escribir buenos prompts

- Describe el comportamiento que quieres ver, no la implementación ("que se
  vea el emoji junto al nombre", no "añade una columna text nullable").
- Si sabes qué tabla o pantalla afecta, dilo — te ahorras una vuelta de
  "¿dónde está esto exactamente?".
- Pide siempre que compruebe el resultado (`npm run lint`, `npm run build`)
  antes de considerar terminada la tarea.
- Si el resultado no es el que esperabas, no lo arregles tú a mano: explícale
  qué está mal y deja que lo corrija él. Es más rápido, y así aprendes qué
  hizo falta aclarar para el siguiente prompt.

## Errores comunes

- **"Error de conexión" al ejecutar `npm run db:push`.** Casi siempre es
  porque todavía no has creado `.env.local` (o no has puesto un
  `DATABASE_URL` real dentro). Copia `.env.example` a `.env.local` y rellena
  la connection string de tu proyecto de Neon.
- **Auth.js lanza un error de "secreto" faltante.** Te falta la variable
  `AUTH_SECRET` en `.env.local`. Genera uno con `npx auth secret` y pégalo
  ahí.
- **`npm run db:push` falla aunque `DATABASE_URL` está bien escrita.**
  Comprueba que has creado de verdad el proyecto (y la base de datos) en el
  dashboard de Neon antes de intentar sincronizar — no basta con tener
  cuenta, hace falta un proyecto creado.
- **Resend rechaza el email y no llegan los correos de verificación.** Si
  usas tu propio dominio en `RESEND_FROM_EMAIL` sin haberlo verificado en
  Resend, los envíos fallan. Para pruebas, usa
  `RESEND_FROM_EMAIL=onboarding@resend.dev` — funciona sin verificar nada.
- **`npm run dev` dice que el puerto 3000 ya está en uso.** O tienes otro
  proyecto corriendo, o una ejecución anterior no se cerró bien. Cierra el
  proceso que lo esté usando, o arranca en otro puerto con
  `npm run dev -- -p 3001`.
- **Al pulsar "Iniciar sesión con Microsoft" da un error `redirect_uri_mismatch`.**
  La URL desde la que estás entrando (localhost o tu dominio de Vercel) no
  está añadida como Redirect URI en la App Registration de Azure. Pídele a
  quien administra Entra ID que la añada (ver
  [`docs/microsoft-entra-id-setup.md`](docs/microsoft-entra-id-setup.md)).
