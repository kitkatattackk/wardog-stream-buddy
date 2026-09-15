# WarDog Stream Buddy

I want to build a new chatbot design for streamers. 

I want them to be able to install it directly into stream elements where they can customize it from there. I will be selling it via Etsy

I want it themed after Wardogs. It should include special messages for Subs, gifted subs, bits, etc etc.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4361b7b8-cf00-4a60-bd6a-08b127824f33).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Customer install flow

The public root route is an install handoff rather than a product landing page. Set the
StreamElements overlay share URL when building or deploying:

```sh
VITE_STREAMELEMENTS_INSTALL_URL="https://streamelements.com/your-share-link" bun run build
```

Customers who open `/` are forwarded to StreamElements, where the shared overlay is added to
their library. The interactive development showcase remains at `/preview`, and the standalone
widget preview remains at `/widget/demo.html`.

Create the share link from the finished Wardogs overlay in the StreamElements overlay editor.
Do not use the private OBS browser-source URL as the customer install link.
