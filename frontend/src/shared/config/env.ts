export const settings = {
  version: import.meta.env.VITE_APP_VERSION,
  github:
    import.meta.env.VITE_GITHUB_URL ??
    "https://github.com/Phantom-misis/frontend",

  backend: {
    api: import.meta.env.VITE_API_URL ?? "http://localhost:8000"
  }
}
