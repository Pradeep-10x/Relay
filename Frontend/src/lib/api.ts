const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let isRefreshing = false;
let failedQueue: { resolve: (token: string | null) => void; reject: (err: Error) => void }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    let token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const getHeaders = (t: string | null) => {
        const headers = { ...options.headers } as Record<string, string>;
        if (t) {
            headers['Authorization'] = `Bearer ${t}`;
        }
        return headers;
    };

    let res = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: getHeaders(token)
    });

    if (res.status === 401) {
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const refreshRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    const newAccessToken = data.accessToken;
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('accessToken', newAccessToken);
                    }
                    isRefreshing = false;
                    processQueue(null, newAccessToken);
                    
                    // Retry original req
                    res = await fetch(`${baseUrl}${endpoint}`, {
                        ...options,
                        headers: getHeaders(newAccessToken)
                    });
                } else {
                    throw new Error("Refresh failed");
                }
            } catch (err) {
                isRefreshing = false;
                processQueue(err as Error, null);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('activeWorkspaceId');
                    window.location.href = '/auth';
                }
                return res; // return 401
            }
        } else {
            // wait for refresh 
            try {
                const newToken = await new Promise<string | null>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                });
                res = await fetch(`${baseUrl}${endpoint}`, {
                    ...options,
                    headers: getHeaders(newToken)
                });
            } catch (err) {
                return res; 
            }
        }
    }

    return res;
}
