# Smart Influence

**Smart Influence** is a web application that helps brands discover, evaluate, and manage influencer partnerships. Describe your campaign, apply audience and niche filters, and receive ranked recommendations backed by analytics and AI-generated reviews.

**Live demo:** [olehskomorokha.github.io/sis-frontend](https://olehskomorokha.github.io/sis-frontend)

---

## Features

- **Campaign-driven search** — Describe a product, service, or campaign and receive a shortlist of matching creators.
- **Advanced filters** — Narrow results by country, tags, minimum follower count, average views, and result count.
- **Influencer analytics** — Compare candidates by followers, engagement rate, average views/likes/comments, post frequency, and brand-fit score.
- **AI reviews** — Generate AI-powered summaries to help decide whether an influencer fits your brand.
- **Client profiles** — Register, sign in, and manage saved influencers from a personal dashboard.
- **Influencer management** — Save, activate/deactivate, and remove influencers from your profile.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | [React](https://react.dev/) 19, [React Router](https://reactrouter.com/) 7 |
| Tooling | [Create React App](https://create-react-app.dev/) |
| Deployment | [GitHub Pages](https://pages.github.com/) (`gh-pages`) |
| Backend API | REST API hosted on Azure |
| Search | Elasticsearch (blogger tags & recommendations) |

---

## Project Structure

```
sis-frontend/
├── smart-influence/          # React application
│   ├── public/               # Static assets
│   └── src/
│       ├── Authentication/   # Login, signup, client profile
│       ├── components/       # Pages and shared UI (Header, Footer, etc.)
│       ├── config/           # API configuration
│       ├── utils/            # Shared helpers (JWT parsing, formatting)
│       └── Other/            # Privacy policy, data deletion
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm

### Installation

```bash
git clone https://github.com/olehskomorokha/sis-frontend.git
cd sis-frontend/smart-influence
npm install
```

### Development

```bash
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000) and reloads on file changes.

### Production Build

```bash
npm run build
```

Output is written to the `build/` directory.

### Deploy to GitHub Pages

```bash
npm run deploy
```

This runs a production build and publishes it to the `gh-pages` branch.

---

## Configuration

The backend API base URL is defined in `smart-influence/src/config/api.js`:

```js
export const API_BASE_URL = 'https://smartinfluence-gwebhyf6dchth0dt.polandcentral-01.azurewebsites.net/api';
```

To point the frontend at a different backend, update this value and rebuild.

---

## Application Flow

1. **Home** — Overview of the platform and how to use it.
2. **Sign up / Log in** — Create a client account or authenticate with JWT-based sessions.
3. **Influencer selection** — Enter a campaign description, set filters, and submit a search request.
4. **Recommendations** — Review ranked results, request AI analysis, and save selected influencers.
5. **Profile** — Manage account settings and your saved influencer list.

Protected routes (influencer selection and profile) require a valid authentication token stored in `localStorage`.

---

## API Endpoints

The frontend communicates with the following backend routes:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/Client` | Register a new client |
| `POST` | `/Client/login` | Authenticate and receive a JWT |
| `GET` | `/Client/{id}` | Fetch client profile |
| `PUT` | `/Client` | Update client profile |
| `GET` | `/Elasticsearch/bloggerTags` | Load available product tags |
| `POST` | `/Influencer/recommendations` | Get influencer recommendations |
| `POST` | `/Influencer/add-influencer/{clientId}` | Save an influencer to a client |
| `GET` | `/ClientInfluencer/{clientId}` | List saved influencers |
| `PUT` | `/ClientInfluencer/update/{id}` | Update influencer (status, AI review) |
| `DELETE` | `/ClientInfluencer/delete/{id}` | Remove an influencer |
| `GET` | `/Ai/review/{channelId}` | Generate an AI review for a channel |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the development server |
| `npm test` | Run tests in watch mode |
| `npm run build` | Create an optimized production build |
| `npm run deploy` | Build and publish to GitHub Pages |

---

## License

This project is private. All rights reserved.
