
import { Integration, KPI, ETLJobMetric, Client } from "./types";

// Integration Form Configurations
export const INTEGRATION_FIELDS: Record<string, { label: string; type: string; placeholder: string }[]> = {
  woo: [
    { label: 'Store URL', type: 'text', placeholder: 'https://myshop.com' },
    { label: 'Consumer Key', type: 'text', placeholder: 'ck_...' },
    { label: 'Consumer Secret', type: 'password', placeholder: 'cs_...' },
  ],
  presta: [
    { label: 'Store URL', type: 'text', placeholder: 'https://myshop.com' },
    { label: 'API Key', type: 'password', placeholder: 'Full Access Key' },
  ],
  magento: [
    { label: 'Base URL', type: 'text', placeholder: 'https://magento-store.com' },
    { label: 'Access Token', type: 'password', placeholder: 'Integration Token' },
  ],
  ga4: [
    { label: 'Property ID', type: 'text', placeholder: '123456789' },
    { label: 'Data Stream ID', type: 'text', placeholder: '987654321' },
  ],
  ads: [ // Google Ads
    { label: 'Customer ID', type: 'text', placeholder: '123-456-7890' },
    { label: 'Developer Token', type: 'password', placeholder: 'Token string' },
  ],
  fb: [ // Meta Ads
    { label: 'Ad Account ID', type: 'text', placeholder: 'act_123456789' },
    { label: 'Access Token', type: 'password', placeholder: 'User Access Token' },
  ],
  tiktok: [
    { label: 'Advertiser ID', type: 'text', placeholder: 'Adv ID' },
    { label: 'Access Token', type: 'password', placeholder: 'Secret Token' },
  ],
  allegro: [
    { label: 'Client ID', type: 'text', placeholder: 'Client ID' },
    { label: 'Client Secret', type: 'password', placeholder: 'Client Secret' },
  ],
  ceneo: [
    { label: 'Shop ID', type: 'text', placeholder: '12345' },
    { label: 'API Key', type: 'password', placeholder: 'API Key' },
  ]
};

