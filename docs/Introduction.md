# Designing Unity WebGL Components for a React-based RPG

## Introduction

Building a role-playing game (RPG) in Unity with WebGL requires careful planning to ensure the game runs smoothly in a browser and integrates well with a React front end. The game in question will feature 2D character sprites in a 3D world (a **2.5D** style), an interactive environment, AI-driven NPCs, and a backend (Supabase) for user accounts and data.

This documentation outlines the key Unity components to create (grouped by purpose), how to structure them modularly for scalability and WebGL compatibility, a recommended project folder organization, integration tips for embedding the Unity WebGL build into React, and best practices (like WebGL optimizations and handling AI at runtime).

The Jasper9 game project aims to create an immersive RPG experience that can be played directly in the browser, using Unity's powerful game engine capabilities combined with the flexibility of React for the frontend application.
