````md
# GCP – snapshot stanu środowiska (papadata-platform-stg) 

## Kontekst / konfiguracja Cloud Shell

**Aktywne konto:** `tech@papadata.pl`  
**Aktywny projekt:** `papadata-platform-stg`  
**Aktywna konfiguracja gcloud:** `cloudshell-29399`

### `gcloud config list`

[accessibility]
screen_reader = True

[component_manager]
disable_update_check = True

[compute]
gce_metadata_read_timeout_sec = 30

[core]
account = tech@papadata.pl
disable_usage_reporting = False
project = papadata-platform-stg
universe_domain = googleapis.com

[metrics]
environment = devshell

## Projekty widoczne w kontekście

Wynik `gcloud projects list` (istotne pozycje):
* **papadata-platform-prod** (prod)
  * `PROJECT_NUMBER`: `142797049030`
* **papadata-platform-stg** (staging)
  * `PROJECT_NUMBER`: `967318112487`

## Szczegóły projektu `papadata-platform-stg`

Wynik `gcloud projects describe papadata-platform-stg`:

* **createTime:** `2025-11-12T22:46:28.552121Z`
* **lifecycleState:** `ACTIVE`
* **parent:** folder `632190779041`
* **labels:**

  * `environment: staging`
  * `firebase: enabled`
  * `firebase-core: disabled`
* **projectNumber:** `967318112487`

## Włączone API / usługi

Wynik `gcloud services list --enabled` (skrót – lista obejmuje m.in.):

* Vertex AI (`aiplatform.googleapis.com`)
* BigQuery (+ dodatki: connection, datapolicy, datatransfer, migration, reservation, storage)
* Cloud Run (`run.googleapis.com`)
* GKE (`container.googleapis.com`)
* Cloud SQL (`sqladmin.googleapis.com`, `sql-component.googleapis.com`)
* Artifact Registry (`artifactregistry.googleapis.com`)
* Secret Manager (`secretmanager.googleapis.com`)
* Workflows + Executions (`workflows.googleapis.com`, `workflowexecutions.googleapis.com`)
* Cloud Scheduler (`cloudscheduler.googleapis.com`)
* Cloud DNS (`dns.googleapis.com`)
* Firestore/Datastore (`firestore.googleapis.com`, `datastore.googleapis.com`)
* Redis (`redis.googleapis.com`)
* Cloud Build (`cloudbuild.googleapis.com`)
* IAP (`iap.googleapis.com`)
* Monitoring/Logging (`monitoring.googleapis.com`, `logging.googleapis.com`)
* KMS (`cloudkms.googleapis.com`)
* VPC Access (`vpcaccess.googleapis.com`)
* Developer Connect (`developerconnect.googleapis.com`)
* Cloud Asset / Org Policy / Network Management itd.

## IAM – polityka dostępu (wyciąg z `get-iam-policy`)

### Najważniejsze obserwacje

* Grupa `platformadmin@papadata.pl` ma przypisaną rolę custom:

  * `projects/papadata-platform-stg/roles/papadata.projectAdmin`
* W projekcie działa wiele service accountów dla komponentów platformy (BFF, frontend, workflows, ETL, provisioner, AI).
* Widoczne są bindingi z warunkiem **`pdp-perm`** (`expression: 'true'`, opis „permanent binding”), czyli stałe przypisania ról.

### Przykładowe role (niepełna lista, na bazie wklejonego wycinka)

* Vertex AI: `roles/aiplatform.user`, `roles/aiplatform.viewer`, `roles/aiplatform.expressUser`, `roles/aiplatform.serviceAgent`
* Artifact Registry: `roles/artifactregistry.reader`, `roles/artifactregistry.writer`, `roles/artifactregistry.serviceAgent`
* BigQuery: `roles/bigquery.admin`, `roles/bigquery.dataEditor`, `roles/bigquery.dataViewer`, `roles/bigquery.jobUser`, `roles/bigquery.user`
* Cloud Build: `roles/cloudbuild.builds.builder`, `roles/cloudbuild.builds.editor`, `roles/cloudbuild.serviceAgent`
* Cloud Scheduler: `roles/cloudscheduler.admin`, `roles/cloudscheduler.serviceAgent`
* Cloud Run: `roles/run.admin`, `roles/run.invoker`, `roles/run.builder`, `roles/run.serviceAgent`
* Secret Manager: `roles/secretmanager.admin`, `roles/secretmanager.secretAccessor`
* Storage: `roles/storage.admin`
* Pub/Sub: `roles/pubsub.admin`, `roles/pubsub.serviceAgent`
* Logging: `roles/logging.logWriter`
* Pozostałe service-agenty: compute / firestore / firebase / vpcaccess / workflows / dataform / dataproc 

## Service Accounts (lista)

Wynik `gcloud iam service-accounts list`:

* `frontend-sa@papadata-platform-stg.iam.gserviceaccount.com` — Frontend Service Account
* `etl-invoker@papadata-platform-stg.iam.gserviceaccount.com` — ETL Invoker
* `papadata-etl-runner@papadata-platform-stg.iam.gserviceaccount.com` — ETL Runner
* `frontend-bi@papadata-platform-stg.iam.gserviceaccount.com` — Frontend BI (read-only)
* `etl-shared-sa@papadata-platform-stg.iam.gserviceaccount.com` — PapaData Shared ETL SA

## Compute Engine – zasoby

## Sieć (VPC)

### VPC networks

Wynik `gcloud compute networks list`:

* `stg-vpc`

  * `SUBNET_MODE`: `CUSTOM`
  * `BGP_ROUTING_MODE`: `REGIONAL`

### Subnets

Wynik `gcloud compute networks subnets list`:

* `stg-subnet-ec2`

  * `REGION`: `europe-central2`
  * `NETWORK`: `stg-vpc`
  * `RANGE`: `10.10.0.0/20`
  * `STACK_TYPE`: `IPV4_ONLY`


gcloud config list
gcloud projects list
gcloud config get-value project
gcloud projects describe $(gcloud config get-value project)

gcloud services list --enabled

gcloud projects get-iam-policy $(gcloud config get-value project)
gcloud iam service-accounts list

gcloud compute instances list
gcloud compute disks list
gcloud compute networks list
gcloud compute networks subnets list

