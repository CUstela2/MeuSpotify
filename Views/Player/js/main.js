// ------------------- CONFIGURAÇÃO DE URLS -------------------
const backendPort = 5173;
const urls = {
    urlListar: `http://localhost:${backendPort}/api/Musica/ListSongs`,
    urlBuscarPorTitulo: (titulo) => `http://localhost:${backendPort}/api/Musica/GetMusicByTitle/${encodeURIComponent(titulo)}`,
    urlBuscarPorArtista: (artista) => `http://localhost:${backendPort}/api/Musica/GetMusicByArtist/${encodeURIComponent(artista)}`,
    urlTocar: (id) => `http://localhost:${backendPort}/api/Musica/PlayMusic/${id}`,
    urlCapa: (id) => `http://localhost:${backendPort}/api/Musica/GetCover/${id}`
};

// ------------------- ELEMENTOS -------------------
const musicaList = document.getElementById('musicaList');
const audioPlayer = document.getElementById('audioPlayer');

const buscarTituloInput = document.getElementById('buscarTitulo');
const buscarArtistaInput = document.getElementById('buscarArtista');
const btnBuscarTitulo = document.getElementById('btnBuscarTitulo');
const btnBuscarArtista = document.getElementById('btnBuscarArtista');
const btnListarTudo = document.getElementById('btnListarTudo');

const sugestoesLista = document.getElementById('sugestoesLista');
const sugestoesArtistasContainer = document.getElementById('sugestoesArtistas');

let todasMusicasCache = []; // Guardar todas músicas carregadas para usar nas sugestões

// ------------------- LISTAR MÚSICAS -------------------
// ------------------- LISTAR MÚSICAS -------------------
async function carregarMusicas() {
    musicaList.innerHTML = '';
    try {
        const res = await fetch(urls.urlListar);
        if (!res.ok) throw new Error('Erro ao carregar músicas');
        let musicas = await res.json();

        // Embaralha as músicas para a lista principal também
        musicas = musicas
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);

        todasMusicasCache = musicas;  // Guardar cache das músicas para sugestões
        mostrarMusicas(musicas);
        mostrarSugestoesAleatorias(musicas);  // Atualiza as sugestões junto
    } catch (error) {
        musicaList.innerHTML = `<li>Erro ao carregar músicas</li>`;
        sugestoesLista.innerHTML = ''; // limpa sugestões em erro
    }
}

// ------------------- MOSTRAR MÚSICAS -------------------
function mostrarMusicas(musicas) {
    musicaList.innerHTML = '';
    musicas.forEach(musica => {
        const li = document.createElement('li');
        li.className = 'musica-item';

        // Capa
        const img = document.createElement('img');
        img.src = musica.capaDoAlbum ? urls.urlCapa(musica.id) : 'https://via.placeholder.com/60x60?text=Sem+Capa';
        img.alt = musica.titulo;

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

        // Botão Tocar
        const btnTocar = document.createElement('button');
        btnTocar.textContent = 'Tocar';
        btnTocar.addEventListener('click', () => tocarMusica(musica.id));

        const acoesDiv = document.createElement('div');
        acoesDiv.className = 'musica-acoes';
        acoesDiv.appendChild(btnTocar);

        li.appendChild(img);
        li.appendChild(infoDiv);
        li.appendChild(acoesDiv);

        musicaList.appendChild(li);
    });
}

// ------------------- TOCAR MÚSICA -------------------
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
// Buscar música por título
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

// Buscar música(s) por artista usando a nova função
btnBuscarArtista.addEventListener('click', async () => {
    const artista = buscarArtistaInput.value.trim();
    if (!artista) return carregarMusicas();
    buscarMusicasPorArtista(artista);
});

btnListarTudo.addEventListener('click', carregarMusicas);

// ------------------- BUSCAR MÚSICAS POR ARTISTA -------------------
async function buscarMusicasPorArtista(artistaNome) {
    musicaList.innerHTML = '';
    try {
        const res = await fetch(urls.urlBuscarPorArtista(artistaNome));
        if (!res.ok) throw new Error('Músicas não encontradas');
        const musicas = await res.json();

        // Certificar que musicas é array (caso a API retorne um único objeto)
        const listaMusicas = Array.isArray(musicas) ? musicas : [musicas];
        mostrarMusicas(listaMusicas);
    } catch (error) {
        musicaList.innerHTML = `<li>${error.message}</li>`;
    }
}

// ------------------- MOSTRAR SUGESTÕES ALEATÓRIAS -------------------
function mostrarSugestoesAleatorias(musicas) {
    const numeroSugestoes = 3; // Limite ajustado para 3 sugestões
    sugestoesLista.innerHTML = '';

    if (!musicas.length) {
        sugestoesLista.innerHTML = '<p>Nenhuma sugestão disponível.</p>';
        return;
    }

    // Embaralhar o array e pegar as primeiras 'numeroSugestoes'
    const musicasEmbaralhadas = musicas
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
        .slice(0, numeroSugestoes);

    musicasEmbaralhadas.forEach(musica => {
        const card = document.createElement('div');
        card.className = 'card-sugestao';

        const img = document.createElement('img');
        img.src = musica.capaDoAlbum ? urls.urlCapa(musica.id) : 'https://via.placeholder.com/50x50?text=Sem+Capa';
        img.alt = musica.titulo;

        const infoDiv = document.createElement('div');
        infoDiv.className = 'info-sugestao';

        const tituloP = document.createElement('p');
        tituloP.className = 'titulo-sugestao';
        tituloP.textContent = musica.titulo;

        const artistaP = document.createElement('p');
        artistaP.className = 'artista-sugestao';
        artistaP.textContent = musica.artista;

        infoDiv.appendChild(tituloP);
        infoDiv.appendChild(artistaP);

        card.appendChild(img);
        card.appendChild(infoDiv);

        // Clicar na sugestão toca a música
        card.addEventListener('click', () => {
            tocarMusica(musica.id);
        });

        sugestoesLista.appendChild(card);
    });
}

// ------------------- ARTISTAS -------------------
const urlListarArtistas = `http://localhost:5173/api/Musica/ListArtists`;
const urlFotoArtista = (id) => `http://localhost:5173/api/Musica/GetPhoto/${id}`;

// Função para carregar e mostrar artistas
async function carregarArtistas() {
    sugestoesArtistasContainer.innerHTML = ''; // limpa antes
    try {
        const res = await fetch(urlListarArtistas);
        if (!res.ok) throw new Error('Erro ao carregar artistas');
        let artistas = await res.json();

        // Embaralhar artistas para aleatoriedade
        artistas = artistas.sort(() => Math.random() - 0.5);

        artistas.slice(0, 6).forEach(artista => {
            const card = document.createElement('div');
            card.className = 'card-artista';

            const img = document.createElement('img');
            img.src = artista.fotoUrl ? artista.fotoUrl : urlFotoArtista(artista.id);
            img.alt = artista.nome;

            const nome = document.createElement('p');
            nome.textContent = artista.nome;

            card.appendChild(img);
            card.appendChild(nome);

            // Evento de clique: filtrar músicas pelo artista clicado
            card.addEventListener('click', () => {
                buscarMusicasPorArtista(artista.nome);
            });

            sugestoesArtistasContainer.appendChild(card);
        });
    } catch (error) {
        sugestoesArtistasContainer.innerHTML = `<p style="color:#f00;">${error.message}</p>`;
    }
}

// ------------------- INICIALIZAÇÃO -------------------
carregarMusicas();
carregarArtistas();
