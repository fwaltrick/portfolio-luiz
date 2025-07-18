# Graphic Designer Portfolio

<video src="https://github.com/fwaltrick/portfolio-luiz/blob/main/src/assets/interaction.webm" autoplay loop muted playsinline style="max-width:600px;"></video>

A portfolio for graphic designer Luiz Dominguez, built with React, TypeScript, Tailwind, and a TinaCMS headless setup. The project's goal was to create a fast, accessible, and easily updatable platform that effectively showcases visual work to a bilingual (EN/DE) audience.

The site is statically generated for optimal performance and uses a Git-based workflow for content management, allowing for real-time visual editing. The project is live at **[luizdominguez.com](https://www.luizdominguez.com)**.

# Core Features

- **Dynamic Project Gallery:** Content is managed via MDX and rendered server-side. Includes a category-based filtering system and a feature-rich image lightbox.
- **Headless CMS Integration:** TinaCMS provides a full content management workflow, including an automated image optimization pipeline using Sharp.
- **Bilingual Architecture:** Full internationalization (i18n) support for English and German, managed with i18next, featuring automatic language detection.
- **Performance Optimization:** Fast load times achieved through static site generation, automatic image compression, lazy loading, and component-level code splitting.
- **Declarative UI Animations**: Implemented with Framer Motion for page transitions, list animations, and micro-interactions to provide clear visual feedback.

# Tech Stack

### Frontend & Architecture

- **React 18**: Component-based UI library.
- **TypeScript**: Static typing for JavaScript.
- **Vite**: High-performance build tool and dev server.
- **TailwindCSS 4**: Utility-first CSS framework.
- **Framer Motion**: Animation library for React.
- **React Router DOM**: Client-side routing and code splitting.

### Content & Data

- **TinaCMS**: Git-based headless CMS.
- **MDX**: Markdown with JSX for rich content authoring.
- **Sharp**: High-performance image processing library.
- **i18next**: Internationalization framework.

### UI Components & Libraries

- **Radix UI**: Headless, accessible UI primitives.
- **Heroicons**: SVG icon library.
- **Yet Another React Lightbox**: Image gallery component.
