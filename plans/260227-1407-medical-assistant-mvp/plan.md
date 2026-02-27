# Plan: Medical Assistant MVP
Created: 2026-02-27T14:07:05+07:00
Status: ✅ Complete

## Overview
Hệ thống trợ lý y tế đa tài: Ghi âm -> STT (Vai trò) -> Phân tích (Scribe, ICD-10, Chuyên gia) -> RAG Tư vấn -> Đối soát Bác sĩ & AI.

## Tech Stack
- **Frontend/Backend:** Next.js
- **Database/Auth:** Supabase (PostgreSQL)
- **Speech-to-Text:** Whisper (Groq) + Role Detection
- **AI Agents:** Llama 3.3 (Groq) / Gemini (Google)
- **Matching/Embedding:** Text-embedding-004 (Google)
- **Knowledge Base:** RAG (Medical Advice)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Setup Environment | ✅ Complete | 100% |
| 02 | Database & Data Integration | ✅ Complete | 100% |
| 03 | Core AI Services (Groq & Google) | ✅ Complete | 100% |
| 04 | Recording & Dashboard UI | ✅ Complete | 100% |
| 05 | SOAP Analysis & Matching Engine | ✅ Complete | 100% |
| 06 | Refined AI Pipeline (Roles & Structure) | ✅ Complete | 100% |
| 07 | Multi-Agent Analysis & Medical RAG | ✅ Complete | 100% |
| 08 | Dashboard Analytics & Final Polish | ✅ Complete | 100% |
| 09 | Basic Review & Testing | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
