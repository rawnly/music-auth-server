# Raycast Apple Music Auth

## How do I generate PKCS8 / KID etc?

Here's an in depth [guide](https://leemartin.dev/creating-an-apple-music-api-token-e0e5067e4281)

## Environment Variables

Here is the updated markdown table with checkboxes indicating required variables:

| Variable                  | Required |
| ------------------------- | -------- |
| `NODE_ENV`                | ❌       |
| `PRODUCTION_DOMAIN`       | ✅       |
| `HOST`                    | ❌       |
| `PORT`                    | ❌       |
| `PRIVATE_KEY`             | ✅       |
| `KID`                     | ✅       |
| `APPLE_DEVELOPER_TEAM_ID` | ✅       |
| `EXTENSION_DEEPLINK`      | ✅       |
