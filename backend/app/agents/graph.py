import os
import json
import logging
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

logger = logging.getLogger(__name__)

# Define the LangGraph State
class AgentState(TypedDict):
    query: str
    user_id: int
    category: str
    confidence: float
    context: Dict[str, Any]
    baseline_co2: float
    alternatives: List[Dict[str, Any]]
    debate_logs: List[str]
    judge_score: float
    judge_reasoning: str
    forecast_impact: Dict[str, Any]
    regret_analysis: Dict[str, Any]
    recommendations: List[Dict[str, Any]]

# A set of high-fidelity pre-compiled data rules for common hackathon simulation examples
MOCK_SIMULATION_DB = {
    "mysore to bangalore": {
        "category": "Travel",
        "baseline": 45.0,  # Driving alone
        "context": {"origin": "Mysore", "destination": "Bangalore", "distance_km": 150},
        "alternatives": [
            {"name": "Train", "co2": 4.5, "cost": "Low", "convenience": "Medium"},
            {"name": "Electric Vehicle", "co2": 10.2, "cost": "Medium", "convenience": "High"},
            {"name": "Carpooling", "co2": 15.0, "cost": "Low", "convenience": "Medium"}
        ]
    },
    "laptop": {
        "category": "Shopping",
        "baseline": 350.0,  # Brand new high-end laptop
        "context": {"item": "Laptop", "condition": "new"},
        "alternatives": [
            {"name": "Refurbished Laptop", "co2": 80.0, "cost": "Low", "convenience": "High"},
            {"name": "Tablet Hybrid", "co2": 150.0, "cost": "Medium", "convenience": "Medium"},
            {"name": "Repair Current Device", "co2": 15.0, "cost": "Very Low", "convenience": "Low"}
        ]
    },
    "dinner": {
        "category": "Food",
        "baseline": 6.8,  # Beef burger delivered individually
        "context": {"item": "Dinner", "delivery": "individual"},
        "alternatives": [
            {"name": "Vegetarian Meal (Local)", "co2": 1.2, "cost": "Low", "convenience": "High"},
            {"name": "Home Cooked Meal", "co2": 0.8, "cost": "Very Low", "convenience": "Medium"},
            {"name": "Group Delivery Order", "co2": 4.2, "cost": "Low", "convenience": "High"}
        ]
    },
    "apartment": {
        "category": "Lifestyle",
        "baseline": 1200.0,  # 3-bedroom older high-emission apartment
        "context": {"item": "Apartment", "type": "standard"},
        "alternatives": [
            {"name": "LEED Certified Studio", "co2": 300.0, "cost": "High", "convenience": "High"},
            {"name": "Shared Living Space", "co2": 450.0, "cost": "Low", "convenience": "Medium"},
            {"name": "Solar-Retrofit Home", "co2": 250.0, "cost": "High", "convenience": "High"}
        ]
    },
    "scooter": {
        "category": "Travel",
        "baseline": 150.0,  # Annual fuel car commute share
        "context": {"item": "Electric Scooter", "purpose": "commute"},
        "alternatives": [
            {"name": "Electric Scooter", "co2": 12.0, "cost": "Medium", "convenience": "High"},
            {"name": "Public Transit Share", "co2": 20.0, "cost": "Low", "convenience": "Medium"},
            {"name": "Bicycling", "co2": 0.0, "cost": "Very Low", "convenience": "Low"}
        ]
    }
}

def get_best_match(query: str) -> Dict[str, Any]:
    q = query.lower()
    for key, val in MOCK_SIMULATION_DB.items():
        if key in q:
            return val
    # Fallback default
    return {
        "category": "Lifestyle",
        "baseline": 120.0,
        "context": {"query": query},
        "alternatives": [
            {"name": "Eco Alternative", "co2": 24.0, "cost": "Low", "convenience": "High"},
            {"name": "Balanced Alternative", "co2": 60.0, "cost": "Medium", "convenience": "High"}
        ]
    }

# Agent 1: Intent Detection Agent
def intent_agent(state: AgentState) -> Dict[str, Any]:
    query = state["query"]
    match = get_best_match(query)
    return {
        "category": match["category"],
        "confidence": 0.95,
        "context": match["context"]
    }

# Agent 2: Carbon Simulation Agent
def carbon_simulation_agent(state: AgentState) -> Dict[str, Any]:
    match = get_best_match(state["query"])
    return {
        "baseline_co2": match["baseline"]
    }

# Agent 3: Alternative Generation Agent
def alternative_agent(state: AgentState) -> Dict[str, Any]:
    match = get_best_match(state["query"])
    return {
        "alternatives": match["alternatives"]
    }

# Agent 4: Debate Agent
def debate_agent(state: AgentState) -> Dict[str, Any]:
    baseline = state["baseline_co2"]
    alternatives = state["alternatives"]
    
    debate_logs = []
    for alt in alternatives:
        saving = baseline - alt["co2"]
        log = (f"Eco-Agent: '{alt['name']}' saves {saving:.1f} kg CO2. "
               f"Convenience-Agent: Yes, but the cost is {alt['cost']} and convenience is {alt['convenience']}.")
        debate_logs.append(log)
        
    return {"debate_logs": debate_logs}

