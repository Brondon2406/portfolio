import { authenticate, logout } from './auth';
import { fetchProfileData, updateProfileData, addProject, deleteProject, addSkill, deleteSkill } from './utils';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login') as HTMLFormElement;
    const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
    const adminDashboard = document.getElementById('admin-dashboard') as HTMLDivElement;
    const loginContainer = document.getElementById('login-form') as HTMLDivElement;

    // Gestion de la connexion
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = (document.getElementById('username') as HTMLInputElement).value;
            const password = (document.getElementById('password') as HTMLInputElement).value;

            try {
                await authenticate(username, password);
                loginContainer.classList.add('hidden');
                adminDashboard.classList.remove('hidden');
                loadProfileData();
                loadProjects();
                loadSkills();
            } catch (error) {
                alert('Identifiants incorrects');
                console.error(error);
            }
        });
    }

    // Gestion de la déconnexion
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
            adminDashboard.classList.add('hidden');
            loginContainer.classList.remove('hidden');
        });
    }

    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('adminToken');
    if (token) {
        loginContainer.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        loadProfileData();
        loadProjects();
        loadSkills();
    }

    async function loadProfileData() {
        try {
            const profileData = await fetchProfileData();
            const profileForm = document.getElementById('profile-form') as HTMLFormElement;
            
            if (profileForm) {
                profileForm.innerHTML = `
                    <div class="form-group">
                        <label for="name">Nom complet</label>
                        <input type="text" id="name" value="${profileData.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="title">Titre</label>
                        <input type="text" id="title" value="${profileData.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" value="${profileData.email || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Téléphone</label>
                        <input type="tel" id="phone" value="${profileData.phone || ''}">
                    </div>
                    <div class="form-group">
                        <label for="about">À propos</label>
                        <textarea id="about" rows="5">${profileData.about || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="location">Localisation</label>
                        <input type="text" id="location" value="${profileData.location || ''}">
                    </div>
                    <button type="submit">Mettre à jour</button>
                `;

                profileForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const updatedData = {
                        name: (document.getElementById('name') as HTMLInputElement).value,
                        title: (document.getElementById('title') as HTMLInputElement).value,
                        email: (document.getElementById('email') as HTMLInputElement).value,
                        phone: (document.getElementById('phone') as HTMLInputElement).value,
                        about: (document.getElementById('about') as HTMLTextAreaElement).value,
                        location: (document.getElementById('location') as HTMLInputElement).value
                    };

                    try {
                        await updateProfileData(updatedData);
                        alert('Profil mis à jour avec succès!');
                    } catch (error) {
                        console.error(error);
                        alert('Erreur lors de la mise à jour du profil');
                    }
                });
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
        }
    }

    async function loadProjects() {
        try {
            const profileData = await fetchProfileData();
            const projectsList = document.getElementById('projects-list') as HTMLDivElement;
            const addProjectBtn = document.getElementById('add-project-btn') as HTMLButtonElement;

            if (projectsList) {
                projectsList.innerHTML = '';
                
                if (profileData.projects && profileData.projects.length > 0) {
                    profileData.projects.forEach((project: any, index: number) => {
                        const projectElement = document.createElement('div');
                        projectElement.className = 'project-item';
                        projectElement.innerHTML = `
                            <h3>${project.title}</h3>
                            <p>${project.description}</p>
                            <a href="${project.link}" target="_blank">Voir le projet</a>
                            <button class="delete-project" data-index="${index}">Supprimer</button>
                        `;
                        projectsList.appendChild(projectElement);
                    });
                } else {
                    projectsList.innerHTML = '<p>Aucun projet pour le moment.</p>';
                }

                // Gestion des événements de suppression
                document.querySelectorAll('.delete-project').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || 0;
                        try {
                            await deleteProject(index);
                            loadProjects();
                        } catch (error) {
                            console.error(error);
                            alert('Erreur lors de la suppression du projet');
                        }
                    });
                });
            }

            if (addProjectBtn) {
                addProjectBtn.addEventListener('click', () => {
                    const title = prompt('Titre du projet:');
                    if (!title) return;

                    const description = prompt('Description:');
                    const link = prompt('Lien (URL):');

                    if (title && description && link) {
                        addProject({ title, description, link })
                            .then(() => loadProjects())
                            .catch(error => {
                                console.error(error);
                                alert('Erreur lors de l\'ajout du projet');
                            });
                    }
                });
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    async function loadSkills() {
        try {
            const profileData = await fetchProfileData();
            const skillsList = document.getElementById('skills-list') as HTMLDivElement;
            const addSkillBtn = document.getElementById('add-skill-btn') as HTMLButtonElement;

            if (skillsList) {
                skillsList.innerHTML = '';
                
                if (profileData.skills && profileData.skills.length > 0) {
                    profileData.skills.forEach((skill: any, index: number) => {
                        const skillElement = document.createElement('div');
                        skillElement.className = 'skill-item';
                        skillElement.innerHTML = `
                            <h3>${skill.name}</h3>
                            <p>Niveau: ${skill.level}/10</p>
                            <button class="delete-skill" data-index="${index}">Supprimer</button>
                        `;
                        skillsList.appendChild(skillElement);
                    });
                } else {
                    skillsList.innerHTML = '<p>Aucune compétence pour le moment.</p>';
                }

                // Gestion des événements de suppression
                document.querySelectorAll('.delete-skill').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || 0);
                        try {
                            await deleteSkill(index);
                            loadSkills();
                        } catch (error) {
                            console.error(error);
                            alert('Erreur lors de la suppression de la compétence');
                        }
                    });
                });
            }

            if (addSkillBtn) {
                addSkillBtn.addEventListener('click', () => {
                    const name = prompt('Nom de la compétence:');
                    if (!name) return;

                    const level = prompt('Niveau (1-10):');

                    if (name && level) {
                        addSkill({ name, level: parseInt(level) })
                            .then(() => loadSkills())
                            .catch(error => {
                                console.error(error);
                                alert('Erreur lors de l\'ajout de la compétence');
                            });
                    }
                });
            }
        } catch (error) {
            console.error('Error loading skills:', error);
        }
    }
});