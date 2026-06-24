"""
Carbon Shadow AI — Emissions Factor Database
==============================================
50+ emission factors sourced from:
- UK DEFRA 2024 Conversion Factors
- US EPA Emission Factors Hub
- IPCC AR6 WG3 (2022)
- IEA World Energy Outlook 2024

All values in kg CO2e per unit unless otherwise noted.
"""

from typing import Dict, List, Optional, Any
import re

# ============================================================
# EMISSIONS FACTOR DATABASE
# Each entry: { subcategory, co2_kg, unit, source, keywords }
# ============================================================

EMISSIONS_FACTORS: List[Dict[str, Any]] = [
    # ── TRAVEL (15 entries) ──────────────────────────────────
    {"category": "Travel", "subcategory": "car_petrol_solo",
     "co2_kg": 0.21, "unit": "per_km",
     "source": "DEFRA 2024 — Average petrol car, single occupant",
     "keywords": ["car", "drive", "driving", "petrol", "gasoline", "solo"]},

    {"category": "Travel", "subcategory": "car_diesel_solo",
     "co2_kg": 0.17, "unit": "per_km",
     "source": "DEFRA 2024 — Average diesel car, single occupant",
     "keywords": ["diesel", "car"]},

    {"category": "Travel", "subcategory": "car_electric",
     "co2_kg": 0.05, "unit": "per_km",
     "source": "DEFRA 2024 — Battery EV (UK grid avg)",
     "keywords": ["electric vehicle", "ev", "electric car", "tesla"]},

    {"category": "Travel", "subcategory": "carpool_4",
     "co2_kg": 0.05, "unit": "per_km",
     "source": "DEFRA 2024 — Petrol car, 4 occupants",
     "keywords": ["carpool", "carpooling", "ride share", "shared ride"]},

    {"category": "Travel", "subcategory": "bus_local",
     "co2_kg": 0.089, "unit": "per_km",
     "source": "DEFRA 2024 — Local bus, average occupancy",
     "keywords": ["bus", "public bus", "transit bus", "ksrtc"]},

    {"category": "Travel", "subcategory": "train_national",
     "co2_kg": 0.035, "unit": "per_km",
     "source": "DEFRA 2024 — National rail, average",
     "keywords": ["train", "rail", "railway", "metro", "subway"]},

    {"category": "Travel", "subcategory": "domestic_flight",
     "co2_kg": 0.246, "unit": "per_km",
     "source": "DEFRA 2024 — Domestic flight, economy, with RF",
     "keywords": ["flight", "fly", "airplane", "domestic flight", "plane"]},

    {"category": "Travel", "subcategory": "long_haul_flight",
     "co2_kg": 0.195, "unit": "per_km",
     "source": "DEFRA 2024 — Long-haul flight, economy, with RF",
     "keywords": ["international flight", "long haul", "overseas"]},

    {"category": "Travel", "subcategory": "motorcycle_petrol",
     "co2_kg": 0.113, "unit": "per_km",
     "source": "DEFRA 2024 — Average motorcycle",
     "keywords": ["motorcycle", "motorbike", "bike petrol"]},

    {"category": "Travel", "subcategory": "electric_scooter",
     "co2_kg": 0.008, "unit": "per_km",
     "source": "IEA 2024 — E-scooter lifecycle per km",
     "keywords": ["electric scooter", "e-scooter", "scooter electric"]},

    {"category": "Travel", "subcategory": "petrol_scooter",
     "co2_kg": 0.065, "unit": "per_km",
     "source": "DEFRA 2024 — Small petrol scooter/moped",
     "keywords": ["scooter", "moped", "petrol scooter", "scooty"]},

    {"category": "Travel", "subcategory": "bicycle",
     "co2_kg": 0.0, "unit": "per_km",
     "source": "Zero direct emissions",
     "keywords": ["bicycle", "cycling", "bike", "cycle", "walk", "walking"]},

    {"category": "Travel", "subcategory": "auto_rickshaw",
     "co2_kg": 0.08, "unit": "per_km",
     "source": "India CPCB — CNG auto-rickshaw average",
     "keywords": ["auto", "rickshaw", "auto rickshaw", "tuk tuk"]},

    {"category": "Travel", "subcategory": "taxi_ride",
     "co2_kg": 0.21, "unit": "per_km",
     "source": "DEFRA 2024 — Regular taxi, single passenger",
     "keywords": ["taxi", "cab", "uber", "ola", "lyft"]},

    {"category": "Travel", "subcategory": "ferry",
     "co2_kg": 0.019, "unit": "per_km",
     "source": "DEFRA 2024 — Foot passenger ferry",
     "keywords": ["ferry", "boat", "ship"]},

    # ── FOOD (12 entries) ────────────────────────────────────
    {"category": "Food", "subcategory": "beef_meal",
     "co2_kg": 6.8, "unit": "per_meal",
     "source": "IPCC AR6 — Beef-based meal (300g serving)",
     "keywords": ["beef", "steak", "burger", "red meat"]},

    {"category": "Food", "subcategory": "chicken_meal",
     "co2_kg": 2.4, "unit": "per_meal",
     "source": "IPCC AR6 — Poultry-based meal (300g serving)",
     "keywords": ["chicken", "poultry", "wings"]},

    {"category": "Food", "subcategory": "fish_meal",
     "co2_kg": 1.8, "unit": "per_meal",
     "source": "IPCC AR6 — Fish-based meal (300g serving)",
     "keywords": ["fish", "seafood", "salmon", "tuna", "shrimp"]},

    {"category": "Food", "subcategory": "vegetarian_meal",
     "co2_kg": 1.2, "unit": "per_meal",
     "source": "IPCC AR6 — Vegetarian meal (dairy included)",
     "keywords": ["vegetarian", "veggie", "paneer", "dal", "lentil"]},

    {"category": "Food", "subcategory": "vegan_meal",
     "co2_kg": 0.7, "unit": "per_meal",
     "source": "IPCC AR6 — Fully plant-based meal",
     "keywords": ["vegan", "plant based", "tofu", "tempeh"]},

    {"category": "Food", "subcategory": "food_delivery_individual",
     "co2_kg": 1.5, "unit": "per_delivery",
     "source": "EPA — Individual food delivery trip emissions",
     "keywords": ["delivery", "food delivery", "swiggy", "zomato", "doordash", "uber eats"]},

    {"category": "Food", "subcategory": "food_delivery_group",
     "co2_kg": 0.5, "unit": "per_delivery_per_person",
     "source": "EPA — Group delivery (3+ people shared)",
     "keywords": ["group order", "shared delivery", "bulk order"]},

    {"category": "Food", "subcategory": "dairy_milk_liter",
     "co2_kg": 1.3, "unit": "per_liter",
     "source": "DEFRA 2024 — Cow's milk production",
     "keywords": ["milk", "dairy"]},

    {"category": "Food", "subcategory": "oat_milk_liter",
     "co2_kg": 0.3, "unit": "per_liter",
     "source": "DEFRA 2024 — Oat milk production",
     "keywords": ["oat milk", "almond milk", "soy milk", "plant milk"]},

    {"category": "Food", "subcategory": "rice_kg",
     "co2_kg": 2.7, "unit": "per_kg",
     "source": "IPCC AR6 — Paddy rice production (methane)",
     "keywords": ["rice", "biryani", "fried rice"]},

    {"category": "Food", "subcategory": "coffee_cup",
     "co2_kg": 0.21, "unit": "per_cup",
     "source": "DEFRA 2024 — Black coffee (250ml)",
     "keywords": ["coffee", "espresso", "latte", "cappuccino"]},

    {"category": "Food", "subcategory": "home_cooked_meal",
     "co2_kg": 0.8, "unit": "per_meal",
     "source": "EPA — Average home-cooked meal (mixed diet)",
     "keywords": ["home cooked", "cook", "cooking", "homemade"]},

    # ── ELECTRONICS (8 entries) ──────────────────────────────
    {"category": "Electronics", "subcategory": "laptop_new",
     "co2_kg": 350.0, "unit": "per_unit_lifecycle",
     "source": "Dell 2024 PCF — New laptop manufacturing + shipping",
     "keywords": ["laptop", "notebook", "macbook", "computer"]},

    {"category": "Electronics", "subcategory": "laptop_refurbished",
     "co2_kg": 80.0, "unit": "per_unit_lifecycle",
     "source": "Circular Computing 2024 — Refurbished laptop",
     "keywords": ["refurbished laptop", "used laptop", "secondhand laptop"]},

    {"category": "Electronics", "subcategory": "smartphone_new",
     "co2_kg": 70.0, "unit": "per_unit_lifecycle",
     "source": "Apple 2024 — iPhone 15 lifecycle emissions",
     "keywords": ["phone", "smartphone", "iphone", "mobile", "android"]},

    {"category": "Electronics", "subcategory": "tablet_new",
     "co2_kg": 120.0, "unit": "per_unit_lifecycle",
     "source": "Apple 2024 — iPad lifecycle emissions",
     "keywords": ["tablet", "ipad"]},

    {"category": "Electronics", "subcategory": "desktop_new",
     "co2_kg": 500.0, "unit": "per_unit_lifecycle",
     "source": "HP 2024 — Desktop PC lifecycle",
     "keywords": ["desktop", "pc", "workstation"]},

    {"category": "Electronics", "subcategory": "monitor_new",
     "co2_kg": 200.0, "unit": "per_unit_lifecycle",
     "source": "Dell 2024 — 27-inch monitor lifecycle",
     "keywords": ["monitor", "screen", "display"]},

    {"category": "Electronics", "subcategory": "tv_new",
     "co2_kg": 350.0, "unit": "per_unit_lifecycle",
     "source": "Samsung 2024 — 55-inch TV lifecycle",
     "keywords": ["tv", "television"]},

    {"category": "Electronics", "subcategory": "repair_device",
     "co2_kg": 15.0, "unit": "per_repair",
     "source": "iFixit 2024 — Average electronics repair",
     "keywords": ["repair", "fix", "service"]},

    # ── HOUSING (8 entries) ──────────────────────────────────
    {"category": "Housing", "subcategory": "standard_apartment_annual",
     "co2_kg": 2400.0, "unit": "per_year",
     "source": "EPA 2024 — Average US apartment energy + heating",
     "keywords": ["apartment", "flat", "rental", "rent"]},

    {"category": "Housing", "subcategory": "leed_certified_annual",
     "co2_kg": 960.0, "unit": "per_year",
     "source": "USGBC — LEED Platinum certified building avg",
     "keywords": ["leed", "green building", "certified", "eco apartment"]},

    {"category": "Housing", "subcategory": "shared_living_annual",
     "co2_kg": 1200.0, "unit": "per_year",
     "source": "EPA 2024 — Shared housing per occupant",
     "keywords": ["shared living", "roommate", "co-living", "hostel"]},

    {"category": "Housing", "subcategory": "solar_retrofit_annual",
     "co2_kg": 600.0, "unit": "per_year",
     "source": "NREL 2024 — Solar-retrofitted home avg",
     "keywords": ["solar", "solar panel", "solar retrofit", "solar home"]},

    {"category": "Housing", "subcategory": "heating_gas_monthly",
     "co2_kg": 200.0, "unit": "per_month",
     "source": "DEFRA 2024 — Natural gas heating, avg home",
     "keywords": ["heating", "gas heating", "furnace", "boiler"]},

    {"category": "Housing", "subcategory": "heating_electric_monthly",
     "co2_kg": 80.0, "unit": "per_month",
     "source": "DEFRA 2024 — Electric heat pump, avg home",
     "keywords": ["heat pump", "electric heating"]},

    {"category": "Housing", "subcategory": "ac_monthly",
     "co2_kg": 100.0, "unit": "per_month",
     "source": "India BEE — Air conditioning avg monthly",
     "keywords": ["air conditioning", "ac", "cooling"]},

    {"category": "Housing", "subcategory": "water_heater_monthly",
     "co2_kg": 30.0, "unit": "per_month",
     "source": "DEFRA 2024 — Electric water heater, avg",
     "keywords": ["water heater", "geyser"]},

    # ── ENERGY (8 entries) ───────────────────────────────────
    {"category": "Energy", "subcategory": "grid_electricity_india",
     "co2_kg": 0.82, "unit": "per_kwh",
     "source": "IEA 2024 — India grid emission factor",
     "keywords": ["electricity", "grid", "power", "india grid"]},

    {"category": "Energy", "subcategory": "grid_electricity_us",
     "co2_kg": 0.39, "unit": "per_kwh",
     "source": "EPA 2024 — US average grid emission factor",
     "keywords": ["us electricity", "american grid"]},

    {"category": "Energy", "subcategory": "grid_electricity_eu",
     "co2_kg": 0.23, "unit": "per_kwh",
     "source": "EEA 2024 — EU average grid emission factor",
     "keywords": ["eu electricity", "europe grid"]},

    {"category": "Energy", "subcategory": "solar_panel_kwh",
     "co2_kg": 0.04, "unit": "per_kwh",
     "source": "NREL 2024 — Rooftop solar lifecycle",
     "keywords": ["solar energy", "solar power", "pv panel"]},

    {"category": "Energy", "subcategory": "wind_kwh",
     "co2_kg": 0.011, "unit": "per_kwh",
     "source": "IPCC AR6 — Onshore wind lifecycle",
     "keywords": ["wind energy", "wind power", "wind turbine"]},

    {"category": "Energy", "subcategory": "natural_gas_kwh",
     "co2_kg": 0.20, "unit": "per_kwh",
     "source": "DEFRA 2024 — Natural gas combustion",
     "keywords": ["natural gas", "gas", "lpg", "propane"]},

    {"category": "Energy", "subcategory": "coal_kwh",
     "co2_kg": 0.91, "unit": "per_kwh",
     "source": "IPCC AR6 — Coal combustion",
     "keywords": ["coal", "coal power"]},

    {"category": "Energy", "subcategory": "diesel_generator_kwh",
     "co2_kg": 0.65, "unit": "per_kwh",
     "source": "EPA — Diesel generator avg",
     "keywords": ["diesel generator", "generator", "backup power"]},

    # ── LIFESTYLE (5 entries) ────────────────────────────────
    {"category": "Lifestyle", "subcategory": "clothing_fast_fashion",
     "co2_kg": 33.4, "unit": "per_garment",
     "source": "WRAP 2024 — Fast fashion garment lifecycle",
     "keywords": ["clothing", "clothes", "fast fashion", "shirt", "jeans", "dress"]},

    {"category": "Lifestyle", "subcategory": "clothing_secondhand",
     "co2_kg": 2.0, "unit": "per_garment",
     "source": "ThredUp 2024 — Secondhand garment impact",
     "keywords": ["secondhand clothing", "thrift", "used clothes"]},

    {"category": "Lifestyle", "subcategory": "streaming_hour",
     "co2_kg": 0.036, "unit": "per_hour",
     "source": "IEA 2024 — Video streaming avg data center + network",
     "keywords": ["streaming", "netflix", "youtube", "video"]},

    {"category": "Lifestyle", "subcategory": "laundry_load",
     "co2_kg": 0.6, "unit": "per_load",
     "source": "DEFRA 2024 — Washing machine cycle (warm)",
     "keywords": ["laundry", "washing", "washer"]},

    {"category": "Lifestyle", "subcategory": "paper_ream",
     "co2_kg": 5.0, "unit": "per_ream_500_sheets",
     "source": "EPA — Paper manufacturing lifecycle",
     "keywords": ["paper", "printing", "printer"]},
]


