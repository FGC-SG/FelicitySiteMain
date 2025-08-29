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
- 2025-08-28: Implemented custom email/password authentication system replacing Replit OAuth
- 2025-08-28: Updated navigation to show "Admin Login" button with professional login modal
- 2025-08-28: Added session-based authentication supporting multiple credential combinations including original fc:0729
- 2025-08-28: Enhanced Edit functionality across all management modules with comprehensive field editing
- 2025-08-28: Fixed role logic to properly recognize "admin" as superuser for Edit/Delete access control
- 2025-08-28: Implemented complete user editing with firstName, lastName, email, and role fields
- 2025-08-28: Added proper role-based access control for member management Edit/Delete functions
- 2025-08-28: Implemented One-Click User Invitation System with email invitations, automatic account setup, and secure token-based invitation flow
- 2025-08-28: Added Password Reset feature to Edit User function with secure link generation and user-controlled password updates
- 2025-08-28: Migrated to fully database-driven authentication system with proper bcrypt password hashing
- 2025-08-28: Removed hardcoded admin credentials (fc/0729) and implemented secure getUserByEmail storage method
- 2025-08-28: Updated onuma@fgcsg.com password to 777777 with proper bcrypt security
- 2025-08-28: Fixed photo upload functionality with simplified ObjectUploader component replacing complex Uppy integration
- 2025-08-28: Implemented photo URL normalization to convert GCS URLs to local object serving paths (/objects/uploads/xxx)
- 2025-08-28: Connected admin member management to public Members section - homepage now displays real database profiles
- 2025-08-28: Added company dropdown standardization with two Felicity companies for consistent data entry
- 2025-08-28: Fixed footer navigation to properly route to Contact page instead of anchor scrolling
- 2025-08-28: Replaced Western office image with professional Asian finance team image for cultural alignment
- 2025-08-28: Removed web contact form, keeping only office information and business hours display
- 2025-08-28: Implemented Portfolio Management system with complete CRUD operations for admin users
- 2025-08-28: Added distinct color schemes for investment types: Buyout (blue), Growth Equity (green), Secondary (purple)
- 2025-08-28: Replaced country text input with standardized dropdown selection covering major Asian markets and global regions
- 2025-08-28: Implemented comprehensive GICS (Global Industry Classification Standard) multi-layer industry selection system with 11 sectors, 25+ industry groups, 74+ industries, and 163+ sub-industries in cascading dropdown format
- 2025-08-28: Added Company URL field to portfolio management system with URL validation, display in portfolio cards, and clickable website links
- 2025-08-28: Switched from GPT-5 to GPT-4o for AI translation service as requested by user
- 2025-08-28: Enhanced translation error handling with graceful fallback for quota exceeded scenarios
- 2025-08-28: Fixed news filtering to properly display AI-translated Japanese articles with appropriate language mapping
- 2025-08-28: Implemented "Read More" functionality for news articles with responsive modal dialog showing full content, metadata, and tags
- 2025-08-28: Updated OpenAI translation service to use direct HTTP fetch API calls matching curl approach instead of OpenAI client library
- 2025-08-28: Enhanced translation system to ensure ALL English articles are translated to Japanese with comprehensive fallback system
- 2025-08-28: Fixed modal dialog accessibility warnings with proper DialogDescription components
- 2025-08-28: Implemented comprehensive Japanese content mapping for accurate business translations in modal dialogs
- 2025-08-28: Fixed Japanese "Read More" functionality to display proper Japanese content instead of mixed English/Japanese text
- 2025-08-28: Completed comprehensive Japanese translation system with all articles displaying proper business-grade Japanese translations including titles, descriptions, and full content in modal dialogs matching user-approved format
- 2025-08-28: Disabled ChatGPT API usage per user request - translation system now operates entirely on comprehensive fallback mappings with professional Japanese business translations
- 2025-08-28: Successfully extracted and imported 18 authentic portfolio companies from ACA Group HTML data including companies from Japan, Singapore, South Korea, Malaysia, Vietnam, Israel, Hong Kong, and UK
- 2025-08-28: Enhanced portfolio schema with bilingual Japanese fields (companyNameJa, industryJa, countryJa, descriptionJa) and comprehensive GICS classification system (sector, industry group, industry, sub-industry)
- 2025-08-28: Portfolio database now contains 30 companies total (12 existing + 18 newly imported) with complete investment type categorization (buyout, growth-equity, secondary, strategy) and investment period data
- 2025-08-29: Integrated comprehensive GICS (Global Industry Classification Standard) data from March 2023 CSV update containing 163 sub-industries across 11 sectors, 25 industry groups, and 74 industries
- 2025-08-29: Replaced legacy GICS data structure with official classification system providing complete 4-level cascading dropdown selection (Sector → Industry Group → Industry → Sub-Industry)
- 2025-08-29: Enhanced portfolio management with authentic industry classification covering all major business sectors from Energy and Materials to Technology and Financial Services
- 2025-08-29: Completed bilingual Portfolio Management interface with comprehensive Japanese field support including Company Name (Japanese) and Description (Japanese) fields
- 2025-08-29: Implemented seamless language persistence between public Portfolio and Portfolio Management pages using URL parameters (?lang=jp or ?lang=en)
- 2025-08-29: Added bidirectional navigation with "Back to Portfolio" button that preserves language selection and comprehensive Japanese translations for all admin form elements
- 2025-08-29: Enhanced form validation and reset functionality to properly handle Japanese fields (companyNameJa, descriptionJa) with clean form state management
- 2025-08-29: Removed "(Optional)" label from Description field as requested and added full bilingual support to dialog titles, descriptions, and form buttons

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