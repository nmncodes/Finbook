# Finbook - End-to-End Architecture Documentation

## 1. Executive Summary

**Finbook** is a full-stack financial billing and invoice management platform built on the **MERN** stack (MongoDB, Express.js, React, Node.js). It enables businesses and freelancers to manage clients, issue and track customizable invoices, record partial or full payments, compile server-side PDF documents, and deliver invoices to clients via automated SMTP email services.

---

## 2. High-Level System Architecture

```mermaid
flowchart TB
    subgraph ClientTier ["Frontend Tier (Client SPA)"]
        Browser["User Browser / Client Device"]
        subgraph ReactApp ["React 17 SPA (Port 3000 / 80)"]
            Router["React Router v5 (Navigation)"]
            ReduxStore["Redux Toolkit Store\n(auth, invoices, clients, profiles)"]
            MUI["Material-UI v4 Theme\n(Glassmorphic Design)"]
            Charts["Analytics Visualizations\n(ApexCharts / Recharts / DevExpress)"]
            AxiosClient["Axios HTTP Client\n(JWT Interceptor)"]
        end
    end

    subgraph IngressTier ["Web Server & Ingress Tier"]
        Nginx["Nginx 1.21 Reverse Proxy / Web Server\n(Port 80 - SPA Fallback & Static Files)"]
    end

    subgraph ServerTier ["Backend Tier (Express REST API - Port 5000)"]
        ExpressApp["Express.js App Engine (server/index.js)"]
        
        subgraph Middleware ["Middleware Pipeline"]
            Cors["CORS Handler"]
            BodyParser["JSON / URL-Encoded Parser (30MB Limit)"]
            AuthGuard["Auth Middleware (Custom JWT + Google Token Decoder)"]
        end

        subgraph Controllers ["Controllers & Routes"]
            UserCtrl["User Controller\n(/users - Auth & Password Reset)"]
            InvoiceCtrl["Invoice Controller\n(/invoices - CRUD & Totals)"]
            ClientCtrl["Client Controller\n(/clients - Paginated Directory)"]
            ProfileCtrl["Profile Controller\n(/profiles - Business Branding)"]
            PdfEngine["PDF & Email Engine\n(/create-pdf, /fetch-pdf, /send-pdf)"]
        end
    end

    subgraph DataTier ["Persistence Tier"]
        MongoDB[("MongoDB (Port 27017)\nMongoose ODM")]
    end

    subgraph ExternalServices ["External Integrations"]
        GoogleAuth["Google Identity Services\n(OAuth 2.0 Client Auth)"]
        SMTPServer["SMTP Mail Server\n(Nodemailer - Invoices & Passwords)"]
        PhantomJS["html-pdf / PhantomJS Engine\n(HTML to PDF Rasterizer)"]
    end

    %% Flow connections
    Browser -->|HTTP/HTTPS Port 80| Nginx
    Nginx -->|Static Assets / index.html| ReactApp
    Browser -->|OAuth Login| GoogleAuth
    GoogleAuth -.->|Credential Token| ReactApp

    ReactApp -->|REST API Requests (Port 5000)| ExpressApp
    ExpressApp --> Middleware
    Middleware --> Controllers

    UserCtrl -->|CRUD| MongoDB
    InvoiceCtrl -->|CRUD| MongoDB
    ClientCtrl -->|CRUD| MongoDB
    ProfileCtrl -->|CRUD| MongoDB

    PdfEngine -->|Render HTML Template| PhantomJS
    PhantomJS -->|Generate invoice.pdf| ExpressApp
    PdfEngine -->|Send Email with Attachment| SMTPServer
    SMTPServer -->|Deliver Email| Browser
```

---

## 3. Tier-by-Tier Architecture

### 3.1. Frontend Presentation Layer (`/client`)

- **Runtime & Library**: React 17 SPA bootstrapped with Create React App.
- **Routing**: `react-router-dom` v5 providing declarative routing:
  - **Public Routes**: `/` (Home/Landing), `/login`, `/forgot`, `/reset/:token`
  - **Authenticated Routes**: `/dashboard`, `/invoices`, `/invoice` (Creator), `/edit/invoice/:id`, `/invoice/:id` (Invoice Details & Actions), `/customers` (Client Management), `/settings` (Company Profile)
- **State Management**: Centralized store managed via **Redux Toolkit** (`@reduxjs/toolkit`):
  - `authSlice.js`: Authentication state, user profile caching, and JWT persistence in `localStorage`.
  - `invoiceSlice.js`: Invoice collection, single invoice cache, active filters, and async CRUD thunks.
  - `clientSlice.js`: Customer records, pagination state, and customer search filters.
  - `profileSlice.js`: Company metadata (logo, address, bank/payment details, contact information).
