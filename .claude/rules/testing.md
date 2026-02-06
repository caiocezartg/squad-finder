## Overview

- **Runner:** [Vitest](https://vitest.dev/)
- **Runtime:** Bun
- **Scope:** Node.js API (Fastify + Clean Architecture)
- **Libs:** Fastify Inject (Integration), Vitest Mocks (Unit)

## Commands (Bun)

| Command             | Description                          |
| :------------------ | :----------------------------------- |
| `bun test`          | Run all backend tests once.          |
| `bun test:watch`    | Run tests in interactive watch mode. |
| `bun test:coverage` | Generate coverage report (v8).       |

---

## Testing Strategy (Clean Architecture)

### Unit Tests (Domain & Application Layers)

**Goal:** Verify business logic in isolation without database or API dependencies.

- **Scope:** Use Cases, Entities, Domain Services.
- **Mocks:** Mock all Repositories and External Services (Discord API).

```typescript
// Example: create-room.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { CreateRoomUseCase } from './CreateRoomUseCase'

describe('CreateRoomUseCase', () => {
  it('should create a room successfully', async () => {
    // Arrange
    const mockRepo = { create: vi.fn().mockResolvedValue({ id: '1' }) }
    const useCase = new CreateRoomUseCase(mockRepo as any)

    // Act
    const result = await useCase.execute({ game: 'LoL', slots: 5 })

    // Assert
    expect(result.id).toBe('1')
    expect(mockRepo.create).toHaveBeenCalledOnce()
  })
})
```
