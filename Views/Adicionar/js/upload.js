// ------------------- CONFIGURAÇÃO DE URLS -------------------
const backendPort = 5173;
const urls = {
    // URLs para músicas
    urlAdicionar: `http://localhost:${backendPort}/api/Musica/AddSongWithFile`,
    urlListar: `http://localhost:${backendPort}/api/Musica/ListSongs`,
    urlAtualizar: (titulo) => `http://localhost:${backendPort}/api/Musica/UpdateMusicByTitle/${encodeURIComponent(titulo)}`,
    urlDeletar: (titulo) => `http://localhost:${backendPort}/api/Musica/DeleteMusicByTitle/${encodeURIComponent(titulo)}`,
    urlCapa: (id) => `http://localhost:${backendPort}/api/Musica/GetCover/${id}`,

    // URLs para artistas
    urlAdicionarArtista: `http://localhost:${backendPort}/api/Musica/AddArtistWithPhoto`,
    urlListarArtistas: `http://localhost:${backendPort}/api/Musica/ListArtists`
};

// ------------------- ELEMENTOS -------------------
const uploadForm = document.getElementById('formAdicionarMusica');
const formAdicionarArtista = document.getElementById('formAdicionarArtista');
const musicaList = document.getElementById('musicaList');

const editModal = document.getElementById('editModal');
const editTitulo = document.getElementById('editTitulo');
const editArtista = document.getElementById('editArtista');
const editGenero = document.getElementById('editGenero');
const editDuracao = document.getElementById('editDuracao');
const salvarEdicaoBtn = document.getElementById('salvarEdicao');
const cancelarEdicaoBtn = document.getElementById('cancelarEdicao');

let musicaEditando = null;

// ------------------- UPLOAD MÚSICA -------------------
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append('Titulo', document.getElementById('musicaTitulo').value);
    formData.append('Artista', document.getElementById('musicaArtista').value);
    formData.append('Genero', document.getElementById('musicaGenero').value);
    formData.append('Duracao', document.getElementById('musicaDuracao').value);

    const arquivoInput = document.getElementById('musicaArquivo');
    if (arquivoInput.files.length > 0) formData.append('Arquivo', arquivoInput.files[0]);

    const capaInput = document.getElementById('musicaCapa');
    if (capaInput.files.length > 0) formData.append('Capa', capaInput.files[0]);

    try {
        const res = await fetch(urls.urlAdicionar, { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Erro ao enviar música');
        alert('Música enviada com sucesso!');
        uploadForm.reset();
        carregarMusicas(); // Atualiza a lista
    } catch (error) {
        alert(error.message);
    }
});

// ------------------- ADICIONAR ARTISTA -------------------
formAdicionarArtista.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append('Nome', document.getElementById('artistaNome').value);

    const fotoInput = document.getElementById('artistaFoto');
    if (fotoInput.files.length > 0) formData.append('Foto', fotoInput.files[0]);

    try {
        const res = await fetch(urls.urlAdicionarArtista, { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Erro ao enviar artista');
        alert('Artista enviado com sucesso!');
        formAdicionarArtista.reset();
        // Aqui você pode carregar lista de artistas se quiser (implemente depois)
    } catch (error) {
        alert(error.message);
    }
});

// ------------------- LISTAR MÚSICAS -------------------
async function carregarMusicas() {
    musicaList.innerHTML = '';
    try {
        const res = await fetch(urls.urlListar);
        if (!res.ok) throw new Error('Erro ao carregar músicas');
        const musicas = await res.json();

        musicas.forEach(musica => {
            const li = criarLiMusica(musica);
            musicaList.appendChild(li);
        });
    } catch (error) {
        musicaList.innerHTML = `<li>Erro ao carregar músicas</li>`;
    }
}

// ------------------- CRIAR LI DA MÚSICA -------------------
function criarLiMusica(musica) {
    const li = document.createElement('li');
    li.className = 'musica-item';

    // Capa
    const img = document.createElement('img');
    img.src = musica.capaDoAlbum ? urls.urlCapa(musica.id) : 'https://via.placeholder.com/60x60?text=Sem+Capa';
    img.alt = musica.capaDoAlbum ? musica.titulo : 'Sem capa';
    img.style.width = '60px';
    img.style.height = '60px';
    img.style.objectFit = 'cover';

    // Info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'musica-info';
    const tituloSpan = document.createElement('span');
    tituloSpan.className = 'titulo';
    tituloSpan.textContent = musica.titulo;
    const artistaSpan = document.createElement('span');
    artistaSpan.className = 'artista';
    artistaSpan.textContent = musica.artista;
    const generoSpan = document.createElement('span');
    generoSpan.className = 'genero';
    generoSpan.textContent = `${musica.genero} - ${musica.duracao}s`;

    infoDiv.appendChild(tituloSpan);
    infoDiv.appendChild(artistaSpan);
    infoDiv.appendChild(generoSpan);

    // Botões
    const btnEditar = document.createElement('button');
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => abrirEdicao(musica));

    const btnDeletar = document.createElement('button');
    btnDeletar.textContent = 'Excluir';
    btnDeletar.addEventListener('click', () => deletarMusica(musica.titulo));

    const acoesDiv = document.createElement('div');
    acoesDiv.className = 'musica-acoes';
    acoesDiv.appendChild(btnEditar);
    acoesDiv.appendChild(btnDeletar);

    li.appendChild(img);
    li.appendChild(infoDiv);
    li.appendChild(acoesDiv);

    return li;
}

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
        const url = urls.urlAtualizar(musicaEditando.titulo);
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
};

// ------------------- INICIAL -------------------
carregarMusicas();
