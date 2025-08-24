const KEY = "eum.sessionId";
export const ensureSessionId = () => {
    if (!localStorage.getItem(KEY))
        localStorage.setItem(KEY, crypto.randomUUID());
};
export const getSessionId = () => localStorage.getItem(KEY);
ensureSessionId();
