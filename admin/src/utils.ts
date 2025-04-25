import { getAuthToken } from './auth';

const API_BASE_URL = 'http://localhost:3000/api';

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

export async function fetchProfileData(): Promise<any> {
    return fetchWithAuth(`${API_BASE_URL}/profile`);
}

export async function updateProfileData(data: any): Promise<any> {
    return fetchWithAuth(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function addProject(project: any): Promise<any> {
    return fetchWithAuth(`${API_BASE_URL}/projects`, {
        method: 'POST',
        body: JSON.stringify(project),
    });
}

export async function deleteProject(index: number): Promise<any> {
    return fetchWithAuth(`${API_BASE_URL}/projects/${index}`, {
        method: 'DELETE',
    });
}

export async function addSkill(skill: any): Promise<any> {
    return fetchWithAuth(`${API_BASE_URL}/skills`, {
        method: 'POST',
        body: JSON.stringify(skill),
    });
}

export async function deleteSkill(index: number): Promise<any> {
    return fetchWithAuth(`${API_BASE_URL}/skills/${index}`, {
        method: 'DELETE',
    });
}