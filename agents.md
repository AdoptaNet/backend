# AdoptaNet Backend — Agent Context

> **Purpose of this file:** Give any AI coding agent (Claude Code, Cursor, Copilot, Gemini, etc.) full context about this repository so it can propose changes that respect the architecture, conventions, and constraints without requiring human re-explanation.

---

## 1. System Overview

**AdoptaNet** is an undergraduate thesis project (Software Engineering + Computer Science) building a web platform for **rescued animal adoption in Peru**. It uses a **hybrid Machine Learning recommendation system** to match rescued pets with potential adopters based on animal characteristics, adopter preferences/lifestyle, and compatibility scoring.

### System Components

| Component | Tech | Repository | Responsibility |
|-----------|------|------------|----------------|
| **Frontend** | Next.js | Separate repo | UI, user interactions, consumes NestJS REST API |
| **Backend Core (THIS REPO)** | NestJS 11 + TypeScript | `adopta-net` | REST API, authentication (JWT + bcrypt + Google OAuth), business logic, data persistence, orchestration |
| **ML Inference Service** | FastAPI | Separate repo | Hybrid recommendation model, matching/scoring |
| **Database** | PostgreSQL (Supabase / Managed) | Managed | Relational data storage |
| **Realtime** | Supabase Realtime | Managed | WebSocket-based real-time chat subscriptions |
| **Image Storage** | Cloudinary | Managed | Pet photo upload and CDN delivery |
| **Email Service** | Resend + React Email | Managed | Transactional email notifications |

### What This Backend Does

- Exposes REST API endpoints consumed by the Next.js frontend.
- Handles full authentication lifecycle directly: registration, login, Google OAuth, password hashing (bcrypt), and JWT access/refresh token issuance.
- Implements all business logic via Clean Architecture use cases.
- Manages CRUD operations for pets, users, adoption requests, messages, and post-adoption follow-ups.
- Orchestrates calls to the FastAPI ML service for pet-adopter recommendations.
- Handles image uploads to Cloudinary via server-side SDK.
- Sends transactional email notifications via Resend and React Email triggered by domain events.

### What This Backend Does NOT Do

- Does NOT serve the frontend (Next.js runs independently).
- Does NOT train or run ML models (delegated to the FastAPI microservice).

---

## 2. Architecture: Clean Architecture (Feature-Based Modules)

The project follows **Clean Architecture** organized by **feature-based modules**. Each business module contains its own domain, application, infrastructure, and presentation layers.

### Folder Structure

```
src/
├── app.module.ts                  # Root module — imports all feature modules + global config
├── main.ts                        # Bootstrap (NestFactory, global pipes, filters, Swagger)
│
├── shared/                        # Cross-cutting concerns shared across modules
│   ├── domain/                    #   Base classes, shared value objects, common interfaces
│   ├── application/               #   Shared DTOs, common use case abstractions
│   ├── infrastructure/            #   Global exception filters, interceptors, guards, config
│   └── presentation/              #   Shared decorators, common response wrappers
│
├── modules/
│   ├── auth/                      # Authentication module
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── users/                     # User management + adopter/shelter profiles
│   │   ├── domain/
│   │   │   ├── entities/          #     User, AdopterProfile, ShelterProfile
│   │   │   ├── value-objects/     #     UserRole enum, Email, etc.
│   │   │   ├── repositories/     #     Abstract repository interfaces
│   │   │   └── exceptions/       #     UserNotFoundException, etc.
│   │   ├── application/
│   │   │   ├── use-cases/        #     CreateUser, GetUserProfile, UpdateProfile, etc.
│   │   │   ├── dtos/             #     CreateUserDto, UserResponseDto, etc.
│   │   │   └── interfaces/       #     Interfaces for external service dependencies
│   │   ├── infrastructure/
│   │   │   └── repositories/     #     Concrete repository implementations
│   │   └── presentation/
│   │       └── controllers/      #     UsersController
│   │
│   ├── pets/                      # Pet (rescued animal) management
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── adoptions/                 # Adoption request workflow
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── messages/                  # Communication between adopters and shelters
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── follow-ups/                # Post-adoption follow-up tracking
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── recommendations/           # ML service integration (matching)
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── media/                     # Image management (Cloudinary)
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   └── notifications/             # Transactional emails & alerts (Resend + React Email)
│       ├── domain/                #   Notification templates types, value objects
│       ├── application/
│       │   ├── listeners/         #   Domain event listeners (handles side effects asynchronously)
│       │   └── interfaces/        #   EmailService abstract class
│       ├── infrastructure/
│       │   ├── services/          #   ResendEmailService (concrete implementation)
│       │   └── templates/         #   React Email (.tsx) email templates
│       └── presentation/          #   (optional test/webhook endpoints if needed)
│
└── database/
    └── migrations/                # TypeORM auto-generated migrations
```

