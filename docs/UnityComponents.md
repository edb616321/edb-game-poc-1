# Key Unity Components by Purpose

When starting out, it's best to break the game down into logical components. Below are the essential categories of game components and what to include in each:

## Scene & Environment

This includes your world geometry, scenery, and scene management:

- **World Scene(s):** Design one or more Unity Scenes to represent the 3D world (terrain, buildings, obstacles, etc.). These will serve as the "levels" or areas of the game world.

- **Environment Objects:** Trees, walls, interactive props, etc., placed in the scene. Use **3D colliders** and **rigidbodies** for physical interactions (e.g., walls blocking movement, trigger zones for events).

- **Layering:** Utilize Unity's layer system to differentiate types of objects (e.g., layers for environment, characters, UI) for optimized collision checks and rendering control.

- **Lighting & Camera:** Set up lighting appropriate for WebGL (avoid very heavy real-time shadows for performance). Use a **Camera** that can display 3D scenery but also show 2D sprites correctly. A perspective camera will make 2D characters appear in the 3D space with proper depth; consider using Unity's **Cinemachine** for smooth camera control.

## Player Character (2D in 3D)

The player avatar will be a 2D sprite but navigates the 3D world:

- **Sprite Representation:** Create the character as a flat object (e.g., a Unity **Quad** or a sprite with a SpriteRenderer) that always faces the camera. This technique (billboarding) keeps the 2D sprite from looking flat by having it always oriented toward the viewer. It's common to use a quad with the character's sprite texture applied. Ensure the material/shader supports transparency (cutout or alpha blend) so the sprite's shape is visible without a background.

- **Colliders and Physics:** Even though the character is a sprite, use 3D physics components so it interacts with the 3D world normally. For example, attach a **Box Collider** and possibly a **Rigidbody** (3D, not 2D) to the character object. This allows the 2D character to collide with 3D environment colliders, trigger events, etc., using Unity's standard physics. (Unity won't let an object have both 2D and 3D physics on the same GameObject, so stick to 3D in a 3D world.)

- **Movement & Control:** Implement a Player Controller script to handle input (WASD or arrow keys for movement, etc.) and move the character's transform or Rigidbody. You can use Unity's input system to capture keyboard input or touch events for WebGL (remember to account for both desktop and mobile browser inputs).

- **Animation:** If the character has animations (e.g., different poses or an animated sprite sheet), use Unity's Animator or simple sprite swapping. You might have multiple sprite images for walking, idle, etc., or even use a skeletal 2D animation if needed. Keep animations efficient – sprite sheet animations or Unity's 2D Animation package are fine since they don't add much overhead.

## AI-driven NPCs

Non-player characters in the world that have AI behaviors and interact with the player:

- **NPC Characters:** Similar to the player, NPCs that are characters can be 2D sprites on quads as well (to maintain a consistent art style). Give them colliders for interaction and mark them on a specific layer if you want to detect them separately (e.g., a "NPC" layer).

- **AI Behavior:** Implement an AI system for NPC behavior. A common approach is using a **Finite State Machine (FSM)** or **Behavior Tree** to manage NPC states (e.g., idle, wandering, talking, chasing, etc.). Unity's Animator can also be leveraged to create state machines for AI, or you can write a simple FSM in C#. The FSM will allow NPCs to switch behaviors based on conditions (for example, an NPC could be roaming until the player comes near, then switch to a "greet" state). Developers often use FSMs because they simulate intelligent behavior in a structured way.

- **Navigation:** For moving NPCs (like patrolling guards or followers), utilize Unity's **NavMesh** system. Bake a NavMesh for your scene and add **NavMeshAgent** components to NPCs so they can find paths and move around obstacles automatically. This is preferable to manually coding pathfinding. Ensure the NavMeshAgent is tuned for performance (e.g., not too many agents active at once, and using simple avoidance). Navigation meshes run in native code and are fairly efficient, but be mindful not to overload the CPU with too many agents, since WebGL is single-threaded for your C# code.

- **Interaction with Player:** Decide how NPCs will interact. For example, for dialogue, you might have a trigger collider around the NPC that when the player enters, the NPC can display a dialogue UI. For more dynamic interaction (like combat), NPC AI scripts should detect the player via distance or line-of-sight (raycasts) and respond accordingly. Keep these interaction checks as simple as possible to conserve performance – e.g., check distance infrequently (a few times per second) rather than every frame, if applicable.

## Interaction Logic (World & Gameplay)

