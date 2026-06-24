import os
import json
import logging
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.data.emissions import get_baseline_for_query, generate_alternatives

logger = logging.getLogger(__name__)

# Define the LangGraph State
class AgentState(TypedDict):
    query: str
    user_id: int
    commute_mode: str
    diet_type: str
    previous_simulations: List[str]
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
        "baseline": 45.0,
        "context": {"origin": "Mysore", "destination": "Bangalore", "distance_km": 150},
        "alternatives": [
            {"name": "Train", "co2": 4.5, "cost": "Low", "convenience": "Medium"},
            {"name": "Electric Vehicle", "co2": 10.2, "cost": "Medium", "convenience": "High"},
            {"name": "Carpooling", "co2": 15.0, "cost": "Low", "convenience": "Medium"}
        ]
    },
    "laptop": {
        "category": "Shopping",
        "baseline": 350.0,
        "context": {"item": "Laptop", "condition": "new"},
        "alternatives": [
            {"name": "Refurbished Laptop", "co2": 80.0, "cost": "Low", "convenience": "High"},
            {"name": "Tablet Hybrid", "co2": 150.0, "cost": "Medium", "convenience": "Medium"},
            {"name": "Repair Current Device", "co2": 15.0, "cost": "Very Low", "convenience": "Low"}
        ]
    },
    "dinner": {
        "category": "Food",
        "baseline": 6.8,
        "context": {"item": "Dinner", "delivery": "individual"},
        "alternatives": [
            {"name": "Vegetarian Meal (Local)", "co2": 1.2, "cost": "Low", "convenience": "High"},
            {"name": "Home Cooked Meal", "co2": 0.8, "cost": "Very Low", "convenience": "Medium"},
            {"name": "Group Delivery Order", "co2": 4.2, "cost": "Low", "convenience": "High"}
        ]
    },
    "apartment": {
        "category": "Lifestyle",
        "baseline": 1200.0,
        "context": {"item": "Apartment", "type": "standard"},
        "alternatives": [
            {"name": "LEED Certified Studio", "co2": 300.0, "cost": "High", "convenience": "High"},
            {"name": "Shared Living Space", "co2": 450.0, "cost": "Low", "convenience": "Medium"},
            {"name": "Solar-Retrofit Home", "co2": 250.0, "cost": "High", "convenience": "High"}
        ]
    },
    "scooter": {
        "category": "Travel",
        "baseline": 150.0,
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
    return {
        "category": "Lifestyle",
        "baseline": 120.0,
        "context": {"query": query},
        "alternatives": [
            {"name": "Eco Alternative", "co2": 24.0, "cost": "Low", "convenience": "High"},
            {"name": "Balanced Alternative", "co2": 60.0, "cost": "Medium", "convenience": "High"}
        ]
    }

def get_llm():
    api_key = os.environ.get("OPENAI_API_KEY", "mock")
    if api_key and api_key != "mock" and api_key.strip() != "":
        try:
            return ChatOpenAI(model="gpt-4o")
        except Exception as e:
            logger.error(f"Error initializing ChatOpenAI: {e}")
            return None
    return None

# Convenience & Cost Score Helpers for Weighted Formulation
def get_conv_score(val: str) -> float:
    mapping = {"Very Low": 1.0, "Low": 2.0, "Medium": 3.0, "High": 4.0}
    return mapping.get(val, 3.0) / 4.0

def get_cost_score(val: str) -> float:
    mapping = {"Very Low": 4.0, "Low": 3.0, "Medium": 2.0, "High": 1.0}
    return mapping.get(val, 2.0) / 4.0

def is_preference_match(alt_name: str, commute_mode: str, diet_type: str) -> bool:
    name = alt_name.lower()
    if commute_mode:
        cm = commute_mode.lower()
        if "transit" in cm or "bus" in cm or "train" in cm:
            if "train" in name or "metro" in name or "bus" in name:
                return True
        if "scooter" in cm and "scooter" in name:
            return True
        if "ev" in cm or "electric" in cm:
            if "electric vehicle" in name or "ev" in name:
                return True
        if "bicycle" in cm or "cycle" in cm or "walking" in cm:
            if "bicycle" in name or "walking" in name:
                return True
    if diet_type:
        dt = diet_type.lower()
        if "vegan" in dt and "vegan" in name:
            return True
        if "vegetarian" in dt and ("vegetarian" in name or "vegan" in name):
            return True
    return False

def calculate_weighted_score(alt: Dict[str, Any], baseline: float, commute_mode: str = None, diet_type: str = None) -> float:
    co2_ratio = alt["co2"] / baseline if baseline > 0 else 1.0
    co2_score = max(0.0, min(1.0, 1.0 - co2_ratio))
    conv_score = get_conv_score(alt.get("convenience", "Medium"))
    cost_score = get_cost_score(alt.get("cost", "Medium"))
    score = 0.4 * co2_score + 0.3 * conv_score + 0.3 * cost_score
    if is_preference_match(alt["name"], commute_mode, diet_type):
        score += 0.1
    return min(1.0, score)

# Agent 1: Intent Detection Agent
def intent_agent(state: AgentState) -> Dict[str, Any]:
    query = state["query"].lower().strip()
    confidence = 0.50
    
    # Exact or substring matches
    for key in MOCK_SIMULATION_DB.keys():
        if key == query:
            confidence = 0.95
            break
        elif key in query:
            confidence = 0.75
            
    commute_mode = state.get("commute_mode") or "car_gasoline"
    diet_type = state.get("diet_type") or "omnivore"
    res = get_baseline_for_query(state["query"], commute_mode=commute_mode, diet_type=diet_type)
    
    if confidence == 0.50 and res.get("matched_factors"):
        confidence = 0.75
        
    return {
        "category": res["category"],
        "confidence": confidence,
        "context": res["context"]
    }

# Agent 1.5: Clarification Agent (Low Confidence Node)
def clarification_agent(state: AgentState) -> Dict[str, Any]:
    context = state.get("context", {}) or {}
    context["clarification_needed"] = True
    context["clarification_message"] = (
        f"Your query '{state['query']}' was not fully recognized. "
        "We are running a generalized carbon simulation using default lifestyle indicators. "
        "Please try specifying travel destinations (e.g. 'Mysore to Bangalore'), food items (e.g. 'beef burger'), or appliance details for more specific recommendations."
    )
    return {"context": context}

# Agent 2: Carbon Simulation Agent
def carbon_simulation_agent(state: AgentState) -> Dict[str, Any]:
    commute_mode = state.get("commute_mode") or "car_gasoline"
    diet_type = state.get("diet_type") or "omnivore"
    res = get_baseline_for_query(state["query"], commute_mode=commute_mode, diet_type=diet_type)
    return {
        "baseline_co2": res["baseline_co2"],
        "category": res["category"],
        "context": res["context"]
    }

# Agent 3: Alternative Generation Agent
def alternative_agent(state: AgentState) -> Dict[str, Any]:
    commute_mode = state.get("commute_mode") or "car_gasoline"
    alts = generate_alternatives(state["category"], state["baseline_co2"], state["query"], commute_mode=commute_mode)
    return {
        "alternatives": alts
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
        
    llm = get_llm()
    if llm:
        try:
            messages = [
                SystemMessage(content="You are a carbon simulation debate agent. Compare the baseline decision with the eco-friendly alternatives from the perspective of an Eco-Agent (focusing on carbon savings) and a Convenience-Agent (focusing on cost, accessibility, and ease of adoption). Be concise and return a list of debate points."),
                HumanMessage(content=f"Query: {state['query']}\nBaseline CO2: {baseline} kg\nAlternatives: {json.dumps(alternatives)}")
            ]
            res = llm.invoke(messages)
            content = res.content.strip()
            lines = [line.strip() for line in content.split('\n') if line.strip()]
            if lines:
                return {"debate_logs": lines}
        except Exception as e:
            logger.error(f"Error invoking LLM in debate_agent: {e}")
            
    return {"debate_logs": debate_logs}

# Agent 5: Decision Judge Agent
def judge_agent(state: AgentState) -> Dict[str, Any]:
    baseline = state["baseline_co2"]
    alternatives = state["alternatives"]
    
    if not alternatives or baseline <= 0:
        return {"judge_score": 100.0, "judge_reasoning": "No alternatives or baseline co2 is zero."}
        
    savings_pcts = []
    cost_vals = []
    conv_vals = []
    
    cost_map = {"Very Low": 4.0, "Low": 3.0, "Medium": 2.0, "High": 1.0}
    conv_map = {"Very Low": 1.0, "Low": 2.0, "Medium": 3.0, "High": 4.0}
    
    for alt in alternatives:
        savings_pcts.append((baseline - alt["co2"]) / baseline * 100)
        cost_vals.append(cost_map.get(alt.get("cost", "Medium"), 2.0))
        conv_vals.append(conv_map.get(alt.get("convenience", "Medium"), 3.0))
        
    avg_savings_pct = sum(savings_pcts) / len(savings_pcts)
    avg_cost_factor = sum(cost_vals) / len(cost_vals)
    avg_conv_factor = sum(conv_vals) / len(conv_vals)
    
    score = 0.5 * avg_savings_pct + 0.25 * avg_cost_factor * 25 + 0.25 * avg_conv_factor * 25
    score = max(0.0, min(100.0, score))
    
    reasoning = (
        f"The alternatives offer an average carbon footprint reduction of {avg_savings_pct:.1f}%. "
        f"The overall viability is high, with average convenience score at {avg_conv_factor:.1f}/4.0 "
        f"and cost score at {avg_cost_factor:.1f}/4.0 (where higher means more affordable)."
    )
    
    llm = get_llm()
    if llm:
        try:
            messages = [
                SystemMessage(content="You are a hackathon judge reviewing a sustainability decision. Refine the judge reasoning based on the computed score and carbon details. Be professional, direct, and concise (under 3 sentences)."),
                HumanMessage(content=f"Query: {state['query']}\nBaseline: {baseline} kg\nScore: {score:.1f}/100\nAlternatives: {json.dumps(alternatives)}\nDefault Reasoning: {reasoning}")
            ]
            res = llm.invoke(messages)
            if res.content:
                reasoning = res.content.strip()
        except Exception as e:
            logger.error(f"Error invoking LLM in judge_agent: {e}")
            
    return {
        "judge_score": round(score, 1),
        "judge_reasoning": reasoning
    }

# Agent 6: Future Twin Agent
def future_twin_agent(state: AgentState) -> Dict[str, Any]:
    baseline = state["baseline_co2"]
    alt_co2 = state["alternatives"][0]["co2"] if state["alternatives"] else baseline
    
    monthly_baseline = baseline * 4
    monthly_predicted = alt_co2 * 4
    yearly_savings = (baseline - alt_co2) * 52
    
    forecast = {
        "monthly_baseline": monthly_baseline,
        "monthly_predicted": monthly_predicted,
        "yearly_savings": yearly_savings,
        "narrative": f"If you choose the eco option, you will save {yearly_savings:.1f} kg CO2 this year! That is equivalent to planting {int(yearly_savings / 20) + 1} trees."
    }
    
    llm = get_llm()
    if llm:
        try:
            messages = [
                SystemMessage(content="You are the user's Future Twin from 2050. Write a short, engaging, warning or encouraging message (2-3 sentences max) from the future about the impact of making this decision over the next year. Use the yearly savings and monthly data to be specific and impactful."),
                HumanMessage(content=f"Query: {state['query']}\nYearly Savings: {yearly_savings:.1f} kg CO2\nMonthly Baseline: {monthly_baseline:.1f} kg\nMonthly Predicted: {monthly_predicted:.1f} kg")
            ]
            res = llm.invoke(messages)
            if res.content:
                forecast["narrative"] = res.content.strip()
        except Exception as e:
            logger.error(f"Error invoking LLM in future_twin_agent: {e}")
            
    return {"forecast_impact": forecast}

# Agent 7: Regret Engine Agent
def regret_engine_agent(state: AgentState) -> Dict[str, Any]:
    baseline = state["baseline_co2"]
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
        
    explanation = f"Repeating the baseline action 100 times will result in {baseline * 100:.1f} kg of CO2 emissions. Switching to the best alternative saves {regret[0]['savings_100x']:.1f} kg CO2."
    
    llm = get_llm()
    if llm:
        try:
            messages = [
                SystemMessage(content="You are the Carbon Regret Engine. Write a short, motivating admonition (2 sentences) explaining why repeating the baseline decision 100 times will result in massive wasted carbon, urging the user to switch to the alternatives. Use the 100x numbers to be specific."),
                HumanMessage(content=f"Query: {state['query']}\nRegret 100x analysis: {json.dumps(regret)}")
            ]
            res = llm.invoke(messages)
            if res.content:
                explanation = res.content.strip()
        except Exception as e:
            logger.error(f"Error invoking LLM in regret_engine_agent: {e}")
            
    return {
        "regret_analysis": {
            "regrets": regret,
            "explanation": explanation
        }
    }

# Agent 8: Recommendation Agent
def recommendation_agent(state: AgentState) -> Dict[str, Any]:
    baseline = state["baseline_co2"]
    alternatives = state["alternatives"]
    regrets = state["regret_analysis"]["regrets"]
    commute_mode = state.get("commute_mode")
    diet_type = state.get("diet_type")
    
    if not alternatives:
        return {"recommendations": []}
        
    # Calculate weighted scores for all alternatives
    alts_with_scores = []
    for alt in alternatives:
        score = calculate_weighted_score(alt, baseline, commute_mode, diet_type)
        alts_with_scores.append((score, alt))
        
    # Sort by score descending (highest score first)
    sorted_by_score = sorted(alts_with_scores, key=lambda x: x[0], reverse=True)
    # Sort by co2 ascending (lowest co2 first)
    sorted_by_co2 = sorted(alternatives, key=lambda x: x["co2"])
    
    # 1. Eco Option: lowest CO₂
    eco_alt = sorted_by_co2[0]
    eco_regret = next((r for r in regrets if r["name"] == eco_alt["name"]), {"savings_100x": (baseline - eco_alt["co2"]) * 100})
    
    # 2. Balanced Option: highest weighted score
    best_weighted_alt = sorted_by_score[0][1]
    balanced_alt = sorted_by_score[1][1] if len(sorted_by_score) > 1 else best_weighted_alt
    
    recommendations = []
    
    eco_reasoning = (
        f"Option '{eco_alt['name']}' has the minimum footprint. "
        f"Adopt this to cut carbon by {(baseline - eco_alt['co2']):.1f} kg CO2 per event."
    )
    
    bal_reasoning = (
        f"Option '{balanced_alt['name']}' provides a good balance of {balanced_alt['convenience']} convenience and moderate footprint."
    )
    
    best_reasoning = (
        f"Recommend '{best_weighted_alt['name']}' because it maximizes yearly impact reduction. "
        f"Using it 100 times saves {eco_regret['savings_100x']:.1f} kg CO2."
    )
    
    llm = get_llm()
    if llm:
        try:
            messages = [
                SystemMessage(content="You are a senior sustainability advisor. Write a personalized, highly specific recommendation rationale (1 sentence per option) for the Eco Option, Balanced Option, and Best Option based on the user preferences and past history. Be concise and return a JSON object with keys 'eco', 'balanced', and 'best' containing the rationales."),
                HumanMessage(content=f"Query: {state['query']}\nPreferences: Commute={commute_mode}, Diet={diet_type}\nAlternatives: {json.dumps(alternatives)}\nEco Option: {json.dumps(eco_alt)}\nBalanced Option: {json.dumps(balanced_alt)}\nBest Option: {json.dumps(best_weighted_alt)}")
            ]
            res = llm.invoke(messages)
            content = res.content.strip()
            try:
                # Remove any markdown code fence wrappers
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[4:]
                parsed = json.loads(content)
                if "eco" in parsed:
                    eco_reasoning = parsed["eco"]
                if "balanced" in parsed:
                    bal_reasoning = parsed["balanced"]
                if "best" in parsed:
                    best_reasoning = parsed["best"]
            except Exception as pe:
                logger.error(f"Error parsing recommendations LLM JSON: {pe}")
        except Exception as e:
            logger.error(f"Error invoking LLM in recommendation_agent: {e}")
            
    recommendations.append({
        "option_name": "Eco Option",
        "co2_value": eco_alt["co2"],
        "reasoning": eco_reasoning,
        "savings_potential": baseline - eco_alt["co2"]
    })
    
    recommendations.append({
        "option_name": "Balanced Option",
        "co2_value": balanced_alt["co2"],
        "reasoning": bal_reasoning,
        "savings_potential": baseline - balanced_alt["co2"]
    })
    
    recommendations.append({
        "option_name": "Best Option",
        "co2_value": best_weighted_alt["co2"],
        "reasoning": best_reasoning,
        "savings_potential": baseline - best_weighted_alt["co2"]
    })
    
    return {"recommendations": recommendations}

def route_after_intent(state: AgentState) -> str:
    if state["confidence"] < 0.70:
        return "clarification"
    return "carbon_simulation"

# Build the StateGraph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("intent", intent_agent)
workflow.add_node("clarification", clarification_agent)
workflow.add_node("carbon_simulation", carbon_simulation_agent)
workflow.add_node("alternative", alternative_agent)
workflow.add_node("debate", debate_agent)
workflow.add_node("judge", judge_agent)
workflow.add_node("future_twin", future_twin_agent)
workflow.add_node("regret_engine", regret_engine_agent)
workflow.add_node("recommendation", recommendation_agent)

# Set Entrypoint
workflow.set_entry_point("intent")

# Add Edges (Conditional routing after intent)
workflow.add_conditional_edges(
    "intent",
    route_after_intent,
    {
        "clarification": "clarification",
        "carbon_simulation": "carbon_simulation"
    }
)
workflow.add_edge("clarification", "carbon_simulation")
workflow.add_edge("carbon_simulation", "alternative")
workflow.add_edge("alternative", "debate")
workflow.add_edge("debate", "judge")
workflow.add_edge("judge", "future_twin")
workflow.add_edge("future_twin", "regret_engine")
workflow.add_edge("regret_engine", "recommendation")
workflow.add_edge("recommendation", END)

# Compile
graph = workflow.compile()

def run_simulation_flow(
    query: str,
    user_id: int = None,
    commute_mode: str = None,
    diet_type: str = None,
    previous_simulations: List[str] = None
) -> Dict[str, Any]:
    initial_state = {
        "query": query,
        "user_id": user_id,
        "commute_mode": commute_mode or "car_gasoline",
        "diet_type": diet_type or "omnivore",
        "previous_simulations": previous_simulations or [],
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

