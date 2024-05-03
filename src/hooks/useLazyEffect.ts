import debounce from "lodash.debounce";
import { EffectCallback, DependencyList, useRef, useCallback, useEffect } from "react";

export function useLazyEffect(effect: EffectCallback, deps: DependencyList = [], wait = 300) {
  const cleanUp = useRef<void | (() => void)>();
  const effectRef = useRef<EffectCallback>();
  effectRef.current = useCallback(effect, deps);
  const lazyEffect = useCallback(
    debounce(() => {
      if (cleanUp.current instanceof Function) {
        cleanUp.current();
      }
      cleanUp.current = effectRef.current?.();
    }, wait),
    [],
  );
  useEffect(lazyEffect, deps);
  useEffect(() => {
    return () => {
      return cleanUp.current instanceof Function ? cleanUp.current() : undefined;
    };
  }, []);
}
