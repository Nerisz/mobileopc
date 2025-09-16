// hooks/useDelayedRender.ts
import { useEffect, useState } from "react";

export function useDelayedRender(delay = 200) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, []);

  return ready;
}
