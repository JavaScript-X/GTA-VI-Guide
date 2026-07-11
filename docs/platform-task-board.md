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
- Schemas SQL versionnes avec migrations `V001` a `V005`.
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

- Persistance: les repositories ont maintenant un adapter PostgreSQL runtime
  optionnel via `pg`, avec fallback memoire quand `DATABASE_URL` ou le driver
  ne sont pas disponibles. Il reste a valider contre une vraie base en CI.
- Authentification: login, JWT, refresh, logout, hash refresh token, expiration
  refresh et suppression compte existent. Il reste a ajouter cookies securises,
  CSRF et verification email/reset password.
- Gateway: il agrege les donnees et l'auth, mais tous les workflows CRUD ne
  passent pas encore par lui.
- Frontend: toutes les pages principales existent, mais plusieurs actions sont
  encore des apercus ou de la lecture seule.
- Guides et communaute: creation, update/delete guides, commentaires avec
  edition/suppression, reactions, crews/events avec edition/suppression,
  recherche frontend/backend et moderation basique posts/reports existent. Les
  workflows avances restent incomplets.
- Suivi joueur: profile, completion et achievements existent en lecture/ecriture
  memoire, mais pas de vraie synchronisation provider.
- Migrations: le runner sait maintenant verifier `platform.schema_migrations`
  avant chaque execution, mais il depend encore du client local `psql`.
- CI/CD: la fondation existe, mais scan, push registry et deploy production sont
  encore a finaliser selon le provider.
- Kubernetes: manifests de base presents, mais pas de Helm chart ni packaging
  complet par environnement.
- Observabilite: Prometheus baseline existe, mais traces OpenTelemetry et Sentry
  ne sont pas branches dans le code applicatif.
- RabbitMQ: l'infrastructure est la, le worker demarre, mais aucun vrai flux
  evenementiel n'est consomme.
- Uploads media: endpoint JSON, validation image, stockage local dev, metadata
  memoire/PostgreSQL et formulaire frontend existent. Il reste a remplacer le
  backend local par MinIO/S3/R2 avec URLs signees, CDN et politiques de cycle de
  vie.
- Tests: unitaires et smoke tests existent, mais pas encore de tests navigateur
  end-to-end.
- TypeScript frontend: sources `.ts` modulaires presentes, mais build encore
  leger sans `tsc` strict ni Vite.

## Pas encore faits

- Validation CI de l'adapter PostgreSQL contre une vraie base.
- Persistance PostgreSQL avancee pour les workflows restants: moderation
  complete, audit detaille et politiques media avancees.
- Tests plus avances du runner de migrations avec une vraie base PostgreSQL CI.
- Workflow editorial avance des guides.
- Moderation avancee restante: permissions fines, escalation, notes internes et
  workflows roles/audit plus complets.
- Remplacer le stockage local upload par MinIO/S3/R2 avec URLs signees,
  antivirus/validation avancee et CDN.
- Publication d'evenements de domaine vers RabbitMQ et workers consommateurs.
- Synchronisation officielle PSN, Xbox et Rockstar via OAuth officiel uniquement.
- Chiffrement/rotation des tokens provider et integration secret manager reelle.
- Export donnees utilisateur et suppression physique/anonymisation configurable.
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
4. Ajouter des tests CI du runner sur une vraie base PostgreSQL.
5. Tester l'adapter PostgreSQL runtime contre une vraie base.
6. Ajouter cookies securises, CSRF, verification email et reset password.
7. Completer Knowledge, Community, Achievements et Profile.
8. Ajouter recherche, commentaires, reactions, crews et events.
9. Brancher RabbitMQ pour les evenements et le sync-worker.
10. Remplacer l'upload local par stockage objet MinIO/S3.
11. Remplacer le build frontend leger par TypeScript strict.
12. Ajouter tests E2E navigateur.
13. Brancher OpenTelemetry et Sentry.
14. Finaliser CI/CD, registry, staging/prod et rollback.

## Travail en cours

- Fait: exposer les actions d'ecriture via API Gateway pour guides, posts,
  reports, achievements et completion profil.
- Fait: ajouter les premiers formulaires frontend connectes a ces actions.
- Fait: etendre le smoke test pour valider ces workflows.
- Fait: rendre le runner de migrations idempotent avec
  `platform.schema_migrations`.
- Fait: ajouter l'adapter PostgreSQL runtime sous les repositories, active
  quand `DATABASE_URL` et `pg` sont disponibles.
- Fait: durcir Identity avec refresh tokens hashes, expiration, logout renforce
  et suppression compte/revocation.
- Fait: ajouter update/delete guides, commentaires/reactions, crews/events CRUD,
  recherche frontend communaute et moderation basique posts/reports.
- Fait: ajouter page moderation avec file de reports, resolution, masquage post
  et lecture audit log moderateur.
- Fait: ajouter page login/sign-up style Vice City avec inscription reelle et
  boutons providers prepares pour OAuth officiel.
- Fait: ajouter upload image pour guides avec validation, stockage local dev,
  metadata PostgreSQL et formulaire frontend.
- Prochaine etape: tester l'adapter PostgreSQL contre une vraie base PostgreSQL
  en CI ou Docker Compose, puis ajouter moderation avancee.
