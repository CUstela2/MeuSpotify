const apiBaseUrl = 'http://localhost:5173/api/Musica';

const uploadForm = document.getElementById('uploadForm');
const musicaList = document.getElementById('musicaList');
const audioPlayer = document.getElementById('audioPlayer');

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('Titulo', document.getElementById('titulo').value);
    formData.append('Artista', document.getElementById('artista').value);
    formData.append('Genero', document.getElementById('genero').value);
    formData.append('Duracao', document.getElementById('duracao').value);

    const arquivoInput = document.getElementById('arquivo');
    if (arquivoInput.files.length > 0) {
        formData.append('Arquivo', arquivoInput.files[0]);
    }

    const capaInput = document.getElementById('capa');
    if (capaInput.files.length > 0) {
        formData.append('Capa', capaInput.files[0]);
    }

    try {
        const res = await fetch(`${apiBaseUrl}/AddSongWithFile`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error('Erro ao enviar música');

        alert('Música enviada com sucesso!');
        uploadForm.reset();
        carregarMusicas();
    } catch (error) {
        alert(error.message);
    }
});
async function carregarMusicas() {
    musicaList.innerHTML = '';

    try {
        const res = await fetch(`${apiBaseUrl}/ListSongs`);
        if (!res.ok) throw new Error('Erro ao carregar músicas');

        const musicas = await res.json();

        musicas.forEach(musica => {
            const li = document.createElement('li');
            li.className = 'musica-item';

            const img = document.createElement('img');
            if (musica.capaDoAlbum) {
                img.src = `${apiBaseUrl}/GetCover/${musica.id}`;
                img.alt = `${musica.titulo} - capa do álbum`;
                img.style.width = '60px';
                img.style.height = '60px';
                img.style.objectFit = 'cover';
            } else {
                img.src = 'https://via.placeholder.com/60x60?text=Sem+Capa';
                img.alt = 'Sem capa';
            }

            const div = document.createElement('div');
            div.innerHTML = `<strong>${musica.titulo}</strong><br>${musica.artista}<br><small>${musica.genero} - ${musica.duracao}s</small>`;

            const btn = document.createElement('button');
            btn.textContent = 'Tocar';
            btn.addEventListener('click', () => tocarMusica(musica.id));

            li.appendChild(img);
            li.appendChild(div);
            li.appendChild(btn);

            musicaList.appendChild(li);
        });
    } catch (error) {
        musicaList.innerHTML = `<li>Erro ao carregar músicas</li>`;
    }
}

async function tocarMusica(id) {
    try {
        const res = await fetch(`${apiBaseUrl}/PlayMusic/${id}`);
        if (!res.ok) throw new Error('Erro ao buscar música');

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        audioPlayer.src = url;
        audioPlayer.play();
    } catch (error) {
        alert(error.message);
    }
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Carrega as músicas ao abrir a página
carregarMusicas();