Systems that handle how the player and NPCs interact with the environment and each other:

- **Input Manager:** In WebGL, input comes from keyboard, mouse, or touch. Use Unity's Input System or old Input class to route input events to the correct objects. For example, clicking on an object could use raycasting from the camera to select an object in the 3D world. Implement a centralized input or interaction manager that detects clicks or key presses and then triggers the appropriate game events (e.g., picking up an item, opening a door).

- **Interactive Objects:** For doors, chests, switches, etc., create them as **prefabs** with scripts that define their interaction. Use collider triggers or OnMouseDown events (note: OnMouseDown works in WebGL for objects with colliders and if the Event System is set up). When the player interacts, these objects' scripts run (opening a door animation, adding an item to inventory, etc.).

- **Game Manager:** It's wise to have a central **GameManager** object (often a singleton) that keeps track of high-level game state. This could manage the current player stats, inventory, quest states, or whether the game is paused. It also interfaces with the backend (saving/loading data via Supabase). This GameManager can persist across scene loads (use `DontDestroyOnLoad`) so that data isn't lost if you switch scenes or if you have separate scenes for different areas.

## User Interface (UI)

Even though the game is embedded in React, in-game UI is usually handled by Unity for things like health bars, inventory screens, dialogues, etc.:

- **Unity UI Canvas:** Use Unity's Canvas system to create in-game UI. For example, a **HUD Canvas** for health, mana, etc., and an **Inventory/Dialogue Canvas** for when those windows open. Design the UI with resolution scaling in mind (Canvas Scaler set to Scale with Screen Size) since WebGL could run in a browser window of varying size.

- **UI Elements:** Typical elements include Text or TMP text for dialogue, Image components for icons, Buttons for clickable elements. Keep the UI design lightweight; too many UI elements can affect WebGL performance (each UI draw call can add up – Unity's UI batching helps, but avoid overly complex UI on the canvas).

- **Event System:** Ensure there is an **EventSystem** object in the scene (Unity usually adds this automatically) so that UI buttons and inputs work. Be cautious with certain UI events on WebGL (for example, input fields on mobile WebGL have some known issues), though if you keep UI simple you may avoid those problems.

- **UI/React Division:** Decide what UI lives in Unity vs React. For an RPG, most in-game interfaces (character stats, NPC dialogue windows) can be in Unity so they can directly interact with the game state. React can handle outer shell UI like the webpage frame, or things like an account login page, but once in the game, Unity's UI is usually better. That said, you could have React components overlay the Unity game if needed (e.g., React-driven HUD) by positioning HTML elements over the canvas, but this gets complicated. The simpler approach is to do all game UI inside Unity's canvas and only use React for external menus or site navigation.

## Backend Integration (Supabase)

Although not a visible "component" in Unity's scene, integrating the backend touches multiple parts of the game:

- **Networking Module:** Unity WebGL can communicate with web APIs. You should create a **BackendManager** or similar script that handles calls to Supabase (for login, fetching/saving game data). Supabase offers a RESTful API and even a C# client library, which means you can call Supabase directly from C# code. For example, you might use UnityWebRequest to call Supabase endpoints or use the community Supabase C# SDK to handle authentication and queries.

- **User Account Handling:** If the player logs in via the React app's UI, you can pass an auth token or session info into Unity. The Unity game then uses that token to authenticate with Supabase. Alternatively, Unity could present a login UI itself (not typical if React is handling it) – but in either case, Unity needs to know who the user is. Once authenticated, Unity can retrieve data like the player's saved stats, inventory, or game progress from Supabase.

- **Data Storage and Sync:** For an RPG, you might store things like character progress, inventory, or quest completion on the backend. The Unity game should be structured to load this data at appropriate times (e.g., on start or when needed) and to save updates (perhaps on certain events or at intervals). The **GameManager** can orchestrate these calls. Because WebGL has to go over network for backend calls, consider frequency and latency – e.g., maybe cache data locally in the game and only send updates at checkpoints or on logout to reduce constant network usage.

- **Security:** Keep in mind that a WebGL build can be decompiled and its traffic inspected by players. Do not embed secret keys in the Unity build. Use Supabase's provided secure mechanisms (like the JWT from a logged-in user or service role for certain operations) and calls to a secure API. Supabase will handle auth and data rules, but your Unity code should avoid storing any sensitive credentials. In short, Unity should treat Supabase as an external service accessed via HTTP requests – ensure those requests are properly authenticated.
