# Tank Game Optimization (README)

This document explains the changes made to the original **Tank Game**
implementation to improve performance and smoothness.

------------------------------------------------------------------------

## ⚡ Problem in Original Code

-   Used **`setInterval`** for both tank movement and bullet updates →
    caused multiple unsynced loops.
-   Every bullet/tank move directly updated the **DOM (`getElementById`,
    `className` changes)** → caused layout thrashing & lag.
-   Bullets handled with **`shift()`/`splice()`** → costly array
    operations per frame.
-   Multiple DOM writes per frame → browser reflowed/repainted
    excessively.
-   Debug `console.log` everywhere → slowed down animation loop.

------------------------------------------------------------------------

## ✅ Optimizations Applied

### 1. Unified Game Loop with `requestAnimationFrame`

-   Replaced `setInterval(move, speed)` and
    `setInterval(moveBullets, bulletSpeed)` with a **single RAF loop**.
-   Game loop uses `timestamp` deltas to trigger actions at correct
    intervals (enemy move every `speed` ms, bullets every `bulletSpeed`
    ms).

### 2. Grid-based Rendering

-   Added a **2D `grid[20][10]` state array** to represent the board.
-   Tanks/bullets update the grid instead of touching DOM directly.
-   At the end of each frame → **`renderGrid()` updates DOM in one
    batch**.

### 3. Cached DOM References

-   Cached pixel spans (`pixels[y][x]`) at `setupGameScreen()` instead
    of calling `document.getElementById` repeatedly.

### 4. Efficient Bullet Handling

-   Removed `shift()`/`splice()` array mutations (O(n)).
-   Now uses `filter()` to drop invalid bullets and position-mapping to
    resolve bullet-vs-bullet collisions.

### 5. Clean Tank & Bullet Classes

-   Removed direct DOM calls (`onPixel`, `offPixel`) from class methods.
-   Now they only update state; rendering is handled in one unified
    pass.

### 6. Smarter Rendering

-   DOM updates only happen **once per frame** (via `renderGrid()`).
-   This eliminates flickering/lag from multiple per-bullet per-tank
    writes.

### 7. Reduced Logging

-   Removed `console.log` calls from critical loops.

------------------------------------------------------------------------

## 🎮 New Control Flow

1.  **Initialization** (`init`)
    -   Resets score, level, hero, enemies, bullets.
    -   Spawns hero and initial enemies.
    -   Starts the RAF loop.
2.  **Game Loop (`gameLoop`)**
    -   Runs every frame (60fps).
    -   Checks if enough time passed to move bullets or enemies.
    -   Updates game state.
    -   Calls `drawAll()` → which clears grid, marks
        hero/enemies/bullets, and renders once.
3.  **Pause/Resume**
    -   Controlled by setting `status = "pause"` or `status = "start"`.
    -   RAF stops rendering when not in `start`.

------------------------------------------------------------------------

## 📂 File Changes

-   **tank.html**
    -   All logic and rendering refactored into optimized version.
    -   Old `setInterval` calls removed.
    -   New `gameLoop` introduced.
    -   `Tank` and `Bullet` classes updated to state-only.

------------------------------------------------------------------------

## ⚙️ Configurable Parameters

-   `bulletSpeed` → controls bullet update interval (default 100ms).
-   `speed` → controls enemy tank movement interval (default 3000ms).

------------------------------------------------------------------------

## 🚀 Result

-   Smooth bullet & tank animation (no lag spikes).
-   DOM updates are minimal & batched.
-   Game logic is cleaner, easier to extend (walls, power-ups, AI).

------------------------------------------------------------------------

## Next Steps (Optional Features)

-   Add obstacles/walls into grid state.
-   Improve enemy AI (pathfinding instead of straight chase).
-   Add power-ups (faster bullets, shields, etc.).
-   Add levels with increasing speed/difficulty.

------------------------------------------------------------------------
