# EDB Game Proof of Concept

## Project Overview
This repository contains the proof of concept for a browser-based game that utilizes Supabase for backend services. The project builds on existing connection infrastructure to ensure reliable access to all required services.

## Infrastructure Information

### VMware vSphere Environment
- **vSphere IP**: 10.0.0.230
- **Username**: administrator@vsphere.local
- **Password**: Odroid701963#
- **VM Host IP**: 10.0.0.220
- **Connection**: Using govc with `GOVC_URL="10.0.0.230"`, `GOVC_INSECURE=1`
- **VM Management Scripts**: Located in `/root/CascadeProjects/vm-manager/`

### Supabase Environment
- **Domain**: supabase1.brookmanfamily.com
- **Internal IP**: 10.0.0.232
- **Database**: supabase
- **Username**: supabase
- **Password**: supabase
- **Port**: 5432
- **Connection String**: `postgresql://supabase:supabase@supabase1.brookmanfamily.com:5432/supabase`
- **VM Login**: eddyb/eddyb

### NGINX Reverse Proxy (CRITICAL)
- **IP**: 10.0.0.228
- **Username**: eddyb
- **Password**: eddyb
- **Access Command**: `sshpass -p 'eddyb' ssh -o StrictHostKeyChecking=no eddyb@10.0.0.228`
- **CRITICAL RULES**:
  - NEVER create local nginx configurations
  - NEVER attempt to run local nginx containers
  - NEVER modify nginx configurations locally
  - ALL nginx configurations MUST be done on 10.0.0.228

### Domain Setup Process
For adding new domains to the NGINX server:

1. Create Nginx Configuration:
```bash
# SSH to nginx server and create config
sshpass -p 'eddyb' ssh -o StrictHostKeyChecking=no eddyb@10.0.0.228 'echo "upstream SERVICENAME {
    server TARGET_IP:TARGET_PORT;
}

server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN.brookmanfamily.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name DOMAIN.brookmanfamily.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/DOMAIN.brookmanfamily.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN.brookmanfamily.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/DOMAIN.brookmanfamily.com/chain.pem;

    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header Referrer-Policy \"no-referrer-when-downgrade\" always;
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;

    location / {
        proxy_pass http://SERVICENAME;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;
    }

    # Error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}" > /tmp/DOMAIN.conf'
```

2. Generate SSL Certificate:
```bash
# Generate SSL certificate
sshpass -p 'eddyb' ssh -o StrictHostKeyChecking=no eddyb@10.0.0.228 'echo "eddyb" | sudo -S certbot certonly --nginx -d DOMAIN.brookmanfamily.com'
```

3. Apply Configuration:
```bash
# Move config and reload nginx
sshpass -p 'eddyb' ssh -o StrictHostKeyChecking=no eddyb@10.0.0.228 'echo "eddyb" | sudo -S mv /tmp/DOMAIN.conf /etc/nginx/conf.d/ && echo "eddyb" | sudo -S nginx -s reload'
```

## Developer Connection Notes

### PostgreSQL Connection Guidelines
- The application supports both individual connection parameters and connection strings
- Connection strings starting with either `postgresql://` or `postgres://` are valid
- When testing locally, you can use the test values for Brook's Supabase connection:
  - URL: `supabase1.brookmanfamily.com`
  - Database: `supabase`
  - Username: `supabase`
  - Password: `supabase`
  - Port: Default PostgreSQL port (5432)
  - Full connection string: `postgresql://supabase:supabase@supabase1.brookmanfamily.com:5432/supabase`

#### Connection String Validation
- Empty connection strings are considered invalid
- Connection strings must start with `postgresql://`
- If a connection string starts with `postgres://`, it will be automatically corrected to `postgresql://`
- Validation checks include:
  - Presence of a server hostname
  - Presence of a database name
  - Optional username (with a warning if missing)

### Additional Supabase Services
Supabase provides several integrated services beyond just PostgreSQL:

#### REST API (PostgREST)
- Endpoint format: `http://[host]/rest/v1/`
- Authentication: Requires `apikey` header and optional `Authorization` header with JWT
- Example test endpoint: `http://supabase1.brookmanfamily.com/rest/v1/`

#### Auth Service
- Endpoint format: `http://[host]/auth/v1/`
- Health check endpoint: `http://[host]/auth/v1/health`

## Game Development Notes
- This project uses Vite, React, TypeScript, and Shadcn UI components
- Game assets and logic will be built on top of the existing connection infrastructure
- The repository is set up with proper environment configurations for development and production

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a3c9ad1b-2884-4508-942b-cdb0f1bdd809) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a3c9ad1b-2884-4508-942b-cdb0f1bdd809) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
