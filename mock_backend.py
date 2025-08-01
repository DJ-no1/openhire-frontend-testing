#!/usr/bin/env python3
"""
Simple Mock Backend for OpenHire Frontend Testing
Provides basic endpoints that the frontend expects
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
from typing import Optional
import uuid
from datetime import datetime

app = FastAPI(
    title="OpenHire Mock Backend",
    description="Mock backend for testing OpenHire frontend",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data
mock_jobs = [
    {
        "id": "job_1",
        "title": "Senior Software Engineer",
        "company": "TechCorp",
        "description": "Looking for an experienced software engineer...",
        "requirements": ["Python", "JavaScript", "React", "Node.js"],
        "location": "Remote",
        "salary_range": "$80,000 - $120,000"
    },
    {
        "id": "job_2", 
        "title": "Data Scientist",
        "company": "DataInc",
        "description": "Seeking a data scientist to join our team...",
        "requirements": ["Python", "Machine Learning", "SQL", "Statistics"],
        "location": "New York",
        "salary_range": "$90,000 - $130,000"
    }
]

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "OpenHire Mock Backend",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "jobs": "/jobs", 
            "review_resume": "/review-resume",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "openhire-mock-backend"
    }

@app.get("/jobs")
async def get_jobs():
    """Get all available jobs"""
    return {
        "jobs": mock_jobs,
        "total": len(mock_jobs)
    }

@app.get("/jobs/{job_id}")
async def get_job(job_id: str):
    """Get specific job by ID"""
    job = next((job for job in mock_jobs if job["id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.post("/review-resume")
async def review_resume(
    job_id: str = Form(...),
    file: UploadFile = File(...)
):
    """Analyze resume against job requirements"""
    
    # Validate file
    if not file.filename.endswith(('.pdf', '.docx', '.doc', '.txt')):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Find job
    job = next((job for job in mock_jobs if job["id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Mock resume analysis
    analysis_id = str(uuid.uuid4())
    
    # Simulate analysis results
    mock_analysis = {
        "analysis_id": analysis_id,
        "job_id": job_id,
        "job_title": job["title"],
        "filename": file.filename,
        "upload_timestamp": datetime.now().isoformat(),
        "analysis": {
            "overall_match": 78,
            "key_skills_match": 82,
            "experience_match": 75,
            "education_match": 80,
            "strengths": [
                "Strong technical background in required technologies",
                "Relevant work experience in similar roles", 
                "Good communication skills"
            ],
            "areas_for_improvement": [
                "Could benefit from more experience with specific frameworks",
                "Consider highlighting leadership experience"
            ],
            "recommendation": "Strong candidate - proceed to interview",
            "confidence_score": 85
        },
        "status": "completed"
    }
    
    return mock_analysis

@app.get("/review-resume/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Get resume analysis by ID"""
    # In a real backend, this would fetch from database
    # For mock, return a sample response
    return {
        "analysis_id": analysis_id,
        "status": "completed",
        "analysis": {
            "overall_match": 78,
            "recommendation": "Strong candidate - proceed to interview"
        }
    }

if __name__ == "__main__":
    print("🚀 Starting OpenHire Mock Backend...")
    print("📍 URL: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("❤️ Health: http://localhost:8000/health")
    
    uvicorn.run(
        "mock_backend:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
