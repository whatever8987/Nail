

This README assumes:
*   Your Django project root (containing `manage.py`) is `~/Nail/`.
*   Your Django backend code is primarily within the `backend/`, `blog/`, `chatbot/`, `core/`, `payments/`, `salons/`, `tracking/`, and `users/` directories inside `~/Nail/`.
*   Your React frontend code is within the `NailSitePro/client/` directory inside `~/Nail/`.
*   Your frontend project root (containing `package.json`) is `~/Nail/NailSitePro/`.
*   You are using `venv` for Python virtual environments and `npm` or `yarn` for Node.js packages.
*   You are using SQLite locally by default, but PostgreSQL in production.
*   Common deployment tools like Nginx, Gunicorn, and systemd are used for the VPS deployment guide.

---

**File:** `~/Nail/README.md` (Create or replace the existing one in your project root)

```markdown
# Salon Site Builder

A web application to build and manage websites for nail salons, featuring user authentication, salon management, templates, payments, a blog, chatbot, and analytics.

## Features

*   User Authentication (Registration, Login, JWT Tokens)
*   Admin Dashboard for managing salons, leads, etc.
*   User Dashboard for managing their specific salon website and subscription
*   Salon Management (CRUD operations)
*   Template Selection and Preview
*   Website Content Management (via Client Portal)
*   Subscription Management (Stripe integration)
*   Blog with Posts and Comments
*   AI Chatbot Assistant
*   Website Visit Tracking and Analytics (Admin view & API)
*   Internationalization (i18n) for Frontend (React) and Backend (Django)
*   Public Salons Gallery Page

## Technologies Used

### Backend
*   **Framework:** Django, Django REST Framework (DRF)
*   **Authentication:** Simple JWT
*   **Database:** PostgreSQL (Production), SQLite (Local Development)
*   **Static/Media Files:** Whitenoise
*   **API Documentation:** DRF Spectacular
*   **CORS:** django-cors-headers
*   **Payments:** Stripe Python library
*   **AI Chatbot:** Google Gemini API (via backend proxy)
*   **Internationalization:** Django's built-in i18n

### Frontend
*   **Framework:** React
*   **Build Tool:** Vite
*   **Routing:** Wouter
*   **State Management/Data Fetching:** TanStack Query (React Query)
*   **Styling:** Tailwind CSS, Shadcn UI
*   **Internationalization:** i18next, react-i18next

### Deployment (VPS)
*   **Web Server:** Nginx
*   **Application Server:** Gunicorn
*   **Process Manager:** systemd
*   **Database:** PostgreSQL
*   **SSL:** Certbot (Let's Encrypt)

## Prerequisites

Make sure you have the following installed on your local machine:

*   [Python 3.8+](https://www.python.org/downloads/) and `pip` (Python package installer)
*   [Node.js 18+](https://nodejs.org/en/) and `npm` (Node package manager) or `yarn`
*   [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
*   (Optional, Recommended for Windows) [Windows Subsystem for Linux (WSL2)](https://learn.microsoft.com/en-us/windows/wsl/) - makes development environment more similar to Linux VPS.
*   (Optional, Recommended for local Postgres) [PostgreSQL](https://www.postgresql.org/download/) client libraries if connecting to a local Postgres instance, otherwise SQLite is used by default.

## Local Setup

### 1. Clone the Repository

```bash
git clone <repository_url> ~/Nail
cd ~/Nail
```

### 2. Backend Setup (Django)

Navigate to the project root where `manage.py` is located (`~/Nail`).

```bash
cd ~/Nail
```

**a. Create and Activate Python Virtual Environment**

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows using Command Prompt: venv\Scripts\activate
```

**b. Install Python Dependencies**

Ensure you have a `requirements.txt` file at `~/Nail/requirements.txt`.

```bash
pip install -r requirements.txt
```

**c. Configure Environment Variables**

Create a `.env` file in the project root (`~/Nail/.env`). Copy the content from `.env.example` if provided, or create it manually.

```ini
# ~/Nail/.env
DJANGO_SECRET_KEY='your_secret_key_here' # Generate a unique, strong key
DJANGO_DEBUG=True

# Database configuration (default is SQLite)
# For SQLite, no changes needed here by default
# For PostgreSQL (local or remote), uncomment and set:
# DATABASE_URL=postgres://user:password@host:port/database_name

# Stripe Keys (Get these from your Stripe Dashboard)
# For development, test keys are fine.
STRIPE_SECRET_KEY='sk_test_...'
STRIPE_PUBLISHABLE_KEY='pk_test_...'
STRIPE_WEBHOOK_SECRET='whsec_...' # Only needed for webhook testing or local dev webhook setup

# Google Gemini API Key (for Chatbot)
GOOGLE_API_KEY='AIza...' # Get this from Google AI Studio or Google Cloud

# Other potential environment variables...
# EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend # For testing emails to console
# DEFAULT_FROM_EMAIL='webmaster@localhost'
```

