from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.base import User, CarbonSimulation, Recommendation, DecisionHistory, CarbonScore, Notification, AuditLog
from app.schemas.schemas import (
    SimulationCreate, SimulationResponse, DecisionCreate,
    TimeMachineCreate, TimeMachineResponse, TimeStep,
    CopilotNotification, CarbonScoreResponse, ForecastResponse
)
from app.agents.graph import run_simulation_flow
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/", response_model=SimulationResponse)
def create_simulation(
    sim_in: SimulationCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Log Action
    ip = request.client.host if request.client else "unknown"
    audit = AuditLog(user_id=current_user.id, action="SIMULATION_EXECUTED", ip_address=ip)
    db.add(audit)
    db.commit()

    # Run the 8-Agent LangGraph workflow
    result = run_simulation_flow(sim_in.query, user_id=current_user.id)
    
    # Save base simulation
    sim = CarbonSimulation(
        user_id=current_user.id,
        query=sim_in.query,
        category=result["category"],
        baseline_co2=result["baseline_co2"]
    )
    db.add(sim)
    db.commit()
    db.refresh(sim)
    
    # Save recommendations
    for rec in result["recommendations"]:
        db_rec = Recommendation(
            simulation_id=sim.id,
            option_name=rec["option_name"],
            co2_value=rec["co2_value"],
            reasoning=rec["reasoning"],
            savings_potential=rec["savings_potential"]
        )
        db.add(db_rec)
    
    db.commit()
    db.refresh(sim)
    return sim

@router.get("/history", response_model=List[SimulationResponse])
def get_simulation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sims = db.query(CarbonSimulation).filter(
        CarbonSimulation.user_id == current_user.id
    ).order_by(CarbonSimulation.created_at.desc()).all()
    return sims

@router.post("/decision")
def make_decision(
    decision_in: DecisionCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify simulation exists
    sim = db.query(CarbonSimulation).filter(
        CarbonSimulation.id == decision_in.simulation_id,
        CarbonSimulation.user_id == current_user.id
    ).first()
    
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
        
    # Save decision
    decision = DecisionHistory(
        user_id=current_user.id,
        simulation_id=decision_in.simulation_id,
        chosen_option=decision_in.chosen_option,
        co2_saved=decision_in.co2_saved
    )
    db.add(decision)
    
    # Audit log
    ip = request.client.host if request.client else "unknown"
    audit = AuditLog(user_id=current_user.id, action="DECISION_COMMITTED", ip_address=ip)
    db.add(audit)
    
    # Update Carbon Score
    score_record = db.query(CarbonScore).filter(CarbonScore.user_id == current_user.id).first()
    if not score_record:
        score_record = CarbonScore(user_id=current_user.id, score=100, risk_index="Low")
        db.add(score_record)
        
    # Increment score based on savings (cap at 100)
    score_record.score = min(100, score_record.score + int(decision_in.co2_saved // 5) + 1)
    if score_record.score > 80:
        score_record.risk_index = "Low"
    elif score_record.score > 50:
        score_record.risk_index = "Medium"
    else:
        score_record.risk_index = "High"
        
    # Create notification
    notif = Notification(
        user_id=current_user.id,
        message=f"Success! Choosing {decision_in.chosen_option} saved you {decision_in.co2_saved:.1f} kg CO2."
    )
    db.add(notif)
    
    db.commit()
    return {"status": "success", "new_score": score_record.score}

@router.post("/time-machine", response_model=TimeMachineResponse)
def time_machine_simulation(
    tm_in: TimeMachineCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Audit log
    ip = request.client.host if request.client else "unknown"
    audit = AuditLog(user_id=current_user.id, action="TIME_WARP_SIMULATION", ip_address=ip)
    db.add(audit)
    db.commit()
    # Generates a detailed timeline mapping choices, matching User Request
    q = tm_in.query.lower()
    
    steps = []
    if "scooter" in q or "electric scooter" in q:
        # Specific scooter case
        steps = [
            TimeStep(label="Purchase & Week 1", current_path_value=12.5, alternative_path_value=1.0, impact="Low Footprint Shift", savings=11.5, regret=11.5, score_change=2),
            TimeStep(label="Month 3: Habit form", current_path_value=37.5, alternative_path_value=3.0, impact="Significant Saving", savings=34.5, regret=34.5, score_change=5),
            TimeStep(label="Month 6: High usage", current_path_value=75.0, alternative_path_value=6.0, impact="Offsetting Production", savings=69.0, regret=69.0, score_change=8),
            TimeStep(label="Year 1: Full Cycle", current_path_value=150.0, alternative_path_value=12.0, impact="Eco Champion Status", savings=138.0, regret=138.0, score_change=15)
        ]
        overall_savings = 138.0
        overall_regret = 138.0
        score_delta = 15
    elif "solar" in q or "solar panel" in q:
        # Solar panels case
        steps = [
            TimeStep(label="Month 1: Install", current_path_value=150.0, alternative_path_value=40.0, impact="Initial Offset", savings=110.0, regret=110.0, score_change=4),
            TimeStep(label="Month 3: Sunny season", current_path_value=450.0, alternative_path_value=100.0, impact="Grid Independent", savings=350.0, regret=350.0, score_change=9),
            TimeStep(label="Month 6: Half-Year", current_path_value=900.0, alternative_path_value=180.0, impact="Zero Carbon Excess", savings=720.0, regret=720.0, score_change=14),
            TimeStep(label="Year 1: Return", current_path_value=1800.0, alternative_path_value=300.0, impact="Grid Contributor", savings=1500.0, regret=1500.0, score_change=22)
        ]
        overall_savings = 1500.0
        overall_regret = 1500.0
        score_delta = 22
    else:
        # Default response
        steps = [
            TimeStep(label="Month 1", current_path_value=25.0, alternative_path_value=5.0, impact="Slight reduction", savings=20.0, regret=20.0, score_change=1),
            TimeStep(label="Month 3", current_path_value=75.0, alternative_path_value=15.0, impact="Steady conservation", savings=60.0, regret=60.0, score_change=3),
            TimeStep(label="Month 6", current_path_value=150.0, alternative_path_value=30.0, impact="Active reduction", savings=120.0, regret=120.0, score_change=5),
            TimeStep(label="Year 1", current_path_value=300.0, alternative_path_value=60.0, impact="High Sustainability Impact", savings=240.0, regret=240.0, score_change=10)
        ]
        overall_savings = 240.0
        overall_regret = 240.0
        score_delta = 10

    return TimeMachineResponse(
        query=tm_in.query,
        timeline=steps,
        overall_savings=overall_savings,
        overall_regret=overall_regret,
        score_delta=score_delta
    )

@router.get("/copilot/proactive", response_model=List[CopilotNotification])
def get_copilot_notifications(
    current_user: User = Depends(get_current_user)
):
    # Simulated proactive notifications
    return [
        CopilotNotification(
            id="copilot_travel",
            type="travel",
            title="Upcoming Weekend Detected",
            message="Thinking of a trip from Mysore to Bangalore this weekend? Simulate your travel plans to cut up to 80% CO2.",
            action_label="Simulate Trip",
            default_query="I want to travel from Mysore to Bangalore this weekend."
        ),
        CopilotNotification(
            id="copilot_energy",
            type="energy",
            title="Electricity Usage Shift",
            message="Your electricity bills show a 14% seasonal usage increase. Check if solar panels can optimize your carbon footprint.",
            action_label="Run Solar Simulation",
            default_query="What if I install solar panels?"
        ),
        CopilotNotification(
            id="copilot_shopping",
            type="shopping",
            title="Hardware Renewal Alert",
            message="Is your main work laptop hitting its 3-year refresh cycle? Consider Refurbished alternatives.",
            action_label="Compare Laptops",
            default_query="I want to buy a new laptop."
        )
    ]

@router.get("/dashboard/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Gather score
    score_record = db.query(CarbonScore).filter(CarbonScore.user_id == current_user.id).first()
    if not score_record:
        score_record = CarbonScore(user_id=current_user.id, score=85, risk_index="Medium")
        db.add(score_record)
        db.commit()
        db.refresh(score_record)
        
    # Calculate savings
    decisions = db.query(DecisionHistory).filter(DecisionHistory.user_id == current_user.id).all()
    total_saved = sum(d.co2_saved for d in decisions)
    
    # Simple categories analysis
    categories = {"Travel": 0.0, "Shopping": 0.0, "Food": 0.0, "Lifestyle": 0.0}
    sims = db.query(CarbonSimulation).filter(CarbonSimulation.user_id == current_user.id).all()
    for s in sims:
        if s.category in categories:
            categories[s.category] += 1
            
    # Normalize category split
    total_sims = len(sims) or 1
    category_split = [{"name": k, "value": int((v / total_sims) * 100)} for k, v in categories.items()]
    
    # 6 Month Forecast (combining history and future projections)
    # Return formatted list
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    forecast = []
    base_val = 220.0
    for idx, m in enumerate(months):
        forecast.append({
            "month": m,
            "baseline": base_val - (idx * 5),
            "actual": base_val - (idx * 15) - (total_saved / 10 if idx == 5 else 0)
        })
        
    return {
        "score": score_record.score,
        "risk_index": score_record.risk_index,
        "total_saved": total_saved,
        "category_split": category_split,
        "forecast": forecast
    }
