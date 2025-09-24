using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CRUD_Musica.Context;
using CRUD_Musica.Models;
using CRUD_Musica.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CRUD_Musica.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MusicaController : ControllerBase
    {
        private readonly MusicaContext _context;
        public MusicaController(MusicaContext context)
        {
            _context = context;
        }

        [HttpPost("AddSongs")]
        public IActionResult AdicionarMusica(Musica musica)
        {
            _context.Musicas.Add(musica);
            _context.SaveChanges();
            return CreatedAtAction(nameof(ObterMusicaPorTitulo), new { titulo = musica.Titulo }, musica);
        }

        [HttpGet("ListSongs")]
        public IActionResult Listar()
        {
            var musicas = _context.Musicas.ToList();
            return Ok(musicas);
        }

        // Corrigido para incluir a barra e o nome do parâmetro igual ao do método
        [HttpGet("GetMusicByTitle/{titulo}")]
        public IActionResult ObterMusicaPorTitulo(string titulo)
        {
            var musica = _context.Musicas.FirstOrDefault(m => m.Titulo == titulo);
            if (musica == null) return NotFound();
            return Ok(musica);
        }

        [HttpGet("GetMusicByArtist/{artista}")]
        public IActionResult ObterMusicasPorArtista(string artista)
        {
            var musicas = _context.Musicas.Where(m => m.Artista == artista).ToList();
            if (musicas == null || musicas.Count == 0) return NotFound();
            return Ok(musicas);
        }

        [HttpPut("UpdateMusicByTitle/{titulo}")]
        public IActionResult AtualizarMusica(string titulo, [FromBody] MusicaMetadataUpdateDto musicaAtualizada)
        {
            var musica = _context.Musicas.FirstOrDefault(m => m.Titulo == titulo);
            if (musica == null) return NotFound();

            musica.Titulo = musicaAtualizada.Titulo;
            musica.Artista = musicaAtualizada.Artista;
            musica.Genero = musicaAtualizada.Genero;
            musica.Duracao = musicaAtualizada.Duracao;

            _context.SaveChanges();
            return NoContent();
        }

        [HttpDelete("DeleteMusicByTitle/{titulo}")]
        public IActionResult DeletarMusica(string titulo)
        {
            var musica = _context.Musicas.FirstOrDefault(m => m.Titulo == titulo);
            if (musica == null) return NotFound();

            _context.Musicas.Remove(musica);
            _context.SaveChanges();
            return NoContent();
        }

        [HttpPost("AddSongWithFile")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AdicionarMusicaComArquivo([FromForm] MusicaUploadDto musicaDto)
        {
            // Comprime o arquivo da música
            using var memoryStreamMusica = new MemoryStream();
            await musicaDto.Arquivo.CopyToAsync(memoryStreamMusica);
            var arquivoComprimido = Compress(memoryStreamMusica.ToArray());

            // Comprime a capa do álbum se existir
            byte[] imagemCapaBytes = null;
            if (musicaDto.Capa != null)
            {
                using var memoryStreamCapa = new MemoryStream();
                await musicaDto.Capa.CopyToAsync(memoryStreamCapa);
                imagemCapaBytes = Compress(memoryStreamCapa.ToArray());
            }

            var musica = new Musica
            {
                Titulo = musicaDto.Titulo,
                Artista = musicaDto.Artista,
                Genero = musicaDto.Genero,
                Duracao = musicaDto.Duracao,
                ArquivoComprimido = arquivoComprimido,
                CapaDoAlbum = imagemCapaBytes
            };

            _context.Musicas.Add(musica);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObterMusicaPorTitulo), new { titulo = musica.Titulo }, musica);
        }
        [HttpGet("GetCover/{id}")]
        public IActionResult GetCover(int id)
        {
            var musica = _context.Musicas.Find(id);
            if (musica == null || musica.CapaDoAlbum == null)
                return NotFound();

            var capaDescomprimida = Decompress(musica.CapaDoAlbum);

            // Ajuste o content-type conforme o formato da imagem que você espera (jpeg, png...)
            return File(capaDescomprimida, "image/jpeg");
        }

        // Método para comprimir bytes usando GZip
        private byte[] Compress(byte[] data)
        {
            using var compressedStream = new MemoryStream();
            using (var gzipStream = new System.IO.Compression.GZipStream(compressedStream, System.IO.Compression.CompressionMode.Compress))
            {
                gzipStream.Write(data, 0, data.Length);
            }
            return compressedStream.ToArray();
        }
        private byte[] Decompress(byte[] compressedData)
        {
            using var compressedStream = new MemoryStream(compressedData);
            using var gzipStream = new System.IO.Compression.GZipStream(compressedStream, System.IO.Compression.CompressionMode.Decompress);
            using var resultStream = new MemoryStream();
            gzipStream.CopyTo(resultStream);
            return resultStream.ToArray();
        }
        [HttpGet("PlayMusic/{id}")]
        public IActionResult TocarMusica(int id)
        {
            var musica = _context.Musicas.Find(id);
            if (musica == null || musica.ArquivoComprimido == null)
                return NotFound();

            var arquivoDescomprimido = Decompress(musica.ArquivoComprimido);

            var stream = new MemoryStream(arquivoDescomprimido);

            return new FileStreamResult(stream, "audio/mpeg")
            {
                FileDownloadName = $"{musica.Titulo}.mp3"
            };

        }
        // ------- MÉTODOS DE COMPRESSÃO/DESCOMPRESSÃO PARA FOTO DO ARTISTA --------
        private byte[] CompressPhoto(byte[] data)
        {
            using var compressedStream = new MemoryStream();
            using (var gzipStream = new System.IO.Compression.GZipStream(compressedStream, System.IO.Compression.CompressionMode.Compress))
            {
                gzipStream.Write(data, 0, data.Length);
            }
            return compressedStream.ToArray();
        }

        private byte[] DecompressPhoto(byte[] compressedData)
        {
            using var compressedStream = new MemoryStream(compressedData);
            using var gzipStream = new System.IO.Compression.GZipStream(compressedStream, System.IO.Compression.CompressionMode.Decompress);
            using var resultStream = new MemoryStream();
            gzipStream.CopyTo(resultStream);
            return resultStream.ToArray();
        }

        // -------- LISTAR ARTISTAS --------
        [HttpGet("ListArtists")]
        public IActionResult ListarArtistas()
        {
            var artistas = _context.Artistas.ToList();
            return Ok(artistas);
        }

        // -------- BUSCAR FOTO DO ARTISTA --------
        [HttpGet("GetPhoto/{id}")]
        public IActionResult GetPhoto(int id)
        {
            var artista = _context.Artistas.Find(id);
            if (artista == null || artista.FotoComprimida == null)
                return NotFound();

            var fotoDescomprimida = DecompressPhoto(artista.FotoComprimida);

            // Ajuste o content-type conforme o formato da imagem (jpeg, png...)
            return File(fotoDescomprimida, "image/jpeg");
        }

        // -------- ADICIONAR ARTISTA COM FOTO --------
        [HttpPost("AddArtistWithPhoto")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AdicionarArtistaComFoto([FromForm] ArtistaUploadDto artistaDto)
        {
            byte[] fotoComprimida = null;
            if (artistaDto.Foto != null)
            {
                using var ms = new MemoryStream();
                await artistaDto.Foto.CopyToAsync(ms);
                fotoComprimida = CompressPhoto(ms.ToArray());
            }

            var artista = new Artista
            {
                Nome = artistaDto.Nome,
                FotoComprimida = fotoComprimida
                // outros campos, se existirem
            };

            _context.Artistas.Add(artista);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ListarArtistas), new { id = artista.Id }, artista);
        }



    }
}
