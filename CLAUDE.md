@AGENTS.md

## Auto-Briefing After Git Pull

At the start of every session, check whether `.claude/pending-briefing` exists in the project root.

If it exists:
1. Delete the file.
2. Automatically run the full session onboarding defined in `.claude/commands/malediction.md` (the no-argument version) — read SPEC.md, key source files, and git log, then produce the session brief.
3. Tell the user: "A git pull was detected. Here's your session brief:"

If it does not exist, proceed normally.