- **UI Components & Theme**: Material-UI (v4) configured with custom glassmorphic styling (`backdropFilter: 'blur(16px)'`, card elevation, Outfit/Inter typography).
- **Analytics & Dashboards**:
  - `react-apexcharts`, `recharts`, and `@devexpress/dx-react-chart-material-ui` used in `Dashboard.js` to render total revenue, overdue receivables, and recent payment history.
- **Network Layer**: Axios instance with automatic request interceptors injecting `Authorization: Bearer <token>` into outgoing HTTP headers.

---

### 3.2. Application & API Tier (`/server`)

- **Runtime**: Node.js (ES Module mode: `"type": "module"`).
- **Web Framework**: Express 4.17.1 running on port `5000` (configurable via `PORT` environment variable).
- **Request Processing Pipeline**:
  1. `cors()`: Cross-Origin Resource Sharing.
  2. `express.json({ limit: "30mb" })` & `express.urlencoded({ limit: "30mb" })`: High capacity parser to accommodate Base64 logo uploads and rich document payloads.
  3. `middleware/auth.js`: Dual authentication mechanism:
     - **Custom JWT**: Tokens with length `< 500` verified against `SECRET`.
     - **Google OAuth**: Tokens with length `>= 500` decoded to extract Google subject ID (`sub`).

#### API Routes & Responsibilities

| Endpoint Prefix | Primary Controller | Functionality |
| :--- | :--- | :--- |
| `/users` | `controllers/user.js` | User signup (`bcryptjs` hashing), signin (JWT issue), password reset requests with crypto token. |
| `/invoices` | `controllers/invoices.js` | Create invoice, update payment status, get by creator ID, count invoices for sequence numbers. |
| `/clients` | `controllers/clients.js` | Client directory management, paginated fetching (8 per page), owner-specific queries. |
| `/profiles` | `controllers/profile.js` | Company profile management, Base64 logo persistence, payment detail storage. |
| `/create-pdf` | `index.js` | Invokes `html-pdf` to compile `documents/index.js` template to physical `invoice.pdf`. |
| `/fetch-pdf` | `index.js` | Serves compiled `invoice.pdf` binary stream to the browser for direct download. |
| `/send-pdf` | `index.js` | Renders PDF and executes `nodemailer.sendMail` with HTML email template and PDF attachment. |

---

### 3.3. Document & Notification Engine

1. **PDF Compilation Engine**:
   - Compiles dynamic HTML templates (`server/documents/index.js`) using `html-pdf` backed by PhantomJS.
   - Outputs standard A4 document layout with invoice items, taxes, branding, and payment instructions.
2. **SMTP Dispatch Pipeline**:
   - `nodemailer` transport connected via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`.
   - Sends rich HTML transaction emails (`server/documents/email.js`) attaching the compiled `invoice.pdf`.
   - Sends password reset emails with single-use crypto-signed reset links (1-hour TTL).

---

### 3.4. Persistence Layer (MongoDB & Mongoose)

- **Database**: MongoDB instance (default port `27017`), managed through Mongoose 5 ODM.
- **Connection**: Managed via `mongoose.connect(DB_URL)` with fallback to `mongodb://127.0.0.1:27017/finbook`.

---

