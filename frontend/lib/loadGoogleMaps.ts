// Simple, single-shot Google Maps script loader that returns a Promise and caches it on window
// Ensures multiple components reuse a single script/promise and attaches to existing <script> if present

export default function loadGoogleMaps(
    apiKey: string | undefined,
    libraries: string[] = ['places'],
    timeoutMs: number = 10000
): Promise<typeof window.google> {
    const w = window as any;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        return Promise.reject(new Error('Google Maps API key not configured'));
    }

    // Already available
    if (w.google && w.google.maps) {
        console.debug('loadGoogleMaps: google.maps already present');
        return Promise.resolve(w.google);
    }

    // Reuse promise if another caller already started loading
    if (w.__googleMapsPromise) {
        console.debug('loadGoogleMaps: reusing existing promise');
        return w.__googleMapsPromise;
    }

    w.__googleMapsPromise = new Promise((resolve, reject) => {
        let timer: number | undefined;
        let createdScript: HTMLScriptElement | null = null;
        const cleanup = () => {
            if (typeof timer !== 'undefined') {
                clearTimeout(timer);
            }
        };

        console.debug('loadGoogleMaps: looking for existing script');
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]') as HTMLScriptElement | null;

        const onLoaded = () => {
            cleanup();
            if (w.google && w.google.maps) {
                console.debug('loadGoogleMaps: resolved - google.maps available');
                resolve(w.google);
            } else {
                console.warn('loadGoogleMaps: script loaded but google.maps missing');
                // Clean the global promise so callers can retry
                delete w.__googleMapsPromise;
                reject(new Error('Google Maps loaded but `google.maps` not found'));
            }
        };

        const onError = (err?: any) => {
            cleanup();
            console.error('loadGoogleMaps: error loading script', err);
            // Allow retries by clearing the promise
            delete w.__googleMapsPromise;
            // Remove the script we added so subsequent retries will create a fresh one
            if (createdScript && createdScript.parentNode) {
                createdScript.parentNode.removeChild(createdScript);
            }
            reject(err || new Error('Failed to load Google Maps script'));
        };

        if (existingScript) {
            console.debug('loadGoogleMaps: existing script found');

            // If the script has already loaded and google is present, resolve
            if (existingScript.getAttribute('data-loaded') === 'true' && w.google && w.google.maps) {
                onLoaded();
                return;
            }

            // Avoid attaching multiple listeners
            if (!existingScript.getAttribute('data-loader-attached')) {
                existingScript.addEventListener('load', () => {
                    existingScript.setAttribute('data-loaded', 'true');
                    onLoaded();
                });
                existingScript.addEventListener('error', onError);
                existingScript.setAttribute('data-loader-attached', 'true');
            } else {
                console.debug('loadGoogleMaps: loader already attached to existing script');
            }
        } else {
            const script = document.createElement('script');
            createdScript = script;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                script.setAttribute('data-loaded', 'true');
                onLoaded();
            };
            script.onerror = (e) => onError(e || new Error('Google Maps script error'));
            document.head.appendChild(script);
            console.debug('loadGoogleMaps: injected script element');
        }

        // Timeout to avoid hanging loader
        timer = window.setTimeout(() => onError(new Error('Google Maps load timed out')), timeoutMs);
    });

    return w.__googleMapsPromise;
}