### Layer Responsibilities

| Layer | Contains | Can Depend On |
|-------|----------|---------------|
| **Domain** | Entities (decorated with TypeORM), value objects, abstract repository interfaces, domain exceptions, domain services | Shared Domain |
| **Application** | Use cases (service classes), input/output DTOs, abstract interfaces for external services | Domain only |
| **Infrastructure** | Concrete repository implementations, external service clients (Cloudinary, ML HTTP client) | Domain + Application |
| **Presentation** | NestJS controllers, route decorators, module-specific guards/decorators | Application (for use cases + DTOs) |

---

## 3. Domain Entities

### User

A single `User` entity extending `AuditableEntity` (includes `id`, `createdAt`, `updatedAt`, `deletedAt` for soft delete).
Key fields:
- `email`: User email (unique).
- `passwordHash`: Bcrypt-hashed password (nullable for Google OAuth users).
- `googleId`: Google OAuth subject ID (nullable for email/password users).
- `fullName`: Display name (nullable).
- `avatarUrl`: Profile picture URL (nullable).
- `role`: Role enum (`adopter`, `shelter`, `admin`). Default: `adopter`.
- `refreshTokenHash`: Hashed refresh token for secure session revocation/rotation (nullable).

Profiles (1:1 relations):
- **AdopterProfile** (1:1 with User) — lifestyle preferences, housing type, experience with pets, schedule, etc. Fed to the ML model for matching.
- **ShelterProfile** (1:1 with User) — organization name, address, rescue capacity, verification status, etc.

### Pet (Mascota)

A rescued animal available for adoption. Key attributes: species, breed, age, size, temperament, health status, vaccination status, sterilization status, photos (Cloudinary URLs), shelter/rescuer who published it, adoption status.

### Adoption Request (Solicitud de Adopción)

Tracks the adoption process. States: `pending` → `under_review` → `approved` | `rejected`. Links an adopter (User) to a pet (Pet). Contains adopter questionnaire responses, shelter notes, timestamps.

### Message (Mensaje)

Communication between an adopter and a shelter/rescuer regarding a specific pet or adoption request. Sender, receiver, content, timestamp, read status.

### Post-Adoption Follow-Up (Seguimiento Post-Adopción)

Records filed after an adoption is approved to verify animal welfare. Scheduled check-ins with status, photos, notes from both adopter and shelter.

---

## 4. Code Conventions

### Naming

| Element | Convention | Example |
|---------|------------|---------|
| Files | `kebab-case` | `create-pet.use-case.ts`, `pet.entity.ts` |
| Classes | `PascalCase` | `CreatePetUseCase`, `PetRepository` |
| Interfaces / Abstract classes | `PascalCase` (no `I` prefix) | `PetRepository` (abstract class), not `IPetRepository` |
| Methods | `camelCase` | `findById()`, `createAdoptionRequest()` |
| DTOs | `PascalCase` with suffix | `CreatePetDto`, `PetResponseDto` |
| Enums | `PascalCase` enum, `UPPER_SNAKE_CASE` values | `enum UserRole { ADOPTER, SHELTER, ADMIN }` |
| Database tables | `snake_case`, plural | `pets`, `adoption_requests`, `users` |
| Database columns | `snake_case` | `created_at`, `shelter_id` |

> [!TIP]
> **Automated Naming Strategy (`SnakePluralNamingStrategy`):**
> The project configures a custom TypeORM naming strategy (`src/shared/infrastructure/database/naming.strategy.ts`).
> - **Tables**: Automatically stripped of `OrmEntity`/`Entity` suffixes, converted to `snake_case`, and pluralized (e.g., `PetOrmEntity` → `pets`, `AdoptionRequestOrmEntity` → `adoption_requests`, `UserProfileOrmEntity` → `user_profiles`).
> - **Columns**: Automatically converted from camelCase property names to `snake_case` (e.g., `birthDate` → `birth_date`, `shelterId` → `shelter_id`).
> - **Foreign keys & relations**: Automatically formatted in `snake_case` (e.g., `user_id`, `pet_id`).
> - **RULE**: Do **NOT** manually specify `@Entity('table_name')` or `@Column({ name: 'column_name' })`. Just use `@Entity()` and `@Column()`, letting the naming strategy handle it automatically.

