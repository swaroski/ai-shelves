# AI Shelves - Smart Library Management System

## 🚀 Overview

AI Shelves is a modern, collaborative library management system powered by artificial intelligence. Built with React, TypeScript, and integrated with Clerk authentication, it provides workspace-based book management with role-based permissions.

## ✨ Features

### 🔐 Authentication & Security
- **Clerk Integration**: Secure authentication with social logins
- **Role-Based Access**: Owner, Admin, Librarian, Member, Viewer roles
- **Workspace Isolation**: Multi-tenant architecture with data separation
- **Permission System**: Granular control over book operations

### 📚 Library Management
- **Smart Book Organization**: AI-powered categorization and tagging
- **Advanced Search**: Full-text search across titles, authors, and tags
- **Borrowing System**: Track book checkouts and due dates
- **Version Control**: Track book modifications with user attribution

### 🏢 Workspace Features
- **Multi-User Collaboration**: Real-time activity feeds
- **Member Management**: Invite and manage workspace members
- **Activity Tracking**: Comprehensive audit logs
- **Settings Management**: Configurable workspace preferences

### 🤖 AI Integration
- **Gemini AI**: Intelligent book analysis and recommendations
- **Auto-Categorization**: Smart genre and tag suggestions
- **Summary Generation**: AI-powered book summaries
- **Duplicate Detection**: Identify potential duplicate entries

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS, Radix UI
- **Authentication**: Clerk
- **State Management**: React Context, React Query
- **AI Integration**: Google Gemini API
- **Storage**: Local Storage (ready for backend integration)
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Clerk account (for authentication)
- Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-shelves.git
   cd ai-shelves
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Add your keys:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:8080
   ```

## 🔧 Configuration

### Clerk Setup
1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Copy publishable key to `.env`
4. Configure redirect URLs:
   - Development: `http://localhost:8080`
   - Production: `https://your-domain.vercel.app`

### Gemini AI Setup (Optional)
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env` file
3. Enable AI features in workspace settings

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── BookCard.tsx    # Individual book display
│   ├── BookGrid.tsx    # Book collection view
│   ├── BookForm.tsx    # Add/edit book form
│   ├── WorkspaceHeader.tsx  # Navigation header
│   └── ...
├── contexts/           # React contexts
│   └── WorkspaceContext.tsx # Workspace state management
├── hooks/              # Custom React hooks
├── pages/              # Route components
│   ├── Index.tsx       # Landing page
│   ├── Dashboard.tsx   # Main workspace view
│   └── WorkspaceSettings.tsx
├── services/           # Business logic
│   ├── libraryService.ts    # Book operations
│   ├── workspaceService.ts  # Workspace management
│   └── geminiService.ts     # AI integration
├── types/              # TypeScript definitions
│   └── library.ts      # Core type definitions
└── lib/                # Utilities
    └── utils.ts        # Helper functions
```

## 🔐 Permission System

### Role Hierarchy
| Role | Permissions |
|------|-------------|
| **Owner** | Full workspace control, settings, delete workspace |
| **Admin** | Manage members, all book operations |
| **Librarian** | Manage books, borrowing operations |
| **Member** | Borrow books, view collection |
| **Viewer** | Read-only access |

### Book Operations
```typescript
// Example usage with permissions
LibraryService.addBookToWorkspace(workspaceId, bookData, userId, userRole)
LibraryService.updateBookInWorkspace(workspaceId, bookId, updates, userId, userRole)
LibraryService.deleteBookFromWorkspace(workspaceId, bookId, userRole)
```

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - automatic builds on git push

### Manual Build
```bash
npm run build
npm run preview  # Test production build locally
```

## 🧪 Development

### Available Scripts
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # Run ESLint
npm run preview     # Preview production build
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Husky**: Git hooks for quality checks

## 🔧 Architecture

### Data Flow
1. **Authentication**: Clerk handles user auth
2. **Workspace Creation**: Auto-created on first sign-in
3. **Book Management**: Workspace-isolated operations
4. **Permission Checks**: Role-based validation
5. **Activity Tracking**: Audit trail for all actions

### Storage Strategy
- **Local Storage**: Development and demo
- **Backend Ready**: Designed for easy API integration
- **Workspace Isolation**: Data separated by workspace ID

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-shelves/issues)
- **Documentation**: See `/docs` folder
- **Email**: support@ai-shelves.com

## 🗺️ Roadmap

- [ ] **Real-time Sync**: WebSocket integration
- [ ] **Mobile App**: React Native version
- [ ] **Advanced Analytics**: Usage insights and reports
- [ ] **File Uploads**: Book covers and documents
- [ ] **API Integration**: External library databases
- [ ] **Backup/Export**: Data portability features
- [ ] **Multi-language**: Internationalization support

---

**Built with ❤️ using React, TypeScript, and AI**