// Translations
export const TRANSLATIONS = {
  pl: {
    sidebar: {
      dashboard: 'Pulpit',
      integrations: 'Integracje',
      architecture: 'Architektura',
      docs: 'Dokumentacja',
      lookerStudio: 'Looker Studio',
      signOut: 'Wyloguj',
      version: 'v2.5.0 (Build 1042)'
    },
    landing: {
      nav: { dashboard: 'Pulpit', architecture: 'Architektura', looker: 'Looker Studio', account: 'Konto', register: 'Zarejestruj się' },
      hero: { 
          title: 'Inteligentna Chmura Danych', 
          subtitle: 'PapaData łączy strumienie danych w jeden, wirujący rdzeń inteligencji. Zasilane przez Gemini 2.5 Flash.', 
          startBtn: 'Rozpocznij Analizę' 
      },
      analyzer: {
          module: 'MODUŁ_INTELIGENCJI_GEMINI_V2.5',
          inputLabel: 'Strumień Danych Wejściowych',
          placeholder: 'Wklej JSON, CSV lub tekst nieustrukturyzowany do analizy...',
          btn: 'ROZPOCZNIJ ANALIZĘ',
          processing: 'PRZETWARZANIE...',
          outputLabel: 'Wynik Inteligencji',
          awaiting: 'OCZEKIWANIE NA DANE...',
          connecting: 'Łączenie z Węzłem Gemini...',
          summary: 'Podsumowanie',
          insights: 'Kluczowe Spostrzeżenia',
          sentiment: 'Sentyment',
          confidence: 'Pewność'
      },
      arch: {
          title: 'Architektura Systemu',
          subtitle: 'Wysokopoziomowy przegląd modułów PapaData i procesów przetwarzania.'
      },
      cards: {
          frontend: { title: 'Frontend (SPA)', desc: 'Aplikacja React 19 + Vite obsługująca Panel Administratora.', items: ['TypeScript & Tailwind CSS', 'Kreator wdrożenia', 'Komponenty wizualizacji'] },
          backend: { title: 'Backend (BFF)', desc: 'API Node.js Express zarządzające logiką i połączeniem BigQuery.', items: ['REST API dla Frontendu', 'Zarządzanie konfiguracją klienta', 'Proxy zarządzania sekretami'] },
          etl: { title: 'Przetwarzanie Danych (ETL)', desc: 'Usługi Cloud Run do ekstrakcji danych ze źródeł.', items: ['ETL Google Analytics 4', 'ETL WooCommerce', 'Dataform dla transformacji SQL'] },
          infra: { title: 'Infrastruktura (IaC)', desc: 'Zasoby Google Cloud zarządzane przez Terraform.', items: ['GCS Buckets (Raw, Staging, Curated)', 'Potoki Cloud Build CI/CD', 'Artifact Registry'] },
          storage: { title: 'Przechowywanie i Analityka', desc: 'BigQuery jako centralna hurtownia danych.', items: ['Tabele partycjonowane i klastrowane', 'Dzienne agregaty metryk', 'Widoki KPI'] },
          contracts: { title: 'Kontrakty Danych', desc: 'Definicje YAML dla schematów i metryk.', items: ['metrics.yaml (SLA, Właściciele)', 'reports.yaml (Wymiary)', 'Automatyczna walidacja'] }
      },
      promo: {
        title: 'Odbierz 2 Tygodnie Gratis!',
        text: 'Zarejestruj się, aby otrzymać darmowy dostęp na 14 dni. Poinformujemy Cię przed końcem okresu próbnego o jego wygaśnięciu.',
        btn: 'Odbierz Ofertę',
        maybeLater: 'Może później'
      }
    },
    dashboard: {
      title: 'Przegląd Platformy',
      subtitle: 'Monitoring KPI oraz wydajności procesów ETL.',
      updated: 'Ostatnia aktualizacja',
      revenue: 'Całkowity Przychód',
      sessions: 'Sesje',
      orders: 'Zamówienia',
      revenueTrend: 'Trend Przychodu (7 dni)',
      sessionsOrders: 'Sesje i Zamówienia',
      etlPerformance: 'Wydajność Jobów ETL (Czas w min)',
      dataQuality: 'Jakość Danych (Wiersze: Załadowane vs Błędy)',
      vsLastMonth: 'vs poprzedni miesiąc'
    },
    integrations: {
      title: 'Katalog Integracji',
      subtitle: 'Zarządzaj źródłami danych i miejscami docelowymi dla potoków PapaData.',
      connect: 'Połącz',
      configure: 'Konfiguruj',
      comingSoon: 'Wkrótce',
      connected: 'Podłączone',
      available: 'Dostępne',
      sections: {
        storePlatforms: 'Platforma sklepu',
        campaigns: 'Kampanie',
        warehouse: 'Hurtownia Danych'
      }
    },
    architecture: {
      title: 'Architektura Systemu',
      subtitle: 'Wysokopoziomowy przegląd modułów PapaData.',
      explore: 'Eksploruj architekturę z AI',
      exploreText: 'Nie wiesz, jak potok ETL łączy się z BigQuery? Użyj czatu, aby zapytać asystenta AI o szczegóły techniczne.'
    },
    chat: {
      placeholder: 'Zapytaj o architekturę PapaData...',
      welcome: 'Cześć! Jestem asystentem PapaData. Zapytaj mnie o architekturę, kontrakty danych lub infrastrukturę.',
      analyzing: 'Analizuję dokumentację...',
      disclaimer: 'AI może popełniać błędy. Sprawdź dokumentację.'
    },
    looker: {
      title: 'Looker Studio',
      subtitle: 'Zaawansowane środowisko analityczne dla Twojego konta.',
      welcome: 'Witaj w swoim Studio',
      analyzeBtn: 'Rozpocznij Analizę'
    },
    auth: {
      registerTitle: 'Dołącz do PapaData',
      registerSubtitle: 'Zunifikuj swoje dane w 3 minuty.',
      email: 'Adres e-mail',
      password: 'Hasło',
      company: 'Nazwa Firmy',
      submit: 'Zarejestruj się',
      backToLogin: 'Powrót do logowania',
      step1Title: 'Wybierz Integracje',
      step1Subtitle: 'Zaznacz platformy, których używasz w swoim biznesie.',
      step2Title: 'Skonfiguruj Połączenia',
      step2Subtitle: 'Wprowadź wymagane dane dostępowe dla wybranych usług.',
      finish: 'Zakończ Konfigurację',
      next: 'Dalej',
      previous: 'Wstecz'
    },
    confirmation: {
      title: 'Konfiguracja Przesłana',
      message: 'Dziękujemy za skonfigurowanie połączeń. W ciągu 24 godzin otrzymasz e-mail z potwierdzeniem utworzenia konta, danymi do logowania oraz bezpośrednim linkiem do Twojego Looker Studio.',
      btn: 'Powrót do Strony Głównej'
    }
  },
  en: {
    sidebar: {
      dashboard: 'Dashboard',
      integrations: 'Integrations',
      architecture: 'Architecture',
      docs: 'Contracts & Docs',
      lookerStudio: 'Looker Studio',
      signOut: 'Sign Out',
      version: 'v2.5.0 (Build 1042)'
    },
    landing: {
      nav: { dashboard: 'Dashboard', architecture: 'Architecture', looker: 'Looker Studio', account: 'Account', register: 'Register' },
      hero: { 
          title: 'Intelligent Data Cloud', 
          subtitle: 'PapaData unifies your data streams into a single, rotating core of intelligence. Powered by Gemini 2.5 Flash.', 
          startBtn: 'Start Analyzing' 
      },
      analyzer: {
          module: 'GEMINI_INTELLIGENCE_MODULE_V2.5',
          inputLabel: 'Input Data Stream',
          placeholder: 'Paste JSON, CSV, or unstructured text here for analysis...',
          btn: 'INITIATE ANALYSIS',
          processing: 'PROCESSING...',
          outputLabel: 'Intelligence Output',
          awaiting: 'AWAITING DATA INPUT...',
          connecting: 'Connecting to Gemini Node...',
          summary: 'Summary',
          insights: 'Key Insights',
          sentiment: 'Sentiment',
          confidence: 'Confidence'
      },
      arch: {
          title: 'System Architecture',
          subtitle: 'High-level overview of PapaData modules and how our neural core processes information.'
      },
      cards: {
          frontend: { title: 'Frontend (SPA)', desc: 'React 19 + Vite application serving the Admin Panel.', items: ['TypeScript & Tailwind CSS', 'Onboarding Wizard', 'Visualization Components'] },
          backend: { title: 'Backend (BFF)', desc: 'Node.js Express API managing logic and BigQuery connection.', items: ['Rest API for Frontend', 'Client Configuration Management', 'Secret Management Proxy'] },
          etl: { title: 'Data Processing (ETL)', desc: 'Cloud Run services for extracting data from sources.', items: ['Google Analytics 4 ETL', 'WooCommerce ETL', 'Dataform for SQL Transformations'] },
          infra: { title: 'Infrastructure (IaC)', desc: 'Terraform managed Google Cloud resources.', items: ['GCS Buckets (Raw, Staging, Curated)', 'Cloud Build CI/CD Pipelines', 'Artifact Registry'] },
          storage: { title: 'Storage & Analytics', desc: 'BigQuery as the central data warehouse.', items: ['Partitioned & Clustered Tables', 'Daily Metric Aggregates', 'KPI Views'] },
          contracts: { title: 'Data Contracts', desc: 'YAML definitions for schema and metrics.', items: ['metrics.yaml (SLA, Owners)', 'reports.yaml (Dimensions)', 'Automated Validation'] }
      },
      promo: {
        title: 'Get 2 Weeks Free!',
        text: 'Register to receive 14 days of free service. We will notify you before your trial expires.',
        btn: 'Get Offer',
        maybeLater: 'Maybe later'
      }
    },
    dashboard: {
      title: 'Platform Overview',
      subtitle: 'Daily KPI monitoring and ETL process performance.',
      updated: 'Last updated',
      revenue: 'Total Revenue',
      sessions: 'Total Sessions',
      orders: 'Processed Orders',
      revenueTrend: 'Revenue Trend (7 Days)',
      sessionsOrders: 'Sessions & Orders',
      etlPerformance: 'ETL Job Performance (Duration min)',
      dataQuality: 'Data Quality (Rows: Loaded vs Failed)',
      vsLastMonth: 'vs last month'
    },
    integrations: {
      title: 'Integration Catalog',
      subtitle: 'Manage data sources and destinations for PapaData pipelines.',
      connect: 'Connect',
      configure: 'Configure',
      comingSoon: 'Coming Soon',
      connected: 'Connected',
      available: 'Available',
      sections: {
        storePlatforms: 'Store Platforms',
        campaigns: 'Campaigns & Marketing',
        warehouse: 'Data Warehouse'
      }
    },
    architecture: {
      title: 'System Architecture',
      subtitle: 'High-level overview of PapaData modules.',
      explore: 'Explore architecture with AI',
      exploreText: 'Not sure how the ETL pipeline connects to BigQuery? Use the chat to ask the AI Assistant specific technical questions.'
    },
    chat: {
      placeholder: 'Ask about PapaData architecture...',
      welcome: 'Hello! I am the PapaData AI assistant. Ask me anything about the platform architecture, data contracts, or infrastructure.',
      analyzing: 'Analyzing documentation...',
      disclaimer: 'AI can make mistakes. Check docs.'
    },
    looker: {
      title: 'Looker Studio',
      subtitle: 'Advanced analytics environment for your account.',
      welcome: 'Welcome to your Studio',
      analyzeBtn: 'Start Analysis'
    },
    auth: {
      registerTitle: 'Join PapaData',
      registerSubtitle: 'Unify your data streams in 3 minutes.',
      email: 'Email Address',
      password: 'Password',
      company: 'Company Name',
      submit: 'Create Account',
      backToLogin: 'Back to Login',
      step1Title: 'Select Integrations',
      step1Subtitle: 'Select the platforms you use in your business.',
      step2Title: 'Configure Connections',
      step2Subtitle: 'Enter required access credentials for selected services.',
      finish: 'Finish Setup',
      next: 'Next',
      previous: 'Back'
    },
    confirmation: {
      title: 'Configuration Submitted',
      message: 'Thank you for configuring your connections. You will receive an email within 24 hours confirming your account creation, along with login details and a direct link to your Looker Studio.',
      btn: 'Return to Home'
    }
  },
  de: {
    sidebar: {
      dashboard: 'Dashboard',
      integrations: 'Integrationen',
      architecture: 'Architektur',
      docs: 'Dokumentation',
      lookerStudio: 'Looker Studio',
      signOut: 'Abmelden',
      version: 'v2.5.0 (Build 1042)'
    },
    landing: {
      nav: { dashboard: 'Dashboard', architecture: 'Architektur', looker: 'Looker Studio', account: 'Konto', register: 'Registrieren' },
      hero: { 
          title: 'Intelligente Daten-Cloud', 
          subtitle: 'PapaData vereint Ihre Datenströme in einem einzigen, rotierenden Kern der Intelligenz. Unterstützt von Gemini 2.5 Flash.', 
          startBtn: 'Analyse starten' 
      },
      analyzer: {
          module: 'GEMINI_INTELLIGENZ_MODUL_V2.5',
          inputLabel: 'Eingangsdatenstrom',
          placeholder: 'Fügen Sie hier JSON, CSV oder unstrukturierten Text zur Analyse ein...',
          btn: 'ANALYSE STARTEN',
          processing: 'VERARBEITUNG...',
          outputLabel: 'Intelligenz-Ausgabe',
          awaiting: 'WARTEN AUF DATENEINGABE...',
          connecting: 'Verbindung zum Gemini-Knoten...',
          summary: 'Zusammenfassung',
          insights: 'Wichtige Erkenntnisse',
          sentiment: 'Stimmung',
          confidence: 'Vertrauen'
      },
      arch: {
          title: 'Systemarchitektur',
          subtitle: 'High-Level-Übersicht der PapaData-Module und wie unser neuronaler Kern verarbeitet.'
      },
      cards: {
          frontend: { title: 'Frontend (SPA)', desc: 'React 19 + Vite Anwendung für das Admin-Panel.', items: ['TypeScript & Tailwind CSS', 'Onboarding-Assistent', 'Visualisierungskomponenten'] },
          backend: { title: 'Backend (BFF)', desc: 'Node.js Express API verwaltet Logik und BigQuery-Verbindung.', items: ['Rest API für Frontend', 'Client-Konfigurationsmanagement', 'Secret Management Proxy'] },
          etl: { title: 'Datenverarbeitung (ETL)', desc: 'Cloud Run Dienste zum Extrahieren von Daten aus Quellen.', items: ['Google Analytics 4 ETL', 'WooCommerce ETL', 'Dataform für SQL-Transformationen'] },
          infra: { title: 'Infrastruktur (IaC)', desc: 'Terraform verwaltete Google Cloud Ressourcen.', items: ['GCS Buckets (Raw, Staging, Curated)', 'Cloud Build CI/CD Pipelines', 'Artifact Registry'] },
          storage: { title: 'Speicher & Analytik', desc: 'BigQuery als zentrales Data Warehouse.', items: ['Partitionierte & geclusterte Tabellen', 'Tägliche Metrik-Aggregate', 'KPI-Ansichten'] },
          contracts: { title: 'Datenverträge', desc: 'YAML-Definitionen für Schema und Metriken.', items: ['metrics.yaml (SLA, Eigentümer)', 'reports.yaml (Dimensionen)', 'Automatisierte Validierung'] }
      },
      promo: {
        title: '2 Wochen kostenlos erhalten!',
        text: 'Registrieren Sie sich, um 14 Tage kostenlosen Service zu erhalten. Wir benachrichtigen Sie vor Ablauf.',
        btn: 'Angebot erhalten',
        maybeLater: 'Vielleicht später'
      }
    },
    dashboard: {
      title: 'Plattformübersicht',
      subtitle: 'Tägliche KPI-Überwachung und ETL-Prozessleistung.',
      updated: 'Zuletzt aktualisiert',
      revenue: 'Gesamtumsatz',
      sessions: 'Sitzungen',
      orders: 'Bestellungen',
      revenueTrend: 'Umsatztrend (7 Tage)',
      sessionsOrders: 'Sitzungen & Bestellungen',
      etlPerformance: 'ETL-Leistung (Dauer min)',
      dataQuality: 'Datenqualität (Zeilen: Geladen vs Fehler)',
      vsLastMonth: 'vs Vormonat'
    },
    integrations: {
      title: 'Integrationskatalog',
      subtitle: 'Verwalten Sie Datenquellen und Ziele für PapaData-Pipelines.',
      connect: 'Verbinden',
      configure: 'Konfigurieren',
      comingSoon: 'Demnächst',
      connected: 'Verbunden',
      available: 'Verfügbar',
      sections: {
        storePlatforms: 'Shop-Plattformen',
        campaigns: 'Kampagnen & Marketing',
        warehouse: 'Data Warehouse'
      }
    },
    architecture: {
      title: 'Systemarchitektur',
      subtitle: 'High-Level-Übersicht der PapaData-Module.',
      explore: 'Architektur mit KI erkunden',
      exploreText: 'Unsicher, wie die ETL-Pipeline mit BigQuery verbunden ist? Nutzen Sie den Chat, um dem KI-Assistenten spezifische technische Fragen zu stellen.'
    },
    chat: {
      placeholder: 'Fragen Sie nach der PapaData-Architektur...',
      welcome: 'Hallo! Ich bin der PapaData KI-Assistent. Fragen Sie mich alles zur Plattformarchitektur.',
      analyzing: 'Analysiere Dokumentation...',
      disclaimer: 'KI kann Fehler machen. Überprüfen Sie die Dokumente.'
    },
    looker: {
      title: 'Looker Studio',
      subtitle: 'Erweiterte Analyseumgebung für Ihr Konto.',
      welcome: 'Willkommen in Ihrem Studio',
      analyzeBtn: 'Analyse starten'
    },
    auth: {
      registerTitle: 'Registrieren',
      registerSubtitle: 'Vereinheitlichen Sie Ihre Daten.',
      email: 'E-Mail-Adresse',
      password: 'Passwort',
      company: 'Firmenname',
      submit: 'Konto erstellen',
      backToLogin: 'Zurück zum Login',
      step1Title: 'Integrationen wählen',
      step1Subtitle: 'Wählen Sie die Plattformen aus, die Sie nutzen.',
      step2Title: 'Verbindungen konfigurieren',
      step2Subtitle: 'Geben Sie die erforderlichen Zugangsdaten ein.',
      finish: 'Einrichtung abschließen',
      next: 'Weiter',
      previous: 'Zurück'
    },
    confirmation: {
      title: 'Konfiguration Übermittelt',
      message: 'Vielen Dank für die Konfiguration Ihrer Verbindungen. Sie erhalten innerhalb von 24 Stunden eine E-Mail mit der Bestätigung Ihrer Kontoerstellung, Anmeldedaten und einem direkten Link zu Ihrem Looker Studio.',
      btn: 'Zurück zur Startseite'
    }
  },
  fr: {
    sidebar: {
      dashboard: 'Tableau de bord',
      integrations: 'Intégrations',
      architecture: 'Architecture',
      docs: 'Documentation',
      lookerStudio: 'Looker Studio',
      signOut: 'Déconnexion',
      version: 'v2.5.0 (Build 1042)'
    },
    landing: {
      nav: { dashboard: 'Tableau de bord', architecture: 'Architecture', looker: 'Looker Studio', account: 'Compte', register: 'S\'inscrire' },
      hero: { 
          title: 'Cloud de Données Intelligent', 
          subtitle: 'PapaData unifie vos flux de données en un seul noyau d\'intelligence rotatif. Propulsé par Gemini 2.5 Flash.', 
          startBtn: 'Lancer l\'analyse' 
      },
      analyzer: {
          module: 'MODULE_INTELLIGENCE_GEMINI_V2.5',
          inputLabel: 'Flux de Données Entrant',
          placeholder: 'Collez JSON, CSV ou texte non structuré ici pour analyse...',
          btn: 'LANCER L\'ANALYSE',
          processing: 'TRAITEMENT...',
          outputLabel: 'Résultat de l\'Intelligence',
          awaiting: 'EN ATTENTE DE DONNÉES...',
          connecting: 'Connexion au Nœud Gemini...',
          summary: 'Résumé',
          insights: 'Points Clés',
          sentiment: 'Sentiment',
          confidence: 'Confiance'
      },
      arch: {
          title: 'Architecture Système',
          subtitle: 'Vue d\'ensemble des modules PapaData et comment notre noyau neuronal traite l\'information.'
      },
      cards: {
          frontend: { title: 'Frontend (SPA)', desc: 'Application React 19 + Vite servant le panneau d\'administration.', items: ['TypeScript & Tailwind CSS', 'Assistant d\'intégration', 'Composants de visualisation'] },
          backend: { title: 'Backend (BFF)', desc: 'API Node.js Express gérant la logique et la connexion BigQuery.', items: ['API Rest pour Frontend', 'Gestion de la configuration client', 'Proxy de gestion des secrets'] },
          etl: { title: 'Traitement des Données (ETL)', desc: 'Services Cloud Run pour l\'extraction de données.', items: ['ETL Google Analytics 4', 'ETL WooCommerce', 'Dataform pour transformations SQL'] },
          infra: { title: 'Infrastructure (IaC)', desc: 'Ressources Google Cloud gérées par Terraform.', items: ['Buckets GCS (Raw, Staging, Curated)', 'Pipelines CI/CD Cloud Build', 'Artifact Registry'] },
          storage: { title: 'Stockage & Analytique', desc: 'BigQuery comme entrepôt de données central.', items: ['Tables partitionnées et clusterisées', 'Agrégats de métriques quotidiens', 'Vues KPI'] },
          contracts: { title: 'Contrats de Données', desc: 'Définitions YAML pour schémas et métriques.', items: ['metrics.yaml (SLA, Propriétaires)', 'reports.yaml (Dimensions)', 'Validation automatisée'] }
      },
      promo: {
        title: 'Obtenez 2 semaines gratuites !',
        text: 'Inscrivez-vous pour bénéficier de 14 jours gratuits. Nous vous informerons avant l\'expiration.',
        btn: 'Obtenir l\'offre',
        maybeLater: 'Peut-être plus tard'
      }
    },
    dashboard: {
      title: 'Vue d\'ensemble',
      subtitle: 'Suivi quotidien des KPI et performance ETL.',
      updated: 'Dernière mise à jour',
      revenue: 'Revenu total',
      sessions: 'Sessions',
      orders: 'Commandes',
      revenueTrend: 'Tendance revenus (7 jours)',
      sessionsOrders: 'Sessions & Commandes',
      etlPerformance: 'Performance ETL (Durée min)',
      dataQuality: 'Qualité des données (Lignes: Chargées vs Échecs)',
      vsLastMonth: 'vs mois dernier'
    },
    integrations: {
      title: 'Catalogue d\'intégrations',
      subtitle: 'Gérez les sources de données et destinations pour PapaData.',
      connect: 'Connecter',
      configure: 'Configurer',
      comingSoon: 'Bientôt',
      connected: 'Connecté',
      available: 'Disponible',
      sections: {
        storePlatforms: 'Plateformes E-commerce',
        campaigns: 'Campagnes & Marketing',
        warehouse: 'Entrepôt de données'
      }
    },
    architecture: {
      title: 'Architecture Système',
      subtitle: 'Vue d\'ensemble des modules PapaData.',
      explore: 'Explorer l\'architecture avec l\'IA',
      exploreText: 'Pas sûr de la connexion entre ETL et BigQuery ? Utilisez le chat pour poser des questions techniques.'
    },
    chat: {
      placeholder: 'Posez une question sur l\'architecture...',
      welcome: 'Bonjour ! Je suis l\'assistant IA PapaData. Posez-moi des questions sur l\'architecture.',
      analyzing: 'Analyse de la documentation...',
      disclaimer: 'L\'IA peut faire des erreurs. Vérifiez la doc.'
    },
    looker: {
      title: 'Looker Studio',
      subtitle: 'Environnement d\'analyse avancé pour votre compte.',
      welcome: 'Bienvenue dans votre Studio',
      analyzeBtn: 'Lancer l\'analyse'
    },
    auth: {
      registerTitle: 'S\'inscrire',
      registerSubtitle: 'Unifiez vos données.',
      email: 'Adresse e-mail',
      password: 'Mot de passe',
      company: 'Nom de l\'entreprise',
      submit: 'Créer un compte',
      backToLogin: 'Retour connexion',
      step1Title: 'Choisir Intégrations',
      step1Subtitle: 'Sélectionnez les plateformes que vous utilisez.',
      step2Title: 'Configurer Connexions',
      step2Subtitle: 'Entrez les identifiants requis.',
      finish: 'Terminer',
      next: 'Suivant',
      previous: 'Retour'
    },
    confirmation: {
      title: 'Configuration Soumise',
      message: 'Merci d\'avoir configuré vos connexions. Vous recevrez un e-mail dans les 24 heures confirmant la création de votre compte, ainsi que vos identifiants de connexion et un lien direct vers votre Looker Studio.',
      btn: 'Retour à l\'accueil'
    }
  }
};

