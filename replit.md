# Felicity Global Capital Website

## Overview
This project delivers a professional, bilingual (English/Japanese) corporate website for Felicity Global Capital Pte. Ltd. It features user authentication, comprehensive company information, and a distinct Singapore skyline background. The primary goal is to present all content from the original fgcsg.com website in an enhanced, multi-page application, serving as a robust digital presence for the company. The platform includes advanced content and member management, portfolio tracking, and ensures legal compliance with privacy policies.

## User Preferences
- Background: Singapore skyline/skyscraper view
- Company name: Felicity Global Capital Pte. Ltd.
- Logo: To be added later by user
- Content: Copy all content from original website with login functionality

## System Architecture
The website is structured as a multi-page application.

### UI/UX Decisions
- **Design**: Professional corporate aesthetic with a Singapore skyline background.
- **Components**: Utilizes shadcn/ui for responsive and accessible components.
- **Bilingual Support**: Comprehensive English and Japanese content, including dynamic elements, forms, and administrative interfaces, with language persistence.
- **Image Licensing**: Employs license-free generated images for office locations, incorporating cultural authenticity (e.g., Ukiyo-e style Tokyo imagery).

### Technical Implementations
- **Frontend**: Built with React, TypeScript, Vite, TailwindCSS, and shadcn/ui. Uses Wouter for routing and TanStack Query for data fetching. Forms are managed with React Hook Form and Zod validation.
- **Backend**: Developed with Express.js and TypeScript.
- **Database**: PostgreSQL, managed with Drizzle ORM.
- **Authentication**: Custom email/password authentication system with bcrypt hashing and session management, including a one-click user invitation system and password reset functionality. Admin access requires email/password login only. Public website is directly accessible without access gates. After successful login, users are automatically redirected to the Management Portal.
- **Content Management**:
    - **News**: Comprehensive view, add, edit, and delete functionality for news articles, with full bilingual support (title and content fields only) and "Read More" modals.
    - **Members**: Full CRUD operations for member profiles, including photo uploads, display order control, and role-based access.
    - **Portfolio**: Full CRUD operations for portfolio companies, featuring distinct color schemes for investment types, standardized country selection, and a multi-layer GICS classification system (Sector, Industry Group, Industry, Sub-Industry). Includes bilingual fields and fund visibility controls.
    - **Fund Management**: Manages fund options with bilingual support and visibility toggling.
- **File Management**: Object storage for photo uploads with automatic scaling and URL normalization.
- **Access Control**: Role-based access control (Superadmin/User) for management portals. News and Portfolio sections are publicly accessible by default.
- **Data Export & Import**: 
    - Admin-only Excel (.xlsx) export functionality for News and Portfolio data.
    - Superadmin-only comprehensive database backup export covering all tables (users, portfolios, funds, fund_disclosures, news, members, contact_submissions, user_invitations) in MS Access-compatible Excel format. Attempts File System Access API for save location selection (Chrome/Edge/Opera), with automatic fallback to Downloads folder for unsupported browsers.
    - Superadmin-only database restore functionality with dry-run preview, merge/replace modes, file validation (10MB limit, .xlsx only), and comprehensive error handling.
- **Privacy**: Includes a comprehensive Privacy Policy page compliant with PDPA (Singapore), GDPR (EU), and US privacy laws.

### Feature Specifications
- **Bilingual Capabilities**: Supports English and Japanese for all public and administrative content.
- **Management Message**: Dedicated section on home page displaying message from Group Representative Tomohiro Fujita, dated July 31, 2025, explaining company restructuring and vision. Fully bilingual with comprehensive content.
- **User Authentication**: Secure login/logout, user creation, role assignment, and password management.
- **Content Management Systems**: Dedicated modules for News, Members, and Portfolio data.
- **Responsive Design**: Optimized for various devices using TailwindCSS and shadcn/ui.
- **Administrative Portals**: Streamlined management interfaces for Team Management and Content Management.
- **Cross-company Navigation**: Hero section includes a prominent button linking to Felicity Capital Inc. (Japan) website at https://felicitycapital.jp/ for seamless navigation between related entities.

## External Dependencies
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Styling Framework**: TailwindCSS
- **UI Component Library**: shadcn/ui