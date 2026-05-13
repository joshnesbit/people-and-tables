# people and tables

A small interactive page exploring how different people-and-tables configurations create different kinds of gatherings — block parties, dinner parties, activity fairs, mutual aid, and more.

Filter by table count and people count with the sliders, hover any card to download it, or print the whole graphic. There's also a form to suggest your own people-and-tables combo.

## Run locally

The page is a single static HTML file — just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8091
```

The form posts to a Vercel serverless function at `/api/submit-idea`; to test that locally use `vercel dev`.

## Deployment

Deployed on Vercel. The submission endpoint requires one environment variable:

- `RESEND_API_KEY` — a [Resend](https://resend.com) API key with permission to send from `notifications@relationaltechproject.org`.

The sending domain must be DNS-verified in Resend.

## License

[MIT](LICENSE) — made by a relational technologist ♥