# ============================================================
# CONVENIENCE MAPS
# ============================================================

CONVENIENCE_SCORES = {"Very Low": 1.0, "Low": 2.0, "Medium": 3.0, "High": 4.0}
COST_SCORES = {"Very Low": 4.0, "Low": 3.0, "Medium": 2.0, "High": 1.0}

# User preference modifiers for baseline adjustments
COMMUTE_MODIFIERS = {
    "car_gasoline": 1.0,
    "car_diesel": 0.85,
    "electric_vehicle": 0.25,
    "public_transit": 0.40,
    "bicycle": 0.0,
    "motorcycle": 0.55,
    "electric_scooter": 0.05,
}

DIET_MODIFIERS = {
    "omnivore": 1.0,
    "pescatarian": 0.72,
    "vegetarian": 0.50,
    "vegan": 0.30,
}

# Common route distances (India-specific for hackathon context)
KNOWN_ROUTES_KM = {
    ("mysore", "bangalore"): 150,
    ("bangalore", "mysore"): 150,
    ("mumbai", "pune"): 150,
    ("pune", "mumbai"): 150,
    ("delhi", "agra"): 230,
    ("agra", "delhi"): 230,
    ("chennai", "bangalore"): 350,
    ("bangalore", "chennai"): 350,
    ("hyderabad", "bangalore"): 570,
    ("bangalore", "hyderabad"): 570,
}