# Agent 5: Decision Judge Agent
def judge_agent(state: AgentState) -> Dict[str, Any]:
    # Calculate a mock score based on how environmental the alternatives are
    # High score means it is easy to adopt high savings
    score = 82.0
    reasoning = "The alternatives represent a significant carbon footprint reduction with manageable cost trade-offs."
    return {
        "judge_score": score,
        "judge_reasoning": reasoning
    }

# Agent 6: Future Twin Agent
def future_twin_agent(state: AgentState) -> Dict[str, Any]:
    baseline = state["baseline_co2"]
    forecast = {
        "monthly_baseline": baseline * 4,
        "monthly_predicted": state["alternatives"][0]["co2"] * 4,
        "yearly_savings": (baseline - state["alternatives"][0]["co2"]) * 52
    }
    return {"forecast_impact": forecast}

# Agent 7: Regret Engine Agent
def regret_engine_agent(state: AgentState) -> Dict[str, Any]:
    baseline = state["baseline_co2"]
    # Generate 100x regret calculations
    regret = []
    for alt in state["alternatives"]:
        baseline_100x = baseline * 100
        alt_100x = alt["co2"] * 100
        potential_savings = baseline_100x - alt_100x
        regret.append({
            "name": alt["name"],
            "baseline_100x": baseline_100x,
            "alternative_100x": alt_100x,
            "savings_100x": potential_savings
        })
    return {"regret_analysis": {"regrets": regret}}

# Agent 8: Recommendation Agent
def recommendation_agent(state: AgentState) -> Dict[str, Any]:
    baseline = state["baseline_co2"]
    alternatives = state["alternatives"]
    regrets = state["regret_analysis"]["regrets"]
    
    recommendations = []
    
    # Sort alternatives by carbon savings (lowest co2 first)
    sorted_alts = sorted(alternatives, key=lambda x: x["co2"])
    
    # Eco Option
    eco_alt = sorted_alts[0]
    eco_regret = next((r for r in regrets if r["name"] == eco_alt["name"]), None)
    recommendations.append({
        "option_name": "Eco Option",
        "co2_value": eco_alt["co2"],
        "reasoning": f"Option '{eco_alt['name']}' has the minimum footprint. "
                    f"Adopt this to cut carbon by {(baseline - eco_alt['co2']):.1f} kg CO2 per event.",
        "savings_potential": baseline - eco_alt["co2"]
    })
    
    # Balanced Option
    bal_alt = sorted_alts[1] if len(sorted_alts) > 1 else eco_alt
    recommendations.append({
        "option_name": "Balanced Option",
        "co2_value": bal_alt["co2"],
        "reasoning": f"Option '{bal_alt['name']}' provides a good balance of {bal_alt['convenience']} convenience and moderate footprint.",
        "savings_potential": baseline - bal_alt["co2"]
    })
    
    # Best Option
    best_alt = sorted_alts[0] # Pick the one with absolute highest savings
    recommendations.append({
        "option_name": "Best Option",
        "co2_value": best_alt["co2"],
        "reasoning": f"Recommend '{best_alt['name']}' because it maximizes yearly impact reduction. "
                    f"Using it 100 times saves {eco_regret['savings_100x']:.1f} kg CO2.",
        "savings_potential": baseline - best_alt["co2"]
    })
    
    return {"recommendations": recommendations}

# Build the StateGraph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("intent", intent_agent)
workflow.add_node("carbon_simulation", carbon_simulation_agent)
workflow.add_node("alternative", alternative_agent)
workflow.add_node("debate", debate_agent)
workflow.add_node("judge", judge_agent)
workflow.add_node("future_twin", future_twin_agent)
workflow.add_node("regret_engine", regret_engine_agent)
workflow.add_node("recommendation", recommendation_agent)

# Set Entrypoint
workflow.set_entry_point("intent")

# Add Edges
workflow.add_edge("intent", "carbon_simulation")
workflow.add_edge("carbon_simulation", "alternative")
workflow.add_edge("alternative", "debate")
workflow.add_edge("debate", "judge")
workflow.add_edge("judge", "future_twin")
workflow.add_edge("future_twin", "regret_engine")
workflow.add_edge("regret_engine", "recommendation")
workflow.add_edge("recommendation", END)

# Compile
graph = workflow.compile()

def run_simulation_flow(query: str, user_id: int = None) -> Dict[str, Any]:
    initial_state = {
        "query": query,
        "user_id": user_id,
        "category": "",
        "confidence": 0.0,
        "context": {},
        "baseline_co2": 0.0,
        "alternatives": [],
        "debate_logs": [],
        "judge_score": 0.0,
        "judge_reasoning": "",
        "forecast_impact": {},
        "regret_analysis": {},
        "recommendations": []
    }
    
    # Run graph synchronously
    result = graph.invoke(initial_state)
    return result