// Mock Data for Dashboard
export const MOCK_KPIS: KPI[] = [
  { date: '2023-10-01', sessions: 1200, revenue: 4500, orders: 85 },
  { date: '2023-10-02', sessions: 1350, revenue: 4800, orders: 92 },
  { date: '2023-10-03', sessions: 1100, revenue: 3900, orders: 78 },
  { date: '2023-10-04', sessions: 1600, revenue: 6200, orders: 115 },
  { date: '2023-10-05', sessions: 1500, revenue: 5800, orders: 105 },
  { date: '2023-10-06', sessions: 1800, revenue: 7100, orders: 130 },
  { date: '2023-10-07', sessions: 1750, revenue: 6900, orders: 125 },
];

// New Mock Data for ETL Performance (Request 2)
export const MOCK_ETL_METRICS: ETLJobMetric[] = [
  { date: '2023-10-01', durationMinutes: 12, rowsLoaded: 15000, rowsFailed: 120 },
  { date: '2023-10-02', durationMinutes: 14, rowsLoaded: 18500, rowsFailed: 45 },
  { date: '2023-10-03', durationMinutes: 11, rowsLoaded: 12000, rowsFailed: 0 },
  { date: '2023-10-04', durationMinutes: 25, rowsLoaded: 45000, rowsFailed: 230 },
  { date: '2023-10-05', durationMinutes: 18, rowsLoaded: 28000, rowsFailed: 15 },
  { date: '2023-10-06', durationMinutes: 15, rowsLoaded: 31000, rowsFailed: 80 },
  { date: '2023-10-07', durationMinutes: 13, rowsLoaded: 29000, rowsFailed: 10 },
];

