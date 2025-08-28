This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Passwords & Admin

- Accounts can now have an optional password.
- User with ID `1` is considered the admin.
- Admin can clear passwords for any account via the new Admin panel.
- When selecting a user that has a password, you’ll be prompted to enter it.
- Set/clear your own password inside the Settings modal.

Notes:
- The client passes the current user id via `X-User-Id` when setting/clearing passwords. Admin (id=1) can clear for any account; users can only modify their own.
- Passwords are hashed with Node.js `crypto.scrypt` using a random salt.
