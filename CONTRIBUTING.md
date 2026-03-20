# Contributing

Thanks for contributing to zx_lib.

This project uses a two-branch modal:

1. `canary` is the active integration branch for ongoing community work.
2. `release` is the stable branch for versioned production releases.

## Branch strategy

1. Never push direct feature work to `release`.
2. Create feature branches from `canary`.
3. Merge feature branches into `canary` through pull requests.
4. Promote tested batches from `canary` to `release` through a dedicated PR.

Recommended branch names:

1. `feat/<short-topic>`
2. `fix/<short-topic>`
3. `chore/<short-topic>`
4. `docs/<short-topic>`

## Local development setup

1. Install Git and Node.js LTS.
2. Clone and enter repo:
	1. `git clone https://github.com/ZX-Forge/zx_lib.git`
	2. `cd zx_lib`
3. Install web dependencies:
	1. `cd web`
	2. `pnpm install`

## Daily developer workflow

1. Sync canary:
	1. `git checkout canary`
	2. `git pull origin canary`
2. Create a branch:
	1. `git checkout -b feat/example-change`
3. Develop and test:
	1. `pnpm dev` for local UI iteration
	2. `pnpm build` before opening PR
4. Commit using Conventional Commits where possible:
	1. `feat(ui): improve notification icon contrast`
	2. `fix(alert): prevent duplicate close callback`
5. Push and open PR to `canary`.

## Quality gates before PR

1. Keep PRs focused and small.
2. Avoid unrelated file churn.
3. Ensure build succeeds from `web/`:
	1. `pnpm build`
4. Ensure changed behavior is documented.
5. Include migration notes if breaking behavior is introduced.

## Pull request checklist

- [ ] Branch is based on `canary`
- [ ] PR target is `canary` (unless release promotion PR)
- [ ] `pnpm build` passes in `web/`
- [ ] Added or updated docs for behavior/config changes
- [ ] No unrelated formatting or refactor noise
- [ ] Clear PR description with scope and test steps
- [ ] Screenshots or recordings included for UI changes
- [ ] Backward compatibility considered, or breaking change documented

## Release promotion process

1. Freeze and validate `canary`.
2. Open PR from `canary` into `release`.
3. Run final smoke tests against merged release candidate.
4. Tag and publish release from `release` branch.

## Coding practices

1. Prefer explicit, readable names.
2. Preserve public API behavior unless change is intentional.
3. Keep modules cohesive and avoid cross-cutting side effects.
4. Add comments only where logic is non-obvious.
5. Keep UI changes accessible and visually consistent.

## Security and community rules

1. Never commit secrets, keys, or private tokens.
2. Treat all external input as untrusted.
3. Be respectful in code reviews and issue discussions.
4. Assume good intent and focus feedback on code, not people.