**d. Apply Database Migrations**

```bash
python manage.py migrate
```

**e. Create a Superuser (for Django Admin)**

```bash
python manage.py createsuperuser
```

**f. Collect Static Files**

This gathers all static files into the `staticfiles/` directory.

```bash
python manage.py collectstatic
```

**g. Prepare Backend Translations**

If you're working with translations:

```bash
# (Ensure you have gettext tools installed on your OS/WSL: sudo apt install gettext)

# Update .po files for all languages (add new strings)
python manage.py makemessages -a -i "venv/*" -i "staticfiles/*" -i "media/*" -i "db.sqlite3" -i "requirements.txt" -i "schema.json" -i "openapitools.json" -i "README.md" -i "NailSitePro/*"

# Translate strings in locale/<lang>/LC_MESSAGES/django.po using a text editor or Poedit

# Compile the .po files into .mo files
python manage.py compilemessages
```

### 3. Frontend Setup (React)

Navigate to the frontend project directory (`~/Nail/NailSitePro`).

```bash
cd ~/Nail/NailSitePro
```

**a. Install Node Dependencies**

```bash
npm install # or yarn install
```

**b. Configure Frontend Environment Variables**

Create a `.env` file in the frontend project root (`~/Nail/NailSitePro/.env`). Copy from `.env.example` or create it manually.

```ini
# ~/Nail/NailSitePro/.env
# Points to your local Django backend development server
VITE_API_URL=http://localhost:8000

# Stripe Publishable Key (safe to expose in frontend)
VITE_STRIPE_PUBLISHABLE_KEY='pk_test_...' # Use the same key as in backend settings

# Other frontend-specific environment variables...
```

**c. Frontend Translations (JSON Files)**

Ensure your translation JSON files are in the `client/public/locales/<lang>/translation.json` structure (e.g., `client/public/locales/en/translation.json`).

## Running Locally

1.  **Start Backend Server:**
    Navigate to `~/Nail/` and activate your virtual environment.
    ```bash
    cd ~/Nail
    source venv/bin/activate
    python manage.py runserver
    ```
    The backend will typically run on `http://127.0.0.1:8000/`.

2.  **Start Frontend Server:**
    Navigate to `~/Nail/NailSitePro/`.
    ```bash
    cd ~/Nail/NailSitePro
    npm run dev # or yarn dev
    ```
    The frontend will typically run on `http://localhost:3000/` and proxy API requests to your backend.

Open your browser to `http://localhost:3000/` to see the application.

## Deployment to a VPS (Recommended Stack: Ubuntu, Nginx, Gunicorn, PostgreSQL, systemd)

This guide provides a general overview. Specific commands and configurations may vary slightly based on your VPS provider and chosen OS/tools.

### Phase 1: Server Setup

