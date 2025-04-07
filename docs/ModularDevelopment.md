# Modular Development and WebGL Build Considerations

Designing the game in a modular way will make development more scalable and the WebGL build more efficient. **Modularity** here means separating your game's functionality and content into self-contained pieces that can be developed and tested independently, and potentially loaded on demand.

## Use Multiple Scenes for Separation

Instead of one monolithic scene, consider breaking the game world into sections or layers:

- You might have a **Main Menu** scene (with UI for start, settings, etc.), a **Game World** scene (the main level), and perhaps separate additive scenes for certain features (e.g., an "UI Scene" just for overlay UI, or separate zones loaded additively if your world is large). Unity allows loading scenes additively at runtime, which can help stream content.

- By developing in separate scenes, different team members can work on different scenes without stepping on each other's toes, and you can unload entire scenes to free memory if needed in WebGL. For example, load a lighter "town" scene when the player is in town, and unload the heavy "wilderness" scene to save resources.

- Unity's **Addressables** or **AssetBundles** are useful if you want truly dynamic loading of content in WebGL. In fact, Unity recommends using the Addressables system for loading assets on demand. This could allow you to keep the initial WebGL build small by loading large assets (models, extra scenes, etc.) from the server when needed. The idea is to have a small initial scene (a loader scene) and dynamically load other assets or scenes as the player progresses. This is an advanced optimization: you might start without it and add it as the project grows.

## Prefabs for Reusability

Make heavy use of **Prefabs** for any object that appears multiple times or will be instantiated dynamically:

- Characters (player, NPCs) should be prefabs. This way you can spawn new NPCs at runtime or update the prefab to change all NPC instances easily.

- Interactive props (doors, items, projectiles, etc.) as prefabs so that your code can spawn them or you can place many instances in scenes consistently.

- Having prefabs also helps separate design from logic: e.g., a designer can tweak the prefab's appearance in the editor, while a programmer works on the script attached to the prefab, without creating conflicts.

- Keep prefabs organized (maybe sub-folders by category: Prefabs/Characters, Prefabs/Environment, Prefabs/UI, etc.).

## Decouple Systems with Scripts

Write your scripts in a modular way:

- Follow Unity's component-based design – each script (component) should have a single clear purpose (e.g., a **MovementController** script, an **NPCBehavior** script, an **ItemPickup** script). This makes it easier to enable/disable components as needed and reuse them.

- Use **events** or messaging systems to reduce direct dependencies. For example, the player could have an event like `OnItemPickedUp` that the UI inventory listens to, rather than the player script directly calling the UI. Unity's C# events or UnityEvent can help. Decoupling like this means you can change one system (e.g., swap out the inventory UI) without rewriting the player logic.

- **Testing Modules:** Because WebGL builds take time and can be a bit cumbersome to debug, test your components in the Editor or using Unity's Play Mode frequently. Write editor tests or play mode tests for critical systems if possible. The more modular your components, the easier it is to test them in isolation (e.g., you can drop an NPC prefab into an empty scene to test its AI without the whole game running).

## Prepare for WebGL Export Constraints

Unity WebGL has some limitations to keep in mind as you architect the game:

- **No Threads for C#:** WebGL runs all your game logic on a single thread (due to browser limitations). So avoid designs that rely on `System.Threading` or background threads (they won't run). If you need to perform a heavy task (like a big pathfinding calculation or loading data), you can't simply spin up a background thread for it in WebGL – instead, consider spreading the work over several frames or using coroutines to asynchronously handle it.

- **Memory Management:** WebGL requires you to allocate a heap upfront (Unity's WebGL template will do this). Large assets all add to the download and memory usage. Therefore, unload assets you don't need when possible (e.g., after a level or cutscene, free those textures or models if you won't revisit them). The Addressables system allows unloading bundles to free memory. Also be mindful of using huge collections or excessive instantiations in code – memory is limited compared to a desktop standalone.

- **Build Size:** Keep the build size modular. Only include necessary assets in the initial scenes. Unity can strip unused code (Engine code stripping) and you should enable that for release. Avoid including massive libraries that you don't fully use. For instance, if you included a large pathfinding or physics package but only use 10% of it, see if you can trim it down.

- **Compression:** Unity WebGL builds are usually compressed (Gzip or Brotli). This reduces download size significantly. Ensure your deployment can serve the compressed files with correct headers. The build settings will let you compress; just remember to configure your web server or React app hosting to serve `.br` or `.gz` files with appropriate content-encoding.

- **Testing on Web:** Plan to frequently test your game in a browser, not just in the Editor. Performance can differ (especially on slower JS engines). In fact, generally you should treat WebGL like a less powerful device – e.g., think of it like targeting a mid-range mobile from a few years ago in terms of what it can handle. This mindset will keep your content lean.

- **Set Exceptions Off:** In Player Settings for WebGL, set Exception Support to none or explicit only. Full exceptions support can greatly bloat the build and slow down performance. Unity's advice for best performance is to disable full exception support (but remember this means you get less info if something crashes in release build).

- **Use "Fastest" Optimization:** In Build Settings, use the "Fastest" code optimization for WebGL build. This will prioritize speed over build size. Given that we can compress builds, a slightly larger wasm is fine if it runs faster.

- **Profiling:** Use the Unity Profiler in WebGL builds (with autoconnect, since you can't attach after the fact). Profile early to catch any slowdowns in AI, rendering, etc., and optimize those scripts or assets.

## Modular AI and Interaction

Keep AI and interaction logic modular as well:

- For NPC AI, consider splitting the navigation, sensing, and decision-making into separate components. For example, an NPC could have a **NavMeshAgent** (Unity's pathfinding), a **Sensor** script that detects the player (via trigger collider or vision check), and an **AIStateController** that changes states based on the sensor. Each of these can be modified or optimized independently.

- For interactions, you might have a generic **Interactable** interface or base class that different objects implement (NPCs, items, doors all implement an `Interact()` method for example). Your player interaction code can simply call `hitObject.Interact()` on whatever it hits, without needing to know the specifics. This is an example of modular design in code, making it easy to add new interactable types later without changing the player code.

In summary, think in terms of **independent modules** – scenes that can load/unload, prefabs that can be plugged in, and scripts that don't heavily depend on each other. This will make your Unity project easier to manage and scale, and also help when you deploy to WebGL by allowing you to only load what's necessary at any given time.
