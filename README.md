# My Awesome Website

A simple and elegant personal website built with [Hugo](https://gohugo.io/) and the beautiful [LoveIt](https://github.com/dillonzq/LoveIt) theme.

## Features

- ⚡ Fast static site generation with Hugo
- 🎨 Beautiful and responsive LoveIt theme
- 📝 Markdown-based content management
- 🔍 SEO optimized
- 📱 Mobile-friendly design
- 🌓 Dark/light theme support
- 💬 Social media integration ready

## Getting Started

### Prerequisites

- [Hugo Extended](https://gohugo.io/getting-started/installing/) (v0.68.0 or later)
- [Git](https://git-scm.com/)

### Development

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd arockiaraj
   ```

2. Initialize the theme submodule:
   ```bash
   git submodule update --init --recursive
   ```

3. Start the development server:
   ```bash
   hugo server -D
   ```

4. Open your browser and visit `http://localhost:1313`

### Building for Production

To build the static files for production:

```bash
hugo --minify
```

The generated files will be in the `public/` directory.

## Content Structure

```
content/
├── posts/           # Blog posts
│   ├── _index.md   # Posts section page
│   └── *.md        # Individual posts
├── about.md         # About page
└── _index.md        # Homepage content
```

## Customization

### Configuration

Edit `hugo.toml` to customize:
- Site title and description
- Social media links
- Theme settings
- Navigation menu

### Styling

Custom CSS can be added to:
- `assets/css/custom.css` - Main custom styles
- Theme-specific overrides in `assets/`

### Content

- Add new blog posts: `hugo new posts/my-new-post.md`
- Add new pages: `hugo new page-name.md`
- Edit existing content in the `content/` directory

## Deployment

This site can be deployed to various platforms:

- **Netlify**: Connect your Git repository for automatic deployments
- **Vercel**: Import your project for instant deployments
- **GitHub Pages**: Use GitHub Actions for automated publishing
- **Any static hosting**: Upload the `public/` directory

## Resources

- [Hugo Documentation](https://gohugo.io/documentation/)
- [LoveIt Theme Documentation](https://hugoloveit.com/)
- [Markdown Guide](https://www.markdownguide.org/)

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using Hugo and LoveIt theme.