# ============================================================
# LOOKUP FUNCTIONS
# ============================================================

def get_emission_factor(category: str, subcategory: str) -> Optional[Dict[str, Any]]:
    """Retrieve a specific emission factor by category and subcategory."""
    for factor in EMISSIONS_FACTORS:
        if factor["category"].lower() == category.lower() and \
           factor["subcategory"].lower() == subcategory.lower():
            return factor
    return None


def get_factors_by_category(category: str) -> List[Dict[str, Any]]:
    """Get all emission factors for a given category."""
    return [f for f in EMISSIONS_FACTORS if f["category"].lower() == category.lower()]


def calculate_emissions(category: str, subcategory: str, quantity: float = 1.0) -> float:
    """Calculate total emissions for a given factor and quantity.

    Args:
        category: e.g., "Travel"
        subcategory: e.g., "car_petrol_solo"
        quantity: e.g., 150 (km) or 1 (meal)

    Returns:
        Total CO2 in kg
    """
    factor = get_emission_factor(category, subcategory)
    if not factor:
        return 0.0
    return round(factor["co2_kg"] * quantity, 2)


def match_query_to_factors(query: str) -> List[Dict[str, Any]]:
    """Match a natural language query against all emission factors.

    Returns matching factors sorted by keyword relevance (most keywords matched first).
    """
    q = query.lower()
    scored: List[tuple] = []

    for factor in EMISSIONS_FACTORS:
        match_count = 0
        for kw in factor["keywords"]:
            if kw in q:
                match_count += 1
        if match_count > 0:
            scored.append((match_count, factor))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in scored]


