export default defineConfig({
  plugins: [
    tanstackStart({
      deploy: {
        preset: "cloudflare-pages",
      },
    }),
  ],
})