# Embedding Unity WebGL into a React Front End

Integrating a Unity WebGL build into a React application involves embedding the Unity player in a webpage and possibly enabling communication between React (JavaScript) and Unity. There are two main approaches: using a ready-made React Unity integration library or doing it manually.

## Building the Unity WebGL App

First, in Unity, switch to the WebGL build target and build the game. This will produce a set of files (for example, `index.html`, a `Build/` folder with `.js/.wasm` files, etc.). Make sure to do a release build (Development Build unchecked) for production. The output will typically include:

- A `.wasm` file (the WebAssembly binary for your game code)
- A `.js` framework file, and a `.data` file (assets)
- A loader JavaScript file (in newer Unity versions, Unity uses a template that splits into multiple files; older versions had a UnityLoader.js)

These need to be hosted by your React app.

## Option 1 – Using react-unity-webgl

The **React Unity WebGL** library provides an easy way to embed and communicate with Unity content in React. You can install it via npm (`react-unity-webgl`) and then use it as a component in your React code. For example, it allows you to specify the Unity build files (loader, data, framework, wasm) and then simply render a `<Unity>` component in JSX.

This library also gives you hooks for loading progress and a convenient API for sending messages between React and Unity.

- With this library, you don't have to manually edit the HTML. You would place the build files in, say, the public folder or host them on a static server, and then provide their URLs to the `useUnityContext` hook as shown in their docs.

- **Two-way Communication:** React Unity WebGL supports calling Unity scripts from React and vice versa. For instance, you can use the `UnityContext.send()` method to call a C# function on a GameObject inside Unity. You can also have Unity call JavaScript functions or emit an event that React can listen to. This is extremely useful for integration — e.g., Unity can invoke a React callback when the player finishes a level, or React can send data to Unity (like the logged-in user's name or inventory to load).

- **Styling and Resizing:** The Unity component is essentially a canvas element. You can style it via CSS or props (for width/height). Typically, you'd make it fill its container or set specific dimensions. Unity WebGL can be made responsive, but you may need to handle aspect ratio – either design the Unity camera viewport for a fixed ratio or be ready for it to scale/stretch.

## Option 2 – Manual Integration

You can also embed Unity WebGL content without an extra library. This involves using the files Unity built and integrating them into the React app's public HTML:

- Copy the `Build` folder (and any `TemplateData` or other folders Unity produced) into your React app's **public/** directory (or wherever you serve static files). Unity's default build produces an `index.html` which you can open to see how it includes the Unity loader and canvas.

- Edit your React app's `public/index.html`. You will need to insert the script that Unity's index.html uses. In older builds, you include `UnityLoader.js` and call `UnityLoader.instantiate` with the game container div. In newer Unity (since 2019+), the template might have `<script src="Build/xxx.loader.js">` plus data, framework, wasm. Copy those `<script>` tags or their equivalent into the HTML head, and make sure the paths match where you put the files. Also, include the container `<div>` (Unity uses a `<canvas>` or a `<div id="unityContainer">` usually) in the body where you want the game to appear.

- Ensure that the Unity loader is called once the DOM is ready. If you put it directly in index.html as Unity's template shows, it should automatically start. Alternatively, you could trigger it via a script.

- **Serving and MIME types:** Make sure your React build/development server serves the Unity files correctly. Sometimes you need to adjust webpack or the static server for the MIME type of .wasm. Typically Create React App will handle static files in public/ fine. Just double-check that when you build for production, the Unity files are included in the output.

- This manual approach is a bit more rigid – it doesn't provide built-in React hooks for communicating. You can still communicate by JavaScript: for example, from React you can call a Unity function via the global `unityInstance` (Unity usually exposes a JS object for the instance). Or use `SendMessage(gameObjectName, methodName, parameter)` from JavaScript to call into Unity. Conversely, Unity C# can call `Application.ExternalCall` or JavaScript functions through a JSLib plugin. It's all doable, but you'll be writing more boilerplate than if you use a library.

## Passing Data (React ↔ Unity)