### File Suffixes

| Type | Suffix | Example |
|------|--------|---------|
| Entity | `.entity.ts` | `pet.entity.ts` |
| Use case | `.use-case.ts` | `create-pet.use-case.ts` |
| Controller | `.controller.ts` | `pets.controller.ts` |
| Repository interface | `.repository.ts` | `pet.repository.ts` |
| Repository implementation | `.typeorm-repository.ts` | `pet.typeorm-repository.ts` |
| DTO | `.dto.ts` | `create-pet.dto.ts` |
| Exception | `.exception.ts` | `pet-not-found.exception.ts` |
| Module | `.module.ts` | `pets.module.ts` |
| Test (unit) | `.spec.ts` | `create-pet.use-case.spec.ts` |
| Test (e2e) | `.e2e-spec.ts` | `pets.e2e-spec.ts` |

### NestJS Module Pattern

Each feature module follows this pattern:

```typescript
// modules/pets/pets.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Pet])],
  controllers: [PetsController],
  providers: [
    CreatePetUseCase,
    GetPetByIdUseCase,
    // ... other use cases
    {
      provide: PetRepository,        // abstract class from domain
      useClass: PetTypeOrmRepository, // concrete implementation from infrastructure
    },
  ],
  exports: [GetPetByIdUseCase],      // only export what other modules need
})
export class PetsModule {}
```

### DTOs and Validation

- **Input DTOs** use `class-validator` decorators and are validated automatically by `ValidationPipe` (configured globally in `main.ts`).
- **Output DTOs** (response DTOs) use `@ApiProperty()` from `@nestjs/swagger` for documentation.
- **Domain entities are NEVER returned directly** from controllers — always map to response DTOs.

```typescript
// application/dtos/create-pet.dto.ts
export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name of the pet' })
  name: string;

  @IsEnum(Species)
  @ApiProperty({ enum: Species })
  species: Species;
  // ...
}
```

### Error Handling

- **Domain exceptions** are custom exception classes (extending a base `DomainException`) defined in each module's `domain/exceptions/` folder.
- A **global ExceptionFilter** in `shared/infrastructure/` catches these domain exceptions and maps them to appropriate HTTP status codes.
- Controllers and use cases **never** throw NestJS HTTP exceptions (`NotFoundException`, etc.) directly — they throw domain exceptions.

```typescript
// domain/exceptions/pet-not-found.exception.ts
export class PetNotFoundException extends DomainException {
  constructor(petId: string) {
    super(`Pet with id ${petId} was not found`);
  }
}
```

---

---

## 5. Authentication (NestJS Native: Email/Password + Google OAuth + JWT)

The platform uses a **100% native NestJS authentication system**. The backend is the single source of truth for user identities, password hashing, OAuth orchestration, and session/token management. The Next.js frontend interacts exclusively with this backend's REST API.

### Dual Authentication Methods

1. **Email & Password**:
   - **Registration (`POST /auth/register`)**: Validates input DTO, hashes the password via `HashingService` (`bcrypt`), persists the `User` entity, and emits a `UserRegisteredEvent`.
   - **Login (`POST /auth/login`)**: Validates credentials against `passwordHash`, issues an access token and a refresh token, and stores the hashed refresh token in the database.
2. **Google OAuth (`passport-google-oauth20`)**:
   - **Initiate (`GET /auth/google`)**: Triggers Passport Google authentication redirect.
   - **Callback (`GET /auth/google/callback`)**: Receives the profile from Google. If the user does not exist, provisions a new `User` with `googleId` and `avatarUrl`. Issues tokens and redirects the user to the frontend with session tokens.

### Token Strategy (Access + Refresh Token Rotation)

