"use client";

import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

export type ToastVariant = "error" | "success" | "info";
export type ToastPlacement = "bottom-right" | "top-right";

type ToastOptions = {
    variant?: ToastVariant;
    durationMs?: number;
    placement?: ToastPlacement;
};

type Toast = {
    id: number;
    message: string;
    variant: ToastVariant;
    placement: ToastPlacement;
    isLeaving: boolean;
};

type ToastContextValue = {
    showToast: (message: string, options?: ToastOptions) => void;
};

const DEFAULT_TOAST_DURATION_MS = 5000;
const DEFAULT_TOAST_VARIANT: ToastVariant = "info";
const DEFAULT_TOAST_PLACEMENT: ToastPlacement = "bottom-right";
const TOAST_EXIT_ANIMATION_MS = 260;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren): React.JSX.Element {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const nextToastId = useRef(0);
    const autoCloseTimers = useRef<Map<number, number>>(new Map());
    const exitTimers = useRef<Map<number, number>>(new Map());

    const removeToast = useCallback((id: number): void => {
        const autoCloseTimerId = autoCloseTimers.current.get(id);
        if (autoCloseTimerId) {
            window.clearTimeout(autoCloseTimerId);
            autoCloseTimers.current.delete(id);
        }

        const exitTimerId = exitTimers.current.get(id);
        if (exitTimerId) {
            window.clearTimeout(exitTimerId);
            exitTimers.current.delete(id);
        }

        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    }, []);

    const beginToastExit = useCallback(
        (id: number): void => {
            const autoCloseTimerId = autoCloseTimers.current.get(id);
            if (autoCloseTimerId) {
                window.clearTimeout(autoCloseTimerId);
                autoCloseTimers.current.delete(id);
            }

            setToasts((currentToasts) => {
                let foundTargetToast = false;
                let targetToastAlreadyLeaving = false;

                const nextToasts = currentToasts.map((toast) => {
                    if (toast.id !== id) {
                        return toast;
                    }

                    foundTargetToast = true;
                    if (toast.isLeaving) {
                        targetToastAlreadyLeaving = true;
                        return toast;
                    }

                    return {
                        ...toast,
                        isLeaving: true,
                    };
                });

                if (!foundTargetToast || targetToastAlreadyLeaving) {
                    return currentToasts;
                }

                const exitTimerId = window.setTimeout(() => {
                    removeToast(id);
                }, TOAST_EXIT_ANIMATION_MS);

                exitTimers.current.set(id, exitTimerId);

                return nextToasts;
            });
        },
        [removeToast],
    );

    const showToast = useCallback(
        (message: string, options?: ToastOptions): void => {
            const id = nextToastId.current;
            nextToastId.current += 1;

            const toast: Toast = {
                id,
                message,
                variant: options?.variant ?? DEFAULT_TOAST_VARIANT,
                placement: options?.placement ?? DEFAULT_TOAST_PLACEMENT,
                isLeaving: false,
            };

            setToasts((currentToasts) => [...currentToasts, toast]);

            const durationMs = options?.durationMs ?? DEFAULT_TOAST_DURATION_MS;
            const timerId = window.setTimeout(() => {
                beginToastExit(id);
            }, durationMs);

            autoCloseTimers.current.set(id, timerId);
        },
        [beginToastExit],
    );

    useEffect(() => {
        const autoCloseTimerStore = autoCloseTimers.current;
        const exitTimerStore = exitTimers.current;

        return () => {
            autoCloseTimerStore.forEach((timerId) => {
                window.clearTimeout(timerId);
            });
            autoCloseTimerStore.clear();

            exitTimerStore.forEach((timerId) => {
                window.clearTimeout(timerId);
            });
            exitTimerStore.clear();
        };
    }, []);

    const toastsByPlacement = useMemo(
        () => ({
            topRight: toasts.filter((toast) => toast.placement === "top-right"),
            bottomRight: toasts.filter((toast) => toast.placement === "bottom-right"),
        }),
        [toasts],
    );

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div
                className="app-toast-stack app-toast-stack-top-right"
                aria-live="polite"
                aria-relevant="additions text"
            >
                {toastsByPlacement.topRight.map((toast) => (
                    <article
                        key={toast.id}
                        className={[
                            "app-toast",
                            `app-toast-${toast.variant}`,
                            toast.isLeaving ? "app-toast-leaving" : "",
                        ].join(" ")}
                        role={toast.variant === "error" ? "alert" : "status"}
                    >
                        <p className="app-toast-message">{toast.message}</p>
                    </article>
                ))}
            </div>

            <div
                className="app-toast-stack app-toast-stack-bottom-right"
                aria-live="polite"
                aria-relevant="additions text"
            >
                {toastsByPlacement.bottomRight.map((toast) => (
                    <article
                        key={toast.id}
                        className={[
                            "app-toast",
                            `app-toast-${toast.variant}`,
                            toast.isLeaving ? "app-toast-leaving" : "",
                        ].join(" ")}
                        role={toast.variant === "error" ? "alert" : "status"}
                    >
                        <p className="app-toast-message">{toast.message}</p>
                    </article>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }

    return context;
}
