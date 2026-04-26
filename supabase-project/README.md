# Self-Hosted Supabase with Docker

This is the official Docker Compose setup for self-hosted Supabase. It provides a complete stack with all Supabase services running locally or on your infrastructure.

## Getting Started

Follow the detailed setup guide in our documentation: [Self-Hosting with Docker](https://supabase.com/docs/guides/self-hosting/docker)

The guide covers:
- Prerequisites (Git and Docker)
- Initial setup and configuration
- Securing your installation
- Accessing services
- Updating your instance

## What's Included

Always-on services:

- **[Caddy](https://github.com/caddyserver/caddy)** - API gateway / reverse proxy (replaces Kong)
- **[Auth](https://github.com/supabase/auth)** - JWT-based authentication (GoTrue)
- **[PostgREST](https://github.com/PostgREST/postgrest)** - Auto-generated REST API from Postgres schema
- **[Storage](https://github.com/supabase/storage)** - File storage API with Postgres-backed permissions
- **[imgproxy](https://github.com/imgproxy/imgproxy)** - On-demand image resizing and transformation
- **[postgres-meta](https://github.com/supabase/postgres-meta)** - REST API for Postgres introspection
- **[PostgreSQL](https://github.com/supabase/postgres)** - Primary database
- **[Supavisor](https://github.com/supabase/supavisor)** - Postgres connection pooler

On-demand services (use profiles, see below):

- **[Studio](https://github.com/supabase/supabase/tree/master/apps/studio)** - Admin dashboard (`studio` profile)

## Running Studio

Studio is not started by default to save ~768 MB of RAM, and is restricted to localhost-only access in Caddy. Access it via SSH tunnel — it is never reachable from the public internet.

**1. Open an SSH tunnel from your local machine:**
```bash
ssh -L 8000:localhost:8000 user@<server-ip>
```

**2. Start the Studio container on the server:**
```bash
docker compose --profile studio up -d studio
```

**3. Open the dashboard in your browser:**
```
http://localhost:8000/studio
```

**4. Stop Studio when done:**
```bash
docker compose --profile studio down studio
```

Starting Studio takes ~30 seconds for the healthcheck to pass. The basic auth credentials are set via `DASHBOARD_USERNAME` and `DASHBOARD_PASSWORD` in `.env`.

## Documentation

- **[Documentation](https://supabase.com/docs/guides/self-hosting/docker)** - Setup and configuration guides
- **[CHANGELOG.md](./CHANGELOG.md)** - Track recent updates and changes to services
- **[versions.md](./versions.md)** - Complete history of Docker image versions for rollback reference

## Updates

To update your self-hosted Supabase instance:

1. Review [CHANGELOG.md](./CHANGELOG.md) for breaking changes
2. Check [versions.md](./versions.md) for new image versions
3. Update `docker-compose.yml` if there are configuration changes
4. Pull the latest images: `docker compose pull`
5. Stop services: `docker compose down`
6. Start services with new configuration: `docker compose up -d`

**Note:** Consider to always backup your database before updating.

## Community & Support

For troubleshooting common issues, see:
- [GitHub Discussions](https://github.com/orgs/supabase/discussions?discussions_q=is%3Aopen+label%3Aself-hosted) - Questions, feature requests, and workarounds
- [GitHub Issues](https://github.com/supabase/supabase/issues?q=is%3Aissue%20state%3Aopen%20label%3Aself-hosted) - Known issues
- [Documentation](https://supabase.com/docs/guides/self-hosting) - Setup and configuration guides

Self-hosted Supabase is community-supported. Get help and connect with other users:

- [Discord](https://discord.supabase.com) - Real-time chat and community support
- [Reddit](https://www.reddit.com/r/Supabase/) - Official Supabase subreddit

Share your self-hosting experience:

- [GitHub Discussions](https://github.com/orgs/supabase/discussions/39820) - "Self-hosting: What's working (and what's not)?"

## Important Notes

### Security

⚠️ **The default configuration is not secure for production use.**

Before deploying to production, you must:
- Update all default passwords and secrets in the `.env` file
- Generate new JWT secrets
- Review and update CORS settings
- Consider setting up a secure proxy in front of self-hosted Supabase
- Review and adjust network security configuration (ACLs, etc.)
- Set up proper backup procedures

See the [security section](https://supabase.com/docs/guides/self-hosting/docker#configuring-and-securing-supabase) in the documentation.

## License

This repository is licensed under the Apache 2.0 License. See the main [Supabase repository](https://github.com/supabase/supabase) for details.
