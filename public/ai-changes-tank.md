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


#### 3 
### 2
## 1
# Tank Game Code Comparison (Before vs After Optimization)

This document shows side-by-side comparisons of the original code vs the
optimized version, with explanations of why changes were made.

------------------------------------------------------------------------

## 1. Game Loop

**Old (multiple `setInterval`)**

``` js
if (timer == null) {
    timer = setInterval(move, speed);
}
if (bulletTimer == null) {
    bulletTimer = setInterval(moveBullets, bulletSpeed);
}
```

**New (single `requestAnimationFrame`)**

``` js
let lastBulletTime = 0;
let lastMoveTime = 0;

function gameLoop(ts) {
    if (status !== "start") return;

    if (ts - lastBulletTime > bulletSpeed) {
        moveBullets();
        lastBulletTime = ts;
    }
    if (ts - lastMoveTime > speed) {
        moveEnemies();
        lastMoveTime = ts;
    }

    drawAll();
    requestAnimationFrame(gameLoop);
}
```

**Why**\
- Old: two independent loops → unsynced, caused frame drops.\
- New: single RAF loop → synced with browser's refresh cycle (60fps),
smoother animations.

------------------------------------------------------------------------

## 2. Direct DOM Manipulation

**Old (per bullet/tank pixel updates)**

``` js
function onPixel(x, y) {
    document.getElementById(`pixel_${x}_${y}`).className = "active";
}

function offPixel(x, y) {
    document.getElementById(`pixel_${x}_${y}`).className = "";
}
```

**New (grid state + batch render)**

``` js
let grid = Array.from({length: 20}, () => Array(10).fill(""));

function mark(x, y, cls="active") {
    if (x >= 0 && x < 10 && y >= 0 && y < 20) grid[y][x] = cls;
}

function renderGrid() {
    for (let y=0; y<20; y++) {
        for (let x=0; x<10; x++) {
            pixels[y][x].className = grid[y][x];
        }
    }
}
```

**Why**\
- Old: `getElementById` inside loops → expensive.\
- New: state array updated in memory, DOM written *once per frame*.

------------------------------------------------------------------------

## 3. Bullet Updates

**Old (array shift/splice inside loop)**

``` js
for (var c = 0; c < bullets.length; c++) {
    bullet = bullets.shift();   // O(n) each time
    ...
    if (bullet != null && bullet.isValid()) {
        bullets.push(bullet);   // reallocation
    }
}
```

**New (filter-based)**

``` js
for (const b of bullets) b.moveForward();
bullets = bullets.filter(b => b.isValid());
```

**Why**\
- Old: `shift()` reindexes the array each time → slow when many
bullets.\
- New: one pass + `filter` → O(n), no costly reindexing.

------------------------------------------------------------------------

## 4. Tank & Bullet Classes

**Old (mixed game logic + DOM updates)**

``` js
Bullet.prototype.appear = function () {
    if (this.isValid()) {
        onPixel(this.pos_x, this.pos_y); // touches DOM
    }
}
```

**New (logic only, rendering handled elsewhere)**

``` js
Bullet.prototype.appear = function () {
    if (this.isValid()) grid[this.pos_y][this.pos_x] = "active";
}
```

**Why**\
- Old: Tight coupling → every bullet called DOM every frame.\
- New: Pure state update → separation of logic & rendering, less DOM
thrash.

------------------------------------------------------------------------

## 5. Bullet--Bullet Collisions

**Old**

``` js
for (var c=0; c < bullets.length; c++) {
    var oppBullet = bullets[c];
    if (bullet.pos_x == oppBullet.pos_x && bullet.pos_y == oppBullet.pos_y) {
        oppBullet.disappear();
        oppBullet.off();
        bullet.off();
    }
}
```

**New (map-based)**

``` js
const map = new Map();
for (const b of bullets) {
    const key = b.pos_x + "," + b.pos_y;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(b);
}
bullets = [];
for (const arr of map.values()) if (arr.length === 1) bullets.push(arr[0]);
```

**Why**\
- Old: O(n²) nested checks.\
- New: O(n) map-based grouping by coordinates.

------------------------------------------------------------------------

## 6. Logging

**Old**

``` js
console.log("move");
console.log("bullet: ", JSON.stringify(bullet));
```

**New**

``` js
// Removed in performance-critical loops
```

**Why**\
- Console logging inside 60fps loops → huge perf hit.\
- Logs only kept where debugging is needed.

------------------------------------------------------------------------

## ✅ Summary

-   Multiple loops → **one game loop**.\
-   Direct DOM updates → **grid state + batch render**.\
-   Array shift/splice → **filter/map**.\
-   Mixed logic/render → **pure logic classes**.\
-   Nested collisions → **map-based O(n)**.\
-   Logging → **removed from loops**.

------------------------------------------------------------------------
