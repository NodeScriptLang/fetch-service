export function parseJson<T = any>(str: string, defaultValue: T): T {
    try {
        const json = JSON.parse(str);
        return json;
    } catch (_err) {
        return defaultValue;
    }
}