One important integration point is how to pass data like user info or state between the React app and Unity:

- **From React to Unity:** Suppose your React app handles user login via Supabase (using supabase-js). Once the user is authenticated, you have a token or user ID. You'll want Unity to know this. If using react-unity-webgl, you might do something like `unityContext.send("GameManager", "OnLogin", token)` to invoke a method on a GameManager object in Unity with the token. If manual, you could call a JS function that Unity's loader provides. For example, Unity's `SendMessage` JavaScript function can target a GameObject by name. A practical example reported by developers: on Unity load, they call a JS function to send a JWT token from React into Unity which then logs the user in. This ensures the Unity game knows who the player is without showing another login.

- **From Unity to React:** Unity can call browser JS functions using a `.jslib` plugin or `Application.ExternalEval`. With react-unity-webgl, you can add event listeners via the UnityContext (e.g., Unity can send an event "GameOver" with a score payload, and React can listen). If doing manually, you might expose a JavaScript function that React defines on `window` for Unity to call. For instance, Unity C# could call `ExternalCall("OnGameOver", score)` which you set up to trigger a JS function that then, say, calls a React component method or uses a global event. Another method is polling – React could periodically ask Unity for data via `SendMessage` to a method that returns something, but events are cleaner.

- In summary, define clear *interfaces* between Unity and React. What information needs to go across? Common cases: user credentials (as mentioned), notifications like "user achieved X", or commands like "pause game". Plan these out and implement either via the React Unity library's API or via custom JavaScript integration.

## Lifecycle Considerations

When embedding in React, consider the lifecycle:

- If your React app is single-page and the Unity component might unmount/remount, you should handle Unity instantiation and destruction. The library will handle a lot of this if used (it has a UnityContext that can be destroyed). If manual, you might need to destroy the Unity instance when leaving the page (Unity doesn't automatically unload on navigation within an SPA).

- If the Unity canvas is just one part of a larger React page (e.g., you have HTML UI around it), ensure the CSS z-index or positioning is such that Unity doesn't overlap incorrectly. Also, Unity's fullscreen mode can be triggered (by default there's a fullscreen button on the loading bar or the canvas if enabled); if you plan to allow that, test it inside the React container.

- **Routing:** If your React app uses client-side routing, and Unity is on a specific route (say `/game`), be mindful that if the user navigates away, you might want to pause or unload Unity to free memory. There is a Unity setting to run in background or not; by default if the canvas is hidden or page is background, Unity will still run unless you handle it. You can catch React route changes to trigger a Unity pause (e.g., call a method that pauses time or an Application.OnPause).

## Supabase Integration via React

One strategy is to let React handle all Supabase calls (since Supabase has a JavaScript library) and then pass relevant data to Unity. For example, React could fetch the player's inventory from Supabase and then feed it into Unity via the methods described. The advantage is you leverage the already-tested JS SDK and avoid CORS issues, etc. The disadvantage is you need to shuttle data between JS and Unity, and there's a bit of duplication.

The other strategy is Unity directly calling Supabase (with the C# SDK or REST calls). You can also mix these: maybe login is done in React (because it's easier with Supabase JS for OAuth, etc.), but game runtime data (like saving progress) Unity calls directly to Supabase REST endpoints with the auth token it was given. Choose an approach that minimizes complexity – often doing as much as possible in Unity (after the initial auth) is fine, just ensure Supabase REST is accessible (WebGL can make web requests as long as CORS is allowed on the Supabase endpoints, which it is for the API).

## Summary

Embedding Unity in React is a solved problem – libraries like react-unity-webgl make it straightforward to drop in the Unity canvas and handle two-way communication. If you prefer a manual route, you can copy the build files into your public folder and reference them as scripts, creating a `<canvas>` for Unity to render into. Either way, plan out how data flows between the React side (which manages user accounts via Supabase) and the Unity side (which runs the game). With the right setup, Unity and React can work together, with React providing the web framework (login, page layout, etc.) and Unity providing the game content.
