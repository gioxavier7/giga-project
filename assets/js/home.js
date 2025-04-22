'use strict';

// Elementos
const postsContainer = document.getElementById('postsContainer');
const storiesContainer = document.querySelector('.stories');
const postModal = document.getElementById('postModal');
const storyModal = document.getElementById('storyModal');
const newPostBtn = document.getElementById('newPostBtn');
const closeButtons = document.querySelectorAll('.close');
const postForm = document.getElementById('postForm');
const storyForm = document.getElementById('storyForm');

// Verifica se o usuário está logado
if (!localStorage.getItem('token')) {
    window.location.href = './login.html';
}

const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');

// Cache para não buscar o mesmo usuário várias vezes
const cacheUsuarios = {};
async function buscarUsuario(id) {
    if (!cacheUsuarios[id]) {
        const resposta = await fetch(`https://back-spider.vercel.app/user/pesquisarUser/${id}`);
        const usuario = await resposta.json();
        cacheUsuarios[id] = usuario;
    }
    return cacheUsuarios[id];
}

// Carrega posts da API
async function loadPosts() {
    try {
        const res = await fetch('https://back-spider.vercel.app/publicacoes/listarPublicacoes', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await res.json();
        renderPosts(data);
    } catch (err) {
        console.error('Erro ao carregar posts:', err);
    }
}

async function renderPosts(posts) {
    postsContainer.innerHTML = '';

    for (const post of posts) {
        const usuario = await buscarUsuario(post.autor); // Busca nome e imagem do autor
        const isLiked = post.curtidoPorUsuario === true;

        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-user">
                    <img src="${usuario.imagemPerfil || 'https://via.placeholder.com/150'}" alt="User" class="post-avatar">
                    <span class="post-username">${usuario.nome}</span>
                </div>
                <i class="fas fa-ellipsis-h"></i>
            </div>
            <img src="${post.imagem}" alt="Post" class="post-image">
            <div class="post-actions">
                <div>
                    <i class="${isLiked ? 'fas liked' : 'far'} fa-heart like-btn" data-post-id="${post.id}"></i>
                    <i class="far fa-comment"></i>
                    <i class="far fa-paper-plane"></i>
                </div>
                <i class="far fa-bookmark"></i>
            </div>
            <div class="post-likes">${post.likes || 0} curtidas</div>
            <div class="post-caption">
                <span>${usuario.nome}:</span>
                ${post.descricao || ''}
            </div>
            <div class="post-comments">Ver todos os comentários</div>
            <div class="post-time">${new Date(post.dataPublicacao).toLocaleString() || 'há pouco'}</div>
            <div class="post-comment-form">
                <input type="text" placeholder="Adicione um comentário..." class="post-comment-input">
                <button class="post-comment-button">Publicar</button>
            </div>
        `;

        postsContainer.appendChild(postElement);
    }

    // Eventos
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const postId = btn.dataset.postId;
            if (!userId) {
                console.error('ID do usuário não encontrado!');
                return;
            }

            try {
                if (btn.classList.contains('fas')) {
                    btn.classList.remove('fas', 'liked');
                    btn.classList.add('far');
                } else {
                    btn.classList.remove('far');
                    btn.classList.add('fas', 'liked');
                }

                const res = await fetch(`https://back-spider.vercel.app/publicacoes/likePublicacao/${postId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ idUser: userId }),
                });

                if (!res.ok) {
                    console.error('Erro ao curtir a publicação:', await res.text());
                    return;
                }

                loadPosts();
            } catch (err) {
                console.error('Erro ao curtir:', err);
            }
        });
    });

    document.querySelectorAll('.post-comment-button').forEach(button => {
        button.addEventListener('click', async (e) => {
            const postId = e.target.closest('.post').querySelector('.like-btn').dataset.postId;
            const commentInput = e.target.closest('.post').querySelector('.post-comment-input');
            const commentText = commentInput.value.trim();

            if (!userId || !commentText) {
                console.error('ID do usuário ou comentário não preenchidos!');
                return;
            }

            try {
                const res = await fetch(`https://back-spider.vercel.app/publicacoes/commentPublicacao/${postId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        idUser: userId,
                        descricao: commentText,
                    }),
                });

                if (!res.ok) {
                    console.error('Erro ao comentar:', await res.text());
                    return;
                }

                loadPosts();
                commentInput.value = '';
            } catch (err) {
                console.error('Erro ao comentar:', err);
            }
        });
    });
}

// Carrega stories da API
async function loadStories() {
    try {
        const res = await fetch('https://back-spider.vercel.app/storys/listarStorys', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await res.json();
        renderStories(data);
    } catch (err) {
        console.error('Erro ao carregar stories:', err);
    }
}

function renderStories(stories) {
    storiesContainer.innerHTML = '';
    stories.forEach(story => {
        const storyElement = document.createElement('div');
        storyElement.className = 'story';
        storyElement.innerHTML = `
            <div class="story-avatar">
                <img src="${story.imagem || 'https://via.placeholder.com/150'}" alt="Story">
            </div>
            <span class="story-username">${story.nomeUsuario || 'Story'}</span>
        `;
        storiesContainer.appendChild(storyElement);
    });
}

// Modais
document.querySelector('.fa-plus-square').addEventListener('click', () => {
    postModal.style.display = 'flex';
});

document.querySelector('.fa-heart').addEventListener('click', () => {
    storyModal.style.display = 'flex';
});

closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        postModal.style.display = 'none';
        storyModal.style.display = 'none';
    });
});

// Submissão de post/story
postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    postModal.style.display = 'none';
});

storyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    storyModal.style.display = 'none';
});

// Inicialização
loadPosts();
loadStories();