- **Access Token (JWT)**: Short-lived (e.g., 15 minutes). Carries user `sub` (UUID), `email`, and `role`. Verified on every protected request via `JwtStrategy` + `JwtAuthGuard`.
- **Refresh Token (JWT)**: Long-lived (e.g., 7 days). Stored hashed (`refreshTokenHash`) in the `users` table for cryptographic revocation and token rotation on `POST /auth/refresh`.
- **Logout (`POST /auth/logout`)**: Invalidates the active refresh token by clearing `refreshTokenHash`.

### Clean Architecture Decoupling

- **Password Hashing**: Defined behind an abstract interface `HashingService` in `application/interfaces/hashing.service.ts` and implemented via `BcryptHashingService` in `infrastructure/services/`. Domain and application layers never depend directly on the `bcrypt` library.
- **Transactional Auth Emails**: Registration verification and password reset emails are triggered by emitting typed domain events (`UserRegisteredEvent`, `PasswordResetRequestedEvent`) via `@nestjs/event-emitter`. The `notifications` module handles rendering (React Email) and delivery (Resend) asynchronously without coupling auth to email infrastructure.

### Endpoints Overview

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `POST` | `/auth/register` | Register new user with email & password | No |
| `POST` | `/auth/login` | Authenticate with email & password | No |
| `GET` | `/auth/google` | Initiate Google OAuth redirect | No |
| `GET` | `/auth/google/callback` | Google OAuth callback URL | No |
| `POST` | `/auth/refresh` | Rotate tokens using valid refresh token | No |
| `POST` | `/auth/logout` | Invalidate active refresh token | Yes (`JwtAuthGuard`) |
| `GET` | `/auth/me` | Retrieve authenticated user profile | Yes (`JwtAuthGuard`) |

### Key Environment Variables

```
JWT_SECRET=your-jwt-access-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-jwt-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:3001
```

### Guards & Decorators

- `JwtAuthGuard` — validates the access JWT on protected routes.
- `RolesGuard` + `@Roles('adopter', 'shelter', 'admin')` decorator — restricts access by user role.
- `@CurrentUser()` param decorator — injects the authenticated `User` into controller handlers.

---

## 6. Database (Supabase / PostgreSQL + TypeORM)

### Connection

TypeORM connects **directly** to the Supabase PostgreSQL instance using the connection string. Configuration is loaded via `@nestjs/config`.

```
DATABASE_HOST=db.xxx.supabase.co
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=xxx
DATABASE_NAME=postgres
```

### ORM Configuration

- `@nestjs/typeorm` with `TypeOrmModule.forRootAsync()` in `AppModule`.
- **Synchronize: `false`** in all environments — use migrations.
- Entities are registered per module using `TypeOrmModule.forFeature([...])`.
- **Naming Strategy**: Uses `SnakePluralNamingStrategy` (`src/shared/infrastructure/database/naming.strategy.ts`) in both `DatabaseModule` and `data-source.ts`. Handles snake_case and English pluralization automatically.

### Migrations

- Migrations are auto-generated using TypeORM CLI: `typeorm migration:generate`.
- Stored in `src/database/migrations/`.
- Applied with: `typeorm migration:run`.
- **Never use `synchronize: true`** — always generate and review migrations.

### Repository Pattern

- **Abstract repository** defined in `domain/repositories/` as an abstract class.
- **Concrete implementation** in `infrastructure/persistence/` using TypeORM's `Repository<T>`.
- Injected via NestJS DI using custom providers (see Module Pattern above).

---

## 7. ML Microservice Integration

### Architecture

The backend communicates with the FastAPI ML service via **HTTP (axios)**. The call is asynchronous at the Node.js event loop level but **synchronous from the user's perspective** (the user waits for the recommendation result within the same request cycle).

### Integration Module: `recommendations`

- An **abstract interface** is defined in `application/interfaces/` (e.g., `RecommendationService`).
- A **concrete HTTP client** in `infrastructure/` implements it using axios.
- The use case (`GetRecommendationsUseCase`) depends only on the abstract interface.

### Contract (PENDING — to be defined by ML team)

```typescript
// Placeholder — exact fields TBD
interface RecommendationRequest {
  adopterId: string;
  adopterProfile: AdopterProfileData;
  // ... additional features TBD
}

interface RecommendationResponse {
  recommendations: Array<{
    petId: string;
    score: number;
    // ... additional metadata TBD
  }>;
}
```

### Error Handling & Resilience

- **Timeout**: Configure a reasonable timeout (e.g., 10s) on the axios call.
- **Fallback**: If the ML service is unavailable, return pets without ML scoring (graceful degradation) or a clear error to the frontend.
- **Retry**: Optional retry with exponential backoff for transient failures.

