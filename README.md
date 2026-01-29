## Security

Security policy and documentation of past fixes (backdoors, vulnerabilities, dependency changes) are in [SECURITY.md](SECURITY.md).

## Getting Started

Create an `.env` file (this file is not tracked by git). See `.env.example` for a template and [SECURITY.md](SECURITY.md) for required variables and rotation guidance. Example:

```bash
ALCHEMY_API_KEY=SOME-STRING-OF-CHARS
INFURA_API_KEY=SOME-STRING-OF-CHARS
JSON_RPC_URL="https://rpc.builder0x69.io"
NETWORK="goerli"
```

**Requirements:** Node 16, 18, or 20.

```bash
npm install
npm run dev
```

Then visit http://localhost:3000. For a production build:

```bash
npm run build
```

## Contributing
Would you like to contribute to this project?

We are looking for people who want to contribute to the project, not just the code.

## Recommended extensions
 - [BetterComments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments)
 - [GitLents](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)
 - [ENV](https://marketplace.visualstudio.com/items?itemName=IronGeek.vscode-env)

## Built with
 - [TypeScript](https://www.typescriptlang.org/)
 - [Vite](https://vitejs.dev/) + [React](https://react.dev/)
 - [Express](https://expressjs.com/)
 - [MUI](https://mui.com/)
 - [Ethers.js](https://docs.ethers.org/v6/)
 - [Wagmi](https://wagmi.sh/)

## Next Steps
- Add more documentation
- Add other guidelines