// Updated Mock Data for Integrations based on user request
export const MOCK_INTEGRATIONS: Integration[] = [
  // Store Platforms
  { id: 'woo', name: 'WooCommerce', type: 'source', category: 'ecommerce', status: 'connected', icon: 'ShoppingCart', description: 'Orders, products, and customer data sync.' },
  { id: 'presta', name: 'PrestaShop', type: 'source', category: 'ecommerce', status: 'available', icon: 'ShoppingBag', description: 'Complete catalog and order integration.' },
  { id: 'magento', name: 'Magento', type: 'source', category: 'ecommerce', status: 'coming_soon', icon: 'Layers', description: 'Enterprise e-commerce data ingestion.' },
  
  // Campaigns
  { id: 'ga4', name: 'Google Analytics 4', type: 'source', category: 'marketing', status: 'connected', icon: 'BarChart3', description: 'User behavior and event streams.' },
  { id: 'ads', name: 'Google Ads', type: 'source', category: 'marketing', status: 'available', icon: 'Megaphone', description: 'Ad performance, costs, and conversions.' },
  { id: 'fb', name: 'Meta Ads', type: 'source', category: 'marketing', status: 'available', icon: 'Facebook', description: 'Social campaign metrics and attribution.' },
  { id: 'tiktok', name: 'TikTok Ads', type: 'source', category: 'marketing', status: 'coming_soon', icon: 'Video', description: 'Viral content and ad reach analytics.' },
  { id: 'allegro', name: 'Allegro', type: 'source', category: 'marketing', status: 'coming_soon', icon: 'Package', description: 'Marketplace offers and transaction data.' },
  { id: 'ceneo', name: 'Ceneo', type: 'source', category: 'marketing', status: 'coming_soon', icon: 'Tags', description: 'Price comparison and click-stream data.' },

  // Warehouse (Kept for completeness)
  { id: 'bq', name: 'BigQuery', type: 'destination', category: 'warehouse', status: 'connected', icon: 'Database', description: 'Main data warehouse for analytics.' },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'TechStart Inc.', status: 'active', integrations: ['GA4', 'BigQuery'], lastSync: '10 min ago' },
  { id: 'c2', name: 'ShopifyStore', status: 'onboarding', integrations: ['WooCommerce'], lastSync: 'Pending' },
  { id: 'c3', name: 'Agency XYZ', status: 'active', integrations: ['GA4', 'Ads', 'BigQuery'], lastSync: '1 hour ago' },
  { id: 'c4', name: 'OldClient', status: 'inactive', integrations: [], lastSync: '30 days ago' },
];

