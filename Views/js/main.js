// ------------------- CONFIGURAÇÃO DE URLS -------------------
const backendPort = 5173; // ajuste para a porta do seu backend ASP.NET
const urls = {
    urlAdicionar: `http://localhost:${backendPort}/api/Musica/AddSongWithFile`,
    urlListar: `http://localhost:${backendPort}/api/Musica/ListSongs`,
    urlBuscarPorTitulo: (titulo) => `http://localhost:${backendPort}/api/Musica/GetMusicByTitle/${encodeURIComponent(titulo)}`,
    urlBuscarPorArtista: (artista) => `http://localhost:${backendPort}/api/Musica/GetMusicByArtist/${encodeURIComponent(artista)}`,
    urlAtualizar: (titulo) => `http://localhost:${backendPort}/api/Musica/UpdateMusicByTitle/${encodeURIComponent(titulo)}`,
    urlDeletar: (titulo) => `http://localhost:${backendPort}/api/Musica/DeleteMusicByTitle/${encodeURIComponent(titulo)}`,
    urlTocar: (id) => `http://localhost:${backendPort}/api/Musica/PlayMusic/${id}`,
    urlCapa: (id) => `http://localhost:${backendPort}/api/Musica/GetCover/${id}`
};

// ------------------- ELEMENTOS -------------------
const uploadForm = document.getElementById('uploadForm');
const musicaList = document.getElementById('musicaList');
const audioPlayer = document.getElementById('audioPlayer');

const buscarTituloInput = document.getElementById('buscarTitulo');
const buscarArtistaInput = document.getElementById('buscarArtista');
const btnBuscarTitulo = document.getElementById('btnBuscarTitulo');
const btnBuscarArtista = document.getElementById('btnBuscarArtista');
const btnListarTudo = document.getElementById('btnListarTudo');

const editModal = document.getElementById('editModal');
const editTitulo = document.getElementById('editTitulo');
const editArtista = document.getElementById('editArtista');
const editGenero = document.getElementById('editGenero');
const editDuracao = document.getElementById('editDuracao');
const salvarEdicaoBtn = document.getElementById('salvarEdicao');
const cancelarEdicaoBtn = document.getElementById('cancelarEdicao');

let musicaEditando = null;

// ------------------- UPLOAD -------------------
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('Titulo', document.getElementById('titulo').value);
    formData.append('Artista', document.getElementById('artista').value);
    formData.append('Genero', document.getElementById('genero').value);
    formData.append('Duracao', document.getElementById('duracao').value);

    const arquivoInput = document.getElementById('arquivo');
    if (arquivoInput.files.length > 0) formData.append('Arquivo', arquivoInput.files[0]);

    const capaInput = document.getElementById('capa');
    if (capaInput.files.length > 0) formData.append('Capa', capaInput.files[0]);

    try {
        const res = await fetch(urls.urlAdicionar, { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Erro ao enviar música');
        alert('Música enviada com sucesso!');
        uploadForm.reset();
        carregarMusicas();
    } catch (error) {
        alert(error.message);
    }
});

// ------------------- LISTAR -------------------
async function carregarMusicas() {
    musicaList.innerHTML = '';

    try {
        const res = await fetch(urls.urlListar);
        if (!res.ok) throw new Error('Erro ao carregar músicas');
        const musicas = await res.json();

        musicas.forEach(musica => {
            const li = document.createElement('li');
            li.className = 'musica-item';

            const img = document.createElement('img');
            img.src = musica.capaDoAlbum ? urls.urlCapa(musica.id) : 'https://via.placeholder.com/60x60?text=Sem+Capa';
            img.alt = musica.capaDoAlbum ? musica.titulo : 'Sem capa';
            img.style.width = '60px';
            img.style.height = '60px';
            img.style.objectFit = 'cover';

            const div = document.createElement('div');
            div.innerHTML = `<strong>${musica.titulo}</strong><br>${musica.artista}<br><small>${musica.genero} - ${musica.duracao}s</small>`;

            // Botões
            const btnTocar = document.createElement('button');
            btnTocar.textContent = 'Tocar';
            btnTocar.addEventListener('click', () => tocarMusica(musica.id));

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.addEventListener('click', () => abrirEdicao(musica));

            const btnDeletar = document.createElement('button');
            btnDeletar.textContent = 'Excluir';
            btnDeletar.addEventListener('click', () => deletarMusica(musica.titulo));

            li.appendChild(img);
            li.appendChild(div);
            li.appendChild(btnTocar);
            li.appendChild(btnEditar);
            li.appendChild(btnDeletar);

            musicaList.appendChild(li);
        });
    } catch (error) {
        musicaList.innerHTML = `<li>Erro ao carregar músicas</li>`;
    }
}

