import { useState, useEffect } from "react";
import { checkHealth } from "@/lib/api";

export function useApiHealth() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const check = () => checkHealth().then(setOnline);
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return online;
}
