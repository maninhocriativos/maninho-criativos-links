# D1 migrations

`migrations/` is the only source of truth for the database schema. Apply it with:

```bash
npm run db:migrate       # local
npm run db:migrate:prod  # remote
```

The root `schema*.sql` files are retained only as historical snapshots and must not be applied to new environments.