def detect_category(query: str) -> str:
    """Detect the category of a query based on keyword analysis."""
    q = query.lower()

    category_keywords = {
        "Travel": ["travel", "drive", "fly", "flight", "bus", "train", "commute",
                    "ride", "taxi", "scooter", "car", "mysore", "bangalore",
                    "trip", "transport", "metro", "auto"],
        "Food": ["food", "eat", "meal", "dinner", "lunch", "breakfast",
                 "restaurant", "cook", "diet", "vegetarian", "vegan",
                 "delivery", "order food", "beef", "chicken"],
        "Electronics": ["laptop", "phone", "computer", "tablet", "tv",
                        "monitor", "desktop", "device", "buy", "purchase",
                        "refurbished", "repair"],
        "Housing": ["apartment", "house", "home", "rent", "heating",
                    "cooling", "ac", "solar panel", "electricity"],
        "Energy": ["electricity", "power", "solar", "energy", "grid",
                   "generator", "renewable"],
        "Lifestyle": ["clothing", "clothes", "fashion", "streaming",
                      "laundry", "paper"],
    }

    best_category = "Lifestyle"
    best_count = 0

    for cat, keywords in category_keywords.items():
        count = sum(1 for kw in keywords if kw in q)
        if count > best_count:
            best_count = count
            best_category = cat

    return best_category


