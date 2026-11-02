---
id: ADR-002
version: 1.0.0
title: Base architecture of checkConnection
status: accepted
date: 2026-11-02
authors:
  - Robert Willemelis
tags: [architecture]
---
## Context

The checkConnection module provides a utility function for checking network connections.

## Decisions

### 1. interval/timeout

the function should check in a given interval to avoid too much network requests.