## 4. Database Entity Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ PROFILE : owns
    USER ||--o{ CLIENT : manages
    USER ||--o{ INVOICE : creates
    INVOICE ||--|{ ITEM : contains
    INVOICE ||--o{ PAYMENT_RECORD : logs

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password "Bcrypt hashed"
        string resetToken
        Date expireToken
    }

    PROFILE {
        ObjectId _id PK
        string name
        string email UK
        string phoneNumber
        string businessName
        string contactAddress
        string paymentDetails "Bank details & instructions"
        string logo "Base64 encoded string"
        string website
        string_array userId FK "Owner User IDs"
    }

    CLIENT {
        ObjectId _id PK
        string name
        string email
        string phone
        string address
        string_array userId FK "Owner User IDs"
        Date createdAt
    }

    INVOICE {
        ObjectId _id PK
        string invoiceNumber
        string type
        string status "Paid | Partial | Unpaid"
        string currency
        number gst "Tax percentage"
        number subTotal
        number total
        number totalAmountReceived
        string_array creator FK "User ID of creator"
        Date dueDate
        Date createdAt
        string notes
        json client "Embedded Client Snapshot"
    }

    ITEM {
        string itemName
        string unitPrice
        string quantity
        string discount
    }

    PAYMENT_RECORD {
        number amountPaid
        Date datePaid
        string paymentMethod "Cash | Bank Transfer | Card | etc."
        string note
        string paidBy
    }
```

---

## 5. End-to-End Workflow Sequence Diagrams

### 5.1. Invoice Creation & Payment Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as Business Owner
    participant UI as React Client (InvoiceDetails / Modal)
    participant Redux as Redux Thunks
    participant API as Express API (/invoices)
    participant DB as MongoDB

    User->>UI: Fills line items, sets tax (GST) & due date
    UI->>Redux: dispatch(createInvoice(invoiceData))
    Redux->>API: POST /invoices (Bearer Token + JSON Payload)
    API->>DB: new InvoiceModel(invoice).save()
    DB-->>API: Saved Invoice Document
    API-->>Redux: 201 Created (Invoice JSON)
    Redux-->>UI: Redirects to /invoice/:id

    Note over User, UI: Payment Recording
    User->>UI: Opens Payment Modal & inputs payment amount ($)
    UI->>UI: Compute: totalReceived + newAmount >= total ? 'Paid' : 'Partial'
    UI->>Redux: dispatch(updateInvoice({ id, updatedInvoice }))
    Redux->>API: PATCH /invoices/:id (Appends paymentRecord & status)
    API->>DB: findByIdAndUpdate(_id, invoiceData)
    DB-->>API: Updated Document
    API-->>Redux: 200 OK
    Redux-->>UI: Re-renders UI with updated Balance Due & Status tag
```

### 5.2. PDF Rendering & Email Dispatch Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as Business Owner
    participant UI as React Client (InvoiceDetails)
    participant API as Express Server
    participant Templating as documents/index.js & email.js
    participant Phantom as html-pdf (PhantomJS)
    participant FS as Local Filesystem
    participant Mailer as Nodemailer (SMTP)
    actor Client as Customer / Client

    alt Download PDF Locally
        User->>UI: Clicks "Download PDF"
        UI->>API: POST /create-pdf (Invoice & Company payload)
        API->>Templating: Render HTML template
        Templating-->>API: Raw HTML string
        API->>Phantom: pdf.create(html, options).toFile('invoice.pdf')
        Phantom->>FS: Writes invoice.pdf
        API-->>UI: 200 OK
        UI->>API: GET /fetch-pdf
        API->>FS: Reads invoice.pdf
        API-->>UI: Binary Stream (Blob)
        UI->>User: FileSaver.js triggers browser download
    else Send PDF via Email
        User->>UI: Clicks "Send Invoice"
        UI->>API: POST /send-pdf (Invoice, Company & Recipient Email)
        API->>Phantom: Generate invoice.pdf
        Phantom->>FS: Writes invoice.pdf
        API->>Mailer: transporter.sendMail(attachment: invoice.pdf)
        Mailer->>Client: Delivers Invoice Email with attached PDF
        API-->>UI: 200 OK (Email sent)
        UI->>User: Displays success notification
    end
```

---

## 6. Containerization & Deployment Topology

The project provides multi-container deployment via `docker-compose.prod.yml`:

```mermaid
flowchart LR
    subgraph Host ["Production Host / VM"]
        subgraph Ports ["Exposed Ports"]
            Port80["Port 80 (HTTP)"]
            Port5000["Port 5000 (API)"]
        end

        subgraph DockerNetwork ["Docker Bridge Network"]
            subgraph ClientContainer ["Container: client (image: client-prod)"]
                NginxSvc["Nginx 1.21-alpine"]
                StaticFiles["/usr/share/nginx/html (React Build)"]
                NginxConf["nginx.conf (try_files SPA fallback)"]
            end

            subgraph ServerContainer ["Container: server (image: server-prod)"]
                NodeSvc["Node 14-alpine Runtime"]
                AppCode["Express REST Server"]
            end

            subgraph MongoContainer ["Container: MONGODB (image: mongo)"]
                MongoDaemon["mongod process (Port 27017)"]
                MongoData["Database Storage"]
            end
        end
    end

    Port80 --> NginxSvc
    NginxSvc --> StaticFiles
    Port5000 --> NodeSvc
    NodeSvc --> MongoDaemon
```

- **Client Dockerfile**: Multi-stage build (`node:14-alpine` builder creates production bundle; `nginx:1.21.0-alpine` serves static files on port 80 with SPA fallback).
- **Server Dockerfile**: Node.js 14 Alpine environment running Express API on port 5000.
- **Mongo Container**: Official MongoDB image exposing port 27017 to the internal network.

---

## 7. Architectural Observations & Production Hardening

1. **PDF Generation Race Conditions**:
   - In `server/index.js`, `/create-pdf` and `/send-pdf` write to a static file (`${__dirname}/invoice.pdf`).
   - *Impact*: Concurrent requests overwrite each other, causing wrong invoice attachments.
   - *Fix*: Generate unique file paths per request (e.g. `/tmp/invoice-${uuid}.pdf`) or stream generated PDF buffers directly in memory.
2. **Headless Engine Replacement**:
   - `html-pdf` utilizes PhantomJS (deprecated).
   - *Fix*: Migrate to modern headless engines such as `puppeteer`, `playwright`, or `@react-pdf/renderer`.
3. **Asset Storage**:
   - Logos are stored as Base64 strings directly in MongoDB.
   - *Fix*: Offload binary media to Cloud Object Storage (e.g., AWS S3, Cloudinary) and store only public asset URLs.
