# CritiCode

[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/olabisi09/criticode)

CritiCode is an AI-powered code review tool designed to help developers improve code quality. By leveraging Google's Gemini AI, it provides instant, in-depth analysis of your code, identifying potential issues across security, performance, best practices, and refactoring opportunities.

Users can paste code directly, upload files, receive detailed feedback, and, for authenticated users, track their review history and performance statistics.

## Key Features

- **AI-Powered Analysis**: Get comprehensive feedback on your code from Google's Gemini model.
- **Multi-Category Review**: Analysis is broken down into four key areas: Security, Performance, Best Practices, and Refactoring.
- **Multiple Input Methods**: Paste your code directly into the editor or upload a file via drag-and-drop.
- **Interactive Code Editor**: A feature-rich editor based on Monaco Editor for a seamless coding experience.
- **User Authentication**: Secure user registration and login system using JWT.
- **Review History**: Authenticated users can access a detailed history of all their past code analyses.
- **User Dashboard**: A personal profile page with statistics on your code review activity, including total reviews and languages used.
- **Modern Tech Stack**: Built with React, Vite, and Express in an Nx monorepo for a scalable and maintainable architecture.

## Tech Stack

CritiCode is a full-stack application organized as an Nx monorepo.

| Component       | Technology                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo**    | [Nx](https://nx.dev/)                                                                                                                             |
| **Frontend**    | [React](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/) |
| **State Mngmt** | [Zustand](https://zustand-demo.pmnd.rs/), [React Query](https://tanstack.com/query/latest)                                                        |
| **Backend**     | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/)                                  |
| **Database**    | [Supabase](https://supabase.com/) (PostgreSQL)                                                                                                    |
| **AI**          | [Google Gemini](https://ai.google.dev/)                                                                                                           |
| **Auth**        | [JWT](https://jwt.io/) & [bcrypt](https://www.npmjs.com/package/bcrypt)                                                                           |
| **UI**          | [Monaco Editor](https://microsoft.github.io/monaco-editor/), [Lucide React](https://lucide.dev/), [Recharts](https://recharts.org/)               |

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v20.x or later)
- [npm](https://www.npmjs.com/)
- A [Supabase](https://supabase.com/) account for the database.
- A [Google AI Studio](https://ai.google.dev/) API key for Gemini.

### 1. Clone the Repository

```bash
git clone https://github.com/olabisi09/criticode.git
cd criticode
```

### 2. Install Dependencies

Install all the necessary packages for the entire monorepo.

```bash
npm install
```

### 3. Set Up Environment Variables

The server requires several environment variables to connect to the database and AI services.

Create a `.env` file in the `server/` directory:

```bash
touch server/.env
```

Now, add the following variables to `server/.env`, replacing the placeholder values with your actual credentials.

```env
# Supabase Configuration
SUPABASE_PROJECT_URL="YOUR_SUPABASE_PROJECT_URL"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

# JWT Configuration
JWT_SECRET="YOUR_SUPER_SECRET_KEY_FOR_JWT_SIGNING"

# Google Gemini AI Configuration
GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"

# Server Configuration (Optional)
PORT=5000

# CORS Origins (Optional, defaults to localhost)
CORS_ORIGINS="http://localhost:4200"
```

### 4. Set Up Supabase Database

You need to create two tables in your Supabase project: `users` and `reviews`.

1.  Navigate to the **SQL Editor** in your Supabase project dashboard.
2.  Click **New query** and run the following SQL scripts to create the tables.

#### Create `users` table:

```sql
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email)
);
```

#### Create `reviews` table:

```sql
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL,
  language text NOT NULL,
  file_name text,
  analysis jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);
```

**Note**: The foreign key `reviews_user_id_fkey` constraint references `auth.users(id)`. Ensure your `users` table is within the `public` schema but accessible for this reference. If you used Supabase Auth, the reference would be to `auth.users`. The provided schema uses a custom `public.users` table for simplicity.

### 5. Run the Application

You need to run both the backend server and the frontend client. Open two separate terminals for this.

#### Run the Backend Server:

```bash
# In your first terminal, at the root of the project
npx nx run @criticode/server:serve
```

The server will start, typically on `http://localhost:5000`.

#### Run the Frontend Client:

```bash
# In your second terminal, at the root of the project
npx nx run @criticode/client:serve
```

The client development server will start, typically on `http://localhost:4200`. You can now open your browser and navigate to this address.

## Project Structure

This project is an Nx monorepo with the following structure:

```
criticode/
├── client/          # React frontend application (Vite + TS)
├── client-e2e/      # Playwright end-to-end tests for the client
├── server/          # Express backend application (Node.js + TS)
├── shared/          # Shared types and utilities between client and server
├── nx.json          # Nx workspace configuration
└── package.json     # Root package.json with all dependencies
```

- **`client`**: Contains the entire React frontend. All UI components, pages, hooks, and services related to the client-side are located here.
- **`server`**: Houses the Express.js backend. This includes API routes, authentication logic, database services, and the integration with the Gemini AI.
- **`shared`**: A library for code that needs to be shared between the `client` and `server`, primarily TypeScript interfaces for data models (e.g., `User`, `Review`).
- **`client-e2e`**: Contains Playwright tests for automated end-to-end testing of the user interface.

<!-- # Criticode

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is almost ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/js?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Finish your CI setup

[Click here to finish setting up your workspace!](https://cloud.nx.app/connect/rh3DNxwXUb)


## Generate a library

```sh
npx nx g @nx/js:lib packages/pkg1 --publishable --importPath=@my-org/pkg1
```

## Run tasks

To build the library use:

```sh
npx nx build pkg1
```

To run any task with Nx use:

```sh
npx nx <target> <project-name>
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Versioning and releasing

To version and release the library use

```
npx nx release
```

Pass `--dry-run` to see what would happen without actually releasing the library.

[Learn more about Nx release &raquo;](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Keep TypeScript project references up to date

Nx automatically updates TypeScript [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) in `tsconfig.json` files to ensure they remain accurate based on your project dependencies (`import` or `require` statements). This sync is automatically done when running tasks such as `build` or `typecheck`, which require updated references to function correctly.

To manually trigger the process to sync the project graph dependencies information to the TypeScript project references, run the following command:

```sh
npx nx sync
```

You can enforce that the TypeScript project references are always in the correct state when running in CI by adding a step to your CI job configuration that runs the following command:

```sh
npx nx sync:check
```

[Learn more about nx sync](https://nx.dev/reference/nx-commands#sync)


[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/js?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) -->
