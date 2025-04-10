'use strict';

// Elementos da página
const postsContainer = document.getElementById('postsContainer');
const storiesContainer = document.querySelector('.stories');
const postModal = document.getElementById('postModal');
const storyModal = document.getElementById('storyModal');
const newPostBtn = document.getElementById('newPostBtn');
const closeButtons = document.querySelectorAll('.close');
const postForm = document.getElementById('postForm');
const storyForm = document.getElementById('storyForm');

// Variáveis globais
let currentUser = JSON.parse(localStorage.getItem('user')) || { id: 1 }; // Exemplo - substitua pelo usuário real
let posts = [];
let stories = [];

// Função para carregar posts
async function loadPosts() {
    try {
        const response = await fetch('https://back-spider.vercel.app/publicacoes/listarPublicacoes');
        if (!response.ok) throw new Error('Erro ao carregar posts');

        posts = await response.json();
        renderPosts();
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Função para carregar stories
async function loadStories() {
    try {
        const response = await fetch('https://back-spider.vercel.app/storys/listarStorys');
        if (!response.ok) throw new Error('Erro ao carregar stories');

        stories = await response.json();
        renderStories();
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Função para renderizar posts
function renderPosts() {
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.dataset.id = post.id;

        postElement.innerHTML = `
                <div class="post-header">
                    <div class="post-user">
                        <img src="https://via.placeholder.com/150" alt="User" class="post-avatar">
                        <span class="post-username">${post.idUsuario || 'usuário'}</span>
                    </div>
                    <i class="fas fa-ellipsis-h"></i>
                </div>
                <img src="${post.imagem}" alt="Post" class="post-image">
                <div class="post-actions">
                    <div>
                        <i class="far fa-heart like-btn" data-post-id="${post.id}"></i>
                        <i class="far fa-comment"></i>
                        <i class="far fa-paper-plane"></i>
                    </div>
                    <i class="far fa-bookmark"></i>
                </div>
                <div class="post-likes">${post.likes || 0} curtidas</div>
                <div class="post-caption">
                    <span>${post.idUsuario || 'usuário'}</span>
                    ${post.descricao || ''}
                </div>
                <div class="post-comments">Ver todos os comentários</div>
                <div class="post-time">${post.dataPublicacao || 'há pouco tempo'}</div>
                <div class="post-comment-form">
                    <input type="text" placeholder="Adicione um comentário..." class="post-comment-input">
                    <button class="post-comment-button">Publicar</button>
                </div>
            `;

        postsContainer.appendChild(postElement);
    });

    // Adiciona eventos de like
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const postId = e.target.dataset.postId;
            await likePost(postId);
        });
    });
}

// Função para renderizar stories
function renderStories() {
    storiesContainer.innerHTML = '';

    stories.forEach(story => {
        const storyElement = document.createElement('div');
        storyElement.className = 'story';

        storyElement.innerHTML = `
                <div class="story-avatar">
                    <img src="${story.imagem}" alt="Story">
                </div>
                <div class="story-username">${story.idUsuario || 'usuário'}</div>
            `;

        storiesContainer.appendChild(storyElement);
    });
}

// Função para adicionar navegação com setas
function addStoriesNavigation() {
    const storiesContainer = document.querySelector('.stories-container');
    
    // Cria botão de navegação anterior
    const prevNav = document.createElement('div');
    prevNav.className = 'stories-nav prev';
    prevNav.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevNav.addEventListener('click', () => {
        document.querySelector('.stories').scrollBy({ left: -200, behavior: 'smooth' });
    });
    
    // Cria botão de navegação seguinte
    const nextNav = document.createElement('div');
    nextNav.className = 'stories-nav next';
    nextNav.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextNav.addEventListener('click', () => {
        document.querySelector('.stories').scrollBy({ left: 200, behavior: 'smooth' });
    });
    
    storiesContainer.appendChild(prevNav);
    storiesContainer.appendChild(nextNav);
    
    // Esconde as setas quando não há mais conteúdo para rolar
    const stories = document.querySelector('.stories');
    const updateNavVisibility = () => {
        prevNav.style.display = stories.scrollLeft > 0 ? 'flex' : 'none';
        nextNav.style.display = stories.scrollLeft < stories.scrollWidth - stories.clientWidth ? 'flex' : 'none';
    };
    
    stories.addEventListener('scroll', updateNavVisibility);
    updateNavVisibility();
}

// Função para curtir um post
async function likePost(postId) {
    try {
        const response = await fetch(`https://back-spider.vercel.app/publicacoes/likePublicacao/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idUser: currentUser.id
            })
        });

        if (!response.ok) throw new Error('Erro ao curtir post');

        // Atualiza a lista de posts após curtir
        await loadPosts();
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Função para criar novo post
async function createPost(postData) {
    try {
        const response = await fetch('https://back-spider.vercel.app/publicacoes/cadastrarPublicacao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) throw new Error('Erro ao criar post');

        // Atualiza a lista de posts após criação
        await loadPosts();
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Função para criar novo story
async function createStory(storyData) {
    try {
        const response = await fetch('https://back-spider.vercel.app/storys/cadastrarStorys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(storyData)
        });

        if (!response.ok) throw new Error('Erro ao criar story');

        // Atualiza a lista de stories após criação
        await loadStories();
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Event Listeners
newPostBtn.addEventListener('click', () => {
    postModal.style.display = 'flex';
});

closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        postModal.style.display = 'none';
        storyModal.style.display = 'none';
    });
});

postForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const descricao = document.getElementById('postDesc').value;
    const local = document.getElementById('postLocation').value;
    const imageFile = document.getElementById('postImage').files[0];

    // Aqui você precisaria implementar o upload da imagem
    // Por simplicidade, vamos usar uma URL fixa
    const imagem = "https://www.aluralingua.com.br/artigos/assets/professor.jpg";

    const postData = {
        descricao,
        dataPublicacao: new Date().toLocaleDateString('pt-BR'),
        imagem,
        local,
        idUsuario: currentUser.id
    };

    await createPost(postData);
    postModal.style.display = 'none';
    postForm.reset();
});

// Adicione um botão para novo story no header
const newStoryBtn = document.createElement('i');
newStoryBtn.className = 'fas fa-plus-circle';
newStoryBtn.style.cursor = 'pointer';
newStoryBtn.addEventListener('click', () => {
    storyModal.style.display = 'flex';
});
document.querySelector('.header-icons').prepend(newStoryBtn);

storyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const descricao = document.getElementById('storyDesc').value;
    const imageFile = document.getElementById('storyImage').files[0];

    // Aqui você precisaria implementar o upload da imagem
    // Por simplicidade, vamos usar uma URL fixa
    const imagem = "https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg";

    const storyData = {
        descricao,
        dataPublicacao: new Date().toLocaleDateString('pt-BR'),
        imagem,
        local: "Localização",
        idUsuario: currentUser.id
    };

    await createStory(storyData);
    storyModal.style.display = 'none';
    storyForm.reset();
});

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
    if (e.target === postModal) postModal.style.display = 'none';
    if (e.target === storyModal) storyModal.style.display = 'none';
});

// Carrega os dados iniciais
loadPosts();
loadStories();
