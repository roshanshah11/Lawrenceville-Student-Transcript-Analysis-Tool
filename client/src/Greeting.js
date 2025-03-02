import React, { useState, useEffect } from "react";
import "./Greeting.css";

function Greeting() {
    const [greeting, setGreeting] = useState("");
    
    useEffect(() => {
        const getCurrentGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) return "Good morning";
            if (hour < 18) return "Good afternoon";
            return "Good evening";
        };
        
        setGreeting(getCurrentGreeting());
        const timer = setInterval(() => setGreeting(getCurrentGreeting()), 60000);
        return () => clearInterval(timer);
    }, []);
    
    return <span className="greeting">{greeting}</span>;
}

export default Greeting;
