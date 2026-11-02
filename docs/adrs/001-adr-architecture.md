---
id: ADR-001
version: 1.0.0
title: Base architecture of health lib
status: accepted
date: 2026-11-02
authors:
  - Robert Willemelis
tags: [architecture]
---
## Context

The health module provides useful functions for checking the health of various
aspects of a project, such as network connections and folder structures.

## References

- 👉 [ADR-002: Check Connection](002-adr-connection.md) - checking network connections

## Decisions

- The health module should provide separate functions for each aspect.
- The logging should be centralized to handles all log entries consistently.