### Environment Variables

```
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_TIMEOUT=10000
```

---

## 8. Image Management (Cloudinary)

### Flow

1. Frontend sends the image file to a backend endpoint (multipart/form-data).
2. Backend receives the file (via `@UseInterceptors(FileInterceptor(...))` from `@nestjs/platform-express`).
3. Backend uploads the file to Cloudinary using the official `cloudinary` npm package.
4. Backend stores the returned Cloudinary URL in the pet entity.
5. Backend returns the URL to the frontend.

### Module: `media`

- An **abstract interface** `ImageStorageService` in `application/interfaces/`.
- A **concrete implementation** `CloudinaryService` in `infrastructure/` using the Cloudinary SDK.

### Environment Variables

```
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

## 9. Transactional Emails & Notifications (Resend + React Email)

### Architecture & Event-Driven Decoupling

AdoptaNet uses **Resend** as the email delivery service and **React Email** (`@react-email/components`) for building typed, responsive email templates in TSX.

To maintain strict Clean Architecture boundaries, use cases **never** call the email service directly. Instead, they emit **domain events** using `@nestjs/event-emitter`. Event listeners in the `notifications` module catch these events and trigger email delivery asynchronously:

```
[Use Case: UpdateAdoptionStatus] 
       │
       ▼ emits event
[AdoptionStatusChangedEvent]
       │
       ▼ handled by
[AdoptionNotificationListener (notifications module)]
       │
       ▼ calls
[EmailService (abstract interface)]
       │
       ▼ implemented by
[ResendEmailService (infrastructure)] ──> Resend API
```

### Transactional Email Use Cases

1. **Adoption Request Status Change**: Sent to the adopter when a request is `under_review`, `approved`, or `rejected`.
2. **New Adoption Request**: Sent to the shelter/rescuer when a new request is submitted for one of their pets.
3. **Post-Adoption Follow-Up Reminder**: Sent to the adopter and shelter when a scheduled check-in is due.
4. **Welcome Email**: Sent to a new user upon first registration/sync.
5. **Account Verification Email (`VerifyEmailTemplate`)**: Sent upon email/password signup via the Supabase Auth "Send Email" Hook. Contains confirmation link with token hash.
6. **Password Recovery Email (`ResetPasswordTemplate`)**: Sent when a user requests password reset via the Supabase Auth "Send Email" Hook. Contains secure reset link with token hash.

### Key Environment Variables

```
RESEND_API_KEY=re_xxx
EMAIL_FROM=AdoptaNet <notificaciones@adoptanet.pe>
```

---

## 10. Configuration & Environment

- Managed via `@nestjs/config` with `ConfigModule.forRoot({ isGlobal: true })`.
- `.env` file at root (gitignored).
- Environment variables are validated at startup using `class-validator` (via a config validation schema).
- Access config values by injecting `ConfigService` — **never use `process.env` directly** in modules/services.

---

## 11. API Documentation

- Swagger/OpenAPI generated automatically using `@nestjs/swagger`.
- Available at `/api/docs` in development.
- All DTOs must have `@ApiProperty()` decorators.
- All controllers must have `@ApiTags()`, `@ApiOperation()`, and `@ApiResponse()` decorators.

---

## 12. Testing Strategy

### Unit Tests

- **Location**: Co-located with source files (e.g., `create-pet.use-case.spec.ts` next to `create-pet.use-case.ts`).
- **Scope**: Use cases, domain entities, value objects, mappers.
- **Mocking**: Repository interfaces and external service interfaces are mocked via NestJS `Test.createTestingModule()`.
- **Framework**: Jest (pre-configured).

### E2E Tests

- **Location**: `test/` directory at project root.
- **Scope**: Controller endpoints — full request/response cycle.
- **Framework**: Jest + Supertest (pre-configured).

### Running Tests

```bash
npm run test          # Unit tests
npm run test:watch    # Unit tests in watch mode
npm run test:cov      # Unit tests with coverage
npm run test:e2e      # E2E tests
```

---

## 13. Useful Commands

```bash
# Development
npm run start:dev       # Start in watch mode
npm run start:debug     # Start in debug mode with inspector

# Build & Production
npm run build           # Compile TypeScript
npm run start:prod      # Run compiled JS

