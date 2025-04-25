const API_BASE_URL = 'http://localhost:3000/api';

interface ProfileData {
    name: string;
    title: string;
    about: string;
    email: string;
    phone: string;
    location: string;
    projects: Project[];
    skills: Skill[];
}

interface Project {
    title: string;
    description: string;
    link: string;
    image?: string;
}

interface Skill {
    name: string;
    level: number;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Charger les données du profil
        const profileData = await fetchProfileData();
        updateProfileUI(profileData);
        
        // Mettre à jour l'année dans le footer
        updateCurrentYear();
    } catch (error) {
        console.error('Error loading profile data:', error);
        showError();
    }
});

async function fetchProfileData(): Promise<ProfileData> {
    const response = await fetch(`${API_BASE_URL}/profile`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

function updateProfileUI(data: ProfileData): void {
    // Mettre à jour les informations de base
    const nameElement = document.getElementById('profile-name');
    const titleElement = document.getElementById('profile-title');
    const aboutElement = document.getElementById('profile-about');
    const emailElement = document.getElementById('profile-email');
    const phoneElement = document.getElementById('profile-phone');
    const locationElement = document.getElementById('profile-location');
    
    if (nameElement) nameElement.textContent = data.name || 'Nom non spécifié';
    if (titleElement) titleElement.textContent = data.title || 'Titre non spécifié';
    if (aboutElement) aboutElement.textContent = data.about || 'Aucune description fournie';
    if (emailElement) emailElement.textContent = data.email || 'Non spécifié';
    if (phoneElement) phoneElement.textContent = data.phone || 'Non spécifié';
    if (locationElement) locationElement.textContent = data.location || 'Non spécifié';
    
    // Mettre à jour les projets
    updateProjectsUI(data.projects || []);
    
    // Mettre à jour les compétences
    updateSkillsUI(data.skills || []);
}

function updateProjectsUI(projects: Project[]): void {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) return;
    
    if (projects.length === 0) {
        projectsContainer.innerHTML = '<p>Aucun projet à afficher pour le moment.</p>';
        return;
    }
    
    projectsContainer.innerHTML = '';
    
    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'project-card';
        projectElement.innerHTML = `
            ${project.image ? `<img src="${project.image}" alt="${project.title}">` : ''}
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <a href="${project.link}" target="_blank" class="project-link">Voir le projet</a>
            </div>
        `;
        projectsContainer.appendChild(projectElement);
    });
}

function updateSkillsUI(skills: Skill[]): void {
    const skillsContainer = document.getElementById('skills-container');
    if (!skillsContainer) return;
    
    if (skills.length === 0) {
        skillsContainer.innerHTML = '<p>Aucune compétence à afficher pour le moment.</p>';
        return;
    }
    
    skillsContainer.innerHTML = '';
    
    skills.forEach(skill => {
        const skillElement = document.createElement('div');
        skillElement.className = 'skill-item';
        skillElement.innerHTML = `
            <h3>${skill.name}</h3>
            <p>Niveau: ${skill.level}/10</p>
            <div class="skill-level">
                <div class="skill-level-bar" style="width: ${skill.level * 10}%"></div>
            </div>
        `;
        skillsContainer.appendChild(skillElement);
    });
}

function updateCurrentYear(): void {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear().toString();
    }
}

function showError(): void {
    const mainElement = document.querySelector('main');
    if (mainElement) {
        mainElement.innerHTML = `
            <div class="error-message">
                <h2>Erreur de chargement</h2>
                <p>Désolé, nous n'avons pas pu charger les données du portfolio. Veuillez réessayer plus tard.</p>
            </div>
        `;
    }
}