1.  **Connect to VPS:** SSH into your server. Use SSH keys.
2.  **Update System:** `sudo apt update && sudo apt upgrade`
3.  **Create Deployment User:** Create a non-root user for deployment (`sudo adduser your_deployment_user`).
4.  **Configure Firewall (UFW):** `sudo ufw allow OpenSSH`, `sudo ufw enable`. (Later allow Nginx Full).
5.  **Install Dependencies:**
    ```bash
    sudo apt install python3-venv python3-dev libpq-dev nginx curl gettext
    ```
    Install Node.js using `nvm`:
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
    source ~/.bashrc # or appropriate shell config file
    nvm install --lts
    nvm use --lts
    ```
    Install PostgreSQL: `sudo apt install postgresql postgresql-contrib`.

### Phase 2: Database Setup (PostgreSQL)

1.  Connect as postgres user: `sudo -i -u postgres`
2.  Enter psql: `psql`
3.  Create database and user:
    ```sql
    CREATE DATABASE your_db_name;
    CREATE USER your_db_user WITH PASSWORD 'your_strong_production_password';
    GRANT ALL PRIVILEGES ON DATABASE your_db_name TO your_db_user;
    \q
    ```
4.  Exit postgres user: `exit`

### Phase 3: Code Transfer and Backend Setup

1.  **Transfer Code:** Clone your repository to the deployment user's home directory.
    ```bash
    cd /home/your_deployment_user
    git clone <repository_url> your_project_directory
    cd your_project_directory # This is your project root (~/Nail equivalent)
    ```
    *Best Practice: Use SSH keys for Git.*
2.  **Create & Activate Venv:** `python3 -m venv venv` and `source venv/bin/activate`.
3.  **Install Python Deps:** `pip install -r requirements.txt && pip install gunicorn psycopg2-binary`.
4.  **Set Production Environment Variables:** **Crucially**, set environment variables for production. **Do NOT rely on a `.env` file being read by Gunicorn/systemd for sensitive secrets.** The most common secure method is using `Environment=` or `EnvironmentFile=` in your systemd service file (see Gunicorn setup). Define variables for:
    *   `DJANGO_SECRET_KEY` (Generate a new, unique, strong key for production)
    *   `DJANGO_DEBUG=False`
    *   `ALLOWED_HOSTS='your_domain.com,www.your_domain.com,your_vps_ip'`
    *   `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT` (matching your VPS Postgres setup)
    *   `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` (Use production keys)
    *   `GOOGLE_API_KEY`
    *   Any other variables your `settings.py` needs (e.g., email settings if sending emails).
5.  **Apply Migrations:** `python manage.py migrate`.
6.  **Create Superuser:** (If this is a fresh deployment) `python manage.py createsuperuser`.
7.  **Collect Static Files:** `python manage.py collectstatic`. This creates the `staticfiles/` directory at your project root.
8.  **Compile Backend Messages:** `python manage.py compilemessages`. Ensure `locale/` dir is transferred.

### Phase 4: Frontend Build

1.  Navigate to your frontend project directory: `cd /home/your_deployment_user/your_project_directory/NailSitePro`.
2.  **Install Node Deps:** `npm install` (or `yarn install`).
3.  **Set Frontend Production Env Vars:** Create a `.env.production` file (or use `VITE_...` vars directly in your build command if needed) in the frontend root.
    ```ini
    # ~/Nail/your_project_directory/NailSitePro/.env.production
    # Points to your production backend URL (usually the same domain)
    VITE_API_URL=https://your_domain.com/api

    # Production Stripe Publishable Key
    VITE_STRIPE_PUBLISHABLE_KEY='pk_live_...'
    ```
4.  **Build Frontend:**
    ```bash
    npm run build # or yarn build
    ```
    This creates the production build in the `dist/` directory (relative to `NailSitePro/`). This `dist/` directory contains your optimized HTML, JS, CSS, and the `locales/` directory with JSON translations.

### Phase 5: Configure Gunicorn

1.  **Test Gunicorn:** `gunicorn --workers 3 --bind unix:/tmp/your_project.sock backend.wsgi:application` (Replace `backend.wsgi` if needed, run from project root). Ctrl+C to stop.
2.  **Create systemd Service File:** `sudo nano /etc/systemd/system/your_project.service`.
    ```ini
    [Unit]
    Description=Gunicorn daemon for Your Project
    After=network.target postgresql.service # Add postgresql.service if Postgres is on the same server

    [Service]
    User=your_deployment_user
    Group=your_deployment_user # Or group that owns the socket dir, e.g., www-data
    WorkingDirectory=/home/your_deployment_user/your_project_directory
    ExecStart=/home/your_deployment_user/your_project_directory/venv/bin/gunicorn \
              --workers 3 \
              --bind unix:/tmp/your_project.sock \
              backend.wsgi:application # Adjust if your wsgi.py is located elsewhere

    # Pass environment variables (referencing the variables set in Phase 3 step 4)
    Environment=DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY} \
                DEBUG=${DEBUG} \
                ALLOWED_HOSTS=${ALLOWED_HOSTS} \
                POSTGRES_DB=${POSTGRES_DB} \
                POSTGRES_USER=${POSTGRES_USER} \
                POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
                POSTGRES_HOST=${POSTGRES_HOST} \
                POSTGRES_PORT=${POSTGRES_PORT} \
                STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY} \
                STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLIPE_KEY} \
                STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET} \
                GOOGLE_API_KEY=${GOOGLE_API_KEY}
    # Alternatively, use EnvironmentFile=/path/to/your/secret/file

    Restart=on-failure
    StandardOutput=syslog
    StandardError=syslog
    SyslogIdentifier=your_project_gunicorn

    [Install]
    WantedBy=multi-user.target
    ```
3.  **Reload systemd:** `sudo systemctl daemon-reload`.
4.  **Enable & Start:** `sudo systemctl enable your_project.service` and `sudo systemctl start your_project.service`.
5.  **Check Status:** `sudo systemctl status your_project.service` and `sudo journalctl -u your_project.service`.

### Phase 6: Configure Nginx

1.  **Create Server Block:** `sudo nano /etc/nginx/sites-available/your_domain.conf`.
    ```nginx
    server {
        listen 80;
        listen [::]:80;
        server_name your_domain.com www.your_domain.com;

        # Redirect HTTP to HTTPS (Certbot will configure this later)
        # return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name your_domain.com www.your_domain.com;

        # Certbot will add SSL configuration here
        # ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem;
        # ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem;
        # include /etc/letsencrypt/options-ssl-nginx.conf;
        # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;


        location = /favicon.ico { access_log off; log_not_found off; }

        # Serve backend's collected static files (from ~/Nail/staticfiles/)
        location /static/ {
            root /home/your_deployment_user/your_project_directory; # Points to BASE_DIR
            expires 1y;
            add_header Cache-Control "public, no-transform";
        }

        # Serve media files (from ~/Nail/media/)
        location /media/ {
            root /home/your_deployment_user/your_project_directory; # Points to BASE_DIR
            client_max_body_size 100M; # Adjust as needed
        }

        # Serve Stripe Webhook directly to Gunicorn (if not using a separate handler)
        # Ensure this matches your backend/urls.py pattern
        location /stripe/webhook/ {
             proxy_pass http://unix:/tmp/your_project.sock;
             proxy_set_header Host $host;
             proxy_set_header X-Real-IP $remote_addr;
             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
             proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Proxy API requests to Gunicorn (usually /api/)
        location /api/ {
             proxy_pass http://unix:/tmp/your_project.sock;
             proxy_set_header Host $host;
             proxy_set_header X-Real-IP $remote_addr;
             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
             proxy_set_header X-Forwarded-Proto $scheme;
             # Consider adding headers for large uploads if needed by API
             # client_max_body_size 10M;
        }

        # Serve the React frontend for all other paths
        # Points to the build output directory (e.g., ~/Nail/NailSitePro/dist/)
        location / {
            root /home/your_deployment_user/your_project_directory/NailSitePro/dist;
            try_files $uri $uri/ /index.html =404; # Handles client-side routing
        }

        # Optional: Error pages
        error_page 500 502 503 504 /500.html;

        # Optional: Include standard Nginx configurations (adjust paths)
        # include /etc/nginx/conf.d/*.conf;
    }
    ```
    *Ensure Nginx user (`www-data`) has read access to static, media, and frontend `dist` directories, and Gunicorn socket.*
3.  **Enable Site:** `sudo ln -s /etc/nginx/sites-available/your_domain.conf /etc/nginx/sites-enabled/`.
4.  **Test Nginx:** `sudo nginx -t`. Fix errors.
5.  **Reload Nginx:** `sudo systemctl reload nginx`.

### Phase 7: Obtain SSL Certificate (Certbot)

1.  **Allow HTTPS in Firewall:** `sudo ufw allow 'Nginx Full'`.
2.  **Install Certbot:** `sudo snap install --classic certbot && sudo snap install certbot --nginx`.
3.  **Run Certbot:** `sudo certbot --nginx -d your_domain.com -d www.your_domain.com`. Follow prompts. Certbot will modify your Nginx config.
4.  **Test Renewal:** `sudo certbot renew --dry-run`.

### Phase 8: Final Checks and Maintenance

1.  **Test Thoroughly:** Access `https://your_domain.com`. Test login, register, API calls (check network tab), admin site (`/admin/`), media uploads, frontend routing, language switching.
2.  **Monitoring & Logging:** Configure logging in `settings.py` to output to files or syslog (standard with systemd). Monitor Gunicorn and Nginx logs (`sudo journalctl -u your_project.service` or check files in `/var/log/nginx/`).
3.  **Backups:** Implement database backups (e.g., using `pg_dump` with a cron job) and media file backups.
4.  **Regular Updates:** Pull new code (`git pull`), rebuild frontend (`npm run build`), collect static (`python manage.py collectstatic`), compile messages (`python manage.py compilemessages`), apply migrations (`python manage.py migrate`), and restart Gunicorn (`sudo systemctl restart your_project.service`).

This README provides a comprehensive guide. Fill in the bracketed placeholders `<...>` with your actual project-specific details. Good luck with your deployment!
```