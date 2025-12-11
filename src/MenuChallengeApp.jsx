import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Button } from "./components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Utensils, AlertCircle, CheckCircle2, Save } from "lucide-react";

// --- DATA SOURCE FROM PDF  ---
const MENU_DATA = {
  Monday: {
    Breakfast: "Poori, Kesari, Coconut Chutney, Potato Kurma, Milk, Coffee",
    Lunch: "Tomato Rice, Mint Rice/Lemon Rice, Potato Chips, Curd Rice, Pickle",
    Snacks: "Suyyam, Tea",
    Dinner: "Onion Dosa, Podi, Oil, Curd Rice, Sambar, Coconut Chutney, Banana, Milk, Coffee"
  },
  Tuesday: {
    Breakfast: "Idly, Medu Vadai, Sambar, Kara Chutney, Milk, Coffee",
    Lunch: "White Rice, Sambar, Veg Liver pepper fry, Rasam, Curd, Appalam, Milk Payasam",
    Snacks: "Boiled Peanuts, Nannari Sarbath",
    Dinner: "Chappathi, Curd Rice, Pickle, Veg Udupi Kuruma, Fruit Salad, Milk, Coffee"
  },
  Wednesday: {
    Breakfast: "Dosai, Pineapple Kesari, Vadacurry, Coconut Chutney, Milk, Coffee",
    Lunch: "White Rice, Sunda Vathal Karakolambu, Cabbage Poriyal, Rasam, Curd, Appalam",
    Snacks: "Sambar Vadai, Tea",
    Dinner: "Mealmaker Briyani, Dalcha, Raitha, Pickle, Curd Rice, Milk, Coffee, Ice Cream"
  },
  Thursday: {
    Breakfast: "Pongal, Vadai, Sambar, Coconut Chutney, Milk, Coffee",
    Lunch: "White Rice, Radish Mango Sambar, Carrot Beans Poriyal, Fryms, Rasam, Buttermilk",
    Snacks: "Sweet Corn, Salt-Chilli, Lemon Juice",
    Dinner: "Idly, Podi, Oil, Curd Rice, Pickle, Sambar, Kara Chutney, Banana, Milk, Coffee"
  },
  Friday: {
    Breakfast: "Idiyappam/Rava Kichadi, Coconut Milk, Channa Gravy, Koozh, Fried Chilli",
    Lunch: "Bisebellabath, White Rice, Rasam, Buttermilk, Potato Peas Poriyal, Appalam",
    Snacks: "Sundal With Onion, Ginger Tea",
    Dinner: "Adai Dosai, Coconut Chutney, Kara Chutney, Banana, Pickle, Curd Rice, Milk"
  },
  Saturday: {
    Breakfast: "Bread, Butter, Jam, Puliyotharai, Sakkarai Pongal, Coconut Chutney",
    Lunch: "White Rice, Motchai Kaarakolambu, Keerai Kootu, Rasam, Buttermilk, Appalam",
    Snacks: "Masala Sandwich, Masala Tea",
    Dinner: "Chappathi, Channa Gravy/Aloo Mutter Panneer Geema, Banana, Curd Rice"
  },
  Sunday: {
    Breakfast: "Dosai Roast, Sambar, Groundnut Chutney, Milk, Coffee, Podi, Oil",
    Lunch: "Veg Chetinad Seeragasamba Briyani, Raitha, Dalcha, Curd Rice, Gulabjaamun",
    Snacks: "Milkbikis Biscuit, Ginger Tea",
    Dinner: "Semiya Kichadi, White Rice, Banana, Coconut Chutney, Potato Poriyal, Rasam"
  }
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["Breakfast", "Lunch", "Snacks", "Dinner"];

export default function MenuChallengeApp() {
  const [activeTab, setActiveTab] = useState("Monday");
  const [user, setUser] = useState({ name: "", email: "", room: "" });
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Helper to handle text changes
  const handleMenuChange = (day, meal, type, value) => {
    setFormData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: {
          ...prev[day]?.[meal],
          [type]: value
        }
      }
    }));
  };

  const validateForm = () => {
    // 1. User Details Check
    if (!user.name || !user.email || !user.room) {
      setError("Boi! Fill in your personal details (Name, Email, Room No) first.");
      return false;
    }

    // 2. Menu Completion Check (Strict Mode)
    for (const day of DAYS) {
      for (const meal of MEALS) {
        const entry = formData[day]?.[meal];
        if (!entry?.suggestion || !entry?.opinion) {
          setError(`Pending items in ${day} (${meal}). Please fill both suggestion and opinion.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user, menuFeedback: formData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
        <CheckCircle2 className="w-20 h-20 text-green-600 mb-4" />
        <h1 className="text-3xl font-bold text-green-800">Mission Accomplished!</h1>
        <p className="text-gray-600 mt-2 text-center">Your suggestions for the SVCE Hostel Menu have been recorded.</p>
        <p className="text-sm text-gray-500 mt-4">Check your email for confirmation.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Design Your Own Menu 🍛
          </h1>
          <p className="text-slate-500">
            SVCE Boys Hostel Block 3 • Redefine what we eat.
          </p>
        </div>

        {/* USER DETAILS CARD */}
        <Card className="border-t-4 border-indigo-600 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Student Identification</CardTitle>
            <CardDescription>Mandatory for valid submission. One entry per email.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="E.g. Balaji" value={user.name} onChange={e => setUser({...user, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">College Email ID</Label>
              <Input id="email" type="email" placeholder="e.g. 2023xx0000@svce.ac.in" value={user.email} onChange={e => setUser({...user, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room">Room Number</Label>
              <Input id="room" placeholder="E.g. 3XYZ" value={user.room} onChange={e => setUser({...user, room: e.target.value})} />
            </div>
          </CardContent>
        </Card>

        {/* ERROR MESSAGE */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* TABS INTERFACE FOR DAYS */}
        <Tabs defaultValue="Monday" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full justify-start md:justify-center bg-white border h-auto p-1">
              {DAYS.map(day => (
                <TabsTrigger key={day} value={day} className="px-4 py-2 text-sm">
                  {day}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {DAYS.map((day) => (
            <TabsContent key={day} value={day} className="mt-6 space-y-6 animate-in fade-in-50">
              
              {/* LOOP THROUGH MEALS FOR THIS DAY */}
              <div className="grid grid-cols-1 gap-6">
                {MEALS.map((meal) => (
                  <Card key={`${day}-${meal}`} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-slate-100 px-6 py-3 border-b flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Utensils className="w-4 h-4" /> {meal}
                      </h3>
                      <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">{day}</span>
                    </div>
                    
                    <CardContent className="p-6 space-y-6">
                      
                      {/* CURRENT MENU DISPLAY */}
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <p className="text-xs font-bold text-amber-800 uppercase mb-1">Current Menu </p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {MENU_DATA[day][meal]}
                        </p>
                      </div>

                      {/* INPUTS GRID */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* SUGGESTION */}
                        <div className="space-y-2">
                          <Label className="text-indigo-600 font-medium">
                            What do you want instead? <span className="text-red-500">*</span>
                          </Label>
                          <Input 
                            placeholder={`Suggest a ${meal} dish...`}
                            value={formData[day]?.[meal]?.suggestion || ""}
                            onChange={(e) => handleMenuChange(day, meal, "suggestion", e.target.value)}
                            className="border-slate-300 focus:border-indigo-500"
                          />
                        </div>

                        {/* OPINION */}
                        <div className="space-y-2">
                          <Label className="text-indigo-600 font-medium">
                            Issue with current dish? <span className="text-red-500">*</span>
                          </Label>
                          <Textarea 
                            placeholder="Too spicy? Not cooked well? Explain..."
                            value={formData[day]?.[meal]?.opinion || ""}
                            onChange={(e) => handleMenuChange(day, meal, "opinion", e.target.value)}
                            className="resize-none border-slate-300 focus:border-indigo-500"
                            rows={2}
                          />
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* NAVIGATION BUTTONS */}
              <div className="flex justify-between pt-4 pb-12">
                <Button 
                  variant="outline" 
                  disabled={day === "Monday"}
                  onClick={() => setActiveTab(DAYS[DAYS.indexOf(day) - 1])}
                >
                  Previous Day
                </Button>
                
                {day !== "Sunday" ? (
                  <Button 
                    className="bg-slate-900 hover:bg-slate-800"
                    onClick={() => setActiveTab(DAYS[DAYS.indexOf(day) + 1])}
                  >
                    Next Day
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto px-8"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : <><Save className="w-4 h-4 mr-2" /> Submit Final Menu</>}
                  </Button>
                )}
              </div>

            </TabsContent>
          ))}
        </Tabs>

      </div>
    </div>
  );
}