// ------------------- TOCAR -------------------
async function tocarMusica(id) {
    try {
        const res = await fetch(urls.urlTocar(id));
        if (!res.ok) throw new Error('Erro ao buscar música');

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        audioPlayer.src = url;
        audioPlayer.play();
    } catch (error) {
        alert(error.message);
    }
}

// ------------------- BUSCA -------------------
btnBuscarTitulo.addEventListener('click', async () => {
    const titulo = buscarTituloInput.value.trim();
    if (!titulo) return carregarMusicas();

    try {
        const res = await fetch(urls.urlBuscarPorTitulo(titulo));
        if (!res.ok) throw new Error('Música não encontrada');
        const musica = await res.json();
        mostrarMusicas([musica]);
    } catch (error) {
        musicaList.innerHTML = `<li>${error.message}</li>`;
    }
});

btnBuscarArtista.addEventListener('click', async () => {
    const artista = buscarArtistaInput.value.trim();
    if (!artista) return carregarMusicas();

    try {
        const res = await fetch(urls.urlBuscarPorArtista(artista));
        if (!res.ok) throw new Error('Música não encontrada');
        const musica = await res.json();
        mostrarMusicas([musica]);
    } catch (error) {
        musicaList.innerHTML = `<li>${error.message}</li>`;
    }
});

btnListarTudo.addEventListener('click', carregarMusicas);

// ------------------- MOSTRAR MÚSICAS -------------------
function mostrarMusicas(musicas) {
    musicaList.innerHTML = '';
    musicas.forEach(musica => {
        const li = document.createElement('li');
        li.className = 'musica-item';

        const img = document.createElement('img');
        img.src = musica.capaDoAlbum ? urls.urlCapa(musica.id) : 'https://via.placeholder.com/60x60?text=Sem+Capa';
        img.alt = musica.capaDoAlbum ? musica.titulo : 'Sem capa';
        img.style.width = '60px';
        img.style.height = '60px';
        img.style.objectFit = 'cover';

        const div = document.createElement('div');
        div.innerHTML = `<strong>${musica.titulo}</strong><br>${musica.artista}<br><small>${musica.genero} - ${musica.duracao}s</small>`;

        const btnTocar = document.createElement('button');
        btnTocar.textContent = 'Tocar';
        btnTocar.addEventListener('click', () => tocarMusica(musica.id));

        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.addEventListener('click', () => abrirEdicao(musica));

        const btnDeletar = document.createElement('button');
        btnDeletar.textContent = 'Excluir';
        btnDeletar.addEventListener('click', () => deletarMusica(musica.titulo));

        li.appendChild(img);
        li.appendChild(div);
        li.appendChild(btnTocar);
        li.appendChild(btnEditar);
        li.appendChild(btnDeletar);

        musicaList.appendChild(li);
    });
}

// ------------------- EDIÇÃO -------------------
// ------------------- EDIÇÃO -------------------
function abrirEdicao(musica) {
    musicaEditando = musica;

    editTitulo.value = musica.titulo;
    editArtista.value = musica.artista;
    editGenero.value = musica.genero;
    editDuracao.value = musica.duracao;

    editModal.style.display = 'block';
}

salvarEdicaoBtn.addEventListener('click', async () => {
    if (!musicaEditando) return;

    // Validação simples
    if (!editTitulo.value || !editArtista.value || !editGenero.value || !editDuracao.value) {
        alert('Preencha todos os campos antes de salvar.');
        return;
    }

    const dadosAtualizados = {
        Titulo: editTitulo.value.trim(),
        Artista: editArtista.value.trim(),
        Genero: editGenero.value.trim(),
        Duracao: parseInt(editDuracao.value)
    };

    try {
        // URL encode para lidar com acentos e espaços
        const url = urls.urlAtualizar(encodeURIComponent(musicaEditando.titulo));

        console.log('Atualizando música:', url, dadosAtualizados); // Depuração

        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });

        if (!res.ok) {
            const textoErro = await res.text();
            throw new Error(`Erro ao atualizar música: ${res.status} ${textoErro}`);
        }

        alert('Música atualizada com sucesso!');
        editModal.style.display = 'none';
        musicaEditando = null;
        carregarMusicas();
    } catch (error) {
        alert(error.message);
    }
});

cancelarEdicaoBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
    musicaEditando = null;
});

// ------------------- EXCLUIR -------------------
async function deletarMusica(titulo) {
    if (!confirm(`Deseja realmente excluir a música "${titulo}"?`)) return;

    try {
        const res = await fetch(urls.urlDeletar(titulo), { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao deletar música');
        carregarMusicas();
    } catch (error) {
        alert(error.message);
    }
}

// ------------------- INICIAL -------------------
carregarMusicas();
