# Project Folder Organization Strategy

A well-structured Unity project keeps things organized as the game grows. Here's a recommended folder structure (inside the `Assets/` directory) and what each contains:

| **Folder**       | **Contents & Purpose**                                                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenes/**      | All Unity scene files. Keep scenes in one place for easy access. You might create subfolders if you have many scenes (e.g., `Scenes/World/`, `Scenes/UI/`).      |
| **Scripts/**     | C# scripts organized by feature or type. For example, `Scripts/Characters/` (player and NPC scripts), `Scripts/UI/` (UI logic), `Scripts/Systems/` (general systems like GameManager, backend integration), etc. Keeping code grouped logically makes it easier to navigate. |
| **Prefabs/**     | Prefab assets for reusable game objects. Often subdivided: `Prefabs/Characters/`, `Prefabs/Environment/`, `Prefabs/UI/`, etc. This way, all prefab templates are easy to find for designers and programmers. |
| **Art/**         | All art assets. This can have subfolders like `Art/Models/` for 3D models, `Art/Sprites/` for 2D sprites, `Art/Textures/` for texture files, and `Art/Materials/` for material assets. Keeping a clear separation for art assets is important. You might also include `Art/Animations/` for animation clips or controllers, and `Art/Shaders/` if custom shaders are used. |
| **Audio/**       | Sound effects and music files. Possibly subdivided into `Audio/SFX/` and `Audio/Music/`. Audio mixers or related assets can live here too. |
| **UI/**          | (Optional) You can have a folder specifically for UI assets, if not grouped under Art. For example, `UI/Images/` for UI graphics, `UI/Layouts/` for prefabbed UI screens, etc. (Alternatively, UI prefabs could live under Prefabs, and UI sprites under Art/Sprites; the exact categorization can vary.) |
| **Plugins/** or **ThirdParty/** | Any third-party SDKs, libraries, or plugins (for example, a Supabase Unity SDK, or other Unity Asset Store packages). It's common to keep these separate so that they can be updated or removed easily. Some plugins import to a folder with their name by default – you might leave those, or move into a Plugins folder if possible. |

## Organizational Tips

- Keep the top-level folders relatively few and clear (as in the table above). This structure is similar to recommended practices that emphasize separating Scripts, Art, Audio, Prefabs, and Scenes.

- Inside each folder, create subfolders as needed when the content grows. For instance, under Scripts, you might later add `AI`, `Inventory`, etc., as the number of scripts increases. Don't over-engineer the subfolders at the very beginning – start simple and expand as needed. If you have only five script files total, they can just sit in Scripts/; but when you have 50, group them by feature.

- **Naming Conventions:** Use consistent names. Some teams prefix asset names with category (e.g., "UI_MainMenu.prefab" or "CHAR_Goblin.prefab") to quickly identify them. This is optional but can help when searching assets.

- **Scene Naming:** Consider naming scenes with numbers or categories ("01_MainMenu", "02_IntroCutscene", "Level_Town", "Level_Dungeon1", etc.) to keep them sorted or grouped.

- **Version Control:** Use Git or another version control for your project from the start. This isn't exactly about folders, but it's related – a good folder strategy (like the above) will play nicely with source control. Avoid having files with the same name in different places (Unity might get confused with GUIDs if not managed well).

- Avoid deeply nesting folders for things like materials and textures per model. The advice from Unity veterans is not to create a separate subfolder for every single model's materials, because it becomes too fragmented. Instead, keep one **Materials** folder (maybe with subfolders by environment or character type if needed) and similarly a centralized **Textures** folder. This way, artists know where to find all materials, etc.

- If using Addressables or AssetBundles, you might have a dedicated folder for assets meant to be bundled. Addressables, however, let you mark assets from anywhere, so it's more about labeling than moving files. But logically, you could group content that is optional or streamed into its own folder (e.g., a DLC or large optional assets folder).

In short, organize by **purpose and type**: one area for code, one for visuals, one for audio, etc., and subdivide by feature once it makes sense. This will help everyone find what they need quickly and make the project scalable.