def estimate_distance_km(query: str) -> Optional[float]:
    """Try to extract or estimate distance from a travel query."""
    q = query.lower()

    # Check known routes
    for (origin, dest), km in KNOWN_ROUTES_KM.items():
        if origin in q and dest in q:
            return km
        if origin in q or dest in q:
            for (o2, d2), km2 in KNOWN_ROUTES_KM.items():
                if (origin == o2 or dest == d2) and (o2 in q or d2 in q):
                    return km2

    # Try to extract explicit distance
    km_match = re.search(r'(\d+)\s*(?:km|kilometer|kilometres)', q)
    if km_match:
        return float(km_match.group(1))

    mile_match = re.search(r'(\d+)\s*(?:miles?)', q)
    if mile_match:
        return float(mile_match.group(1)) * 1.609

    return None


def get_baseline_for_query(query: str, commute_mode: str = "car_gasoline",
                           diet_type: str = "omnivore") -> Dict[str, Any]:
    """Calculate a baseline CO2 value for a given query using the emissions database.

    Returns a dict with category, baseline_co2, context, and matched factors.
    """
    category = detect_category(query)
    matches = match_query_to_factors(query)
    q = query.lower()
    baseline = 0.0
    context: Dict[str, Any] = {"query": query, "matched_factors": len(matches)}

    if category == "Travel":
        distance = estimate_distance_km(query)
        if distance:
            context["distance_km"] = distance
            # Use user's commute mode for baseline
            modifier = COMMUTE_MODIFIERS.get(commute_mode, 1.0)
            # Default baseline is petrol car
            petrol_factor = get_emission_factor("Travel", "car_petrol_solo")
            if petrol_factor:
                baseline = round(petrol_factor["co2_kg"] * distance * modifier, 1)
            else:
                baseline = round(0.21 * distance * modifier, 1)
        else:
            # No distance found — use annual commute estimate
            baseline = 150.0 * COMMUTE_MODIFIERS.get(commute_mode, 1.0)
            context["note"] = "Annual commute estimate"

    elif category == "Food":
        diet_mod = DIET_MODIFIERS.get(diet_type, 1.0)
        if matches:
            baseline = round(matches[0]["co2_kg"] * diet_mod, 1)
        else:
            baseline = round(6.8 * diet_mod, 1)  # Default beef meal
        context["diet_modifier"] = diet_mod

    elif category == "Electronics":
        if matches:
            baseline = matches[0]["co2_kg"]
        else:
            baseline = 350.0  # Default new laptop
        context["item_type"] = matches[0]["subcategory"] if matches else "laptop_new"

    elif category == "Housing":
        if matches:
            baseline = matches[0]["co2_kg"]
        else:
            baseline = 2400.0
        context["housing_type"] = matches[0]["subcategory"] if matches else "standard_apartment_annual"

    elif category == "Energy":
        if matches:
            baseline = matches[0]["co2_kg"] * 300  # Monthly kWh estimate
        else:
            baseline = 246.0  # India grid, 300 kWh/month

    else:  # Lifestyle
        if matches:
            baseline = matches[0]["co2_kg"]
        else:
            baseline = 120.0

    return {
        "category": category,
        "baseline_co2": max(baseline, 0.1),
        "context": context,
        "matched_factors": matches[:5],
    }