// The full text provided in the prompt serves as the Knowledge Base
export const PAPADATA_KNOWLEDGE_BASE = `
PapaData to platforma do agregacji i analizy danych, zbudowana w oparciu o Google Cloud Platform (GCP). System składa się z kilku głównych komponentów:
Backend (BFF – Backend for Frontend): aplikacja Node.js pełniąca rolę API dla panelu administracyjnego PapaData.
Frontend: panel administracyjny w technologii React (Vite) służący do zarządzania klientami, ich konfiguracją oraz integracjami w PapaData.
Infrastruktura (IaC): zasoby chmurowe GCP (BigQuery, Cloud Storage i inne) zarządzane za pomocą Terraform, stanowiące fundament działania PapaData.
Automatyzacja (CI/CD): procesy budowania i wdrażania komponentów PapaData zdefiniowane w Cloud Build.
Przetwarzanie danych (ETL/ELT): logika ekstrakcji, ładowania i transformacji danych zaimplementowana w Dataform, zasilająca warstwy analityczne PapaData.
Kontrakty danych: struktury danych zdefiniowane w plikach YAML, opisujące schematy, metryki i zasady przetwarzania używane przez PapaData.

Struktura holistyczna repozytorium:
apps/: główne aplikacje backendowe (np. papadata-bff).
data/: kontrakty danych (YAML).
docs/: dokumentacja operacyjna.
etl/: kod źródłowy ETL/ELT.
infra/: definicje Terraform, Cloud Build, Dataform.
web/: główne aplikacje frontendowe (web/admin).

Backend API (apps/papadata-bff):
Node.js + Express.js.
Zmienne środowiskowe: PROJECT_ID, BQ_DATASET, KPIS_VIEW, FRONT_ORIGIN.
BigQuery jest główną bazą danych (dataset config i bi_public).
Endpointy: GET /health, GET /api/kpis, GET/POST /api/clients, zarządzanie sekretami i harmonogramami.

Frontend (web/admin):
React 19, TypeScript, Vite, Tailwind CSS.
Komunikacja z backendem przez REST API.

Infrastruktura (infra/):
GCS Buckets: papadata-raw, papadata-stg, papadata-curated, papadata-logs.
BigQuery Tables: raw_ga4.events, raw_woo.orders, analytics.metrics_daily.
Dataform: Transformacje SQLX, zarządzanie widokami i asercjami.

Automatyzacja (infra/cloudbuild):
CI/CD oparte o Cloud Build i Docker (Artifact Registry + Cloud Run).

Kontrakty Danych (data/contracts):
metrics.yaml: definicje metryk (id, owner, source, destination, sla).
reports.yaml: definicje raportów (metrics, dimensions, stakeholders).
`;

export const SYSTEM_INSTRUCTION = `
You are the expert AI assistant for PapaData.
You have access to the full technical documentation of the platform.
Your goal is to help administrators and developers understand the architecture, data flow, and configuration of PapaData.
Always answer based on the context provided below.
If the user asks about something not in the context, politely state you only have knowledge about the PapaData platform described.
Keep answers concise, technical, and helpful.
Reference specific directories (e.g., apps/, infra/) when explaining concepts.
Language: Reply in the same language the user uses in their last message (Polish or English).

CONTEXT:
${PAPADATA_KNOWLEDGE_BASE}
`;