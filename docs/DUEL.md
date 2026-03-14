# Duel de code — Architecture et configuration

## Fonctionnement

- **Hôte** : crée un salon, choisit le **thème** et le **nombre d'exercices** (3, 5 ou 10).
- **Joueurs** : rejoignent avec le code (max 5 personnes).
- Chacun choisit sa **langue** (sauf FiveM → Lua).
- L'hôte **lance la partie** : une **série d'exercices** du thème s'enchaîne.
- **Par manche** : premier correct = 3 pts, 2e = 2 pts, 3e = 1 pt (les autres 0). La manche se termine au premier correct, on enregistre les points puis on passe à l'exercice suivant.
- **Classement final** : somme des points sur toutes les manches. Le gagnant est celui qui a le plus de points.

## Backend : Supabase

### 1. Créer un projet Supabase

1. Va sur [supabase.com](https://supabase.com) et crée un projet.
2. Dans **Settings → API** : note l'**URL** et la clé **anon public**.

### 2. Variables d'environnement

À la racine du projet, crée `.env` :

```env
VITE_SUPABASE_URL=https://ton-projet.supabase.co
VITE_SUPABASE_ANON_KEY=ta-cle-anon-publique
```

### 3. Schéma SQL

Exécute le script suivant dans le SQL Editor Supabase :

```sql
-- Table des salons
create table if not exists duel_rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_id text not null,
  theme_id text not null default 'bases',
  exercise_id int,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  started_at timestamptz,
  round_count int not null default 3,
  current_round int not null default 1,
  round_started_at timestamptz,
  created_at timestamptz default now()
);

-- Table des membres d'un salon
create table if not exists duel_room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references duel_rooms(id) on delete cascade,
  user_name text not null,
  user_id text not null,
  language text not null default 'javascript',
  submitted_at timestamptz,
  correct boolean default false,
  created_at timestamptz default now(),
  unique(room_id, user_id)
);

-- Résultats par manche (série d'exercices)
create table if not exists duel_round_results (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references duel_rooms(id) on delete cascade,
  round_index int not null,
  user_id text not null,
  submitted_at timestamptz not null,
  points int not null default 0
);

create index if not exists idx_duel_rooms_code on duel_rooms(code);
create index if not exists idx_duel_room_members_room_id on duel_room_members(room_id);
create index if not exists idx_duel_round_results_room_id on duel_round_results(room_id);

-- Realtime (activer dans Database → Replication si besoin)
-- alter publication supabase_realtime add table duel_rooms;
-- alter publication supabase_realtime add table duel_room_members;
-- alter publication supabase_realtime add table duel_round_results;
```

**Si les tables existent déjà** (sans `round_count`, `current_round`, `round_started_at`) :

```sql
alter table duel_rooms add column if not exists round_count int not null default 3;
alter table duel_rooms add column if not exists current_round int not null default 1;
alter table duel_rooms add column if not exists round_started_at timestamptz;

create table if not exists duel_round_results (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references duel_rooms(id) on delete cascade,
  round_index int not null,
  user_id text not null,
  submitted_at timestamptz not null,
  points int not null default 0
);
create index if not exists idx_duel_round_results_room_id on duel_round_results(room_id);
```

### 4. RLS (optionnel)

```sql
alter table duel_rooms enable row level security;
alter table duel_room_members enable row level security;
alter table duel_round_results enable row level security;

create policy "Allow all duel_rooms" on duel_rooms for all using (true) with check (true);
create policy "Allow all duel_room_members" on duel_room_members for all using (true) with check (true);
create policy "Allow all duel_round_results" on duel_round_results for all using (true) with check (true);
```

## Fichiers

- `src/pages/Duel.jsx` : page Duel (création, salon, série d'exercices, classement final).
- `src/lib/supabase.js` : client Supabase.
- `src/utils/exerciseValidation.js` : validation des solutions.