# Code Quality
npm run lint            # ESLint with auto-fix
npm run format          # Prettier formatting

# Database Migrations (TypeORM CLI)
npx typeorm migration:generate src/database/migrations/MigrationName -d src/database/data-source.ts
npx typeorm migration:run -d src/database/data-source.ts
npx typeorm migration:revert -d src/database/data-source.ts

# Testing
npm run test            # Unit tests
npm run test:e2e        # E2E tests
npm run test:cov        # Coverage report
```

---

## 14. Inviolable Rules

> [!CAUTION]
> These rules are **non-negotiable**. Any AI agent working on this codebase MUST respect all of them when proposing changes.

### Rule 1: No Business Logic in Controllers
Controllers are thin. They validate input (via DTOs + ValidationPipe), call a use case, and return the response DTO. **Zero business logic.**

```typescript
// ✅ CORRECT
@Post()
async create(@Body() dto: CreatePetDto): Promise<PetResponseDto> {
  return this.createPetUseCase.execute(dto);
}

// ❌ WRONG — logic in controller
@Post()
async create(@Body() dto: CreatePetDto) {
  if (dto.age < 0) throw new BadRequestException();  // ← logic here is wrong
  const pet = new Pet(dto);
  await this.petRepo.save(pet);                       // ← direct repo call is wrong
  return pet;
}
```

### Rule 2: Respect the Dependency Rule
Dependencies point **inward** only:
- `presentation` → `application` → `domain`
- `infrastructure` → `application` + `domain`
- **Domain imports NOTHING from other layers.**
- **Application NEVER imports from infrastructure or presentation.**

### Rule 3: Never Return Entities Directly from Controllers
Always map to explicit response DTOs. Entities must never be returned directly from controller endpoints to prevent leaking internal fields or bypassing response contracts.

### Rule 4: External Services Behind Abstractions
All communication with external services (ML microservice, Cloudinary, Resend) **must** go through an abstract interface defined in `application/interfaces/`, with the concrete implementation in `infrastructure/`.

### Rule 5: No Cross-Module Internal Imports
Modules interact through their **public NestJS module API** (exported providers). Never import directly from another module's internal layers.

```typescript
// ❌ WRONG
import { Pet } from '../pets/domain/entities/pet.entity';

// ✅ CORRECT — import from the module's exported service
// PetsModule exports GetPetByIdUseCase, and AdoptionsModule imports PetsModule
```

### Rule 6: Repositories as Abstract Interfaces
Repository interfaces are defined as **abstract classes** in `domain/repositories/`. Concrete TypeORM implementations live in `infrastructure/persistence/`. They are wired via NestJS DI custom providers.

### Rule 7: Domain Events for Cross-Cutting Side Effects
Core use cases (e.g., adoptions, user registration) must **NOT** directly call the email sending service. Instead, emit typed domain events via `@nestjs/event-emitter` (`EventEmitter2`). Event listeners in `notifications/application/listeners/` consume these events asynchronously, keeping the core domain completely decoupled from notification infrastructure.

---

## 15. Tech Stack Summary

| Category | Technology | Version |
|----------|------------|---------|
| Runtime | Node.js | LTS |
| Framework | NestJS | 11.x |
| Language | TypeScript | 5.x |
| ORM | TypeORM | Latest |
| Database | PostgreSQL (Supabase / Managed) | — |
| Realtime | Supabase Realtime (WebSockets) | — |
| Auth | NestJS Native (Passport JWT + Google OAuth + bcrypt) | — |
| Image Storage | Cloudinary (server SDK) | — |
| Email Service | Resend + React Email | — |
| Event Bus | @nestjs/event-emitter | — |
| ML Communication | HTTP via axios | — |
| Validation | class-validator + class-transformer | — |
| API Docs | @nestjs/swagger (OpenAPI) | — |
| Testing | Jest + Supertest | — |
| Linting | ESLint + Prettier | — |
| Config | @nestjs/config (.env) | — |

---

## 16. Formatting & Linting

- **Prettier**: single quotes, trailing commas (`all`), auto end-of-line.
- **ESLint**: TypeScript recommended + type-checked rules. `no-explicit-any` is OFF. `no-floating-promises` and `no-unsafe-argument` are WARN.
- **TypeScript**: strict null checks, no implicit any, strict bind/call/apply, no fallthrough in switch.
