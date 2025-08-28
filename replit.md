# Felicity Global Capital Website

## Project Overview
A professional corporate website for Felicity Global Capital Pte. Ltd. with bilingual content (English/Japanese), user authentication, and comprehensive company information. The website features a Singapore skyline background and contains all content from the original fgcsg.com website.

## Recent Changes
- 2025-08-28: Initial project setup with bilingual content structure
- 2025-08-28: Added Singapore skyline background as requested
- 2025-08-28: Restructured from single-page to multi-page application with separate routes for Home, About, News, and Contact
- 2025-08-28: Added comprehensive member management system with login/logout functionality
- 2025-08-28: Implemented "Add News Article" function with bilingual form validation
- 2025-08-28: Created "Add User" function with role-based access control and department management
- 2025-08-28: Simplified role system to only "Superadmin" and "User" roles
- 2025-08-28: Streamlined management portal to only include Team Management and Content Management sections
- 2025-08-28: Removed Analytics & Reports and System Settings from management dashboard
- 2025-08-28: Migrated Add News Article functionality to Content Management section
- 2025-08-28: Added comprehensive Member Management system with photo upload capabilities
- 2025-08-28: Implemented object storage for photo uploads with automatic scaling
- 2025-08-28: Created member profile management with title, company, and biography fields
- 2025-08-28: Added Member Management section to admin portal with full CRUD operations
- 2025-08-28: Successfully extracted and imported 7 news articles from original ACA Group website
- 2025-08-28: Enhanced news management system with comprehensive view/add/delete functionality
- 2025-08-28: Successfully authenticated and extracted authentic news content from dev.fgcsg.com using provided credentials (fc:0729)
- 2025-08-28: Imported 6 real articles including PT Fore Kopi Indonesia portfolio updates and corporate announcements with actual dates

## User Preferences
- Background: Singapore skyline/skyscraper view
- Company name: Felicity Global Capital Pte. Ltd.
- Logo: To be added later by user
- Content: Copy all content from original website with login functionality

## Project Architecture
- **Frontend**: React with TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OAuth integration
- **Routing**: Multi-page application with separate routes for Home (/), About (/about), News (/news), Contact (/contact)
- **Styling**: Singapore skyline background, professional corporate design
- **Languages**: Bilingual support (English/Japanese)

## Key Features
- Bilingual website (EN/JP)
- User authentication with Replit OAuth
- Member management portal with role-based access
- News article creation and management
- User creation with department/role assignment
- Company information and team profiles
- Professional corporate design with Singapore skyline
- Responsive design with shadcn/ui components
- Member profile management with photo upload
- Object storage integration for file uploads
- Automatic photo scaling and processing
- Full CRUD operations for member profiles

## Technical Stack
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS + shadcn/ui for styling
- Express.js backend
- Wouter for routing
- TanStack Query for data fetching
- React Hook Form with Zod validation