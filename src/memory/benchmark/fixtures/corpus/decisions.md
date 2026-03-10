# OpenClaw Development Decisions

## Authentication Strategy

We decided to use JWT (JSON Web Tokens) for authentication in the API.

**Rationale:**
- Stateless authentication reduces server memory load
- Easy to scale horizontally
- Works well with mobile clients
- Industry standard for REST APIs

**Implementation details:**
- 15-minute access tokens
- 7-day refresh tokens
- RS256 algorithm for signing
- Tokens stored in httpOnly cookies for web clients

Decision made: 2024-03-15

## Database Selection

After evaluating options, we chose PostgreSQL as our primary database.

**Why PostgreSQL:**
- Excellent JSONB support for flexible schemas
- Robust indexing capabilities
- Strong ACID guarantees
- Active community and good tooling

**Alternatives considered:**
- MongoDB: Too flexible, risked schema chaos
- MySQL: Less feature-rich for our use case
- SQLite: Not suitable for production scale

Port: 5432
Version: PostgreSQL 15

## API Framework Decision

Selected Express.js for the backend API framework.

**Reasons:**
- Mature ecosystem with extensive middleware
- Team familiarity
- Good performance for our scale
- Excellent TypeScript support via @types/express

**Configuration:**
- Running on port 3000
- Rate limiting: 100 requests/minute per IP
- CORS enabled for *.example.com domains
- Request timeout: 30 seconds

## Caching Strategy

Implemented Redis for caching frequently accessed data.

**Use cases:**
- Session storage
- API response caching (5-minute TTL)
- Rate limiting counters
- Real-time feature flags

Redis version: 7.0
Port: 6379
Max memory: 2GB with LRU eviction

## Frontend Framework

Chose React with Next.js for the frontend.

**Benefits:**
- Server-side rendering for SEO
- Code splitting out of the box
- Great developer experience
- Large talent pool

Build time: ~45 seconds
Bundle size target: <500KB

## Logging Infrastructure

Using structured JSON logging with Winston.

**Log levels:**
- error: Unrecoverable failures
- warn: Recoverable issues
- info: Significant events
- debug: Detailed diagnostics

Logs are shipped to CloudWatch for analysis.
Retention: 30 days

## CI/CD Pipeline

GitHub Actions for continuous integration and deployment.

**Pipeline stages:**
1. Lint and format check (oxlint, prettier)
2. TypeScript compilation
3. Unit tests (vitest)
4. Integration tests
5. Build Docker image
6. Deploy to staging
7. Smoke tests
8. Deploy to production

Average pipeline duration: 8 minutes

## Code Style Guidelines

**Formatting:**
- Tabs for indentation
- Single quotes for strings
- Trailing commas in multiline
- Max line length: 100 characters

**TypeScript:**
- Strict mode enabled
- No any types allowed
- Explicit return types for public functions
- Prefer interfaces over type aliases

Enforced via oxlint and pre-commit hooks.
