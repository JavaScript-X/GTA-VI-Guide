# Platform Task Board

Ce document donne l'etat reel de la plateforme GTA VI Guide au niveau code et
documentation. Les statuts distinguent les fondations deployables des fonctions
vraiment utilisables en production.

## Complets a 100%

- Structure monorepo: services backend, frontend, packages partages, scripts,
  documentation et infrastructure.
- Squelette microservices: API Gateway, Identity, Game Profile, Achievements,
  Knowledge, Community et Sync Worker.
- Endpoints techniques: `/health`, `/livez`, `/readyz` et `/metrics` sur les
  services principaux.
- Logs JSON structures et helper HTTP commun.
- CORS configurable par environnement.
- Rate limiting memoire sur l'API Gateway.
- Variables d'environnement par cible: dev, staging et prod examples.
- Docker Compose local avec PostgreSQL, RabbitMQ, MinIO, reverse proxy,
  Prometheus, services et web.
- Dockerfile Node non-root partage pour les services.
- Schemas SQL versionnes avec migrations `V001` a `V003`.
- Verification de migrations avec `npm run db:migration-check`.
- Scripts backup/restore PostgreSQL.
- Documentation operationnelle: architecture, API, runbook, checklist de
  deploiement, securite, backlog et travaux restants.
- Frontend modulaire en sources TypeScript: pages principales, composants
  reutilisables, store, service API et theme neon Vice City.
- Donnees de fallback pour permettre l'utilisation locale sans backend.
- Tests unitaires de base et smoke test des services locaux.
- Modele de roles et limites legales documentees pour PSN, Xbox et Rockstar.

## Complets a moitie

- Persistance: les repositories existent, mais l'execution utilise encore un
  store memoire. PostgreSQL est schema-ready, pas encore runtime-ready.
- Authentification: login, JWT, refresh et logout existent, mais les utilisateurs
  et sessions refresh ne sont pas persistes en PostgreSQL.
- Gateway: il agrege les donnees et l'auth, mais tous les workflows CRUD ne
  passent pas encore par lui.
- Frontend: toutes les pages principales existent, mais plusieurs actions sont
  encore des apercus ou de la lecture seule.
- Guides et communaute: creation possible cote service, mais workflows complets
  edition, moderation, commentaires, reactions et recherche restent incomplets.
- Suivi joueur: profile, completion et achievements existent en lecture/ecriture
  memoire, mais pas de vraie synchronisation provider.
- Migrations: le runner applique des fichiers SQL, mais doit encore verifier
  `platform.schema_migrations` avant chaque execution.
- CI/CD: la fondation existe, mais scan, push registry et deploy production sont
  encore a finaliser selon le provider.
- Kubernetes: manifests de base presents, mais pas de Helm chart ni packaging
  complet par environnement.
- Observabilite: Prometheus baseline existe, mais traces OpenTelemetry et Sentry
  ne sont pas branches dans le code applicatif.
- RabbitMQ: l'infrastructure est la, le worker demarre, mais aucun vrai flux
  evenementiel n'est consomme.
- MinIO/S3: l'infrastructure et les variables sont pretes, mais aucun upload
  media n'utilise encore le stockage objet.
- Tests: unitaires et smoke tests existent, mais pas encore de tests navigateur
  end-to-end.
- TypeScript frontend: sources `.ts` modulaires presentes, mais build encore
  leger sans `tsc` strict ni Vite.

## Pas encore faits

- Adapter PostgreSQL reel pour chaque repository.
- Persistance PostgreSQL des users, refresh sessions, linked accounts, consents,
  audit logs, guides, posts, reports, achievements et profils.
- Runner de migrations idempotent base sur `schema_migrations`.
- CRUD complet guides: edition, publication, revision, suppression et recherche.
- CRUD complet communaute: posts, commentaires, reactions, reports, moderation,
  crews et events.
- Dashboard admin/moderateur avec file de signalements et audit logs.
- Upload images/fichiers via MinIO/S3/R2.
- Publication d'evenements de domaine vers RabbitMQ et workers consommateurs.
- Synchronisation officielle PSN, Xbox et Rockstar via OAuth officiel uniquement.
- Chiffrement/rotation des tokens provider et integration secret manager reelle.
- Export, revocation et suppression complete des donnees utilisateur.
- Email verification, reset password et hardening session production.
- CDN frontend/assets et strategie cache.
- Helm chart ou release Kubernetes complete.
- Autoscaling teste en environnement de staging.
- Backups automatiques planifies avec test de restauration.
- Tracing OpenTelemetry applicatif et error tracking Sentry.
- Tests d'integration inter-services plus larges.
- Tests end-to-end navigateur avec parcours login, guide, communaute et suivi.
- Pipeline deploy staging/prod complet avec rollback automatise.

## Ordre de travail conseille

1. Exposer par le Gateway les actions deja disponibles dans les services.
2. Rendre les pages frontend capables de creer guide, post, report et progression.
3. Ajouter smoke tests sur les routes d'ecriture gateway.
4. Implementer le runner de migrations idempotent.
5. Ajouter l'adapter PostgreSQL runtime.
6. Persister Identity: users, sessions, consents et audit logs.
7. Persister Knowledge, Community, Achievements et Profile.
8. Completer CRUD guides et communaute avec moderation.
9. Brancher RabbitMQ pour les evenements et le sync-worker.
10. Ajouter upload objet MinIO/S3.
11. Remplacer le build frontend leger par TypeScript strict.
12. Ajouter tests E2E navigateur.
13. Brancher OpenTelemetry et Sentry.
14. Finaliser CI/CD, registry, staging/prod et rollback.

## Travail en cours

- Etape 1: exposer les actions d'ecriture via API Gateway.
- Etape 2: ajouter les premiers formulaires frontend connectes a ces actions.
- Etape 3: etendre le smoke test pour valider ces workflows.
