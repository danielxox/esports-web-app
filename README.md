## Introduction

This project is an **internal web application** designed to help esports teams efficiently manage their operations. Built with **Next.js, Shadcn/UI, PostgreSQL, Drizzle ORM, Clerk for authentication, Tailwind CSS, and Zustand for state management**, it provides a structured and scalable approach to handling team-related activities such as content management, user authentication, and role-based access control.

## Features

### 1. **Authentication and Role-Based Access Control**

- Uses **Clerk** for authentication, allowing users to sign in securely.
- Supports multiple roles (e.g., **admin, coach, player, staff**) to control access to different features.
- Role management ensures that only authorized users can perform CRUD operations.
- **Buttons and UI elements are dynamically rendered** based on roles, allowing:
  - Only **staff members** to write news or edit the food plan.
  - Only **analysts or coaches** to create scrim blocks.

### 2. **Game Data Fetching & Visualization**

- **Main Feature**: Uses the **Game ID from the GRID API** to fetch and visualize League of Legends game data directly in the app.
- Data is stored in a **PostgreSQL database using Drizzle ORM**, making it easy for users to analyze and retrieve insights in multiple ways.
- Provides an **intuitive UI for visualizing match data**, ensuring effective post-game analysis.

### 3. **News & Internal Blog Section**

- A **blog-style news section** where staff can publish, edit, and delete articles.
- Articles support **text, images, and rich formatting**.
- Uses **Next.js API routes** and **Drizzle ORM** to store news posts in **PostgreSQL**.
- Role-based editing: Staff can **manage** articles, while others can only **view** them.

### 4. **Modular and Scalable Architecture**

- Built using a **component-based approach** with **Shadcn/UI** for a polished, modern UI.
- **Tailwind CSS** ensures easy customization and maintainability.
- Uses **Zustand for state management**, allowing better control over UI interactions and global state.
- Pages and features are **independently developed**, allowing easy expansion without breaking core functionality.

### 5. **Database & Backend**

- Uses **PostgreSQL** for a robust and scalable database solution.
- **Drizzle ORM** provides a type-safe, easy-to-manage schema for database interactions.
- API routes in **Next.js** handle **CRUD operations** for news articles, game data storage, authentication, and user roles.

### 6. **Future Expansions**

The project is designed to be **extensible**, with future plans to add:

- **More advanced scrim and match data analysis tools**.
- **OpenAI GPT Integration** for AI-powered insights.
- **Additional role-based functionalities** to refine user experiences for different staff roles.

## Tech Stack

### Technologies Used

- **Next.js** - Server-side rendering, API routes, and routing.
- **Shadcn/UI** - UI component library for modern design.
- **PostgreSQL** - Scalable database for storing team data.
- **Drizzle ORM** - Type-safe ORM for easy database management.
- **GRID API** - Fetches game data for visualization.
- **Clerk** - Authentication and user role management.
- **Tailwind CSS** - Utility-first CSS framework for styling.
- **Zustand** - Lightweight state management for UI interactions.

## Why This Project Matters

Managing an esports team involves multiple layers of **data management, content distribution, and secure access control**. This web app simplifies the process by providing a centralized platform where authorized users can manage news, scrim details, and team information, ensuring **efficient communication and workflow** within the organization.

## Conclusion

This internal web app serves as a foundation for esports teams to streamline their operations while maintaining **clean code, scalable architecture, and an intuitive user experience**. Whether it’s managing **news updates, tracking scrims, or integrating AI-powered insights**, this project is designed to evolve with the needs of the team.

Since I do not have access to the GRID API, I cannot provide a live demo of the app. However, you can check out the code and deploy it yourself. The project is open-source, and contributions are welcome.

I highly recommend using Coolify to deploy the app, as it provides a simple and straightforward process for deploying Next.js apps. You can also use Vercel or any other hosting provider for deployment.

Feel free to reach out to me if you have any questions or feedback. I'm always happy to help!

---
