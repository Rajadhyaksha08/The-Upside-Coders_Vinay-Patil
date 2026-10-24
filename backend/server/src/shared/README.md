# Shared backend utilities

Contains genuinely cross-cutting primitives such as HTTP errors and response conventions.

## Rules
- Only add utilities used by at least two modules, or clearly cross-cutting middleware.
- Avoid turning this folder into a miscellaneous dumping ground.
- Utilities should be generic and should not contain KaamConnect domain rules.
- Document exported functions, expected inputs, and errors in this README.
