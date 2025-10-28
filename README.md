# Agency Management System

A comprehensive agency management system built for marketing agencies, featuring time tracking, CRM, project management, financial tools, and internal communication.

## Features

### Core Modules

- **Time Tracking** - Track billable and non-billable hours by project and task
- **CRM** - Manage companies, contacts, and client relationships
- **Project Management** - Full project lifecycle with tasks, subtasks, and dependencies
- **Employee Management** - Time-off requests, schedules, and team organization
- **Calendar** - Integrated calendar with events, deadlines, and milestones
- **Workback Schedules & Gantt Charts** - Visual project planning and tracking
- **Financial Management** - Proposals, invoices, and product catalog
- **Internal Chat** - Team communication with channels
- **Notifications & Activity Logs** - Stay informed of all system activities

## Tech Stack

- **Framework**: Next.js 14+ (React) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context + TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## Database Schema

The system includes comprehensive data models for:

### User Management
- Users with roles (Admin, Manager, Employee, Client, Contractor)
- Department and job title tracking
- Hourly rates and employment dates

### CRM
- Companies with full contact information
- Multiple contacts per company
- Company status tracking (Active, Inactive, Prospect, Archived)

### Project Management
- Projects with budgets and timelines
- Project members with roles
- Tasks with priorities and status tracking
- Subtasks for detailed task breakdown
- Task dependencies (blocks/requires relationships)

### Time Management
- Time entries linked to projects and tasks
- Billable/non-billable tracking
- Time-off requests with approval workflow
- Calendar events

### Financial
- Proposals with line items
- Invoices with payment tracking
- Product catalog for reusable line items
- Automatic totals and tax calculations

### Communication
- Chat channels (Public, Private, Direct)
- Chat messages with edit history
- Real-time notifications
- Activity logs for audit trail

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**

   Update `.env` with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/agency_management?schema=public"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Set up the database**

   Run Prisma migrations to create your database schema:
   ```bash
   npx prisma migrate dev --name init
   ```

   Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ext-marketing/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   │   └── auth/         # NextAuth configuration
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── providers.tsx     # Context providers
├── lib/                   # Utilities and configurations
│   ├── prisma.ts         # Prisma client singleton
│   ├── auth.ts           # NextAuth configuration
│   └── utils.ts          # Utility functions
├── prisma/                # Database schema and migrations
│   └── schema.prisma     # Prisma schema file
├── hooks/                 # Custom React hooks
└── public/                # Static assets
```

## Development Workflow

### Database Changes

When making changes to the database schema:

1. Update `prisma/schema.prisma`
2. Create a migration:
   ```bash
   npx prisma migrate dev --name description_of_changes
   ```
3. Prisma Client will be regenerated automatically

### Viewing the Database

Use Prisma Studio to view and edit your database:
```bash
npx prisma studio
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma generate` - Generate Prisma Client

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Database Hosting

For production, consider:
- **Vercel Postgres** - Integrated with Vercel
- **Railway** - Easy PostgreSQL hosting
- **Supabase** - PostgreSQL with additional features
- **AWS RDS** - Enterprise-grade database

## Future Development

### Phase 1 (Foundation) ✓
- [x] Project setup and tech stack
- [x] Database schema design
- [x] Authentication system
- [x] Basic project structure

### Phase 2 (Core Features)
- [ ] Dashboard with overview widgets
- [ ] User management interface
- [ ] Company and contact management (CRM)
- [ ] Project creation and listing
- [ ] Task management with drag-and-drop
- [ ] Time tracking interface

### Phase 3 (Advanced Features)
- [ ] Calendar with multiple views
- [ ] Gantt chart for project timelines
- [ ] Workback schedule creator
- [ ] Proposal generation and sending
- [ ] Invoice creation and tracking
- [ ] Time-off request system

### Phase 4 (Communication & Collaboration)
- [ ] Internal chat system
- [ ] Real-time notifications
- [ ] File uploads and management
- [ ] Comments on tasks and projects

### Phase 5 (Reporting & Analytics)
- [ ] Time tracking reports
- [ ] Project profitability analysis
- [ ] Team utilization reports
- [ ] Financial dashboards
- [ ] Export to PDF/Excel

### Phase 6 (Polish & Optimization)
- [ ] Mobile responsive design
- [ ] Performance optimization
- [ ] Advanced search and filtering
- [ ] Bulk operations
- [ ] API documentation
- [ ] Webhooks for integrations

## License

Proprietary - All rights reserved
