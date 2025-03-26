# Task Manager API

A Nest.js backend application with Prisma ORM for managing tasks.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm (v9 or higher)
- Prisma CLI (will be installed locally)

## Installation

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**

   ```bash
   npm install
   npx prisma generate
   ```

3. **Install Prisma CLI (if not already installed)**
   ```bash
   npm install prisma --save-dev
   ```

## Environment Setup

1. Create a `.env` file in the root directory
2. Add the following environment variables:
   ```env
   DATABASE_URL="postgresql://postgres:12345678@localhost:5432/taskManagerGapstar?schema=public"
   PORT=3010
   ```

## Database Setup

1. **Push Prisma schema to database**

   ```bash
   npx prisma db push
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

## Running the Application

**Development mode:**

```bash
npm run start:dev
```

The application will be available at:  
`http://localhost:3010`

## Project Structure

```
src/
├── prisma/
│   └── schema.prisma    # Prisma schema definition
├── src/
│   └── main.ts          # Application entry point
.env                     # Environment variables
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note:** Make sure your PostgreSQL server is running locally before starting the application. The provided credentials in the `.env` file should match your local PostgreSQL installation.

---

### To create the file directly via command line (Linux/macOS):

```bash
cat > README.md << 'EOF'
[PASTE THE ABOVE CONTENT HERE]
EOF
```

### For Windows:

1. Create a new file named `README.md`
2. Copy/paste the above content
3. Save the file

Remember to:

1. Replace `<your-repository-url>` with your actual Git URL
2. Replace `<project-directory>` with your actual folder name
3. Verify PostgreSQL credentials match your local setup
