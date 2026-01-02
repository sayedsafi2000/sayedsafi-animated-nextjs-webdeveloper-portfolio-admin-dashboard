# Admin Dashboard - Sayed Safi Portfolio

Admin dashboard built with Next.js for managing Blog posts, Projects, and Services.

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript support
- ✅ JWT authentication
- ✅ CRUD operations for Blog, Projects, and Services
- ✅ Responsive design with Tailwind CSS
- ✅ Dark mode support
- ✅ Toast notifications
- ✅ Protected routes

## Prerequisites

- Node.js (v18 or higher)
- Backend API running (see backend README)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Update the `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Run the development server:
```bash
npm run dev
```

The admin dashboard will start on `http://localhost:3001`

## Usage

1. **Login/Register**: 
   - Navigate to `/login`
   - Register a new admin account or login with existing credentials
   - The first user registered will be an admin

2. **Dashboard**: 
   - View statistics for Blog posts, Projects, and Services
   - Quick access to all management pages

3. **Blog Management** (`/dashboard/blog`):
   - View all blog posts
   - Create, edit, and delete blog posts
   - Toggle publish status
   - Manage categories, tags, and content

4. **Projects Management** (`/dashboard/projects`):
   - View all projects
   - Create, edit, and delete projects
   - Mark projects as featured
   - Set custom code vs WordPress projects

5. **Services Management** (`/dashboard/services`):
   - View all services
   - Create, edit, and delete services
   - Toggle active status
   - Manage features and pricing

## Authentication

The dashboard uses JWT tokens stored in localStorage. Tokens are automatically included in API requests and refreshed when needed.

## License

ISC

