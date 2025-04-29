'use strict'

async function carregarPublicacoes() {
    try {
        // Requisição das publicações
        const respostaPublicacoes = await fetch('https://back-spider.vercel.app/publicacoes/listarPublicacoes')
        const publicacoes = await respostaPublicacoes.json()

        // Requisição dos usuários
        const respostaUsuarios = await fetch('https://back-spider.vercel.app/user/listarUsers')
        const usuarios = await respostaUsuarios.json()

        // Exibe os posts
        exibirPublicacoes(publicacoes, usuarios)

    } catch (erro) {
        console.error('Erro ao carregar dados:', erro)
    }
}

function exibirPublicacoes(publicacoes, usuarios) {
    const feed = document.querySelector('#feed') // ajustado para pegar a div com id="feed"

    publicacoes.forEach((publicacao) => {
        const usuario = usuarios.find((user) => user.id === Number(publicacao.idUsuario))

        const post = document.createElement('div')
        post.classList.add('post')

        post.innerHTML = `
            <div class="post-header">
                <div class="avatar">
                    <img src="${usuario.imagemPerfil}" alt="Avatar do usuário" style="width: 100%; height: 100%; border-radius: 9999px;">
                </div>
                <div class="post-user-info">
                    <p class="post-author">${usuario.nome}</p>
                    <p class="post-time">${publicacao.local}</p>
                </div>
            </div>
            <div class="post-image">
                <img src="${publicacao.imagem}" alt="Imagem da publicação" style="width: 100%; height: 100%; border-radius: 8px; object-fit: cover;">
            </div>
            <div class="post-content">
                <p>${publicacao.descricao}</p>
            </div>
            <div class="interaction-buttons">
                <button class="interaction-btn heart" data-id="${publicacao.id}" data-curtido="false">
                    <img src="img/heart_false.png" alt="Curtir" width="20">
                    Curtir
                </button>
                <button class="interaction-btn">
                    <img src="img/chat.png" alt="Comentar" width="20">
                    Comentar
                </button>
            </div>
        `

        feed.appendChild(post)

        const botaoCurtir = post.querySelector('.heart')
        botaoCurtir.addEventListener('click', () => {
            const curtido = botaoCurtir.getAttribute('data-curtido') === 'true'
            botaoCurtir.querySelector('img').src = curtido ? 'img/heart_false.png' : 'img/heart_true.png'
            botaoCurtir.setAttribute('data-curtido', !curtido)
        })
    })
}

window.addEventListener('DOMContentLoaded', carregarPublicacoes)