def generate_alternatives(category: str, baseline_co2: float,
                          query: str, commute_mode: str = "car_gasoline") -> List[Dict[str, Any]]:
    """Generate eco-friendly alternatives based on category and baseline."""
    q = query.lower()
    alternatives: List[Dict[str, Any]] = []

    if category == "Travel":
        distance = estimate_distance_km(query) or 100.0

        train_co2 = calculate_emissions("Travel", "train_national", distance)
        ev_co2 = calculate_emissions("Travel", "car_electric", distance)
        bus_co2 = calculate_emissions("Travel", "bus_local", distance)
        carpool_co2 = calculate_emissions("Travel", "carpool_4", distance)
        escooter_co2 = calculate_emissions("Travel", "electric_scooter", distance)
        bicycle_co2 = 0.0

        candidates = [
            {"name": "Train / Metro", "co2": train_co2, "cost": "Low", "convenience": "Medium"},
            {"name": "Electric Vehicle", "co2": ev_co2, "cost": "Medium", "convenience": "High"},
            {"name": "Public Bus (KSRTC)", "co2": bus_co2, "cost": "Low", "convenience": "Medium"},
            {"name": "Carpooling (4 people)", "co2": carpool_co2, "cost": "Low", "convenience": "Medium"},
        ]

        if distance <= 30:
            candidates.append({"name": "Electric Scooter", "co2": escooter_co2, "cost": "Medium", "convenience": "High"})
            candidates.append({"name": "Bicycle / Walking", "co2": bicycle_co2, "cost": "Very Low", "convenience": "Low"})

        # Filter out alternatives that are worse than baseline
        candidates = [c for c in candidates if c["co2"] < baseline_co2]
        alternatives = sorted(candidates, key=lambda x: x["co2"])[:3]

    elif category == "Food":
        if baseline_co2 > 4.0:
            alternatives = [
                {"name": "Vegetarian Meal (Local)", "co2": 1.2, "cost": "Low", "convenience": "High"},
                {"name": "Home Cooked Meal", "co2": 0.8, "cost": "Very Low", "convenience": "Medium"},
                {"name": "Group Delivery Order", "co2": round(baseline_co2 * 0.6, 1), "cost": "Low", "convenience": "High"},
            ]
        else:
            alternatives = [
                {"name": "Vegan Meal (Plant-based)", "co2": 0.7, "cost": "Low", "convenience": "High"},
                {"name": "Home Cooked Meal", "co2": 0.8, "cost": "Very Low", "convenience": "Medium"},
                {"name": "Local Seasonal Produce", "co2": 0.5, "cost": "Low", "convenience": "Medium"},
            ]

    elif category == "Electronics":
        alternatives = [
            {"name": "Refurbished Device", "co2": round(baseline_co2 * 0.23, 1), "cost": "Low", "convenience": "High"},
            {"name": "Smaller/Efficient Model", "co2": round(baseline_co2 * 0.45, 1), "cost": "Medium", "convenience": "High"},
            {"name": "Repair Current Device", "co2": 15.0, "cost": "Very Low", "convenience": "Low"},
        ]

    elif category == "Housing":
        alternatives = [
            {"name": "LEED Certified Housing", "co2": round(baseline_co2 * 0.40, 1), "cost": "High", "convenience": "High"},
            {"name": "Shared / Co-Living Space", "co2": round(baseline_co2 * 0.50, 1), "cost": "Low", "convenience": "Medium"},
            {"name": "Solar Retrofit Home", "co2": round(baseline_co2 * 0.25, 1), "cost": "High", "convenience": "High"},
        ]

    elif category == "Energy":
        alternatives = [
            {"name": "Rooftop Solar Panels", "co2": round(baseline_co2 * 0.05, 1), "cost": "High", "convenience": "High"},
            {"name": "Green Energy Tariff", "co2": round(baseline_co2 * 0.30, 1), "cost": "Medium", "convenience": "High"},
            {"name": "Energy Efficiency Upgrades", "co2": round(baseline_co2 * 0.60, 1), "cost": "Medium", "convenience": "High"},
        ]

    else:  # Lifestyle
        alternatives = [
            {"name": "Sustainable Alternative", "co2": round(baseline_co2 * 0.20, 1), "cost": "Low", "convenience": "High"},
            {"name": "Secondhand Option", "co2": round(baseline_co2 * 0.10, 1), "cost": "Very Low", "convenience": "Medium"},
            {"name": "Reduce Usage by 50%", "co2": round(baseline_co2 * 0.50, 1), "cost": "Very Low", "convenience": "High"},
        ]

    if not alternatives:
        alternatives = [
            {"name": "Eco Alternative", "co2": round(baseline_co2 * 0.20, 1), "cost": "Low", "convenience": "High"},
            {"name": "Balanced Alternative", "co2": round(baseline_co2 * 0.50, 1), "cost": "Medium", "convenience": "High"},
        ]

    return alternatives
